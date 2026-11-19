# PlantDiary Technical Defense Reviewer

Use the answers as study notes, not a script to memorize. Explain the idea in your own words, then point to the source reference and walk through a real example.

## 1. What problem does PlantDiary solve, and what are its main screens?

**Simple Answer:** PlantDiary helps users keep a plant list, remember watering dates, and write photo-based growth notes.

**Detailed Explanation:** The app has a Welcome screen followed by Home, Schedule, Diary, and Add Plant tabs. Home shows saved plants and watering status. Schedule sorts plants by their next watering date and lets users change intervals. Diary holds notes and optional photos linked to plants. Add Plant accepts user-entered details and can search the PlantSolve catalog.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/screens/WelcomeScreen.js`](../src/screens/WelcomeScreen.js), [`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js), [`src/screens/Schedule.js`](../src/screens/Schedule.js), [`src/screens/Diary.js`](../src/screens/Diary.js), [`src/screens/AddPlant.js`](../src/screens/AddPlant.js).

**Example:** Selecting Schedule displays each plant's next watering date and status; selecting Water Now calls the parent watering handler.

**Possible Follow-up:** Does the application have a backend or user accounts?

**Follow-up Answer:** No. Plant records are stored locally with AsyncStorage. There is an external PlantSolve catalog lookup, but the app does not have its own backend, accounts, or cloud sync.

## 2. What is the app entry point, and how does navigation start?

**Simple Answer:** Expo registers `App.js` from `index.js`, and `App.js` re-exports the coordinator in `src/PlantCare.js`.

**Detailed Explanation:** `index.js` calls `registerRootComponent(App)`. `App.js` exports the default component from `src/PlantCare.js`. The coordinator initially renders `WelcomeScreen`; its Start Tracking callback changes local state so the React Navigation bottom-tab navigator is rendered.

**Actual Code Reference:** [`index.js`](../index.js), [`App.js`](../App.js), [`src/PlantCare.js`](../src/PlantCare.js).

**Example:** Tapping Start Tracking changes `showWelcome`; the four tab screens are then available through the bottom navigator.

**Possible Follow-up:** Is Welcome a navigation route?

**Follow-up Answer:** In the current implementation, it is conditionally rendered by the coordinator before the tab navigator, rather than registered as a route in that tab navigator.

## 3. What is the difference between props and state in this app?

**Simple Answer:** State belongs to a component and changes over time. Props are values or callbacks passed to a child by its parent.

**Detailed Explanation:** `PlantCare.js` owns the shared `plants` and `diary` state. It passes those arrays and mutation callbacks to screens. A screen such as `Diary.js` keeps form values and modal visibility in local state, then calls a prop callback when it needs a shared diary record saved. React re-renders affected components when state or their props change.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/screens/Diary.js`](../src/screens/Diary.js), [`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js).

**Example:** The selected plant and note are local form state in Diary; after a valid save, `onAddDiary` sends the new record to the parent.

**Possible Follow-up:** Why not keep a separate plant list inside each screen?

**Follow-up Answer:** That could let Home and Schedule show different copies of the same data. The parent owns the shared records and passes the same updated source to each screen.

## 4. What does `useState` do here?

**Simple Answer:** `useState` stores values that affect what a component displays.

**Detailed Explanation:** The coordinator uses it for the plant list, diary list, welcome flow, and hydration status. Screens use it for inputs, modal visibility, loading/error states, and pending Undo notices. Calling a state setter requests a render with the new value.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/screens/AddPlant.js`](../src/screens/AddPlant.js), [`src/screens/Diary.js`](../src/screens/Diary.js), [`src/screens/Schedule.js`](../src/screens/Schedule.js).

**Example:** `Schedule.js` uses `editModalVisible` to decide whether to show the schedule editor.

**Possible Follow-up:** What if a value changes but is not stored in state?

**Follow-up Answer:** React may not re-render just because an ordinary local variable changed. Values used to control the UI should generally be state or derived from current props/state.

## 5. How does `useEffect` work in this project?

**Simple Answer:** `useEffect` runs side-effect work after rendering, such as loading saved data or cleaning up timers.

**Detailed Explanation:** `PlantCare.js` has an effect that loads AsyncStorage once when the coordinator mounts and marks itself as unmounted in cleanup. Add Plant aborts an outstanding catalog request on unmount. Home and Diary clear their Undo timers during cleanup. Effects re-run according to their dependency arrays; an empty array means the setup is tied to that mounted component instance.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/screens/AddPlant.js`](../src/screens/AddPlant.js), [`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js), [`src/screens/Diary.js`](../src/screens/Diary.js).

**Example:** If Add Plant is removed while a catalog request is in flight, its cleanup aborts that request so the screen does not keep waiting on it.

**Possible Follow-up:** Why does an effect need cleanup?

**Follow-up Answer:** Cleanup releases work owned by the screen, such as timers or requests, and helps prevent callbacks from acting after the screen is gone.

## 6. What is the purpose of `useRef` in the shared data coordinator?

**Simple Answer:** The refs hold the latest plant and diary values for queued operations without making the refs themselves cause a render.

**Detailed Explanation:** React state is used to display the data. `plantsRef` and `diaryRef` are updated after a save succeeds so later queued mutations can read current records even if a callback was created during an earlier render. Other refs track whether storage loading succeeded and serialize pending mutations.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), especially the refs and `enqueueMutation` / `persistAndPublish`.

**Example:** If two plant updates are queued close together, the second mutation reads the latest ref after the first write rather than rebuilding from an outdated render snapshot.

**Possible Follow-up:** Why not use refs as the only state?

**Follow-up Answer:** Updating a ref does not make React render. The app still needs React state setters to update visible screens; refs are used for current values needed by asynchronous work.

## 7. What does `useMemo` do, and is `useCallback` used?

**Simple Answer:** `useMemo` caches a computed value while its dependencies are unchanged. The project uses it to sort the schedule. I did not find project-owned `useCallback` usage.

**Detailed Explanation:** In `Schedule.js`, `useMemo` makes a sorted copy of `plants` when the `plants` prop changes. Copying before sorting avoids mutating the shared array. `useCallback` would memoize a function identity, but it should only be introduced where it has a concrete benefit; it is not required just because a project uses hooks.

**Actual Code Reference:** [`src/screens/Schedule.js`](../src/screens/Schedule.js).

**Example:** After a plant's watering date changes, the `plants` prop changes, and the memoized sorted order is recalculated.

**Possible Follow-up:** What is the difference between `useMemo` and `useCallback`?

**Follow-up Answer:** `useMemo` caches a returned value; `useCallback` caches a function reference. Both depend on dependency arrays.

## 8. How does saved data load when the app starts?

**Simple Answer:** The coordinator calls `loadPersistedAppData`; if no saved data exists, it uses the sample plant and diary data.

**Detailed Explanation:** `src/utils/storage.js` reads the `plantcare_app_data_v1` key and parses its JSON. The coordinator normalizes diary links to current plants, updates refs and React state, and marks data as ready only when loading succeeds. Missing storage is a normal first-launch case; storage or parse failures are logged and surfaced with an alert.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/utils/storage.js`](../src/utils/storage.js), [`src/data/plantsdata.js`](../src/data/plantsdata.js).

**Example:** A first launch with no key loads the initial sample records. A later launch with a saved key should load the stored arrays.

**Possible Follow-up:** Has restart persistence been verified on a device?

**Follow-up Answer:** Not in this assessment. The storage code is present, but a full device close-and-reopen check remains to be done.

## 9. How are shared plant and diary changes saved?

**Simple Answer:** The screen calls a coordinator callback; the coordinator queues the mutation, writes the updated arrays, then publishes them to React state.

**Detailed Explanation:** The mutation queue prevents overlapping changes from reading the same old values and overwriting one another. `persistAndPublish` first calls `savePersistedAppData`, then updates refs and calls `setPlants` and `setDiary`. The storage utility has its own write queue to preserve write order.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js) (`enqueueMutation`, `persistAndPublish`, and mutation handlers); [`src/utils/storage.js`](../src/utils/storage.js) (`savePersistedAppData`).

**Example:** Water Now creates an updated plant with a new `lastWatered` date, persists the next plant list, and then causes Home and Schedule to receive the new value.

**Possible Follow-up:** Why is the state not updated before the storage write?

**Follow-up Answer:** Saving first avoids showing a completed change if persistence fails. The trade-off is that the UI waits for the storage operation before displaying the update.

## 10. What happens when storage loading fails?

**Simple Answer:** The app shows a load-error state on the Welcome screen, keeps mutations blocked, and lets the user retry.

**Detailed Explanation:** The coordinator tracks loading, ready, and error states separately. The tabs are rendered only after loading succeeds. If the read or parse fails, the Welcome screen explains the problem and offers a retry; the app does not present its initial sample arrays as loaded user data.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js) (`loadSavedData`, `dataLoadStatus`, `retryDataLoad`, and mutation guards); [`src/screens/WelcomeScreen.js`](../src/screens/WelcomeScreen.js) (loading and retry states).

**Example:** If a saved JSON value is malformed, the user sees the retry option and cannot accidentally edit or replace data that failed to load.

**Possible Follow-up:** What would you change?

**Follow-up Answer:** The app already distinguishes loading, loaded, and failed states. It retries the read without enabling writes against uncertain data.

## 11. How does the watering status get calculated?

**Simple Answer:** The app adds the watering interval to the last-watered date, compares that date to today at midnight, and turns the difference into a label.

**Detailed Explanation:** `getNextWateringDate` calls `addDays`. `getDaysDifference` normalizes both dates to midnight and calculates the day difference. `getWateringStatus` maps negative days to Overdue, zero to Due Today, one to Due Tomorrow, and larger values to a `Due in N days` label.

**Actual Code Reference:** [`src/utils/date.js`](../src/utils/date.js), used by [`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js) and [`src/screens/Schedule.js`](../src/screens/Schedule.js).

**Example:** A plant last watered three days ago with a three-day interval is due today.

**Possible Follow-up:** Why compare at midnight?

**Follow-up Answer:** It prevents the current time of day from making a plant appear one day early or late when the user only needs a calendar-day status.

## 12. How does Schedule validate a new interval?

**Simple Answer:** It uses a shared parser to accept digit-only positive safe integers.

**Detailed Explanation:** `saveScheduleChanges` and Add Plant both use `parsePositiveInteger` from `src/utils/positiveInteger.js`. It rejects decimals, trailing text, zero, and unsafe integer values. Schedule also checks that its callback exists, shows an inline error on validation or persistence failure, and only closes the modal after the parent returns `true`.

**Actual Code Reference:** [`src/screens/Schedule.js`](../src/screens/Schedule.js) (`saveScheduleChanges`), [`src/screens/AddPlant.js`](../src/screens/AddPlant.js) (`addPlant`), [`src/utils/positiveInteger.js`](../src/utils/positiveInteger.js), [`src/PlantCare.js`](../src/PlantCare.js) (`updatePlantSchedule`).

**Example:** Entering zero fails the positive whole-number check, so the schedule is not saved.

**Possible Follow-up:** Is Add Plant validation equally strict?

**Follow-up Answer:** Yes. Add Plant accepts only digits that form a positive safe integer, so decimals and numeric prefixes with trailing text are rejected.

## 13. How does a diary entry stay linked to a plant?

**Simple Answer:** Diary entries store a plant ID and name, and the coordinator normalizes the link against the current plant list.

**Detailed Explanation:** `saveDiary` validates that a plant and note are selected and builds an entry with the selected plant's ID and name. The parent `normalizeDiaryEntry` prefers a matching plant ID, then falls back to name or legacy entry ID matching. Editing can reassign an entry because the screen updates both `plantId` and `plantName` before calling the parent.

**Actual Code Reference:** [`src/screens/Diary.js`](../src/screens/Diary.js) (`openEditDiary`, `saveDiary`), [`src/PlantCare.js`](../src/PlantCare.js) (`normalizeDiaryEntry`, `addDiary`, `updateDiary`).

**Example:** When editing a note and choosing another plant, the saved record receives the new plant's ID and display name.

**Possible Follow-up:** What happens to diary entries when a plant is deleted?

**Follow-up Answer:** `deletePlant` removes diary entries linked by plant ID, with a name fallback for older records, in the same persisted update. It returns an in-memory snapshot so Undo can restore the plant and those entries for five seconds.

## 14. How does the PlantSolve integration work?

**Simple Answer:** The Add Plant screen searches a plant index, displays results, and can request details for a selected plant.

**Detailed Explanation:** `Plantapi.js` calls the PlantSolve index and detail endpoints on native platforms, maps varied response fields into a normalized object, caches requests, and uses `AbortController` for cancellation and timeouts. Search is local because the service does not provide a search endpoint. On Web it uses a bundled catalog, so a Web result does not verify a live API request. Network-level direct request failures can retry through Jina; explicit HTTP/parse failures and direct timeouts are not retried that way.

**Actual Code Reference:** [`src/utils/Plantapi.js`](../src/utils/Plantapi.js) (`fetchAllPlants`, `searchPlants`, `fetchPlantDetails`, `fetchJsonWithFallback`, `getJson`); [`src/screens/AddPlant.js`](../src/screens/AddPlant.js).

**Example:** On Web, searching for Monstera uses the bundled catalog rather than making a PlantSolve request.

**Possible Follow-up:** What response formats does the code accept?

**Follow-up Answer:** The index accepts either an array or an object with a `plants` array. Detail mapping checks alternative field names and can unwrap a `plant` property.

## 15. How are selected photos saved?

**Simple Answer:** The picker returns a URI, then the image helper converts or copies it into storage before the record is saved.

**Detailed Explanation:** On native, `imageStorage.js` copies picker-owned local files into the app's document directory; remote images may be downloaded there. On Web, blob URIs are converted to data URLs because temporary blob links may not remain valid. The selected image URI is then included in the plant or diary record stored in AsyncStorage.

**Actual Code Reference:** [`src/utils/imageStorage.js`](../src/utils/imageStorage.js), [`src/screens/AddPlant.js`](../src/screens/AddPlant.js), [`src/screens/Diary.js`](../src/screens/Diary.js), [`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js).

**Example:** Before saving a diary entry with an image, `saveDiary` calls `persistImageUriToAppStorage`.

**Possible Follow-up:** Is image cleanup complete?

**Follow-up Answer:** The helper `removePersistedImage` exists for native app files, but current replacement and delete flows do not call it, so unused image files may remain.

## 16. How should you debug a bug in this application?

**Simple Answer:** Reproduce it, check the relevant screen and parent callback, inspect logs and state transitions, then verify the fix on the affected platform.

**Detailed Explanation:** For a UI issue, start at the screen component and trace the callback props back to `PlantCare.js`. For persistence, inspect the storage helper and the order of queued operations. For catalog failures, inspect the `PlantApiError` code, response status, and browser/native platform branch. Then run `npm test`, reproduce the relevant flow, and run the available Expo checks. Automated coverage currently checks interval parsing and persisted-data validation; there are no lint or build scripts.

**Actual Code Reference:** [`src/PlantCare.js`](../src/PlantCare.js), [`src/utils/storage.js`](../src/utils/storage.js), [`src/utils/Plantapi.js`](../src/utils/Plantapi.js), [`package.json`](../package.json).

**Example:** A schedule that appears not to update should be traced from `saveScheduleChanges` through `onUpdatePlantSchedule`, the mutation queue, storage write, and the updated `plants` prop.

**Possible Follow-up:** What platform issue remains unverified?

**Follow-up Answer:** Web and Android JavaScript bundle exports passed, but interactive browser, Android device, and iOS behavior have not been tested.

## Mock defense questions

Answer these aloud before checking the answer key above:

1. Trace what happens after a user taps Start Tracking.
2. Explain how Schedule's Water Now action updates both the app and stored data.
3. Why does the coordinator use both React state and refs?
4. What is the difference between the mutation queue and the storage write queue?
5. What does the app do when there is no saved data? What if reading fails?
6. Describe one situation where the Schedule screen's `useMemo` recalculates.
7. Why is the Web PlantSolve result not proof that the native API works?
8. What user-input issue exists in Add Plant's watering interval parsing?
9. How are a plant deletion and its linked diary entries kept consistent?
10. Which behaviors still need device-level testing, and why?
