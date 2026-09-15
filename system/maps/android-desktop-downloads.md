# Android, Windows and Linux downloads

For an app people download from your website rather than a store. Walked for real
from one Mac, with no Windows or Linux machine.

## The rule that decides it

Every platform that can have a real downloadable file gets one: a button, not a
page of browser install instructions. The browser install is the fallback.

## Android: a Trusted Web Activity

A genuine installed Android app that shows your live site full screen, with no
browser bar. Built with Bubblewrap, which generates a real Gradle project. It loads
the live site, so it updates whenever the site deploys; rebuild only when the shell
changes.

```
export BUBBLEWRAP_KEYSTORE_PASSWORD=... BUBBLEWRAP_KEY_PASSWORD=...
npx @bubblewrap/cli build --skipPwaValidation
```

Then copy `app-release-signed.apk` to where your download page expects it.

**Three traps that each killed a build:**
1. JDK 17, not newer. Gradle rejects newer ones.
2. `jdkPath` in `~/.bubblewrap/config.json` must **not** end in
   `/Contents/Home`; Bubblewrap appends it itself.
3. Bubblewrap wants the old SDK layout (`<sdk>/tools/bin/sdkmanager`). Make a shim
   folder of symlinks that fakes it and point `androidSdkPath` at the shim.

## The keystore cannot be replaced

Android only installs an update signed with the same key. Lose the keystore and
every installed copy is frozen on its version forever. Keep it out of the website
folder and out of git, and **back it up off the machine**.

`public/.well-known/assetlinks.json` carries the package name and the signing
fingerprint. It is what removes the address bar. Change the key and this file must
change too. Verify on an emulator before and after deploy.

## Windows and Linux: one Electron shell

A tiny Electron app (`main.js`, `package.json`, an icon) that opens the live site
in its own window. electron-builder builds both from a Mac:

```
npx electron-builder --win     # a one click NSIS installer
npx electron-builder --linux   # an AppImage
```

Use the same app id as the Android package so the shells are one product. Output
goes to `dist/`, which stays out of git.

## Where the files live

Many static hosts refuse large files (Cloudflare Pages caps a single file at 25 MiB).
APKs are small enough to ship with the site. Desktop installers (80 to 100 MB) go in
object storage behind their own domain; Cloudflare R2 has no download fee. Serve
each with the right content type, or Android refuses to install an APK served as
text:

- `.apk` `application/vnd.android.package-archive`
- `.exe` `application/vnd.microsoft.portable-executable`
- `.AppImage` `application/x-executable`

## The download page

One page that reads the device and offers the one file it can use. Check Android
**before** Linux, because Android reports itself as Linux. An iPad reports itself as
a Mac. Apple devices get a pointer to the App Store instead of a file.
