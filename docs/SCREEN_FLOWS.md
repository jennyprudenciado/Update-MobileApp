# PlantDiary Screen Flows

## 1. Navigation

`index.js` registers `App.js`, which forwards to `src/PlantCare.js`. The app
shows `WelcomeScreen` first. Pressing **Start Tracking** replaces it with a
React Navigation bottom-tab navigator:

| Tab | Component | Purpose |
| --- | --- | --- |
| Home | `src/screens/HomeScreen.js` | Plant collection, watering actions, image editing, delete and Undo |
| Schedule | `src/screens/Schedule.js` | Ordered watering dates and interval editing |
| Diary | `src/screens/Diary.js` | Plant notes/photos, entry add/edit/delete and Undo |
| Add Plant | `src/screens/AddPlant.js` | Plant creation form |

These are tabs, not a nested stack of separate detail screens. Home buttons
use tab navigation to open Add Plant or Diary.

## 2. Shared data flow

```text
Screen input/action
  -> screen validation and local form state
  -> callback prop to src/PlantCare.js
  -> serialized parent mutation
  -> AsyncStorage write
  -> publish React state after successful write
  -> updated screen props and render
```

The parent component owns the plant and diary arrays. A write failure is
reported to the user and the failed change is not published to shared state.
The storage module also queues writes to preserve their order.

## 3. Welcome and data loading

The parent starts loading saved data on mount, while the welcome screen is
visible. The Start Tracking button is enabled only after loading succeeds.

- No stored value: the sample arrays are used; they are saved only after the
  next successful mutation.
- Saved empty arrays: they remain empty.
- Read/parse failure: the Welcome screen explains the error and offers a
  retry. Tabs remain hidden, sample records are not presented as loaded data,
  and mutations remain blocked until loading succeeds.

## 4. Add a plant

1. The user opens the Add Plant tab and enters a name, type, and interval.
2. The screen trims the text and checks the required values. It accepts an
   interval only when it contains digits and is a positive safe integer.
   Decimal and trailing text input are rejected.
3. Optional photo selection requests library permission, opens Expo
   ImagePicker, and shows a preview. On native, selected files are copied
   into app document storage. On Web, blob URIs are converted to data URLs
   before the record is saved.
4. Plant search uses the bundled catalog on Web. Native platforms request
   PlantSolve. A network-level error on a direct request triggers the Jina
   Reader proxy; HTTP, parse, and direct-timeout errors do not.
   The selected catalog entry can fill the name, type, and optional photo;
   the user still chooses the watering interval.
5. The screen creates a timestamp-string ID and current `lastWatered` date,
   then awaits `onAddPlant(record)`.
6. The parent checks hydration and duplicate ID, writes the updated collection
   to AsyncStorage, and publishes state only after that write succeeds.
7. On success, the form clears, navigates to Home, and shows a confirmation
   alert. On failure it keeps the form available and reports the error.

## 5. Home actions

### Water a plant

Home calls `onWaterPlant(id)`. The parent updates only that plant's
`lastWatered` date, awaits persistence, and then publishes the new collection.
It reports success or failure with an alert. Watering status and due date are
derived from the saved date and interval.

### Edit a plant

Tapping a plant image opens the image editor. The user chooses and previews a
replacement, then saves. The image is copied on native platforms and the
parent replaces the matching plant record after a successful storage write.
This Home flow changes only the image; it does not edit plant name or type.
The replacement flow does not remove the previous image file.

### Delete and Undo a plant

1. Delete opens a confirmation dialog.
2. Confirm calls the parent's delete callback. The parent removes the plant
   and matching diary entries, then saves both arrays before publishing them.
   The returned snapshot holds the removed records and former position.
3. Home keeps the snapshot in memory and shows an Undo banner for five
   seconds.
4. Undo restores the plant and its diary entries, awaits persistence, and
   updates shared state.
5. If the app closes or the timer expires, the snapshot is lost.

The confirmation explains the five-second Undo window. If Undo expires, the
removed plant and diary entries are not retained. Associated image files are
not cleaned up.

## 6. Schedule

Schedule sorts a copy of the plant array by calculated next-watering date,
shows each status and interval, and offers Water Now and Edit Schedule.

The interval editor accepts a positive whole number. It disables saving
controls while the asynchronous parent callback runs and closes only after
the callback returns `true`. A failed save keeps the dialog open and shows an
error. The parent validates again and awaits the storage write before
publishing state.

## 7. Diary

### Add and edit

1. The user opens the Diary tab and selects **+** to open the entry modal.
2. The user selects a plant by ID, enters a non-empty note, and may select
   and preview a photo.
3. Saving copies the image on native platforms or converts the Web blob URI,
   builds or updates the entry, and awaits the parent callback.
4. The parent normalizes the entry association, saves it, and publishes the
   change. New entries are prepended; edits retain their
   entry ID and date.

When editing, the screen places the newly selected plant ID and name on the
updated entry before calling the parent. Parent normalization resolves that
ID first, so an entry can be reassigned to another plant.

### Delete and Undo an entry

Diary deletion has a confirmation dialog and a five-second Undo banner. The
parent saves the reduced diary array first. Undo reinserts the entry near its
previous neighbors and saves again. Undo state is in memory only. Deleting a
diary entry does not remove its image file.

## 8. Watering status and reminders

`src/utils/date.js` adds the interval in days to `lastWatered` and compares
calendar dates at midnight. Labels are `Overdue`, `Due Today`, `Due Tomorrow`,
or `Due in N days`. Home shows due-today/overdue names and can issue one
in-app alert reminder after data loads. The project does not schedule
background or push notifications.

## 9. Modals, errors, and positioning

Image editing, delete confirmations, interval editing, and diary entry forms
are React Native `Modal` dialogs with a shared dark overlay. Plant and
schedule dialogs use centered, bounded cards; Diary dialogs use sheet-style
cards. Home and Diary Undo banners use different bottom offsets. The layout
has not been compared across Android devices and screen sizes.

Most asynchronous save and image-picker failures are logged and surfaced by
alerts or inline form errors. On a storage-load failure, the app stays on the
Welcome screen, hides the sample records, blocks mutations, and offers a retry.

## 10. Verification note

These flows describe source behavior. Expo Web and Android JavaScript bundle
exports passed. Browser checks covered startup, adding a plant, invalid
interval rejection, and the storage-load retry state. `npm test` covers
interval parsing and persisted-data validation. No Android device or emulator
test was run.

