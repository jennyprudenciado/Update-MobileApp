# PlantDiary Technical Plan and Project Guide

## 1. Project overview

PlantDiary (the Expo project/package is named `PlantCareMobileApp`) is a
local-first plant-care app for recording a plant collection, watering
intervals, and plant diary notes with optional photos. It helps plant owners
keep basic care details and observations together. PlantSolve supplies plant
catalog information, but the app has no user accounts, cloud sync, push
notifications, backup, or restore service.

This guide describes the repository source and configuration. Expo Web and
Android JavaScript bundle exports passed, but interactive browser and Android
runtime behavior have not been tested.

## 2. Current technology and configuration

| Area | Configured version or value |
| --- | --- |
| Expo | `~57.0.32` |
| React | `19.2.3` |
| React Native | `0.86.3` |
| React Navigation | Bottom Tabs `^7.19.2`, Native `^7.4.1` |
| Persistent storage | AsyncStorage `2.2.0` |
| Image selection | `expo-image-picker ~57.0.21` |
| Native image file operations | `expo-file-system ~57.0.7` via `expo-file-system/legacy` |
| Web renderer | `react-native-web ~0.21.0` |
| Package manager | npm; `package-lock.json` is present |
| App config | `app.json`; portrait orientation, light interface, app icon and splash image |
| Build profiles | `eas.json`; development, preview, production |

Version values are read from `package.json`. The project does not declare a
Node.js engine version. Use a Node.js version supported by the installed Expo
SDK and npm; consult the versioned Expo documentation rather than assuming an
exact Node release.

## 3. Application architecture

```text
index.js -> App.js -> src/PlantCare.js
                         |-- WelcomeScreen
                         |-- HomeScreen
                         |-- Schedule
                         |-- Diary
                         |-- AddPlant
                         |-- shared plants/diary state and mutation queue
                         |-- src/utils/Plantapi.js -> PlantSolve / bundled Web catalog
                         `-- src/utils/storage.js -> AsyncStorage
```

`index.js` registers the root component with Expo. `App.js` forwards the root
export to `src/PlantCare.js`. The coordinator owns shared records, loads them
on mount, and passes screen data and callbacks as props. Screen-local forms
and dialogs use their own React state.

### Source tree

```text
PlantCareMobileApp/
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── .gitignore
├── App.js
├── index.js
├── package.json
├── package-lock.json
├── app.json
├── eas.json
├── .claude/
│   └── settings.json
├── assets/
│   └── plantdiary-icon.png
├── android/                         # Local native project; ignored by Git
│   ├── build.gradle
│   ├── gradle.properties
│   ├── settings.gradle
│   ├── gradlew
│   ├── gradlew.bat
│   ├── gradle/wrapper/gradle-wrapper.properties
│   └── app/
│       ├── build.gradle
│       ├── proguard-rules.pro
│       └── src/
│           ├── debug/AndroidManifest.xml
│           ├── debugOptimized/AndroidManifest.xml
│           └── main/
│               ├── AndroidManifest.xml
│               ├── java/com/anonymous/plantcaremobileapp/
│               │   ├── MainActivity.kt
│               │   └── MainApplication.kt
│               └── res/             # Launcher icons, colors, and themes
├── doc/
│   ├── API.md
│   ├── CI_CD_ROADMAP.md
│   ├── SCREEN_FLOWS.md
│   ├── SYSTEM_DESIGN.md
│   ├── TECHNICAL_PLAN.md
│   └── design_guidelines.md
├── docs/
│   └── TECHNICAL_GUIDE.md
└── src/
    ├── PlantCare.js
    ├── assets/
    │   ├── monstera.jpg
    │   ├── peace-lily.jpg
    │   ├── plant-diary.jpg
    │   ├── rose.jpg
    │   └── snake-plant.jpg
    ├── constants/
    │   └── colors.js
    ├── data/
    │   └── plantsdata.js
    ├── screens/
    │   ├── AddPlant.js
    │   ├── Diary.js
    │   ├── HomeScreen.js
    │   ├── Schedule.js
    │   └── WelcomeScreen.js
    ├── styles/
    │   ├── addPlantStyles.js
    │   ├── diaryStyles.js
    │   ├── homeStyles.js
    │   ├── scheduleStyles.js
    │   ├── styles.js
    │   └── welcomeStyles.js
    └── utils/
        ├── date.js
        ├── imageSource.js
        ├── imageStorage.js
        ├── Plantapi.js
        └── storage.js
```

The `.expo/`, `dist/`, `node_modules/`, and Android build-cache directories
are generated or dependency content rather than application source.
`.gitignore` excludes the local `android/` and `ios/` native project folders
from Git, even though the Android project is present in this workspace.

## 4. Module responsibilities

- `src/PlantCare.js`: welcome transition, bottom-tab navigation, shared plant
  and diary state, hydration status, serialized mutations, and record
  callbacks.
- `src/screens/WelcomeScreen.js`: introductory screen and start action.
- `src/screens/HomeScreen.js`: plant cards, due/overdue summary, watering,
  image editing, delete confirmation, and temporary Undo.
- `src/screens/AddPlant.js`: plant form, validation, photo preview, and
  creation callback.
- `src/screens/Schedule.js`: next-watering order and interval-edit form.
- `src/screens/Diary.js`: plant-linked notes and optional photos; add, edit,
  delete confirmation, and temporary Undo.
- `src/data/plantsdata.js`: sample plant and diary records used when storage
  has no value.
- `src/utils/storage.js`: AsyncStorage JSON load/save/remove boundary and
  serialized writes.
- `src/utils/positiveInteger.js`: shared positive whole-number input parser.
- `src/utils/persistedData.js`: persisted collection and required-field checks.
- `src/utils/date.js`: date formatting, due-date calculation, and watering
  status labels.
- `src/utils/imageStorage.js`: native image copy/removal and Web blob-to-data
  URL conversion.
- `src/utils/Plantapi.js`: PlantSolve catalog lookups on native platforms and
  a bundled catalog on Web.
- `src/utils/imageSource.js`: accepts URI strings and bundled image values.
- `src/constants/colors.js` and `src/styles/`: shared palette and screen
  presentation.

## 5. Data and persistence behavior

The AsyncStorage key is `plantcare_app_data_v1`. Writes contain `plants`,
`diary`, and `pendingDeletes` arrays. The app does not pass its in-memory Undo
snapshots to the storage helper, so the saved `pendingDeletes` array is
empty. The plant record uses `id`, `name`, `type`, `interval`, `lastWatered`,
and `image`; catalog plants can also have a compact `apiInfo` object. A diary
record uses `id`, `plantId`, `plantName`, `note`, `date`, and `image`.
Timestamp strings are used for new plant and diary IDs, with a duplicate check
within the corresponding list.

The parent and storage helper each serialize their respective asynchronous
work. The parent awaits a storage write before publishing changed arrays to
React state. Failed writes are surfaced and do not publish the attempted
change.

Startup distinguishes a missing key from a valid saved empty list. Missing
data uses the sample arrays, which are persisted only on the next successful
mutation. Invalid JSON, storage read failures, or an unexpected root format
are surfaced and block subsequent mutations to avoid overwriting the stored
value with sample state. The Welcome screen offers a retry after a load
failure, and the sample arrays are not shown as loaded user data. Missing
collections default to empty arrays; malformed collections or records are
rejected. Required plant and diary fields are validated, but there is no
backup or schema migration. See [`API.md`](./API.md) and
[`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) for details.

## 6. Implemented functionality and limitations

| Feature | Current source behavior |
| --- | --- |
| Welcome flow | Shown before the tab navigator; Start Tracking reveals the tabs. |
| Home collection | Shows plants, calculated watering status, reminders, and an empty state. |
| Add plant | Requires name/type and parses a positive integer interval; optional photo. Decimal or trailing text may be truncated. |
| Plant editing | Home replaces the image; Schedule edits interval. Name/type editing is not present. |
| Watering | Home and Schedule update `lastWatered` and await persistence. |
| Schedule | Sorts by next watering date and awaits an interval save before closing the editor. |
| Diary | Adds, edits, and deletes entries with optional images; deletion has a five-second Undo. |
| Plant-to-diary association | Entries use plant IDs; editing writes the selected plant ID and name before saving. |
| Plant deletion | Removes linked diary entries with the plant; five-second in-memory Undo restores both. |
| Plant catalog | Native requests PlantSolve with a Jina Reader fallback; Web uses a small bundled catalog. |
| Image handling | Native selected images are copied into app document storage. Web blob URLs are converted to data URLs for local persistence. |
| Notifications | In-app alerts/reminders only; no background schedule or push notification. |

The plant and diary Undo snapshots are not saved across app restarts.
`removePersistedImage()` is not called by current delete/replacement flows, so
unreferenced native image files can remain. Web images use browser-local
storage and are not backed up; runtime persistence was not checked in this
review. Home and Diary Undo banners use different offsets; Diary dialogs use
sheet-style cards while plant and schedule dialogs are centered.
Further details are in the [screen flows](./SCREEN_FLOWS.md) and
[design guidelines](./design_guidelines.md).

## 7. Install and run

### Requirements

- Node.js supported by Expo SDK 57 and npm.
- For local Android: Android Studio/Android SDK and an emulator or connected
  Android device.
- For Web: a supported browser.
- For EAS cloud builds: an Expo account and the EAS CLI.

### Install dependencies

From the project root:

```sh
npm ci
```

The lockfile is present, so `npm ci` installs the locked dependency tree.

### Start the Expo development server

```sh
npm run start
```

The script maps to `expo start`. Use the Expo CLI prompts to open a configured
target. The app's operation on a given device/browser is not asserted here.

### Android

```sh
npm run android
```

This maps to `expo run:android` and requires Android tooling. It runs a local
native development build; it is not the same as a verified release APK.

### Web

```sh
npm run web
```

This maps to `expo start --web`. `react-native-web` is in the dependency
manifest. Web bundle export completed successfully. Interactive browser
flows and image persistence across reload have not been tested. Browser
storage limits and cleared browser data remain limitations.

### EAS builds

`eas.json` defines an Android preview profile with internal distribution and
APK output, plus development and production profiles. With EAS CLI installed
and authenticated, the configured Android preview command is:

```sh
eas build --platform android --profile preview
```

The production profile is also present. EAS builds were not run. `npm test`
runs the shared interval parser tests; there are no `build` or `lint` npm
scripts.

## 8. Testing and verification status

The automated tests cover positive-integer parsing and persisted-data
validation. Expo Web and Android JavaScript bundle exports passed, and browser
smoke checks covered core flows. No Android device/emulator test or EAS build
was run.

## 9. Development priorities

1. Define backup/recovery behavior and extend validation for optional record
   metadata without overwriting valid data on load failure.
2. Add a regression test for changing an existing diary entry's plant.
3. Decide and implement safe image cleanup.
4. Account for Web storage quotas and define a clear image-persistence limit.
5. Align modal and temporary notification positioning.
6. Add automated and on-device validation when the project adopts a test
   strategy.

