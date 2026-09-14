// OPE, Out Past Engineering. The Mac app.
//
// A window with a web view in it. The interface is the web folder bundled
// inside the app, served on ope://app/ so it never needs the internet. The
// interface asks this file for everything it cannot do itself: opening a folder,
// reading and writing files, running git, copying to the clipboard, and hearing
// when files on disk change.
//
// Every command here has a twin in scripts/dev-server.mjs. Change one, change
// the other.
import Cocoa
import WebKit
import CoreServices
#if arch(arm64) && canImport(FoundationModels)
import FoundationModels
#endif

let SCHEME = "ope"
let HOME = URL(string: "ope://app/index.html")!

// ---------------------------------------------------------------- the project

final class Project {
  var root: URL?
  private var stream: FSEventStreamRef?
  var onChange: (([String]) -> Void)?

  static let gitOK: Set<String> = ["for-each-ref", "log", "diff", "blame", "rev-list", "rev-parse", "ls-files",
                                   "status", "init", "add", "commit", "tag", "show"]
  static let skip: Set<String> = [".git", "node_modules", ".next", "dist", "build", ".build", "DerivedData",
                                  ".venv", "venv", "__pycache__", ".cache", "Pods", ".turbo", ".wrangler", "coverage"]

  /* the path the disk itself uses. URL's own resolver turns /private/tmp back
     into /tmp, and file events report /private/tmp, so they never matched */
  static func real(_ path: String) -> String {
    guard let c = realpath(path, nil) else { return (path as NSString).standardizingPath }
    defer { free(c) }
    return String(cString: c)
  }

  var recent: [String] {
    get { UserDefaults.standard.stringArray(forKey: "recent") ?? [] }
    set { UserDefaults.standard.set(Array(newValue.prefix(8)), forKey: "recent") }
  }

  /* the library of project folders, kept in this Mac's own settings, never in the app */
  var library: [[String: Any]] {
    get { (UserDefaults.standard.array(forKey: "library") as? [[String: Any]]) ?? [] }
    set { UserDefaults.standard.set(newValue, forKey: "library") }
  }

  func open(_ path: String) throws -> String {
    let expanded = (path as NSString).expandingTildeInPath
    var isDir: ObjCBool = false
    guard FileManager.default.fileExists(atPath: expanded, isDirectory: &isDir), isDir.boolValue else {
      throw OPEError("That folder does not exist.")
    }
    /* the real path, symlinks resolved, because that is what file events report */
    let url = URL(fileURLWithPath: Project.real(expanded))
    root = url
    var r = recent.filter { $0 != url.path }
    r.insert(url.path, at: 0)
    recent = r
    UserDefaults.standard.set(url.path, forKey: "last")
    if !library.contains(where: { ($0["path"] as? String) == url.path }) {
      library = library + [["path": url.path, "name": url.lastPathComponent]]
    }
    watch()
    return url.path
  }

  /* a path from the interface, and only ever inside the project */
  func inside(_ rel: String) throws -> URL {
    guard let root = root else { throw OPEError("No project is open.") }
    let full = URL(fileURLWithPath: Project.real(root.appendingPathComponent(rel).standardizedFileURL.path))
    guard full.path == root.path || full.path.hasPrefix(root.path + "/") else {
      throw OPEError("That path is outside the project.")
    }
    return full
  }

  func git(_ args: [String]) -> [String: Any] {
    guard let root = root else { return ["code": 1, "out": "", "err": "no project"] }
    guard let first = args.first, Project.gitOK.contains(first) else { return ["code": 1, "out": "", "err": "not allowed"] }
    let p = Process()
    p.executableURL = URL(fileURLWithPath: "/usr/bin/git")
    p.arguments = ["-C", root.path] + args
    var env = ProcessInfo.processInfo.environment
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_PAGER"] = "cat"
    p.environment = env
    let out = Pipe(), err = Pipe()
    p.standardOutput = out
    p.standardError = err
    var outData = Data(), errData = Data()
    let group = DispatchGroup()
    group.enter(); DispatchQueue.global().async { outData = out.fileHandleForReading.readDataToEndOfFile(); group.leave() }
    group.enter(); DispatchQueue.global().async { errData = err.fileHandleForReading.readDataToEndOfFile(); group.leave() }
    do { try p.run() } catch { return ["code": 1, "out": "", "err": "git is not installed. Run xcode-select --install in Terminal."] }
    p.waitUntilExit()
    group.wait()
    return ["code": Int(p.terminationStatus),
            "out": String(decoding: outData, as: UTF8.self),
            "err": String(decoding: errData, as: UTF8.self)]
  }

  func list() -> [String] {
    guard let root = root else { return [] }
    var out: [String] = []
    let keys: [URLResourceKey] = [.isDirectoryKey, .isRegularFileKey]
    guard let e = FileManager.default.enumerator(at: root, includingPropertiesForKeys: keys,
                                                 options: [], errorHandler: nil) else { return [] }
    for case let url as URL in e {
      if out.count > 20000 { break }
      let name = url.lastPathComponent
      let vals = try? url.resourceValues(forKeys: Set(keys))
      if vals?.isDirectory == true {
        if Project.skip.contains(name) { e.skipDescendants() }
        continue
      }
      if name == ".DS_Store" || vals?.isRegularFile != true { continue }
      let p = url.standardizedFileURL.path
      if p.hasPrefix(root.path + "/") { out.append(String(p.dropFirst(root.path.count + 1))) }
    }
    return out.sorted()
  }

  func read(_ rel: String) throws -> [String: Any] {
    let url = try inside(rel)
    let size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int) ?? 0
    if size > 2 * 1024 * 1024 { return ["tooBig": true, "size": size] }
    guard let data = try? Data(contentsOf: url) else { throw OPEError("That file could not be read.") }
    if data.prefix(8000).contains(0) { return ["binary": true, "size": size] }
    return ["text": String(decoding: data, as: UTF8.self), "size": size]
  }

  func write(_ rel: String, _ text: String) throws {
    let url = try inside(rel)
    do { try text.write(to: url, atomically: true, encoding: .utf8) }
    catch { throw OPEError("That file could not be saved: \(error.localizedDescription)") }
  }

  /* anything that changes under the project folder, the AI writing a file or git
     saving a checkpoint, is passed to the interface a quarter of a second later */
  private func watch() {
    if let s = stream { FSEventStreamStop(s); FSEventStreamInvalidate(s); FSEventStreamRelease(s); stream = nil }
    guard let root = root else { return }
    var ctx = FSEventStreamContext(version: 0, info: Unmanaged.passUnretained(self).toOpaque(),
                                   retain: nil, release: nil, copyDescription: nil)
    let cb: FSEventStreamCallback = { _, info, count, paths, _, _ in
      guard let info = info else { return }
      let me = Unmanaged<Project>.fromOpaque(info).takeUnretainedValue()
      guard let root = me.root else { return }
      let list = unsafeBitCast(paths, to: NSArray.self) as? [String] ?? []
      let rel = list.prefix(count).compactMap { p -> String? in
        guard p.hasPrefix(root.path) else { return nil }
        let r = String(p.dropFirst(root.path.count)).trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if r.range(of: #"(^|/)(node_modules|\.next|dist|build)(/|$)"#, options: .regularExpression) != nil { return nil }
        if r.hasPrefix(".git/") && r.range(of: #"^\.git/(refs|HEAD|index|packed-refs)"#, options: .regularExpression) == nil { return nil }
        return r
      }
      if !rel.isEmpty { DispatchQueue.main.async { me.onChange?(rel) } }
    }
    stream = FSEventStreamCreate(nil, cb, &ctx, [root.path] as CFArray,
                                 FSEventStreamEventId(kFSEventStreamEventIdSinceNow), 0.25,
                                 FSEventStreamCreateFlags(kFSEventStreamCreateFlagUseCFTypes | kFSEventStreamCreateFlagFileEvents))
    if let s = stream {
      FSEventStreamSetDispatchQueue(s, DispatchQueue.main)
      FSEventStreamStart(s)
    }
  }
}

struct OPEError: Error { let message: String; init(_ m: String) { message = m } }

// ---------------------------------------------------------------- the files inside the app

final class Bundled: NSObject, WKURLSchemeHandler {
  let base = Bundle.main.resourceURL!.appendingPathComponent("web")

  func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
    guard let url = task.request.url else { return }
    var path = url.path
    if path.isEmpty || path == "/" { path = "/index.html" }
    let file = base.appendingPathComponent(String(path.dropFirst())).standardizedFileURL
    guard file.path.hasPrefix(base.path), let data = try? Data(contentsOf: file) else {
      task.didReceive(HTTPURLResponse(url: url, statusCode: 404, httpVersion: nil, headerFields: nil)!)
      task.didFinish(); return
    }
    let types = ["html": "text/html", "js": "text/javascript", "css": "text/css", "json": "application/json",
                 "svg": "image/svg+xml", "ttf": "font/ttf", "md": "text/markdown", "png": "image/png"]
    let type = types[file.pathExtension.lowercased()] ?? "application/octet-stream"
    task.didReceive(HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil,
                                    headerFields: ["Content-Type": type, "Access-Control-Allow-Origin": "*"])!)
    task.didReceive(data)
    task.didFinish()
  }
  func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

// ---------------------------------------------------------------- OPE Chat

/* OPE CHAT EXPLAINS. IT DOES NOT BUILD, FIX OR DEBUG.

   A free model small enough to run on a laptop reads and explains code well.
   Fixing and adding to an existing app is the hardest thing a model does, and a
   small one does it confidently and wrong. So OPE Chat promises the one thing
   it does well, and says so when asked for the rest.

   Two engines, both on this Mac, and the project never leaves it:
     1. Apple's own model, where the Mac has Apple Intelligence. Nothing to download.
     2. Qwen2.5 Coder 3B through Ollama, for every other Mac. A 1.9 GB download
        OPE starts for you once Ollama is installed. */
enum Chat {
  static let model = "qwen2.5-coder:3b"
  static let ollama = URL(string: "http://127.0.0.1:11434")!
  static var pulling: [String: Any]? = nil

  static let rules = """
  You are OPE Chat, inside OPE, an app for people who build software by talking to an AI \
  coder and cannot read code themselves.
  You ONLY explain. Say what a file, a function or a line does, why it is there, and how \
  it connects to the rest, in plain words a non programmer understands. Explain any \
  technical word the first time you use it.
  You never write code, never rewrite it, never suggest a fix, never debug, and never add \
  a feature. If you are asked to fix, change, build, add or debug something, answer in \
  one sentence that OPE Chat only explains code, and that their AI coder can make the \
  change. Then, if it helps, explain what the code there does now.
  Only talk about the code you are shown. If it is not enough to answer, say what is missing.
  Keep answers short: a few short paragraphs at most.
  """

  static func appleReady() -> Bool {
  #if arch(arm64) && canImport(FoundationModels)
    if #available(macOS 26, *) {
      if case .available = SystemLanguageModel.default.availability { return true }
    }
  #endif
    return false
  }

  static func ollamaInstalled() -> Bool {
    ["/usr/local/bin/ollama", "/opt/homebrew/bin/ollama", "/Applications/Ollama.app"]
      .contains { FileManager.default.fileExists(atPath: $0) }
  }

  /* nil when Ollama is not answering, otherwise whether the model is there */
  static func ollamaHasModel() async -> Bool? {
    var req = URLRequest(url: ollama.appendingPathComponent("api/tags"))
    req.timeoutInterval = 2
    guard let (data, _) = try? await URLSession.shared.data(for: req),
          let j = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
    let names = (j["models"] as? [[String: Any]] ?? []).compactMap { $0["name"] as? String }
    return names.contains { $0 == model || $0.hasPrefix(model) }
  }

  static func engine() async -> [String: Any] {
    if appleReady() { return ["engine": "apple", "label": "Apple Intelligence, on this Mac"] }
    switch await ollamaHasModel() {
    case .some(true): return ["engine": "ollama", "label": "Qwen2.5 Coder 3B, on this Mac"]
    case .some(false):
      var out: [String: Any] = ["engine": "need-model", "label": "Needs a 1.9 GB download"]
      if let p = pulling { out["pulling"] = p }
      return out
    case .none:
      return ollamaInstalled()
        ? ["engine": "start-ollama", "label": "Open Ollama to use OPE Chat"]
        : ["engine": "none", "label": "Needs Ollama, free, from ollama.com"]
    }
  }

  /* the code is cut to what the engine can read at once, with the question and
     the rules always kept whole */
  static func prompt(_ b: [String: Any], budget: Int) -> String {
    var head: [String] = []
    if let v = b["project"] as? String, !v.isEmpty { head.append("Project: \(v)") }
    if let v = b["version"] as? String, !v.isEmpty { head.append("Version picked: \(v)") }
    if let v = b["file"] as? String, !v.isEmpty { head.append("File open: \(v)") }
    if let v = b["lines"] as? String, !v.isEmpty { head.append("Lines selected: \(v)") }
    var code = b["code"] as? String ?? ""
    if code.count > budget { code = String(code.prefix(budget)) + "\n[the rest of the file was cut to fit]" }
    let q = b["question"] as? String ?? ""
    return head.joined(separator: "\n") + (code.isEmpty ? "" : "\n\nThe code:\n```\n\(code)\n```") + "\n\nQuestion: \(q)"
  }

  static func ask(_ b: [String: Any]) async throws -> [String: Any] {
  #if arch(arm64) && canImport(FoundationModels)
    if #available(macOS 26, *), appleReady() {
      let session = LanguageModelSession(instructions: rules)
      do {
        let r = try await session.respond(to: prompt(b, budget: 7000))
        return ["answer": r.content, "engine": "apple"]
      } catch {
        /* a file too big for the small window, or a guardrail: say it plainly */
        let text = "\(error)"
        if text.localizedCaseInsensitiveContains("context") || text.localizedCaseInsensitiveContains("exceeded") {
          return ["answer": "That is more code than this model can read at once. Select the part you are asking about and ask again.", "engine": "apple"]
        }
        throw OPEError("Apple's model could not answer: \(text)")
      }
    }
  #endif
    guard await ollamaHasModel() == true else { throw OPEError("OPE Chat has no model on this Mac yet.") }
    var req = URLRequest(url: ollama.appendingPathComponent("api/chat"))
    req.httpMethod = "POST"
    req.timeoutInterval = 180
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.httpBody = try JSONSerialization.data(withJSONObject: [
      "model": model, "stream": false,
      "options": ["num_ctx": 8192, "temperature": 0.2],
      "messages": [["role": "system", "content": rules], ["role": "user", "content": prompt(b, budget: 18000)]]
    ])
    let (data, _) = try await URLSession.shared.data(for: req)
    let j = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    if let e = j?["error"] as? String { throw OPEError("Ollama could not answer: \(e)") }
    let answer = (j?["message"] as? [String: Any])?["content"] as? String ?? ""
    return ["answer": answer, "engine": "ollama"]
  }

  /* the 1.9 GB download, started once, reported through engine() as it goes */
  static func pull() {
    if pulling != nil { return }
    pulling = ["status": "starting", "completed": 0, "total": 0]
    Task {
      var req = URLRequest(url: ollama.appendingPathComponent("api/pull"))
      req.httpMethod = "POST"
      req.timeoutInterval = 3600
      req.httpBody = try? JSONSerialization.data(withJSONObject: ["model": model, "stream": true])
      do {
        let (bytes, _) = try await URLSession.shared.bytes(for: req)
        for try await line in bytes.lines {
          guard let j = try? JSONSerialization.jsonObject(with: Data(line.utf8)) as? [String: Any] else { continue }
          if let e = j["error"] as? String { pulling = ["status": "error", "error": e]; return }
          var p: [String: Any] = ["status": j["status"] as? String ?? ""]
          if let t = j["total"] as? Int { p["total"] = t }
          if let c = j["completed"] as? Int { p["completed"] = c }
          pulling = p
        }
        pulling = nil
      } catch {
        pulling = ["status": "error", "error": "The download stopped. Check Ollama is open and try again."]
      }
    }
  }
}

// ---------------------------------------------------------------- the bridge

final class Bridge: NSObject, WKScriptMessageHandlerWithReply {
  let project: Project
  weak var window: NSWindow?
  init(_ p: Project) { project = p }

  func userContentController(_ c: WKUserContentController, didReceive message: WKScriptMessage,
                             replyHandler: @escaping (Any?, String?) -> Void) {
    guard let body = message.body as? [String: Any], let cmd = body["cmd"] as? String else {
      replyHandler(["error": "Bad message."], nil); return
    }
    let reply: ([String: Any]) -> Void = { replyHandler($0, nil) }
    let fail: (String) -> Void = { replyHandler(["error": $0], nil) }

    switch cmd {
    case "hello":
      var root = project.root?.path ?? ""
      if root.isEmpty, let last = UserDefaults.standard.string(forKey: "last"),
         FileManager.default.fileExists(atPath: last), let opened = try? project.open(last) { root = opened }
      reply(["kind": "mac", "root": root, "recent": project.recent, "library": project.library])

    case "open":
      do { reply(["root": try project.open(body["path"] as? String ?? ""), "library": project.library]) } catch let e as OPEError { fail(e.message) } catch { fail("\(error)") }

    case "pick":
      let panel = NSOpenPanel()
      panel.canChooseDirectories = true
      panel.canChooseFiles = false
      panel.allowsMultipleSelection = false
      panel.prompt = "Open"
      panel.message = "Pick the folder your AI built the project in."
      let done: (NSApplication.ModalResponse) -> Void = { r in
        guard r == .OK, let url = panel.url else { reply(["root": ""]); return }
        do { reply(["root": try self.project.open(url.path), "library": self.project.library]) } catch { fail("That folder could not be opened.") }
      }
      if let w = window { panel.beginSheetModal(for: w, completionHandler: done) } else { done(panel.runModal()) }

    case "prompt":
      let url = Bundle.main.resourceURL!.appendingPathComponent("OPE-PROMPT.md")
      reply(["text": (try? String(contentsOf: url, encoding: .utf8)) ?? ""])

    case "git":
      let args = (body["args"] as? [Any] ?? []).map { "\($0)" }
      DispatchQueue.global(qos: .userInitiated).async {
        let r = self.project.git(args)
        DispatchQueue.main.async { reply(r) }
      }

    case "list":
      DispatchQueue.global(qos: .userInitiated).async {
        let files = self.project.list()
        DispatchQueue.main.async { reply(["files": files]) }
      }

    case "read":
      do { reply(try project.read(body["path"] as? String ?? "")) } catch let e as OPEError { fail(e.message) } catch { fail("\(error)") }

    case "write":
      do { try project.write(body["path"] as? String ?? "", body["text"] as? String ?? ""); reply(["ok": true]) }
      catch let e as OPEError { fail(e.message) } catch { fail("\(error)") }

    case "log":
      FileHandle.standardError.write(("OPE: " + (body["text"] as? String ?? "") + "\n").data(using: .utf8)!)
      reply(["ok": true])

    case "libraryRemove":
      let path = body["path"] as? String ?? ""
      project.library = project.library.filter { ($0["path"] as? String) != path }
      reply(["items": project.library])

    case "chatEngine":
      Task { let r = await Chat.engine(); DispatchQueue.main.async { reply(r) } }

    case "chat":
      Task {
        do { let r = try await Chat.ask(body); DispatchQueue.main.async { reply(r) } }
        catch let e as OPEError { DispatchQueue.main.async { fail(e.message) } }
        catch { DispatchQueue.main.async { fail("OPE Chat could not answer: \(error.localizedDescription)") } }
      }

    case "chatPull":
      Chat.pull(); reply(["ok": true])

    case "chatOpen":
      if let url = URL(string: body["url"] as? String ?? ""), ["https"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }
      else { NSWorkspace.shared.open(URL(fileURLWithPath: "/Applications/Ollama.app")) }
      reply(["ok": true])

    case "copy":
      NSPasteboard.general.clearContents()
      NSPasteboard.general.setString(body["text"] as? String ?? "", forType: .string)
      reply(["ok": true])

    default:
      fail("Unknown command \(cmd)")
    }
  }
}

// ---------------------------------------------------------------- the window

final class App: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate {
  var window: NSWindow!
  var web: WKWebView!
  let project = Project()
  lazy var bridge = Bridge(project)

  func applicationDidFinishLaunching(_ n: Notification) {
    menus()
    let cfg = WKWebViewConfiguration()
    cfg.setURLSchemeHandler(Bundled(), forURLScheme: SCHEME)
    cfg.userContentController.addScriptMessageHandler(bridge, contentWorld: .page, name: "ope")
    cfg.preferences.setValue(true, forKey: "developerExtrasEnabled")

    /* the laptop's own screen when there is one */
    let screen = NSScreen.screens.first(where: { $0.localizedName.localizedCaseInsensitiveContains("built-in") })
      ?? NSScreen.main ?? NSScreen.screens[0]
    let size = NSSize(width: min(1480, screen.visibleFrame.width - 80), height: min(920, screen.visibleFrame.height - 60))
    window = NSWindow(contentRect: NSRect(origin: .zero, size: size),
                      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                      backing: .buffered, defer: false, screen: screen)
    window.titlebarAppearsTransparent = true
    window.titleVisibility = .hidden
    window.backgroundColor = .black
    window.minSize = NSSize(width: 760, height: 520)
    window.title = "OPE"
    window.delegate = self
    window.setFrameAutosaveName("OPEMain")
    if !window.setFrameUsingName("OPEMain") {
      let f = screen.visibleFrame
      window.setFrameOrigin(NSPoint(x: f.midX - size.width / 2, y: f.midY - size.height / 2))
    }

    web = WKWebView(frame: .zero, configuration: cfg)
    web.setValue(false, forKey: "drawsBackground")
    web.navigationDelegate = self
    if #available(macOS 13.3, *) { web.isInspectable = true }
    window.contentView = web
    bridge.window = window

    project.onChange = { [weak self] paths in
      guard let self = self,
            let data = try? JSONSerialization.data(withJSONObject: ["paths": paths]),
            let json = String(data: data, encoding: .utf8) else { return }
      self.web.evaluateJavaScript("window.OPEBridge && OPEBridge.emit(\(json))", completionHandler: nil)
    }

    web.load(URLRequest(url: HOME))
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ s: NSApplication) -> Bool { true }

  /* Copy, paste and undo only reach the code view if the menu has them */
  func menus() {
    let main = NSMenu()
    let appItem = NSMenuItem(); main.addItem(appItem)
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "About OPE", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
    appMenu.addItem(.separator())
    appMenu.addItem(withTitle: "Hide OPE", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
    appMenu.addItem(withTitle: "Quit OPE", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    appItem.submenu = appMenu

    let editItem = NSMenuItem(); main.addItem(editItem)
    let edit = NSMenu(title: "Edit")
    edit.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
    let redo = edit.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "z")
    redo.keyEquivalentModifierMask = [.command, .shift]
    edit.addItem(.separator())
    edit.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
    edit.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
    edit.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
    edit.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
    editItem.submenu = edit

    let winItem = NSMenuItem(); main.addItem(winItem)
    let win = NSMenu(title: "Window")
    win.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
    win.addItem(withTitle: "Close", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
    winItem.submenu = win
    NSApp.mainMenu = main
    NSApp.windowsMenu = win
  }
}

let app = NSApplication.shared
let delegate = App()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
