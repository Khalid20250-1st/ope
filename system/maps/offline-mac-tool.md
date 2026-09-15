# A web tool made into a Mac app that works offline

For a tool you use yourself (in a car, a shop with bad signal, a client's office),
not a page customers see. The same page the website serves runs inside the app.

## 1. Diagnose what reaches the internet

List every line in the page that leaves the machine. There are four kinds:

| Kind | Find it | Becomes |
|---|---|---|
| API calls | `grep -o "fetch('[^']*'" page.html` | answered on the Mac |
| Iframes and assets | `grep -o 'src="[^"]*"' page.html` | files inside the app |
| Fonts | `grep fonts.googleapis` | fetched once at build, then local |
| The database | whatever the page's data layer calls | files on disk |

What genuinely needs the internet becomes one button: Publish.

## 2. The scheme handler

```swift
cfg.setURLSchemeHandler(local, forURLScheme: "tool")
web.load(URLRequest(url: URL(string: "tool://app/page.html")!))
```

Now `/api/...` and relative iframes land in your Swift code, and the page does not
have to be rewritten. Lines that cannot be reused are patched at build time by a
script, never by hand and never in the original.

## 3. Build in two scripts

- A web build script copies the real files, fetches fonts once, patches the lines
  that reach the web, and **throws if a line it means to patch has moved**.
- A shell script makes the icon, compiles, assembles the bundle.

Check the result every time; every URL left must be a link a person clicks:

```
grep -rho "https\?://[a-zA-Z0-9./-]*" build/web --include=*.html --include=*.js | sort -u
```

## 4. The work on disk

Plain JSON, one file per record, in `~/Documents/<Tool Name>/`, visible in Finder
and surviving the app being deleted. Sanitise every id into a file name (letters,
digits, dashes only). Every record carries a `live` flag, which is the whole publish
queue.

## 5. Publish

- Check reachability with a real request, not `navigator.onLine`.
- One record at a time. A record that fails is left as it was so the next publish
  retries it. Never mark something live just because the call returned.
- Credentials the site needs are exchanged at publish time, not minted offline.

## Watch

Give the app a `--self-check` flag that loads the page, writes a record, reads it
back and deletes it, with no one at the screen.
