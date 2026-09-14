// Draws the OPE icon: a black tile, a thin blue edge, OPE in white with a green cursor.
import Cocoa
let size: CGFloat = 1024
let img = NSImage(size: NSSize(width: size, height: size))
img.lockFocus()
let inset: CGFloat = 100
let tile = NSRect(x: inset, y: inset, width: size - inset * 2, height: size - inset * 2)
let path = NSBezierPath(roundedRect: tile, xRadius: 185, yRadius: 185)
NSColor.black.setFill(); path.fill()
NSColor(red: 0.353, green: 0.690, blue: 0.878, alpha: 1).setStroke()
path.lineWidth = 14; path.stroke()
let font = NSFont.monospacedSystemFont(ofSize: 250, weight: .bold)
let text = NSAttributedString(string: "OPE", attributes: [.font: font, .foregroundColor: NSColor.white, .kern: 12])
let t = text.size()
let x = (size - t.width) / 2 - 40, y = (size - t.height) / 2 + 20
text.draw(at: NSPoint(x: x, y: y))
NSColor(red: 0.133, green: 0.773, blue: 0.369, alpha: 1).setFill()
NSRect(x: x + t.width + 24, y: y + 38, width: 70, height: 200).fill()
img.unlockFocus()
let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
