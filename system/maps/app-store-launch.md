# Putting an iPhone and iPad app on the App Store

Walked twice for real, for two native SwiftUI apps. Most of the time went on a
rejection whose error message pointed the wrong way, so read the first section
before touching any code.

## 1. Diagnose before changing anything

**The trap.** Builds upload, process, show VALID, reach Waiting for Review, then
flip to Invalid Binary within about ninety seconds with `ITMS-90111: Unsupported
SDK or Xcode version`. Local validation (`xcrun altool --validate-app`) passes
every time.

**The real cause.** The Mac that built it ran a **beta macOS**. Xcode writes the
build machine's OS build into every bundle, and App Store ingestion refuses an
unreleased one. The error wording only mentions old toolchains.

**Read the binary instead of guessing:**

```
plutil -p build/App.xcarchive/Products/Applications/App.app/Info.plist | grep -E "BuildMachineOSBuild|DTSDKName|DTXcode"
sw_vers
```

A build number ending in a lowercase letter (like `26A5353q`) is a beta. Other
guesses that cost a rebuild each and were wrong: export compliance, the privacy
manifest, EU trader status. The tell: the same failure on a second, unrelated app
means the machine, never the code.

## 2. Set up once

**Repo.** One private repo per app, build output ignored (`build/`,
`DerivedData/`, `*.xcarchive`, `*.ipa`, `xcuserdata/`). Generating the Xcode
project from `project.yml` with xcodegen makes the `.xcodeproj` disposable.

**Signing assets through the App Store Connect API**, not cloud signing (cloud
signing failed at export with a permission error). Generate a private key locally,
send a signing request, get the certificate back, then create an App Store profile
bound to it and the bundle id. Apple allows three distribution certificates; do
not burn them casually.

**The account.**
- EU trader status (Digital Services Act): App Store Connect, Business, Compliance.
  Selling subscriptions makes you a trader. The address, phone and email are shown
  publicly, and proof of address under three months old is required. Takes about
  a day.
- The Free Apps Agreement is enough for a free app. Paid agreements and tax forms
  only matter if Apple collects money for you. Selling on the web through your own
  payments means Apple takes no cut.
- A profile can only carry a capability the bundle id has enabled. Check the
  bundle id before blaming the profile.

**The listing.**
- A web wrapper gets rejected under guideline 4.2. Build real native screens, and
  adapt navigation to the device (tab bar on iPhone, sidebar on iPad).
- Screenshots from a simulator with believable data, never empty screens, spinners
  or notification banners. Delete old screenshots when the app is rebuilt.
- A reviewer login that works, on a demo account seeded with real looking data.
- Ship `PrivacyInfo.xcprivacy`. Answer export compliance in the project with
  `INFOPLIST_KEY_ITSAppUsesNonExemptEncryption: NO`.

**Secrets**, six per app, held only as CI repo secrets, piped in so they are never
printed:

```
base64 -i AuthKey_XXX.p8 | tr -d '\n' | gh secret set ASC_KEY_P8
```

`ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`, `DIST_P12`, `DIST_P12_PASSWORD`,
`PROFILE_APP`.

## 3. Build off a beta Mac

GitHub Actions on a released macOS runner. The workflow: checkout, install
xcodegen and regenerate, import the certificate into a throwaway keychain, install
the profile **named by the UUID inside it**, into both
`~/Library/MobileDevice/Provisioning Profiles` and
`~/Library/Developer/Xcode/UserData/Provisioning Profiles`, archive with manual
signing, **print `BuildMachineOSBuild`** on every run, export and upload.

## 4. Export and upload

**The line that fixed hours of wrong leads.** With manual signing the export plist
must map each bundle id to its profile:

```xml
<key>provisioningProfiles</key><dict><key>com.example.app</key><string>Example App Store</string></dict>
```

Without it the export fails and blames push notifications or entitlements. Also set
`signingCertificate` to Apple Distribution and pass `-exportPath`. With
`destination: upload`, the export sends the build straight to App Store Connect.

## 5. Submit

- A version already in a submission cannot join a new one. Cancel with
  `PATCH /v1/reviewSubmissions/{id}` `canceled: true`, then wait until the state
  reads COMPLETE, or you get a 409.
- Attaching a build to a version stuck at Invalid Binary resets it to Prepare for
  Submission. No new version record needed.
- Create a reviewSubmission, add the version as an item, then `submitted: true`.
  The final patch is refused for a minute or two; retry in a loop.
- Bump the build number every time.
- **Attaching a build to a version already in review cancels that submission.**
  Check the state first. There is no undo.

## 6. The first fifteen minutes

A refused binary dies within about ninety seconds of Waiting for Review. Poll the
submission and version state every thirty seconds for fifteen minutes. Held all the
way means it is genuinely queued. Review usually answers in 24 to 48 hours.

## 7. Testing on a device

A beta iOS on the phone can refuse to launch an app installed over the cable from
an older Xcode. Use TestFlight internal testing instead: an internal group with
`hasAccessToAllBuilds: true`, testers who are already team users. No beta review.

## 8. When it comes back rejected

- The message names the guideline and the review device. Retest on that device class.
- Guideline 2.1(b) is a questionnaire about the business. Answer every question in
  order, in Resolution Center and in the review notes, and never say anything the
  website contradicts. Reviewers open the website.
- A second reviewer also checks: the pricing page, network traffic, the demo
  account, the screenshots, Sign in with Apple placement (at least as prominent as
  Google), Hide My Email handling, and that delete account really deletes.

**The resubmit trap.** After a rejection, attach the new build first. If
`submitted: true` keeps answering "not ready" and the Resubmit button is greyed,
press **Update Review** on the version page, not Resubmit. Delete any empty draft
submission first. Do not create a new reviewSubmission to get around it.
