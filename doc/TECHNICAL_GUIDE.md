# PlantDiary Technical Defense Guide

This guide describes the current source implementation. Expo Web and Android
JavaScript bundle exports passed, but interactive browser and Android
runtime behavior have not been tested.

## 1. Architecture overview

```text
index.js -> App.js -> src/PlantCare.js
                         |-- WelcomeScreen
                         `-- bottom tabs
                              |-- HomeScreen
                              |-- Schedule
                              |-- Diary
                              `-- AddPlant
                         |-- shared plants and diary arrays
                         `-- utils/storage.js -> AsyncStorage
```

`index.js` registers the root component with Expo. `App.js` forwards to
`src/PlantCare.js`, the app coordinator. The coordinator owns shared plant
and diary data, loads it on mount, and passes records and callbacks to the
screens. Each screen keeps transient form and modal values in its own state.

## 2. Source file responsibilities

| File | Responsibility |
| --- | --- |
| `index.js` | Registers the root component with Expo. |
| `App.js` | Exports `src/PlantCare.js` as the root app. |
| `src/PlantCare.js` | Owns tabs, welcome transition, shared arrays, hydration, mutation callbacks, and storage writes. |
| `src/screens/WelcomeScreen.js` | Introduction and Start Tracking action. |
| `src/screens/HomeScreen.js` | Plant cards, reminders, watering, image editing, delete confirmation, and temporary Undo. |
| `src/screens/AddPlant.js` | Validates and submits plant details with optional photo. |
| `src/screens/Schedule.js` | Sorts by next watering date and edits intervals. |
| `src/screens/Diary.js` | Displays entries and supports add, edit, delete, photo selection, and temporary Undo. |
| `src/data/plantsdata.js` | Sample plant and diary arrays used when no saved value exists. |
| `src/utils/storage.js` | AsyncStorage JSON read/write/remove helpers and write queue. |
| `src/utils/positiveInteger.js` | Shared positive whole-number parser for Add Plant and Schedule. |
| `src/utils/persistedData.js` | Validates saved collections and required plant and diary fields. |
| `src/utils/date.js` | Date formatting, due dates, and watering status labels. |
| `src/utils/imageSource.js` | Resolves a URI string or bundled image value for React Native Image. |
| `src/utils/imageStorage.js` | Copies native images and converts browser blob URLs to data URLs. |
| `src/utils/Plantapi.js` | PlantSolve catalog lookup, response mapping, and Web fallback catalog. |
| `tests/positiveInteger.test.cjs` | Tests the shared positive whole-number parser. |
| `tests/persistedData.test.cjs` | Tests valid legacy data and malformed saved records. |
| `src/constants/colors.js` | Shared color tokens. |
| `src/styles/*.js` | Shared and screen-specific presentation styles. |

## 3. Startup, hydration, and persistence

1. `index.js` registers `App`, which imports `src/PlantCare.js`.
2. The parent starts with sample arrays and starts `loadPersistedAppData()`
   in an effect while the Welcome screen is visible.
3. If the storage key has no value, the samples are used and loading is
   considered successful. A valid saved object with empty arrays remains
   empty.
4. If reading or JSON parsing fails, or the root value is falsy, primitive,
   or an array, the storage helper throws. The parent keeps mutations blocked
   and shows an error state on Welcome instead of opening the tabs with sample
   records.
5. The Welcome error state offers a retry. Tabs open only after data loading
   succeeds.
6. Successful mutations explicitly call the persistence helper. The parent
   awaits the write before publishing arrays to its refs and React state.
   There is no general effect that automatically saves any state change.

The storage key is `plantcare_app_data_v1`. AsyncStorage stores JSON text,
not JavaScript objects. Serialization turns Date values into strings; date
helpers construct dates when displaying or calculating watering state.

The parent has a mutation queue and the storage module has a write queue.
These queues serialize actions/writes. A failed write is logged and
reported; the failed mutation is not published to shared React state.

There is no backup, restore, schema migration, or schema version. Storage
normalization defaults missing collections to empty arrays, rejects present
non-array collections, and checks required plant and diary fields. It supports
older diary entries without `plantId`. Optional API metadata and
`pendingDeletes` entries are not validated. Writes include an empty
`pendingDeletes` array by default; the app does not persist its Undo
snapshots.

## 4. Records and associations

A plant record has `id`, `name`, `type`, `interval`, `lastWatered`, and
`image`. Plants selected from the catalog may also include a compact `apiInfo`
object. Add Plant creates a timestamp-string ID and current last-watered
date. It accepts a positive safe integer expressed with digits only; decimal
and trailing text input are rejected. The parent rejects an ID already in
the current plant list; IDs are not generated with a UUID library.

A diary record has `id`, `plantId`, `plantName`, `note`, `date`, and `image`.
The Diary screen selects by plant ID and saves the ID and name together.
Parent normalization also matches older entries by name when they have no
valid ID.

New entries are associated with the selected plant ID. When editing an entry,
the form writes the selected plant ID and name onto the updated record before
calling the parent, so reassignment is supported by the current flow.

## 5. Plant catalog API

The Add Plant screen uses PlantSolve's plant index and detail endpoints on
native platforms. It caches the index and detail requests, searches the
downloaded index locally, and falls back to the Jina Reader proxy if a direct
network-level request fails. HTTP errors, invalid responses, and direct
request timeouts do not use that fallback. It maps alternate response fields
and shows a basic search result if detail loading fails.

Web uses the small catalog bundled in `src/utils/Plantapi.js` instead of
requesting PlantSolve. The selected plant's compact care details are saved
with the record under `apiInfo`; the full service response is not stored.
PlantSolve attribution is shown in the Add Plant screen.

## 6. Main feature flows

### Add and edit plants

Add Plant trims required text and accepts only a positive whole-number
interval. Decimal and trailing text are rejected.
Optional image selection asks for media-library permission and
shows a preview. The screen creates a record and awaits the parent callback.
On successful save it clears the form and navigates to Home.

Home's plant editor changes only the image. Plant name/type editing is not
implemented in that screen. Schedule separately edits the interval.

### Watering

`src/utils/date.js` adds the interval in days to `lastWatered` and compares
calendar days at midnight. The labels are `Overdue`, `Due Today`,
`Due Tomorrow`, and `Due in N days`. There is no `Up to Date` label.

Home and Schedule call the parent with a plant ID. The parent updates only
that plant's `lastWatered` value, awaits storage, and then publishes the new
array. Home shows due-today/overdue reminders and may issue one in-app alert
after the data loads. There are no scheduled background or push notifications.

### Schedule editing

The editor validates a positive integer in the screen and parent. It shows a
saving state, awaits the async callback, and closes only when it returns
`true`. Failed saves keep the editor open with an error.

### Plant deletion and Undo

Home opens a confirmation dialog, then awaits the parent's delete operation.
The parent removes the plant and its associated diary entries, saves both
arrays, and returns a snapshot containing the records, former position, and
five-second expiry. Home displays an Undo banner. Undo restores the plant and
entries and saves both arrays. The snapshot and timer exist only in memory
and do not survive app restart. The confirmation text explains the
five-second Undo window.

### Diary entries

Diary requires a selected plant and non-empty note and allows an optional
photo. New entries are prepended so newest entries appear first. Editing
retains the entry ID and date. Delete has a confirmation dialog and a
five-second in-memory Undo. Deleting a diary entry does not remove its image
file.

## 7. Image selection and platform behavior

`expo-image-picker` requests media-library permission, opens the photo
library, and provides a preview URI. For native platforms,
`persistImageUriToAppStorage()` copies selected files into the app's document
directory and the record stores that URI. Existing app-directory URIs are
reused. Remote images are downloaded on native; if a download fails, the
remote URL is kept.

On Web, blob URLs are converted to data URLs before being stored through
AsyncStorage. Persistence across a browser reload has not been tested.
Browser storage limits and user-cleared browser data can still remove
saved images, so this is not a backup.

`removePersistedImage()` can remove a native `file://` image and logs cleanup
errors. Current plant and diary replacement/deletion flows do not call it,
so unused native image files can remain. If converting a Web blob URL fails,
the helper logs and throws so the form does not save a temporary URI.

## 8. Error handling and unresolved behavior

- Read errors, invalid JSON, and invalid root values are thrown by the
  storage helper, surfaced by the parent, and do not trigger a write.
- Required plant and diary fields are validated. Invalid data blocks loading
  rather than being silently replaced; optional metadata is not validated.
- Write errors are logged and surfaced through an alert or form error; the
  parent publishes changes only after the write succeeds.
- Schedule save is awaited, and its modal remains open on failure.
- No backup or automated recovery protects saved data.
- The Home and Diary Undo banners use different bottom offsets. Plant and
  schedule dialogs use centered, bounded cards; Diary dialogs use separate
  sheet-style cards.
- Node tests cover interval parsing and persisted-data validation. Web and
  Android bundle exports passed, and browser checks covered core flows. No
  Android device test or runtime image-persistence test was run.

## 9. Useful defense questions

1. **What is the app's source of truth?**

   `src/PlantCare.js` owns the shared plant and diary arrays. Screens receive
   them as props and request changes through callbacks.

2. **When does the app save data?**

   Each parent mutation awaits `savePersistedAppData()` before updating
   shared state. Data is not saved by a general state effect.

3. **What happens on first launch?**

   A missing storage key uses sample records. They are written with the next
   successful mutation, not simply as a result of loading.

4. **How is an empty collection represented?**

   A saved object with empty arrays is valid and stays empty; it is different
   from a missing key.

5. **How does the app respond to corrupted storage?**

   Read/parse/root-format errors are reported and block mutations so sample
   data is not written over the stored value. There is no recovery UI.

6. **How is the next watering date calculated?**

   `getNextWateringDate()` adds the interval to `lastWatered`; the displayed
   status is derived from the calendar-day difference.

7. **Does Undo survive restarting the app?**

   No. The snapshot and timer exist only in component memory for five seconds.

8. **What happens to diary entries when a plant is deleted?**

   The entries are removed with the plant and held in the in-memory Undo
   snapshot. Undo restores both the plant and its entries within five seconds.

9. **Can a diary entry be reassigned to a different plant?**

   Yes. The edit form updates both `plantId` and `plantName` from the selected
   plant before saving.

10. **Are images durable on both platforms?**

    Native selected images are copied into app document storage. Web blob
    URLs are converted to data URLs, but persistence across reloads has not
    been tested. Browser storage limits and clearing remain
    platform limitations.

11. **What should be said about testing?**

    `npm test` covers interval parsing and persisted-data validation. Web and
    Android bundle exports passed, and browser smoke checks covered key flows.
    No Android device test was run.

