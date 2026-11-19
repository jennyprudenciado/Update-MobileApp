# PlantDiary Data and API Reference

## Overview

PlantDiary has no backend for user records, accounts, or synchronization.
Plant and diary data are held in shared state in [`src/PlantCare.js`](../src/PlantCare.js)
and saved locally through [`src/utils/storage.js`](../src/utils/storage.js).
The Add Plant screen also reads plant catalog information from PlantSolve on
native platforms.

## Plant catalog

[`src/utils/Plantapi.js`](../src/utils/Plantapi.js) uses these PlantSolve
endpoints:

The base path `https://www.plantsolve.com/api/v1/plants` is not a catalog
listing page and may return `403 Forbidden` when opened by itself. The app
requests the specific endpoints below.

| Request | Purpose |
| --- | --- |
| `GET /api/v1/plants/index.json` | Load plant slugs, scientific names, and difficulty. |
| `GET /api/v1/plants/{slug}.json` | Load details for one plant. |

PlantSolve has no search endpoint, so the app searches the index locally.
Native index and detail requests are cached in memory. A network-level error
on a direct request triggers a retry through the Jina Reader proxy. HTTP
errors, invalid responses, and direct-request timeouts are reported without
that retry.

Web does not call PlantSolve. It searches the small catalog bundled in
`Plantapi.js`. API results are mapped to the fields used by Add Plant, and
selected care information is saved on a plant record as `apiInfo`. The full
response is not saved. The UI displays PlantSolve attribution.

## Local storage

The app uses `@react-native-async-storage/async-storage` (`2.2.0`) with the
key `plantcare_app_data_v1`. Writes contain `plants`, `diary`, and
`pendingDeletes` arrays. The app does not pass Undo snapshots to the storage
helper, so `pendingDeletes` is saved as an empty array.

The storage module exports:

- `loadPersistedAppData()` returns `null` only when the key is missing.
  Read errors and invalid JSON are logged and thrown. Falsy, primitive, and
  array roots are rejected. Missing collections default to empty arrays;
  present non-array collections are rejected. Plant and diary records are
  checked for required fields, while legacy diary entries may omit `plantId`.
- `savePersistedAppData(plants, diary, pendingDeletes = [])` serializes and
  saves arrays only; invalid collection arguments throw. A Promise queue
  preserves write order.
- `clearPersistedAppData()` waits for earlier writes and removes the key. No
  current app flow calls this helper.

There is no backup, restore, schema migration, or schema version. Storage is
local to the app/browser installation and is not an application-level
encrypted database.

## Records

### Plant

```js
{
  id: "timestamp string",
  name: "Monstera",
  type: "Indoor Plant",
  interval: 7,
  lastWatered: "date value",
  image: "file or web URI, bundled image value, or null",
  apiInfo: {
    source: "PlantSolve",
    slug: "monstera",
    difficulty: "easy",
    description: "Plant description",
    watering: "Watering advice",
    sunlight: "Light advice",
    soil: "Soil advice",
    careNotes: []
  }
}
```

Add Plant creates an ID with `Date.now().toString()`, sets `lastWatered` to
the current date, and requires a name, type, and positive whole-number
interval containing digits only. Decimal and trailing text input are
rejected. The parent rejects a duplicate ID in the current collection. IDs
are timestamp-based, not globally generated UUIDs.

### Diary entry

```js
{
  id: "timestamp string",
  plantId: "plant ID or null",
  plantName: "Monstera",
  note: "New leaves are growing",
  date: "date value",
  image: "file or web URI, bundled image value, or null"
}
```

The Diary screen selects by plant ID and saves the ID and name together.
When editing an entry, it replaces both values with the selected plant before
calling the parent. Parent normalization then matches a valid ID first, a
plant name second, and the entry ID as a legacy fallback.

## Loading and saving

The app loads data on startup:

1. A missing key uses the sample records from
   [`src/data/plantsdata.js`](../src/data/plantsdata.js). They are not saved
   until the next successful mutation.
2. A saved object with empty arrays remains empty.
3. Read, JSON parse, or root-format errors are reported and block mutations.
   The app remains on the Welcome screen, does not show sample records as
   loaded data, and offers a retry. It does not save sample records over data
   it could not read.

The parent queues mutations and waits for `savePersistedAppData()` before
publishing updated arrays. Failed writes are surfaced and do not publish the
attempted change. Required plant and diary fields are validated, but there is
no backup or recovery copy.

## Data operations

| Operation | Behavior |
| --- | --- |
| Add plant | Checks hydration and duplicate ID, appends, saves, then publishes. |
| Water plant | Updates `lastWatered` and saves before publishing. |
| Update plant | Replaces the matching plant and saves before publishing. Home currently uses this for image changes. |
| Update schedule | Requires a positive integer interval and awaits the save. |
| Delete plant | Removes the plant and its matching diary entries, then saves both arrays. |
| Undo plant deletion | Within five seconds, restores the plant and diary entries and saves both arrays. |
| Add/edit diary | Normalizes the plant association and saves the entry. New entries are prepended. |
| Delete diary | Saves a reduced diary array and returns an in-memory Undo snapshot. |
| Undo diary deletion | Within five seconds, restores the entry and saves the diary array. |

Both Undo snapshots and timers are held in screen memory. They do not survive
closing or restarting the app. Plant deletion also removes the associated
diary entries unless Undo is used.

## Image handling

[`src/utils/imageStorage.js`](../src/utils/imageStorage.js) exports
`persistImageUriToAppStorage()` and `removePersistedImage()`:

- Native selected files are copied to the app document directory. Existing
  app-directory files are reused; remote images are downloaded when possible.
- On Web, blob URLs are converted to data URLs before the record is saved.
  Persistence across a browser reload has not been runtime-tested.
  Browser storage limits and user-cleared browser data remain limitations.
- If Web conversion fails, the helper logs and throws so the form does not
  save a temporary blob URL as persistent data. If a native remote-image
  download fails, it keeps the remote URL.
- `removePersistedImage()` deletes a native `file://` image, but current
  replacement and deletion flows do not call it. Unused native image files
  can remain.

## Known limitations

- Data has no server sync, backup, or restore.
- A failed load blocks writes and offers a retry, but there is no backup or
  recovery copy.
- Timestamp IDs can collide; the parent rejects duplicates in the current
  collection.
- Undo is temporary and not persisted.
- Image cleanup is not wired into record replacement or deletion.
- Browser image data depends on local storage availability and quota.
- Expo Web and Android JavaScript bundle exports passed. These checks verify
  bundling only; interactive browser flows and Android runtime behavior have
  not been tested.
