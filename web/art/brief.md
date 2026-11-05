# Level Goblin UI brief

Status: **draft, waiting for the Architect's approval.** No kit work starts before that.

## 1. Feeling
- **Greedy, scrappy, cheeky.** Anti-word: **grim**.
- Matters most: the moment someone levels up or a fight turns. It should stay quick to read at a noisy table.
- Mood references: a tavern tally board, a pirate's ledger, a goblin's stolen treasure. Mood only, never copied.

## 2. Style
Picked from the options in `review/style-options.png`. See the changelog.

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
| goblin | #7FA650 / #5C7E38 | the mascot only |

**Meanings:** gold means "the main thing" or treasure, never a warning. Red means danger, never decoration. Player colors identify players only, and always sit beside the player's name. Winning and losing fights also differ by icon and text, never by red and green alone.

Measured contrast: every text pair above is at least 5.5:1.

## 4. Tone
Short and cheeky, but the numbers come first. One or two words on buttons. Sentence case. Motion is bouncy and quick.

## 5. Type
Open-license font, picked with the style. It must contain every Turkish letter (çğıöşü ÇĞİÖŞÜ), checked in the font file itself, because a font's "latin-ext" file doesn't guarantee them.

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
