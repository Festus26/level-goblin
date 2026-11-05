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
    "catGinger": "#E0953F", "catGrey": "#A7A29C", "catCream": "#EFDDB8", "catDark": "#6A5F6E",
    "lizardTeal": "#5FA8A0", "lizardRust": "#C0704A", "lizardBlue": "#6A90C4", "lizardGold": "#CDB24F",
    "ogreOlive": "#B8A86F", "ogreBlue": "#8E9BB5", "ogreRose": "#D49A8A",
    "boarPink": "#E8AFA6", "boarBrown": "#A87C5F", "boarGrey": "#9C8E86",
    "bone": "#EFE6D2", "boneOld": "#DCCFAE",
    "bearBrown": "#9A6A3C", "bearHoney": "#D2A258", "bearGrey": "#857B74", "bearPale": "#F0E8D8",
    "foxRed": "#D9692E", "foxGrey": "#9A938C", "foxSand": "#E2B56E",
    "frogLime": "#A9C24A", "frogBlue": "#5FA3B8", "frogPink": "#DE93A8",
    "rabbitWhite": "#F4ECDC", "rabbitTan": "#C9A27A", "rabbitGrey": "#A9A4B0",
    "owlBrown": "#8E6A48", "owlSnow": "#E8E2D4", "owlTawny": "#C48A44",
    "bullBlack": "#6A5A54", "bullBrown": "#9C5F38", "bullCream": "#E0CDA8",
    "impPurple": "#9A6FC0", "impTeal": "#3FA79A", "impCoral": "#E08868",
    "stone": "#A8A296", "stoneDark": "#857F78", "stoneMoss": "#8F9A78",
    "vampPale": "#E9E2DC", "vampBlue": "#C9D3DE", "vampTan": "#D8C0AC",
}
HAIR = {
    "blond": "#E6C25A", "red": "#C4602D", "brown": "#6E4A2E", "black": INK,
    "grey": "#B9B1A1", "white": SURFACE,
}
CLOTH = {
    "steel": "#C9C2B0", "blue": "#3F6FA8", "purple": "#7D4FA8", "teal": "#2A9188",
    "plum": "#4B3A5C", "forest": "#3F6B4F", "orange": "#D9742A", "pink": "#CF5A8C",
    "green": "#3F8F4F", "white": SURFACE, "red": "#B5473A", "black": "#4A3B33",
    "fur": "#7A5A3C", "furPale": "#CDB994", "furDark": "#5A4A44",
    "leaf": "#4F9A4A", "leafDark": "#2F7A58", "autumn": "#C9782E",
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
    ("cat", "pirate", "catGinger", "red", "black", "patch"),
    ("cat", "knight", "catGrey", "grey", "red", "none"),
    ("cat", "jester", "catCream", "blond", "purple", "blush"),
    ("cat", "alchemist", "catDark", "black", "teal", "earring"),
    ("cat", "barbarian", "catGinger", "red", "fur", "scar"),
    ("lizard", "pirate", "lizardTeal", "black", "red", "goldTeeth"),
    ("lizard", "knight", "lizardBlue", "black", "orange", "none"),
    ("lizard", "jester", "lizardGold", "black", "green", "monocle"),
    ("lizard", "alchemist", "lizardRust", "black", "blue", "none"),
    ("lizard", "barbarian", "lizardTeal", "black", "furPale", "scar"),
    ("ogre", "pirate", "ogreOlive", "black", "black", "earring"),
    ("ogre", "knight", "ogreBlue", "black", "purple", "patch"),
    ("ogre", "jester", "ogreRose", "black", "teal", "none"),
    ("ogre", "alchemist", "ogreOlive", "black", "orange", "monocle"),
    ("ogre", "barbarian", "ogreRose", "black", "fur", "scar"),
    ("boar", "pirate", "boarBrown", "black", "red", "earring"),
    ("boar", "knight", "boarPink", "black", "blue", "blush"),
    ("boar", "jester", "boarGrey", "black", "orange", "none"),
    ("boar", "alchemist", "boarPink", "black", "green", "monocle"),
    ("boar", "barbarian", "boarBrown", "black", "furDark", "patch"),
    ("skeleton", "pirate", "bone", "black", "black", "goldTeeth"),
    ("skeleton", "knight", "boneOld", "black", "green", "none"),
    ("skeleton", "jester", "bone", "black", "pink", "none"),
    ("skeleton", "alchemist", "boneOld", "black", "purple", "monocle"),
    ("skeleton", "barbarian", "bone", "black", "fur", "none"),
    ("bear", "pirate", "bearGrey", "black", "blue", "patch"),
    ("bear", "knight", "bearBrown", "black", "teal", "none"),
    ("bear", "jester", "bearHoney", "black", "red", "blush"),
    ("bear", "alchemist", "bearPale", "black", "orange", "none"),
    ("bear", "barbarian", "bearBrown", "black", "furPale", "goldTeeth"),
    ("fox", "paladin", "foxRed", "black", "blue", "none"),
    ("fox", "druid", "foxSand", "black", "leaf", "blush"),
    ("fox", "chef", "foxGrey", "black", "red", "none"),
    ("fox", "noble", "foxRed", "black", "purple", "monocle"),
    ("fox", "ninja", "foxGrey", "black", "plum", "none"),
    ("frog", "paladin", "frogBlue", "black", "red", "none"),
    ("frog", "druid", "frogLime", "black", "autumn", "none"),
    ("frog", "chef", "frogPink", "black", "blue", "blush"),
    ("frog", "noble", "frogLime", "black", "red", "monocle"),
    ("frog", "ninja", "frogBlue", "black", "black", "none"),
    ("rabbit", "paladin", "rabbitWhite", "black", "teal", "none"),
    ("rabbit", "druid", "rabbitTan", "black", "leafDark", "freckles"),
    ("rabbit", "chef", "rabbitGrey", "black", "green", "blush"),
    ("rabbit", "noble", "rabbitWhite", "black", "blue", "earring"),
    ("rabbit", "ninja", "rabbitTan", "black", "forest", "patch"),
    ("owl", "paladin", "owlSnow", "black", "orange", "none"),
    ("owl", "druid", "owlBrown", "black", "leaf", "none"),
    ("owl", "chef", "owlTawny", "black", "purple", "none"),
    ("owl", "noble", "owlBrown", "black", "green", "monocle"),
    ("owl", "ninja", "owlTawny", "black", "plum", "patch"),
    ("bull", "paladin", "bullBrown", "black", "purple", "none"),
    ("bull", "druid", "bullCream", "black", "leafDark", "none"),
    ("bull", "chef", "bullBlack", "black", "orange", "none"),
    ("bull", "noble", "bullBrown", "black", "teal", "earring"),
    ("bull", "ninja", "bullBlack", "black", "red", "scar"),
    ("imp", "paladin", "impTeal", "black", "pink", "none"),
    ("imp", "druid", "impCoral", "black", "leaf", "gap"),
    ("imp", "chef", "impPurple", "black", "green", "goldTeeth"),
    ("imp", "noble", "impTeal", "black", "orange", "earring"),
    ("imp", "ninja", "impPurple", "black", "black", "patch"),
    ("golem", "paladin", "stone", "black", "green", "none"),
    ("golem", "druid", "stoneMoss", "black", "autumn", "none"),
    ("golem", "chef", "stoneDark", "black", "teal", "none"),
    ("golem", "noble", "stone", "black", "blue", "none"),
    ("golem", "ninja", "stoneDark", "black", "forest", "none"),
    ("vampire", "paladin", "vampPale", "black", "red", "none"),
    ("vampire", "druid", "vampTan", "red", "autumn", "blush"),
    ("vampire", "chef", "vampBlue", "black", "pink", "none"),
    ("vampire", "noble", "vampPale", "black", "plum", "monocle"),
    ("vampire", "ninja", "vampBlue", "white", "black", "none"),
]

# Where each race's face sits, as a downward shift from the shared position.
FACE_SHIFT = {"human": 6, "elf": 6, "dwarf": 6, "halfling": 8, "orc": 6, "gnome": 8,
              "cat": 8, "lizard": 6, "ogre": 8, "boar": 6, "skeleton": 4, "bear": 8,
              "fox": 4, "frog": 6, "rabbit": 8, "owl": 6, "bull": 4, "imp": 8, "golem": 6, "vampire": 4}


def ears(race, skin):
    if race == "fox":
        return (f'<path d="M22 72 L6 24 L50 48 Z" fill="{skin}"/>'
                f'<path d="M106 72 L122 24 L78 48 Z" fill="{skin}"/>'
                f'<path d="M22 54 L14 36 L34 48 Z" fill="{PARCHMENT}" stroke-width="3"/>'
                f'<path d="M106 54 L114 36 L94 48 Z" fill="{PARCHMENT}" stroke-width="3"/>')
    if race == "frog":
        return (f'<circle cx="30" cy="62" r="21" fill="{skin}"/>'
                f'<circle cx="98" cy="62" r="21" fill="{skin}"/>')
    if race == "rabbit":
        return (f'<path d="M34 58 Q6 38 8 12 Q28 10 48 48 Z" fill="{skin}"/>'
                f'<path d="M94 58 Q122 38 120 12 Q100 10 80 48 Z" fill="{skin}"/>'
                f'<path d="M30 46 Q16 34 16 20 Q28 22 38 40 Z" fill="{BLUSH}" stroke-width="3"/>'
                f'<path d="M98 46 Q112 34 112 20 Q100 22 90 40 Z" fill="{BLUSH}" stroke-width="3"/>')
    if race == "owl":
        return (f'<path d="M26 62 L10 22 L54 44 Z" fill="{skin}"/>'
                f'<path d="M102 62 L118 22 L74 44 Z" fill="{skin}"/>')
    if race == "bull":
        return (f'<path d="M30 60 Q6 58 7 26 Q16 42 38 46 Z" fill="{PARCHMENT}"/>'
                f'<path d="M98 60 Q122 58 121 26 Q112 42 90 46 Z" fill="{PARCHMENT}"/>'
                f'<path d="M26 76 L7 72 L18 90 Z" fill="{skin}"/>'
                f'<path d="M102 76 L121 72 L110 90 Z" fill="{skin}"/>')
    if race == "imp":
        return (f'<path d="M40 46 Q30 26 14 26 Q24 38 28 56 Z" fill="{GOLD_DARK}"/>'
                f'<path d="M88 46 Q98 26 114 26 Q104 38 100 56 Z" fill="{GOLD_DARK}"/>'
                f'<path d="M30 74 L6 62 L26 92 Z" fill="{skin}"/>'
                f'<path d="M98 74 L122 62 L102 92 Z" fill="{skin}"/>')
    if race == "golem":
        return (f'<path d="M12 62 H24 V92 H12 Z" fill="{skin}"/>'
                f'<path d="M104 62 H116 V92 H104 Z" fill="{skin}"/>')
    if race == "vampire":
        return (f'<path d="M30 70 L12 56 L28 90 Z" fill="{skin}"/>'
                f'<path d="M98 70 L116 56 L100 90 Z" fill="{skin}"/>')
    if race == "lizard":
        return (f'<path d="M30 58 L8 48 L18 66 L6 76 L20 82 L12 98 L34 92 Z" fill="{skin}"/>'
                f'<path d="M98 58 L120 48 L110 66 L122 76 L108 82 L116 98 L94 92 Z" fill="{skin}"/>')
    if race == "boar":
        return (f'<path d="M30 56 Q8 50 8 74 Q24 80 36 68 Z" fill="{skin}"/>'
                f'<path d="M98 56 Q120 50 120 74 Q104 80 92 68 Z" fill="{skin}"/>')
    if race == "cat":
        return (f'<path d="M24 74 L8 28 L52 50 Z" fill="{skin}"/>'
                f'<path d="M104 74 L120 28 L76 50 Z" fill="{skin}"/>'
                f'<path d="M24 58 L16 40 L34 50 Z" fill="{BLUSH}" stroke-width="3"/>'
                f'<path d="M104 58 L112 40 L94 50 Z" fill="{BLUSH}" stroke-width="3"/>')
    if race == "bear":
        return (f'<circle cx="20" cy="56" r="15" fill="{skin}"/>'
                f'<circle cx="108" cy="56" r="15" fill="{skin}"/>'
                f'<circle cx="19" cy="55" r="7" fill="{BLUSH}" stroke-width="3"/>'
                f'<circle cx="109" cy="55" r="7" fill="{BLUSH}" stroke-width="3"/>')
    if race == "skeleton":
        return ""
    if race == "ogre":
        return (f'<circle cx="13" cy="78" r="8" fill="{skin}"/>'
                f'<circle cx="115" cy="78" r="8" fill="{skin}"/>')
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
    if race == "fox":
        return f'<path d="M20 68 Q64 38 108 68 Q110 102 64 121 Q18 102 20 68 Z" fill="{skin}"/>'
    if race == "frog":
        return f'<ellipse cx="64" cy="86" rx="51" ry="33" fill="{skin}"/>'
    if race == "rabbit":
        return f'<ellipse cx="64" cy="80" rx="39" ry="38" fill="{skin}"/>'
    if race == "owl":
        return (f'<ellipse cx="64" cy="78" rx="43" ry="42" fill="{skin}"/>'
                f'<circle cx="46" cy="72" r="19" fill="{PARCHMENT}" stroke="none"/>'
                f'<circle cx="82" cy="72" r="19" fill="{PARCHMENT}" stroke="none"/>')
    if race == "bull":
        return (f'<path d="M28 54 Q64 40 100 54 Q110 80 98 100 Q90 121 64 121 '
                f'Q38 121 30 100 Q18 80 28 54 Z" fill="{skin}"/>')
    if race == "imp":
        return f'<ellipse cx="64" cy="80" rx="39" ry="38" fill="{skin}"/>'
    if race == "golem":
        return f'<path d="M22 46 H106 L113 72 L104 118 H24 L15 72 Z" fill="{skin}"/>'
    if race == "vampire":
        return f'<path d="M27 62 Q64 34 101 62 Q104 102 64 121 Q24 102 27 62 Z" fill="{skin}"/>'
    if race == "cat":
        return f'<ellipse cx="64" cy="80" rx="43" ry="37" fill="{skin}"/>'
    if race == "lizard":
        return f'<ellipse cx="64" cy="76" rx="38" ry="42" fill="{skin}"/>'
    if race == "ogre":
        return (f'<path d="M30 46 Q64 34 98 46 Q116 62 116 90 Q112 120 64 121 '
                f'Q16 120 12 90 Q12 62 30 46 Z" fill="{skin}"/>')
    if race == "boar":
        return f'<ellipse cx="64" cy="78" rx="43" ry="40" fill="{skin}"/>'
    if race == "skeleton":
        return (f'<path d="M26 72 Q26 36 64 36 Q102 36 102 72 Q102 90 90 96 L90 112 '
                f'Q64 120 38 112 L38 96 Q26 90 26 72 Z" fill="{skin}"/>')
    if race == "bear":
        return f'<ellipse cx="64" cy="80" rx="44" ry="38" fill="{skin}"/>'
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
    if race == "vampire":
        return (f'<path d="M26 68 Q24 36 64 34 Q104 36 102 68 Q86 46 64 66 Q42 46 26 68 Z" '
                f'fill="{hair}"/>')
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
    top = {"gnome": 46, "frog": 44}.get(race, 40)
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
    t = top
    if cls == "pirate":
        return (f'<path d="M10 {t + 12} Q30 {t - 6} 38 {t - 26} Q64 {t - 36} 90 {t - 26} '
                f'Q98 {t - 6} 118 {t + 12} Q64 {t + 2} 10 {t + 12} Z" fill="{cloth}"/>'
                f'<path d="M20 {t + 7} Q64 {t - 3} 108 {t + 7}" fill="none" stroke="{GOLD}" stroke-width="4"/>'
                f'<circle cx="64" cy="{t - 14}" r="8" fill="{GOLD}" stroke-width="4"/>')
    if cls == "knight":
        return (f'<path d="M62 {t - 18} Q60 {t - 36} 84 {t - 36} Q104 {t - 34} 110 {t - 8} '
                f'Q94 {t - 24} 74 {t - 14} Z" fill="{cloth}"/>'
                f'<path d="M22 {t + 8} C22 {t - 32} 106 {t - 32} 106 {t + 8} Z" fill="{CLOTH["steel"]}"/>'
                f'<path d="M16 {t + 8} H112 V{t + 18} H16 Z" fill="{LEATHER}"/>'
                f'<circle cx="34" cy="{t + 13}" r="1.6" fill="{GOLD}" stroke-width="3"/>'
                f'<circle cx="94" cy="{t + 13}" r="1.6" fill="{GOLD}" stroke-width="3"/>'
                f'<path d="M59 {t + 18} H69 V{t + 34} H59 Z" fill="{CLOTH["steel"]}" stroke-width="4"/>')
    if cls == "jester":
        return (f'<path d="M24 {t + 8} Q20 {t - 16} 9 {t - 16} Q24 {t - 34} 52 {t - 10} L50 {t + 4} Z" fill="{cloth}"/>'
                f'<path d="M104 {t + 8} Q108 {t - 16} 119 {t - 16} Q104 {t - 34} 76 {t - 10} L78 {t + 4} Z" fill="{cloth}"/>'
                f'<path d="M44 {t + 4} Q50 {t - 28} 64 {t - 30} Q78 {t - 28} 84 {t + 4} Z" fill="{SURFACE}"/>'
                f'<path d="M20 {t + 6} Q64 {t - 8} 108 {t + 6} L108 {t + 16} Q64 {t + 2} 20 {t + 16} Z" fill="{GOLD}"/>'
                f'<circle cx="9" cy="{t - 16}" r="5" fill="{GOLD}" stroke-width="3"/>'
                f'<circle cx="119" cy="{t - 16}" r="5" fill="{GOLD}" stroke-width="3"/>'
                f'<circle cx="64" cy="{t - 30}" r="5" fill="{GOLD}" stroke-width="3"/>')
    if cls == "alchemist":
        return (f'<path d="M24 {t + 12} C24 {t - 32} 104 {t - 32} 104 {t + 12} Z" fill="{LEATHER}"/>'
                f'<path d="M18 {t + 8} Q64 {t - 6} 110 {t + 8}" fill="none" stroke-width="8"/>'
                f'<circle cx="46" cy="{t}" r="13" fill="{cloth}" stroke-width="4"/>'
                f'<circle cx="82" cy="{t}" r="13" fill="{cloth}" stroke-width="4"/>'
                f'<path d="M40 {t - 5} Q44 {t - 8} 48 {t - 7} M76 {t - 5} Q80 {t - 8} 84 {t - 7}" '
                f'fill="none" stroke="{SURFACE}" stroke-width="3"/>')
    if cls == "barbarian":
        return (f'<path d="M20 {t + 14} L22 {t - 8} L34 {t + 1} L42 {t - 16} L53 {t} L64 {t - 20} '
                f'L75 {t} L86 {t - 16} L94 {t + 1} L106 {t - 8} L108 {t + 14} Q64 {t + 2} 20 {t + 14} Z" '
                f'fill="{cloth}"/>'
                f'<path d="M58 {t + 2} L64 {t + 18} L70 {t + 2} Z" fill="{SURFACE}" stroke-width="3"/>')
    if cls == "paladin":
        return (f'<path d="M26 {t + 4} Q5 {t - 4} 6 {t - 30} Q13 {t - 20} 20 {t - 24} Q20 {t - 14} 34 {t - 14} Z" fill="{SURFACE}"/>'
                f'<path d="M102 {t + 4} Q123 {t - 4} 122 {t - 30} Q115 {t - 20} 108 {t - 24} Q108 {t - 14} 94 {t - 14} Z" fill="{SURFACE}"/>'
                f'<path d="M24 {t + 8} C24 {t - 32} 104 {t - 32} 104 {t + 8} Z" fill="{CLOTH["steel"]}"/>'
                f'<path d="M18 {t + 8} H110 V{t + 18} H18 Z" fill="{GOLD}"/>'
                f'<circle cx="64" cy="{t - 2}" r="9" fill="{cloth}" stroke-width="4"/>')
    if cls == "druid":
        leaves = "".join(
            f'<path d="M{x} {y + 8} Q{x - 11} {y - 3} {x} {y - 13} Q{x + 11} {y - 3} {x} {y + 8} Z" fill="{cloth}" stroke-width="4"/>'
            for x, y in ((24, t + 5), (42, t - 1), (64, t - 4), (86, t - 1), (104, t + 5)))
        return (f'<path d="M20 {t + 12} Q64 {t - 4} 108 {t + 12}" fill="none" stroke-width="9"/>'
                f'<path d="M20 {t + 12} Q64 {t - 4} 108 {t + 12}" fill="none" stroke="{LEATHER}" stroke-width="4"/>'
                f'{leaves}<circle cx="64" cy="{t - 6}" r="5" fill="{GOLD}" stroke-width="3"/>')
    if cls == "chef":
        return (f'<path d="M32 {t + 12} L30 {t - 6} Q14 {t - 12} 22 {t - 25} Q30 {t - 35} 44 {t - 27} '
                f'Q56 {t - 37} 72 {t - 30} Q88 {t - 36} 98 {t - 25} Q114 {t - 12} 98 {t - 6} L96 {t + 12} Z" fill="{SURFACE}"/>'
                f'<path d="M26 {t + 4} Q64 {t - 6} 102 {t + 4} L102 {t + 16} Q64 {t + 6} 26 {t + 16} Z" fill="{cloth}"/>')
    if cls == "noble":
        return (f'<path d="M26 {t + 12} L20 {t - 22} L43 {t - 6} L64 {t - 31} L85 {t - 6} L108 {t - 22} L102 {t + 12} '
                f'Q64 {t + 2} 26 {t + 12} Z" fill="{GOLD}"/>'
                f'<circle cx="64" cy="{t - 4}" r="6" fill="{cloth}" stroke-width="3"/>'
                f'<circle cx="38" cy="{t + 3}" r="4" fill="{cloth}" stroke-width="3"/>'
                f'<circle cx="90" cy="{t + 3}" r="4" fill="{cloth}" stroke-width="3"/>')
    if cls == "ninja":
        return (f'<path d="M104 {t + 6} L122 {t - 4} L117 {t + 8} L124 {t + 20} L102 {t + 16} Z" fill="{cloth}"/>'
                f'<path d="M22 {t + 16} Q18 {t - 28} 64 {t - 30} Q110 {t - 28} 106 {t + 16} Q64 {t + 4} 22 {t + 16} Z" fill="{cloth}"/>'
                f'<path d="M50 {t - 8} H78 V{t + 4} H50 Z" fill="{CLOTH["steel"]}" stroke-width="4"/>')
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


def eyes(mood, quirk, race):
    left, right = (46, 66), (82, 64)
    parts = []
    socket = INK if race in ("skeleton", "golem") else SURFACE
    pupil = {"skeleton": SURFACE, "golem": GOLD}.get(race, INK)
    if mood == "win":
        for x, y in (left, (82, 66)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{GOLD}" stroke-width="4"/>'
                         f'<circle cx="{x}" cy="{y}" r="6" fill="{GOLD_DARK}" stroke-width="3"/>')
    elif mood == "lose":
        for x, y, r in ((46, 66, 12), (82, 66, 12)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{socket}" stroke-width="4"/>'
                         f'<circle cx="{x + 1}" cy="{y + 2}" r="3" fill="{pupil}" stroke="none"/>')
    else:
        parts.append(f'<circle cx="{left[0]}" cy="{left[1]}" r="11" fill="{socket}" stroke-width="4"/>'
                     f'<circle cx="82" cy="64" r="14" fill="{socket}" stroke-width="4"/>')
        if race in ("lizard", "cat"):
            parts.append(f'<ellipse cx="50" cy="66" rx="2.5" ry="7" fill="{INK}" stroke="none"/>'
                         f'<ellipse cx="79" cy="64" rx="3" ry="9" fill="{INK}" stroke="none"/>')
        else:
            parts.append(f'<circle cx="50" cy="68" r="4.5" fill="{pupil}" stroke="none"/>'
                         f'<circle cx="78" cy="66" r="5.5" fill="{pupil}" stroke="none"/>')
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
    if race in ("dwarf", "orc", "ogre"):
        return '<path d="M32 50 L58 56 M96 48 L70 56" fill="none" stroke-width="6"/>'
    return ""


def nose(race, skin_shade):
    if race == "fox":
        return (f'<path d="M38 84 Q64 74 90 84 Q78 102 64 110 Q50 102 38 84 Z" fill="{PARCHMENT}" stroke="none"/>'
                f'<ellipse cx="64" cy="84" rx="7" ry="5" fill="{INK}" stroke-width="3"/>')
    if race == "frog":
        return (f'<circle cx="59" cy="80" r="2" fill="{INK}" stroke="none"/>'
                f'<circle cx="69" cy="80" r="2" fill="{INK}" stroke="none"/>')
    if race == "rabbit":
        return (f'<path d="M58 78 H70 L64 84 Z" fill="{BLUSH}" stroke-width="3"/>'
                f'<path d="M64 84 V90" fill="none" stroke-width="3"/>')
    if race == "owl":
        return f'<path d="M64 70 L73 80 L64 94 L55 80 Z" fill="{GOLD}" stroke-width="4"/>'
    if race == "bull":
        return (f'<ellipse cx="64" cy="94" rx="27" ry="19" fill="{BLUSH}" stroke-width="4"/>'
                f'<ellipse cx="53" cy="90" rx="3" ry="4" fill="{INK}" stroke="none"/>'
                f'<ellipse cx="75" cy="90" rx="3" ry="4" fill="{INK}" stroke="none"/>')
    if race == "golem":
        return f'<path d="M59 72 H69 V86 H59 Z" fill="{skin_shade}" stroke-width="4"/>'
    if race == "cat":
        return f'<path d="M58 79 H70 L64 86 Z" fill="{BLUSH}" stroke-width="3"/>'
    if race == "lizard":
        return (f'<circle cx="59" cy="80" r="2" fill="{INK}" stroke="none"/>'
                f'<circle cx="69" cy="80" r="2" fill="{INK}" stroke="none"/>')
    if race == "ogre":
        return f'<ellipse cx="64" cy="80" rx="10" ry="7" fill="{skin_shade}" stroke-width="4"/>'
    if race == "boar":
        return (f'<ellipse cx="64" cy="82" rx="16" ry="11" fill="{BLUSH}" stroke-width="4"/>'
                f'<ellipse cx="58" cy="82" rx="2.5" ry="4" fill="{INK}" stroke="none"/>'
                f'<ellipse cx="70" cy="82" rx="2.5" ry="4" fill="{INK}" stroke="none"/>')
    if race == "skeleton":
        return f'<path d="M64 76 L58 87 L70 87 Z" fill="{INK}" stroke-width="3"/>'
    if race == "bear":
        return (f'<ellipse cx="64" cy="90" rx="25" ry="17" fill="{PARCHMENT}" stroke-width="4"/>'
                f'<ellipse cx="64" cy="80" rx="8" ry="6" fill="{INK}" stroke-width="3"/>')
    if race in ("dwarf", "gnome"):
        return f'<ellipse cx="64" cy="79" rx="12" ry="10" fill="{BLUSH}" stroke-width="4"/>'
    if race == "orc":
        return (f'<path d="M56 78 Q64 70 72 78 Q64 84 56 78 Z" fill="{INK}" stroke-width="3"/>')
    return f'<path d="M60 74 Q70 78 64 84" fill="none" stroke-width="4"/>'


def mouth(mood, race, quirk):
    if mood == "lose":
        return '<path d="M42 102 Q50 94 58 101 Q66 108 74 101 Q82 94 90 102" fill="none" stroke-width="5"/>'
    y = 2 if mood == "win" else 0
    if race == "owl":
        return f'<path d="M48 {102 + y} Q64 {112 + y} 80 {102 + y}" fill="none" stroke-width="4"/>'
    if race == "bull":
        return (f'<path d="M46 {100 + y} Q64 {110 + y} 82 {100 + y}" fill="none" stroke-width="4"/>'
                f'<circle cx="64" cy="{107 + y}" r="6" fill="none" stroke="{GOLD}" stroke-width="4"/>')
    if race == "golem":
        ticks = " ".join(f"M{x} {96 + y} V{106 + y}" for x in (52, 64, 76))
        return (f'<path d="M40 {96 + y} H88 V{106 + y} H40 Z" fill="{SURFACE}" stroke-width="4"/>'
                f'<path d="{ticks}" fill="none" stroke-width="3"/>')
    if race == "frog":
        return f'<path d="M26 {90 + y} Q64 {108 + y} 102 {88 + y} Q64 {97 + y} 26 {90 + y} Z" fill="{INK}" stroke-width="4"/>'
    if race == "skeleton":
        ticks = " ".join(f"M{x} {95 + y} V{106 + y}" for x in (48, 56, 64, 72, 80))
        gold = (f'<path d="M72 {96 + y} H80 V{106 + y} H72 Z" fill="{GOLD}" stroke-width="3"/>'
                if quirk == "goldTeeth" else "")
        return (f'<path d="M40 {96 + y} Q64 {90 + y} 88 {96 + y} L86 {108 + y} Q64 {112 + y} 42 {108 + y} Z" '
                f'fill="{SURFACE}" stroke-width="4"/>{gold}<path d="{ticks}" fill="none" stroke-width="3"/>')
    if race in ("fox", "vampire"):
        small = f'<path d="M44 {90 + y} Q64 {106 + y} 84 {88 + y} Q64 {96 + y} 44 {90 + y} Z" fill="{INK}" stroke-width="4"/>'
        return (small + f'<path d="M50 {92 + y} L53 {101 + y} L58 {93 + y} Z" fill="{SURFACE}" stroke-width="3"/>'
                f'<path d="M71 {93 + y} L75 {101 + y} L79 {91 + y} Z" fill="{SURFACE}" stroke-width="3"/>')
    grin = f'<path d="M36 {90 + y} Q64 {115 + y} 94 {88 + y} Q64 {98 + y} 36 {90 + y} Z" fill="{INK}" stroke-width="4"/>'
    if race == "rabbit":
        return (grin + f'<path d="M56 {93 + y} H64 V{106 + y} H56 Z" fill="{SURFACE}" stroke-width="3"/>'
                f'<path d="M64 {93 + y} H72 V{106 + y} H64 Z" fill="{SURFACE}" stroke-width="3"/>')
    if race == "imp":
        return (grin + f'<path d="M72 {94 + y} L77 {105 + y} L82 {92 + y} Z" fill="{GOLD if quirk == "goldTeeth" else SURFACE}" stroke-width="3"/>')
    if race == "ogre":
        return (grin + f'<path d="M46 {101 + y} L52 {76 + y} L62 {102 + y} Z" fill="{SURFACE}" stroke-width="3"/>'
                f'<path d="M78 {101 + y} L84 {84 + y} L88 {98 + y} Z" fill="{SURFACE}" stroke-width="3"/>')
    if race == "boar":
        return (grin + f'<path d="M38 {97 + y} L30 {80 + y} L48 {98 + y} Z" fill="{SURFACE}" stroke-width="3"/>'
                f'<path d="M90 {96 + y} L98 {79 + y} L80 {98 + y} Z" fill="{SURFACE}" stroke-width="3"/>')
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
    if race == "cat":
        parts.append('<path d="M28 82 L10 78 M28 90 L10 94 M100 82 L118 78 M100 90 L118 94" '
                     'fill="none" stroke-width="3"/>')
    if race == "lizard":
        for x, y in ((30, 84), (36, 92), (98, 84), (92, 92), (64, 62)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="2" fill="{INK}" stroke="none"/>')
    if race == "golem":
        parts.append('<path d="M30 50 L38 62 L32 70 M28 90 L34 96 L28 102" fill="none" stroke-width="3"/>')
    if race == "frog":
        for x, y in ((24, 88), (30, 94), (104, 88), (98, 94)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="2" fill="{INK}" stroke="none"/>')
    if race == "skeleton":
        parts.append('<path d="M94 56 L88 62 L94 68" fill="none" stroke-width="3"/>')
    if quirk == "blush":
        parts.append(f'<ellipse cx="34" cy="84" rx="7" ry="4" fill="{BLUSH}" stroke="none"/>'
                     f'<ellipse cx="94" cy="84" rx="7" ry="4" fill="{BLUSH}" stroke="none"/>')
    if quirk == "freckles":
        for x, y in ((38, 82), (44, 86), (32, 86), (90, 82), (84, 86), (96, 86)):
            parts.append(f'<circle cx="{x}" cy="{y}" r="1.6" fill="{INK}" stroke="none"/>')
    if quirk == "scar":
        parts.append('<path d="M88 80 L100 94 M90 88 L96 83 M95 94 L101 88" fill="none" stroke-width="3"/>')
    if quirk == "earring":
        x, y = {"elf": (31, 74), "orc": (15, 80), "gnome": (20, 90), "dwarf": (21, 84),
                "rabbit": (15, 26), "bull": (13, 78), "imp": (13, 74)}.get(race, (21, 84))
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
    face = (mask + eyes(mood, quirk, race) + brows(mood, race) + nose(race, skin)
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
