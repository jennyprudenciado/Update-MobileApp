# PlantDiary Design Guidelines

## 1. Design direction

PlantDiary uses a friendly, plant-focused green palette with pale backgrounds,
white cards, rounded controls, and simple layouts. Preserve the existing
visual identity when making UI changes. These notes describe current style
values in `src/constants/colors.js` and `src/styles/`; they are not a
separate design system or a claim of accessibility certification.

## 2. Color palette

| Token | Value | Current use |
| --- | --- | --- |
| `background` | `#dbe2db` | Main screen surfaces |
| `white` | `#fff` | Cards and controls |
| `card` | `#F7FAF6` | Plant card surface |
| `primary` | `#27602e` | Main actions |
| `primaryDark` | `#285d38` | Headings and emphasis |
| `secondary` | `#cedfd6` | Soft green panels and badges |
| `text` | `#1F3022` | Main text |
| `muted` | `#718071` | Supporting text |
| `border` | `#D7E2D5` | Card and input borders |
| `water` | `#3d7aa9` | Watering action |
| `danger` | `#C94C4C` | Delete and error states |
| `warning` | `#E8A83E` | Available warning token |
| `lightBlue` | `#E5F2FA` | Available soft blue token |
| `lightRed` | `#FFE4E4` | Due/overdue emphasis |

The Welcome screen also defines a few direct colors in
`src/styles/welcomeStyles.js`, including `#F5FAF4` and `#4CAF50`.

## 3. Typography and spacing

Most screen styles use bold headings, dark green/dark text, muted supporting
labels, and comfortable line spacing. Common current examples include a
28-point title, 20-point section heading, and 21-point plant name. Shared
title styling chooses Times New Roman on iOS and Arial on other platforms;
individual screens also use platform-default text styles.

Typical layout spacing is 8–20 points for gaps and 14–20 points for card or
form padding. Use the existing screen style objects rather than introducing
unrelated spacing rules.

## 4. Screen layout patterns

- **Welcome:** centered illustration, title, descriptive text, and a start
  button inside a safe-area layout.
- **Home:** title/count header, due/overdue reminder area, summary card,
  section header, and horizontally scrolling plant cards.
- **Add Plant:** vertically scrollable form with image preview, labeled
  inputs, interval help, and a primary action. Keyboard avoidance is
  configured for iOS.
- **Schedule:** vertically scrolling list of cards sorted by next watering
  date, with status, Water Now, and Edit Schedule actions.
- **Diary:** vertically scrolling cards with image or placeholder, plant
  name/date/note, and edit/delete actions.
- **Tabs:** white bottom bar, green active tint, muted inactive tint, icons,
  and compact labels. Tab height is configured as 64 points.

`SafeAreaProvider` wraps the application and each main screen uses
`SafeAreaView`. Home plant cards have a fixed 300-point width, so their
horizontal layout is mobile-oriented rather than a responsive desktop grid.

## 5. Buttons, forms, and image previews

Primary buttons use the green token with white bold text; water actions use
blue; delete actions use red. Inputs have a white background, thin border,
rounded corners, dark text, and muted placeholder text. Photo controls show a
selected image preview or an icon/prompt.

Plant image replacement is initiated by tapping the Home card image. The
Diary screen's photo control opens the picker. Add Plant allows the unsaved
photo selection to be removed; the current diary edit flow does not provide
a separate clear-image action.

## 6. Modals and temporary notices

Modal overlays share a translucent dark background and centered alignment
from `styles.modalOverlay`. Plant image and schedule cards are centered and
bounded in width; the plant delete card also has a width limit. Diary entry
and delete dialogs use top-rounded, sheet-style cards with a maximum height.
Their shapes differ by purpose, so exact alignment is not uniform.

Home Undo notices are positioned above the bottom tab bar, starting at
72 points from the bottom. Diary Undo notices start at 12 points. The
different offsets can produce inconsistent placement or overlap. Their
behavior has not been compared across Android devices and screen sizes.

## 7. Responsive behavior and accessibility

The current app favors mobile layouts: safe areas, scrollable content,
wrapping schedule rows, horizontal plant cards, bounded dialog widths, and
keyboard handling on the Add Plant screen. Do not claim desktop optimization
or consistent modal positioning without testing.

Some buttons define accessibility roles and labels, especially delete and
Undo actions. When extending the UI, maintain clear labels, usable touch
targets, adequate contrast, and status text that does not rely on color alone.
These are recommendations; no formal accessibility audit is documented.

