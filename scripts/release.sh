#!/bin/zsh
# Makes the file people download: OPE.dmg, signed and notarized by Apple so it
# opens on any Mac with no warning.
#
# Needs, once:
#   1. A "Developer ID Application" certificate in this Mac's keychain
#      (Apple Developer account, Certificates, only the account holder can make one)
#   2. A saved notary login:
#        xcrun notarytool store-credentials ope-notary --key <AuthKey.p8> --key-id <ID> --issuer <ISSUER>
#
#   zsh scripts/release.sh
set -e
here=${0:a:h}
root=${here:h}
build="$root/build"

id=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | sed -E 's/.*"(.*)"/\1/')
if [ -z "$id" ]; then
  echo "No Developer ID Application certificate on this Mac. See the top of this file."
  exit 1
fi

SIGN="$id" zsh "$here/build.sh"

echo "dmg"
rm -rf "$build/dmg" "$build/OPE.dmg"
mkdir -p "$build/dmg"
cp -R "$build/OPE.app" "$build/dmg/OPE.app"
ln -s /Applications "$build/dmg/Applications"
hdiutil create -volname "OPE" -srcfolder "$build/dmg" -ov -format UDZO "$build/OPE.dmg" >/dev/null
codesign --force --sign "$id" --timestamp "$build/OPE.dmg"

echo "notarize (Apple usually takes a few minutes)"
xcrun notarytool submit "$build/OPE.dmg" --keychain-profile ope-notary --wait
xcrun stapler staple "$build/OPE.dmg"
spctl --assess --type open --context context:primary-signature -v "$build/OPE.dmg"
echo "ready: $build/OPE.dmg"
