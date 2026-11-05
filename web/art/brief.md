# Level Goblin UI brief

Status: **approved 2026-11-06.**

## 1. Feeling
- **Greedy, scrappy, cheeky.** Anti-word: **grim**.
- Matters most: the moment someone levels up or a fight turns. It should stay quick to read at a noisy table.
- Mood references: a tavern tally board, a pirate's ledger, a goblin's stolen treasure. Mood only, never copied.

## 2. Style
**Option A, Chunky Inked** (see `review/style-options.png`).

- **Shapes:** round and chunky. Corner radius 18 px on cards, 14 px on buttons.
- **Weight:** 3.5 px ink outline in the UI, and a solid ink lip under every raised piece (5 px cards, 4 px buttons). Pressing a button drops it onto its lip.
- **Art:** 4 px ink stroke on a 64 px icon grid, 6 px on the 128 px mascot grid, round joins and caps.
- **Ornament:** none on panels. The character comes from the art, not from decoration.
- **Goblin:** silly rather than mean: round head, big mismatched eyes, huge grin, one gold tooth.

## 3. Palette
| Role | Hex | Used for |
|---|---|---|
| ink | #3A2417 | outlines, main text |
| parchment | #F3E4C3 | page background |
| surface | #FBF3DF | cards and panels |
| text-dim | #6B5240 | captions and labels |
| gold | #E9B23A | the one main action per screen, treasure, the win |
| danger | #B5301F | destructive actions and the monster winning |
| good | #3F7D3A | players winning a fight |
| gold-tint | #FBEBB5 | the card of the player whose turn it is |
| goblin | #7FA650 / #5C7E38 | the mascot only |
| portrait colors | see `web/art/tokens.json` | skin, hair and cloth in player portraits only |
| gold-dark | #C08A1E | shading on coins and treasure |
| leather | #9A6A3C | leather items in art, such as boots and sacks |

**Meanings:** gold means "the main thing" or treasure, never a warning. Red means danger, never decoration. Player colors identify players only, and always sit beside the player's name. Winning and losing fights also differ by icon and text, never by red and green alone.

Measured contrast: every text pair passes 4.5:1. The lowest is good on surface, at 4.51:1, so don't lighten that green.

## 4. Tone
Short and cheeky, but the numbers come first. One or two words on buttons. Sentence case. Motion is bouncy and quick.

## 5. Type
**Baloo 2** (weights 600 and 800), self-hosted. Any font used must contain every Turkish letter (çğıöşü ÇĞİÖŞÜ), checked in the font file itself, because a font's "latin-ext" file doesn't guarantee them.

- **Pass:** Baloo 2, Grandstander, Rammetto One, Lemon, Rubik.
- **Fail:** Fredoka, Lilita One, Bowlby One, Chango, Sniglet, Titan One.

## 6. Screens and input
Phones first, 360-430 px wide, and it must also work on tablets and desktops. Touch is primary, and keyboard must work. Touch targets are at least 44 px.

## 7. UX map
| Scene | Player is... | UI must... | Glance time | Priority info |
|---|---|---|---|---|
| Home | arriving with friends | start or join in one tap | 3 s | start, join |
| Table | playing cards, talking | show everyone's level and strength | 1 s | level, strength, whose turn |
| Fight | arguing over a monster | show who is winning | 1 s | both totals, the result |
| Log | checking for cheating | show who changed what | 5 s | latest changes, undo |
| Settings | fixing something | stay out of the way | 5 s | players, end game |

## Originality
No publisher art, characters, card names or card text. Nothing imitating any game's card illustrations.

## Changelog
- 2026-11-05: drafted by the agent.
- 2026-11-06: approved by the Architect with style A and a sillier goblin. Added gold-dark and leather for the art.
- 2026-11-06: added portrait colors for the 30 player portraits, pending the Architect's verdict.
- 2026-11-06: kit approved by the Architect, with the helper and next-turn icons redrawn. Added gold-tint.
