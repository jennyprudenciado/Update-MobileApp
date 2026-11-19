# PlantDiary CI/CD Roadmap

## 1. Current repository configuration

PlantDiary is an Expo React Native project. Configuration currently present:

| Item | Current state |
| --- | --- |
| Expo / React Native | Expo `~57.0.32`, React Native `0.86.3` |
| Package manager | npm; `package-lock.json` is present |
| Entry point | `index.js` |
| Root component | `App.js` forwards to `src/PlantCare.js` |
| Local data | AsyncStorage |
| Photo selection | Expo ImagePicker |
| Web renderer | `react-native-web` |
| Expo metadata | `app.json` |
| EAS profiles | `eas.json` has development, preview, and production profiles |
| CI workflow | No GitHub Actions workflow is present in the project tree |

These are configuration facts, not evidence that CI jobs or Android builds
have run.

## 2. Existing npm scripts

`package.json` defines only:

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web",
  "test": "node --test"
}
```

`npm test` runs Node's built-in test runner for the shared positive-integer
validator. There are no `lint` or `build` npm scripts. The package manifest
does not pin a Node.js engine version. Use a Node.js version supported by
Expo SDK 57 and the project dependencies.

## 3. EAS build configuration

The current `eas.json` contains:

- `development`: development client, internal distribution.
- `preview`: internal distribution, Android `buildType: "apk"`.
- `production`: automatic version increment.
- EAS CLI minimum version `>= 24.8.0`.
- App version source set to `remote`.

An Android preview APK can be requested after installing/logging into EAS
CLI:

```sh
eas build --platform android --profile preview
```

The profile exists in configuration; successful cloud builds, signing, and
distribution have not been verified here. `app.json` sets the app name,
slug, version, portrait orientation, icon/splash, Android package ID, and
EAS project ID. The existence of those values does not establish a release
or deployment pipeline.

## 4. Local setup and commands

Install the locked dependencies:

```sh
npm ci
```

Start Expo:

```sh
npm run start
```

Run the local Android native project (Android SDK/Android Studio required):

```sh
npm run android
```

Start Web:

```sh
npm run web
```

An `ios` script is present, but local iOS builds require macOS and Xcode.
Expo Web and Android JavaScript bundle exports passed. These checks verify
bundling only; no interactive browser or Android device/emulator test was run.

## 5. CI recommendations (not implemented)

If automated validation is added, a small initial workflow could:

1. Check out the repository and set up a Node.js release supported by the
   pinned Expo SDK.
2. Run `npm ci`.
3. Run `npm test`.
4. Run a static Expo configuration/dependency check and the platform bundle
   exports selected by the maintainers.

The current tests cover interval parsing and persisted-data validation. Add
focused screen-flow tests before treating the app as fully covered. Do not
configure CI to run a nonexistent `npm run lint`.

## 6. Future release workflow

A possible future process is to validate the app on target devices, request
an EAS preview APK for QA, and create a production build only after review.
This is a recommendation, not an existing release workflow. The project
currently has no checked-in GitHub Actions automation, release publishing,
artifact upload, environment-specific backend credentials, or deployment
service.

## 7. Data and platform checks for a future release

Before distributing a build, test on the actual targets:

- First launch, saved-empty state, app restart, and corrupted/read-failure
  handling.
- Add/water/update/delete/Undo and schedule persistence.
- Diary add/edit/delete and plant association, including deletion and Undo of
  a linked plant.
- Image selection, replacement, restart persistence, and cleanup on Android.
- Web picker image behavior across reloads and storage limits. Blob URLs are
  converted to data URLs, but browser storage is not a backup.
- Modal and Undo banner layout on short and tall screens.

No backup or restore feature currently exists. Bundle exports do not verify
the app's interactive flows, storage across restarts, image-picker
permissions, or native image persistence. Those checks still need to be run
in a browser and on Android devices. Do not describe release validation as
complete until they have been completed.

## 8. Summary

The repository is configured for Expo development and includes EAS build
profiles, including an Android preview APK profile. It does not currently
contain a CI pipeline or a verified release process. The app remains
local-first and has known persistence, recovery, image, and UI limitations
documented in [`API.md`](./API.md) and
[`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).

