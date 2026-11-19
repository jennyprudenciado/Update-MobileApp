# PlantDiary System Design

## 1. Purpose and scope

PlantDiary is a local-first plant-care diary for people who want to keep plant
details, watering intervals, and growth notes in one place. PlantSolve
provides plant catalog information, but user records remain local. There is
no account, cloud sync, or push-notification service.

This document describes the source currently in the repository. Expo Web
and Android JavaScript bundle exports passed, but interactive browser and
Android runtime behavior have not been tested.

## 2. Technology

| Area | Current implementation |
| --- | --- |
| App framework | Expo `~57.0.32` |
| UI/runtime | React `19.2.3`, React Native `0.86.3` |
| Navigation | React Navigation 7 bottom tabs |
| Local records | AsyncStorage `2.2.0` |
| Photo selection | `expo-image-picker` |
| Native image files | `expo-file-system/legacy` |
| Safe areas | `react-native-safe-area-context` |
| Web renderer | `react-native-web` |
| Build configuration | Expo app config and `eas.json`; Android preview APK profile is configured |

The dependency versions above come from `package.json`; configured build
profiles are not evidence that a build has been run successfully.

## 3. Application structure

```text
index.js
  -> App.js
    -> src/PlantCare.js
       -> WelcomeScreen (before the user starts)
       -> bottom-tab navigator
          -> HomeScreen
          -> Schedule
          -> Diary
          -> AddPlant
       -> shared plant/diary state and mutation callbacks
       -> utils/storage.js -> AsyncStorage
```

`index.js` registers the root component with Expo. `App.js` re-exports
`src/PlantCare.js`. The application coordinator owns the shared arrays,
hydration state, and data mutations. Screen components receive data and
callbacks through props; their form and modal state remains local to each
screen.

| Area | Files | Responsibility |
| --- | --- | --- |
| App entry | `index.js`, `App.js` | Expo registration and app-component forwarding |
| Coordinator/navigation | `src/PlantCare.js` | Welcome transition, tabs, shared state, load/save, mutation queues and callbacks |
| Screens | `src/screens/*.js` | Welcome, Home, Add Plant, Schedule, and Diary UI |
| Seed records | `src/data/plantsdata.js` | Initial sample plants and diary entries |
| Utilities | `src/utils/date.js`, `imageSource.js`, `imageStorage.js`, `positiveInteger.js`, `persistedData.js`, `storage.js`, `Plantapi.js` | Date/status rules, validation, image handling, AsyncStorage, and plant catalog |
| Shared design | `src/constants/colors.js`, `src/styles/*.js` | Palette and screen-specific React Native styles |
| Expo/build configuration | `package.json`, `app.json`, `eas.json` | Dependencies, scripts, app metadata, EAS profiles |

The existing Android native project is under `android/`. The repository
`.gitignore` treats the native Android and iOS folders as generated/ignored
output; local Android build files may therefore not be part of a clone.

## 4. Data model

### Plant

```js
{
  id: String,
  name: String,
  type: String,
  interval: Number,
  lastWatered: DateOrSerializedDate,
  image: StringOrBundledImageValueOrNull,
  apiInfo?: Object
}
```

New IDs are millisecond timestamps converted to strings. The parent rejects a
duplicate ID already in the current plant list. The code does not use a UUID
generator or enforce uniqueness of names/types.

### Diary entry

```js
{
  id: String,
  plantId: StringOrNull,
  plantName: String,
  note: String,
  date: DateOrSerializedDate,
  image: StringOrBundledImageValueOrNull
}
```

The Diary form selects plants by stable ID and stores the ID and name
together. Parent normalization matches an existing ID first, then the saved
name, then the entry ID as a legacy fallback. Plant deletion removes linked
diary entries while the temporary Undo snapshot retains them for restoration.

## 5. State and persistence

Plant and diary arrays live in `src/PlantCare.js`. The component uses React
state for rendering and refs for the latest arrays and successful hydration
status. A parent-level mutation queue serializes app actions; the storage
module has a separate queue for writes.

Each mutation awaits the storage write before updating the refs and React
state. Failed writes are logged and surfaced to the initiating flow rather
than publishing the unsaved change. There is no general state-save effect:
successful user mutations explicitly call the persistence helper.

The storage key is `plantcare_app_data_v1`; writes contain `plants`, `diary`,
and `pendingDeletes` arrays. The parent does not pass Undo snapshots to the
storage helper, so the saved `pendingDeletes` array is empty. AsyncStorage is
local app storage, not a backup, sync service, or application-level encrypted
store.

### Startup cases

- **No value found:** the parent uses sample records. They are saved only with
  the next successful mutation, not simply because the app loaded.
- **Saved empty arrays:** empty lists are valid saved state and remain empty.
- **Read/parse/root-format failure:** the helper throws for storage errors,
  invalid JSON, and falsy, primitive, or array roots. The Welcome screen
  reports the error and offers a retry. The app does not show initial sample
  records as loaded data or allow mutations until loading succeeds.
- **Collection and record validation:** missing collections default to empty
  arrays; present non-array collections and invalid plant or diary records
  cause loading to fail. Required fields are checked, and older diary entries
  without `plantId` remain supported. Records are not repaired automatically.

No backup copy, restore operation, migration, or schema version is
implemented. Parse/read errors are distinguished from a missing key, but
invalid saved data cannot be recovered in-app.

## 6. Watering rules

`src/utils/date.js` calculates a due date by adding the plant's interval in
days to `lastWatered`. Status is derived rather than stored:

- Past date: `Overdue`
- Today: `Due Today`
- Tomorrow: `Due Tomorrow`
- Later: `Due in N days`

The helper compares calendar dates at midnight. Home displays due-today and
overdue reminders and issues one in-app `Alert` reminder after the Home screen
has loaded, when applicable. It does not schedule background or push
notifications. Schedule sorts a copy of the plant array by due date.

Water Now updates `lastWatered` to the current date and waits for persistence.
Schedule changes validate a positive whole number and await the parent save
before the modal closes.

## 7. Plant catalog

The Add Plant screen searches PlantSolve's index locally and fetches details
for selected plants on native platforms. It caches the index and detail
requests and tries the Jina Reader proxy after a direct network-level error;
HTTP errors, invalid responses, and direct-request timeouts do not use that
fallback. Web uses the small catalog bundled in `src/utils/Plantapi.js`
rather than making PlantSolve requests. The app maps optional fields
defensively and saves selected care information as `apiInfo`, not the
complete API response.

## 8. Image flow

The plant and diary forms use Expo ImagePicker after requesting media-library
permission. Selected images are previewed before saving.

On native platforms, `persistImageUriToAppStorage()` copies a selected URI to
the app document directory and stores the returned URI in the record. On Web,
temporary blob URIs are converted to data URLs and saved through AsyncStorage.
Persistence across a browser reload has not been tested. Browser
storage limits and user-cleared browser data remain limitations.

The `removePersistedImage()` utility can remove native `file://` files, but
current deletion and replacement flows do not call it. Old image files may
remain after a record is changed or deleted. A failed browser blob conversion
is logged and thrown so the form does not save a temporary URI.

## 9. Feature state

The following status reflects source inspection and bundle exports, not
runtime testing:

| Feature | Source status | Notes |
| --- | --- | --- |
| Welcome and tab navigation | Implemented | Start button reveals Home, Schedule, Diary, and Add Plant tabs. |
| Plant collection and watering status | Implemented | Home list, summary, derived due dates, and reminders. |
| Add plant | Implemented | Required text, positive whole-number interval, optional image. Decimal and trailing text are rejected. |
| Plant editing | Partial | Home edits the image; Schedule edits interval. Name/type editing is not provided. |
| Plant deletion and Undo | Implemented with limitation | Deletes associated diary entries and restores them with the plant during the five-second in-memory Undo. |
| Schedule editing | Implemented | Async save is awaited; positive whole number required. |
| Diary add/edit/delete | Implemented | Editing writes the newly selected plant ID and name; entry deletion has a five-second Undo. |
| Plant catalog | Implemented with limitation | Native PlantSolve requests; Web uses a bundled fallback catalog. |
| Image selection/preview | Implemented | Native copies selected images; Web blob URLs become data URLs for local storage. |
| Persistent local data | Implemented with limitations | AsyncStorage; required plant/diary fields are validated, but there is no backup, restore, or sync. |
| Backup/recovery | Partial | Load failures offer a retry; there is no backup copy or restore flow. |
| Web image persistence | Implemented in source; runtime persistence unverified | Blob URLs are converted to data URLs; browser storage limits and clearing browser data remain limitations. |
| Accounts, cloud sync, push reminders | Not implemented | No backend or background notification service is configured. |
| Cross-platform operation | Partially verified | Web and Android JavaScript exports passed. Browser checks covered key flows; no Android device test was run. |

## 10. Current issues and future work

- Add a safe recovery/backup strategy while preserving valid stored data.
- Validate optional metadata and define an explicit schema migration strategy.
- Handle Web image storage limits and define expected behavior when browser
  data is cleared.
- Decide when app-managed image files can safely be deleted and wire cleanup
  into replacement/deletion.
- Align Home and Diary Undo banner offsets and review the different centered
  and sheet-style modal layouts.
- Add a regression test for diary reassignment and run Android device checks
  for storage, picker, and modal behavior.
- Add automated CI only if/when a workflow is introduced; none is currently
  configured in this repository.

