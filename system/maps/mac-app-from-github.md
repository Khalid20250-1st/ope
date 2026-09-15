# A Mac app strangers download from GitHub

Built, signed, notarized by Apple, handed out as a DMG on a GitHub release. Walked
for real building OPE itself.

## 1. The shape: a Swift window around a web interface

One `main.swift`, compiled with `swiftc`, no Xcode project:

- a `WKURLSchemeHandler` on your own scheme (`myapp://app/`) serving a `web/`
  folder bundled in the app, so it needs no internet
- a `WKScriptMessageHandlerWithReply`: the page calls
  `window.webkit.messageHandlers.myapp.postMessage({cmd, ...})` and gets a promise
- disk changes pushed into the page with `evaluateJavaScript(...)`

The page never touches the disk; it asks the bridge.

## 2. The twin: the same bridge in Node

A small Node server that answers every bridge command over HTTP, so the whole
interface runs in a normal browser for building, testing and screenshots. Every
command exists in both, with the same arguments and the same answer.

## 3. Build: universal

```
swiftc -O -target arm64-apple-macos13  main.swift -o App-arm64  -framework Cocoa -framework WebKit
swiftc -O -target x86_64-apple-macos13 main.swift -o App-x86_64 -framework Cocoa -framework WebKit
lipo -create App-arm64 App-x86_64 -output App
```

Assemble the bundle by script: `Contents/MacOS`, `Contents/Resources`, an
`Info.plist` written by the script, an `.icns` cut with `sips` and `iconutil`.
Without a certificate, sign ad hoc (`codesign --sign -`); it runs only on that Mac.

## 4. Traps

| Trap | Fix |
|---|---|
| `/tmp` is really `/private/tmp`, and `URL.resolvingSymlinksInPath()` turns it back into `/tmp`, so file events never match | resolve paths with C `realpath()` |
| Copy, paste and undo dead in the web view | build the Edit menu in code with the standard selectors |
| Window opens on an external monitor | pick the screen whose `localizedName` contains "Built-in" |
| A code editor library loads from a CDN | copy it into the app at build time |
| A blank window with no clue why | catch `error` and `unhandledrejection` in the page and show them |

## 5. Sign and notarize

Once:
1. A **Developer ID Application** certificate. An "Apple Development" certificate
   only runs on registered devices. Only the account holder can create it:
   developer.apple.com, Certificates, Developer ID Application, upload a signing
   request made on the Mac.
2. A saved notary login from an App Store Connect API key:
   `xcrun notarytool store-credentials <profile> --key AuthKey.p8 --key-id ... --issuer ...`

Then every release:

```
codesign --force --deep --options runtime --timestamp --sign "Developer ID Application: ..." App.app
hdiutil create -volname App -srcfolder dmg/ -ov -format UDZO App.dmg   # dmg/ holds the app and an /Applications link
codesign --force --sign "Developer ID Application: ..." --timestamp App.dmg
xcrun notarytool submit App.dmg --keychain-profile <profile> --wait
xcrun stapler staple App.dmg
spctl --assess --type open --context context:primary-signature -v App.dmg
```

The first notarization on a new certificate can take over an hour; later ones are
minutes.

## 6. Publish

Private repo first, README with real screenshots taken from the Node twin, a draft
release with the DMG attached. Make it public only on the word. Take screenshots
from demo data, never from your own private projects.
