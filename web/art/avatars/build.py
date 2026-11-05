#!/usr/bin/env python3
"""Writes the 30 player portraits, three moods each, to web/src/art/avatars.

Every shape here is hand-written. The portraits share parts so that they stay one
family and a style change is a single edit. Run it with: python3 web/art/avatars/build.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "src/art/avatars"

INK = "#3A2417"
SURFACE = "#FBF3DF"
PARCHMENT = "#F3E4C3"
GOLD = "#E9B23A"
GOLD_DARK = "#C08A1E"
LEATHER = "#9A6A3C"

SKIN = {
    "fair": "#F2CFA6", "tan": "#D9A273", "brown": "#A9714B", "deep": "#85573A",
    "orcTeal": "#7E9C8B", "orcMauve": "#A58FA8", "orcMoss": "#9BA37A",
}
HAIR = {
    "blond": "#E6C25A", "red": "#C4602D", "brown": "#6E4A2E", "black": INK,
    "grey": "#B9B1A1", "white": SURFACE,
}
CLOTH = {
    "steel": "#C9C2B0", "blue": "#3F6FA8", "purple": "#7D4FA8", "teal": "#2A9188",
    "plum": "#4B3A5C", "forest": "#3F6B4F", "orange": "#D9742A", "pink": "#CF5A8C",
    "green": "#3F8F4F", "white": SURFACE,
}
BLUSH = "#E08A6D"

# Race, class, skin, hair, cloth, quirk. Six races by five classes.
PORTRAITS = [
    ("human", "warrior", "tan", "brown", "steel", "scar"),
    ("human", "wizard", "fair", "white", "blue", "monocle"),
    ("human", "thief", "brown", "black", "plum", "earring"),
    ("human", "cleric", "deep", "black", "white", "blush"),
    ("human", "bard", "fair", "red", "orange", "freckles"),
    ("elf", "warrior", "fair", "blond", "steel", "blush"),
    ("elf", "wizard", "deep", "white", "purple", "earring"),
    ("elf", "thief", "tan", "black", "forest", "blush"),
    ("elf", "cleric", "fair", "blond", "white", "monocle"),
    ("elf", "bard", "brown", "red", "pink", "freckles"),
    ("dwarf", "warrior", "tan", "red", "steel", "patch"),
    ("dwarf", "wizard", "fair", "grey", "teal", "monocle"),
    ("dwarf", "thief", "brown", "brown", "plum", "goldTeeth"),
    ("dwarf", "cleric", "deep", "white", "white", "earring"),
    ("dwarf", "bard", "fair", "blond", "green", "blush"),
    ("halfling", "warrior", "brown", "black", "steel", "gap"),
    ("halfling", "wizard", "fair", "brown", "blue", "freckles"),
    ("halfling", "thief", "tan", "red", "forest", "goldTeeth"),
    ("halfling", "cleric", "fair", "blond", "white", "blush"),
    ("halfling", "bard", "deep", "black", "orange", "earring"),
    ("orc", "warrior", "orcTeal", "black", "steel", "patch"),
    ("orc", "wizard", "orcMauve", "white", "purple", "monocle"),
    ("orc", "thief", "orcMoss", "black", "plum", "earring"),
    ("orc", "cleric", "orcTeal", "grey", "white", "earring"),
    ("orc", "bard", "orcMauve", "red", "pink", "gap"),
    ("gnome", "warrior", "fair", "white", "steel", "blush"),
    ("gnome", "wizard", "tan", "grey", "teal", "patch"),
    ("gnome", "thief", "deep", "white", "forest", "goldTeeth"),
    ("gnome", "cleric", "brown", "grey", "white", "monocle"),
    ("gnome", "bard", "fair", "red", "green", "freckles"),
]

# Where each race's face sits, as a downward shift from the shared position.
FACE_SHIFT = {"human": 6, "elf": 6, "dwarf": 6, "halfling": 8, "orc": 6, "gnome": 8}


def ears(race, skin):
    if race == "elf":
        return (f'<path d="M34 70 Q14 58 7 35 Q28 40 42 54 Z" fill="{skin}"/>'
                f'<path d="M94 70 Q114 58 121 35 Q100 40 86 54 Z" fill="{skin}"/>')
    if race == "orc":
        return (f'<path d="M26 66 L8 54 L12 80 Q18 86 28 82 Z" fill="{skin}"/>'
                f'<path d="M102 66 L120 54 L116 80 Q110 86 100 82 Z" fill="{skin}"/>')
    if race == "gnome":
        return (f'<path d="M32 76 Q12 66 12 84 Q14 98 34 92 Z" fill="{skin}"/>'
                f'<path d="M96 76 Q116 66 116 84 Q114 98 94 92 Z" fill="{skin}"/>')
    return (f'<circle cx="25" cy="76" r="9" fill="{skin}"/>'
            f'<circle cx="103" cy="76" r="9" fill="{skin}"/>')


def head(race, skin):
    if race == "elf":
        return f'<ellipse cx="64" cy="76" rx="35" ry="43" fill="{skin}"/>'
    if race == "dwarf":
        return f'<ellipse cx="64" cy="68" rx="43" ry="38" fill="{skin}"/>'
    if race == "halfling":
        return f'<ellipse cx="64" cy="78" rx="42" ry="40" fill="{skin}"/>'
    if race == "orc":
        return (f'<path d="M34 40 Q64 28 94 40 Q108 60 110 88 Q108 116 64 118 '
                f'Q20 116 18 88 Q20 60 34 40 Z" fill="{skin}"/>')
    if race == "gnome":
        return f'<ellipse cx="64" cy="82" rx="37" ry="35" fill="{skin}"/>'
    return f'<ellipse cx="64" cy="76" rx="40" ry="41" fill="{skin}"/>'


def hair_back(race, hair):
    if race == "elf":
        return (f'<path d="M28 66 Q20 100 30 122 L44 112 L40 72 Z" fill="{hair}"/>'
                f'<path d="M100 66 Q108 100 98 122 L84 112 L88 72 Z" fill="{hair}"/>')
    return ""


def hair_front(race, hair):
    if race == "dwarf":
        return (f'<path d="M20 74 Q18 104 34 116 Q46 126 64 124 Q82 126 94 116 '
                f'Q110 104 108 74 Q98 92 82 86 Q64 80 46 86 Q30 92 20 74 Z" fill="{hair}"/>')
    if race == "gnome":
        return (f'<path d="M30 92 Q32 120 64 124 Q96 120 98 92 Q84 104 64 100 '
                f'Q44 104 30 92 Z" fill="{hair}"/>')
    if race == "halfling":
        return (f'<path d="M26 66 Q18 56 28 50 Q26 40 38 40 Q42 30 54 34 Q64 26 74 34 '
                f'Q86 30 90 40 Q102 40 100 50 Q110 56 102 66 Q88 52 64 52 Q40 52 26 66 Z" '
                f'fill="{hair}"/>')
    if race == "human":
        return (f'<path d="M25 72 Q22 40 64 36 Q106 40 103 72 Q92 54 64 52 Q36 54 25 72 Z" '
                f'fill="{hair}"/>')
    if race == "elf":
        return f'<path d="M29 70 Q30 36 64 34 Q98 36 99 70 Q82 50 64 48 Q46 50 29 70 Z" fill="{hair}"/>'
    return ""


def side_hair(race, hair):
    """Drawn over the hat's edge line, so it stays visible under any headwear."""
    if race == "halfling":
        left = ('M24 62 Q12 62 15 73 Q6 80 15 88 Q12 98 25 96 Q30 88 28 80 Q32 70 24 62 Z')
        right = ('M104 62 Q116 62 113 73 Q122 80 113 88 Q116 98 103 96 Q98 88 100 80 Q96 70 104 62 Z')
        return f'<path d="{left}" fill="{hair}"/><path d="{right}" fill="{hair}"/>'
    if race == "human":
        return (f'<path d="M25 58 L24 86 L34 78 L36 58 Z" fill="{hair}" stroke-width="4"/>'
                f'<path d="M103 58 L104 86 L94 78 L92 58 Z" fill="{hair}" stroke-width="4"/>')
    return ""


def headwear(cls, cloth, race):
    top = {"gnome": 46}.get(race, 40)
    if cls == "warrior":
        return (f'<path d="M22 {top + 8} C22 {top - 32} 106 {top - 32} 106 {top + 8} Z" fill="{cloth}"/>'
                f'<path d="M64 {top - 24} V{top + 8}" fill="none" stroke-width="4"/>'
                f'<path d="M16 {top + 8} H112 V{top + 18} H16 Z" fill="{LEATHER}"/>'
                f'<path d="M24 {top - 8} Q6 {top - 12} 8 {top - 32} Q20 {top - 22} 34 {top - 18} Z" fill="{GOLD}"/>'
                f'<path d="M104 {top - 8} Q122 {top - 12} 120 {top - 32} Q108 {top - 22} 94 {top - 18} Z" fill="{GOLD}"/>')
    if cls == "wizard":
        return (f'<path d="M30 {top + 4} Q48 {top - 20} 58 {top - 30} Q76 {top - 35} 92 {top - 29} '
                f'Q78 {top - 25} 76 {top - 14} Q88 {top - 6} 98 {top + 4} Z" fill="{cloth}"/>'
                f'<path d="M14 {top + 8} Q64 {top - 8} 114 {top + 8} Q64 {top + 22} 14 {top + 8} Z" fill="{cloth}"/>'
                f'<path d="M62 {top - 20} L65 {top - 13} L72 {top - 12} L67 {top - 7} L68 {top} '
                f'L62 {top - 4} L56 {top} L57 {top - 7} L52 {top - 12} L59 {top - 13} Z" '
                f'fill="{GOLD}" stroke-width="3"/>')
    if cls == "thief":
        return (f'<path d="M20 {top + 34} Q14 {top - 32} 64 {top - 32} Q114 {top - 32} 108 {top + 34} '
                f'Q100 {top + 2} 64 {top + 2} Q28 {top + 2} 20 {top + 34} Z" fill="{cloth}"/>')
    if cls == "cleric":
        return (f'<path d="M30 {top + 10} L36 {top - 24} Q64 {top - 40} 92 {top - 24} L98 {top + 10} '
                f'Q64 {top - 2} 30 {top + 10} Z" fill="{cloth}"/>'
                f'<circle cx="64" cy="{top - 14}" r="11" fill="{GOLD}" stroke-width="4"/>'
                f'<path d="M26 {top + 8} Q64 {top - 6} 102 {top + 8} L102 {top + 18} Q64 {top + 4} 26 {top + 18} Z" '
                f'fill="{GOLD}"/>')
    # Bard: a floppy cap with a long feather.
    return (f'<path d="M92 {top - 12} Q116 {top - 33} 124 {top - 32} Q124 {top - 18} 98 {top} Z" '
            f'fill="{SURFACE}" stroke-width="4"/>'
            f'<path d="M18 {top + 12} Q16 {top - 30} 60 {top - 30} Q102 {top - 30} 108 {top + 12} '
            f'Q64 {top - 4} 18 {top + 12} Z" fill="{cloth}"/>'
            f'<path d="M16 {top + 10} Q64 {top - 8} 110 {top + 10} L110 {top + 18} Q64 {top + 2} 16 {top + 18} Z" '
            f'fill="{GOLD}"/>')


def thief_mask():
    return (f'<path d="M26 66 Q64 48 102 62 Q106 72 98 80 Q80 76 66 82 Q50 76 32 84 Q22 76 26 66 Z" '
            f'fill="{INK}" stroke-width="3"/>')


def eyes(mood, quirk):
    left, right = (46, 66), (82, 64)
    parts = []
    if mood == "win":
        for x, y in (left, (82, 66)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{GOLD}" stroke-width="4"/>'
                         f'<circle cx="{x}" cy="{y}" r="6" fill="{GOLD_DARK}" stroke-width="3"/>')
    elif mood == "lose":
        for x, y, r in ((46, 66, 12), (82, 66, 12)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{SURFACE}" stroke-width="4"/>'
                         f'<circle cx="{x + 1}" cy="{y + 2}" r="3" fill="{INK}" stroke="none"/>')
    else:
        parts.append(f'<circle cx="{left[0]}" cy="{left[1]}" r="11" fill="{SURFACE}" stroke-width="4"/>'
                     f'<circle cx="82" cy="64" r="14" fill="{SURFACE}" stroke-width="4"/>'
                     f'<circle cx="50" cy="68" r="4.5" fill="{INK}" stroke="none"/>'
                     f'<circle cx="78" cy="66" r="5.5" fill="{INK}" stroke="none"/>')
    if quirk == "patch":
        parts.append(f'<path d="M26 44 L104 80" fill="none" stroke-width="4"/>'
                     f'<path d="M68 52 H98 Q100 76 83 80 Q66 76 68 52 Z" fill="{INK}" stroke-width="3"/>')
    if quirk == "monocle":
        parts.append(f'<circle cx="82" cy="65" r="17" fill="none" stroke="{GOLD}" stroke-width="4"/>'
                     f'<path d="M97 74 Q104 88 100 102" fill="none" stroke="{GOLD}" stroke-width="3"/>')
    return "".join(parts)


def brows(mood, race):
    if mood == "lose":
        return ('<path d="M34 50 Q44 42 56 46 M72 46 Q84 42 94 50" fill="none" stroke-width="4"/>')
    if race in ("dwarf", "orc"):
        return '<path d="M32 50 L58 56 M96 48 L70 56" fill="none" stroke-width="6"/>'
    return ""


def nose(race, skin_shade):
    if race in ("dwarf", "gnome"):
        return f'<ellipse cx="64" cy="79" rx="12" ry="10" fill="{BLUSH}" stroke-width="4"/>'
    if race == "orc":
        return (f'<path d="M56 78 Q64 70 72 78 Q64 84 56 78 Z" fill="{INK}" stroke-width="3"/>')
    return f'<path d="M60 74 Q70 78 64 84" fill="none" stroke-width="4"/>'


def mouth(mood, race, quirk):
    if mood == "lose":
        return '<path d="M42 102 Q50 94 58 101 Q66 108 74 101 Q82 94 90 102" fill="none" stroke-width="5"/>'
    y = 2 if mood == "win" else 0
    grin = f'<path d="M36 {90 + y} Q64 {115 + y} 94 {88 + y} Q64 {98 + y} 36 {90 + y} Z" fill="{INK}" stroke-width="4"/>'
    if race == "orc":
        return (grin + f'<path d="M44 {100 + y} L42 {80 + y} L54 {98 + y} Z" fill="{SURFACE}" stroke-width="3"/>'
                f'<path d="M84 {98 + y} L88 {78 + y} L76 {100 + y} Z" fill="{SURFACE}" stroke-width="3"/>')
    teeth = ""
    if quirk != "gap":
        teeth += f'<path d="M48 {93 + y} L50 {100 + y} L58 {101 + y} L58 {95 + y} Z" fill="{SURFACE}" stroke-width="3"/>'
    gold = GOLD if quirk in ("goldTeeth", "gap") else SURFACE
    teeth += f'<path d="M70 {95 + y} L70 {101 + y} L79 {98 + y} L79 {92 + y} Z" fill="{gold}" stroke-width="3"/>'
    return grin + teeth


def details(mood, quirk, race):
    parts = []
    if quirk == "blush":
        parts.append(f'<ellipse cx="34" cy="84" rx="7" ry="4" fill="{BLUSH}" stroke="none"/>'
                     f'<ellipse cx="94" cy="84" rx="7" ry="4" fill="{BLUSH}" stroke="none"/>')
    if quirk == "freckles":
        for x, y in ((38, 82), (44, 86), (32, 86), (90, 82), (84, 86), (96, 86)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="1.6" fill="{INK}" stroke="none"/>')
    if quirk == "scar":
        parts.append('<path d="M88 80 L100 94 M90 88 L96 83 M95 94 L101 88" fill="none" stroke-width="3"/>')
    if quirk == "earring":
        x, y = {"elf": (31, 74), "orc": (15, 80), "gnome": (20, 90), "dwarf": (21, 84)}.get(race, (21, 84))
        parts.append(f'<circle cx="{x}" cy="{y + 8 - FACE_SHIFT[race]}" r="6" fill="none" stroke="{GOLD}" stroke-width="3"/>')
    if mood == "lose":
        parts.append(f'<path d="M104 62 Q112 74 104 80 Q96 74 104 62 Z" fill="{SURFACE}" stroke-width="3"/>')
    return "".join(parts)


def portrait(race, cls, skin_name, hair_name, cloth_name, quirk, mood):
    skin = SKIN[skin_name]
    hair = HAIR[hair_name]
    cloth = CLOTH[cloth_name]
    shift = FACE_SHIFT[race]
    mask = thief_mask() if cls == "thief" and quirk != "patch" else ""
    face = (mask + eyes(mood, quirk) + brows(mood, race) + nose(race, skin)
            + mouth(mood, race, quirk) + details(mood, quirk, race))
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">\n'
        f'  <g stroke="{INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">\n'
        f'    {hair_back(race, hair)}{ears(race, skin)}{head(race, skin)}{hair_front(race, hair)}{side_hair(race, hair) if cls != "thief" else ""}\n'
        f'    <g transform="translate(0 {shift})">{face}</g>\n'
        f'    {headwear(cls, cloth, race)}\n'
        '  </g>\n</svg>\n'
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.svg"):
        old.unlink()
    for race, cls, skin, hair, cloth, quirk in PORTRAITS:
        for mood in ("grin", "win", "lose"):
            text = portrait(race, cls, skin, hair, cloth, quirk, mood)
            (OUT / f"{race}-{cls}-{mood}.svg").write_text(text)
    print(f"wrote {len(PORTRAITS) * 3} portraits")


if __name__ == "__main__":
    main()
