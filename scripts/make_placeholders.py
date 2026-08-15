#!/usr/bin/env python3
"""
Generates the placeholder catalogue: 20 invented productions plus a
cinematic-looking still for each, so the wall can be judged as a design
before any real material exists.

Everything this script writes is disposable. Delete src/content/productions/*.md
and public/thumbs/*.jpg once the real catalogue goes in.
"""
import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter

random.seed(20260815)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THUMBS = os.path.join(ROOT, "public", "thumbs")
PROD = os.path.join(ROOT, "src", "content", "productions")
IMG = os.path.join(ROOT, "public", "img")
os.makedirs(THUMBS, exist_ok=True)
os.makedirs(PROD, exist_ok=True)
os.makedirs(IMG, exist_ok=True)

# (id, title_da, title_en, client, year, category, role_da, role_en,
#  desc_da, desc_en, order, featured, vimeo)
P = [
    ("fortabte-somre", "Fortabte somre", "Lost Summers", "Bjergvang Film", 2025, "film",
     "Fotograf", "Cinematographer",
     "Kortfilm om to søskende, der vender tilbage til et sommerhus, de ikke har set i tyve år. Optaget på Anamorphic i Nordsjælland over ni dage.",
     "Short film about two siblings returning to a summer house they have not seen in twenty years. Shot anamorphic in North Zealand over nine days.",
     1, True, "76979871"),
    ("staalvaerket", "Stålværket", "The Steelworks", "Byhistorisk Museum", 2024, "kultur",
     "Fotograf & klip", "DP & editor",
     "Udstillingsfilm om byens sidste stålværk, bygget op om arkivmateriale og fire interviews med tidligere ansatte. Vises i loop i museets hovedsal.",
     "Exhibition film about the city's last steelworks, built around archive footage and four interviews with former workers. Runs on loop in the museum's main hall.",
     2, True, ""),
    ("nordlys-gin", "Nordlys Gin — Vinterserie", "Nordlys Gin — Winter Series", "Nordlys Destilleri", 2025, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Tre produktfilm til sociale medier. Makrooptagelser af botanicals og is, skudt på højhastighed i studie.",
     "Three product films for social media. Macro shots of botanicals and ice, filmed at high speed in studio.",
     3, True, "76979871"),
    ("morgenskift", "Morgenskift", "Morning Shift", "Egen produktion", 2023, "film",
     "Instruktør & fotograf", "Director & cinematographer",
     "Dokumentarisk kortfilm optaget over fire måneder på et bageri i Sydhavnen. Udtaget til to nordiske festivaler.",
     "Documentary short filmed over four months in a bakery in Sydhavnen. Selected for two Nordic festivals.",
     4, True, ""),
    ("havnefestival-2024", "Havnefestival 2024", "Harbour Festival 2024", "Havnefestival", 2024, "kultur",
     "Fotograf & klip", "DP & editor",
     "Aftermovie fra tre dages festival. To kameraer, levering 48 timer efter sidste koncert.",
     "Aftermovie from three days of festival. Two cameras, delivered 48 hours after the final concert.",
     5, False, ""),
    ("groenne-tage", "Grønne tage", "Green Roofs", "Foreningen Bæredygtigt Byggeri", 2023, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Oplysningsfilm om tagbeplantning i byen. Drone, interviews og grafik. Brugt i undervisning og til medlemsmøder.",
     "Informational film about rooftop planting in the city. Drone, interviews and graphics. Used in teaching and at member meetings.",
     6, False, ""),
    ("kokken-og-koen", "Kokken og køen", "The Chef and the Cow", "Restaurant Stenhuset", 2022, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Portrætfilm om restaurantens samarbejde med en gård på Djursland. Fra mark til tallerken på fire minutter.",
     "Portrait film about the restaurant's collaboration with a farm in Djursland. From field to plate in four minutes.",
     7, True, ""),
    ("vinterbad", "Vinterbad", "Winter Swim", "Egen produktion", 2024, "film",
     "Fotograf", "Cinematographer",
     "Stemningsfilm optaget ved daggry gennem en hel vintersæson. Ingen dialog.",
     "Mood piece filmed at dawn across an entire winter season. No dialogue.",
     8, False, ""),
    ("arv-og-jord", "Arv og jord", "Inheritance", "Landbrugets Kulturfond", 2022, "kultur",
     "Fotograf", "Cinematographer",
     "Dokumentarfilm i tre dele om generationsskifte på danske gårde. Optaget over halvandet år.",
     "Three-part documentary about generational handover on Danish farms. Filmed over a year and a half.",
     9, False, ""),
    ("bryggeriet-tour", "Bryggeriet — rundvisning", "The Brewery — A Tour", "Skovgaard Bryggeri", 2023, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Virksomhedsfilm til hjemmeside og messebrug. Steadicam gennem hele produktionen i én bevægelse.",
     "Corporate film for website and trade fairs. Steadicam through the entire production in a single move.",
     10, False, ""),
    ("stemmer-fra-blokken", "Stemmer fra blokken", "Voices from the Block", "Boligforeningen Nordvest", 2021, "kultur",
     "Fotograf & klip", "DP & editor",
     "Otte beboerportrætter til foreningens 60-års jubilæum. Vist på storskærm til jubilæumsfesten.",
     "Eight resident portraits for the association's 60th anniversary. Screened at the anniversary party.",
     11, False, ""),
    ("saeson-forar", "Sæson — Forår", "Season — Spring", "Gartneriet Lindely", 2024, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Første film i en serie på fire, én pr. årstid. Produktoptagelser af grøntsager i dagslys.",
     "First film in a series of four, one per season. Product photography of vegetables in daylight.",
     12, False, ""),
    ("den-sidste-faerge", "Den sidste færge", "The Last Ferry", "Bjergvang Film", 2020, "film",
     "Fotograf", "Cinematographer",
     "Kortfilm optaget på en nedlagt færgerute. Vandt fotografiprisen ved en dansk kortfilmfestival.",
     "Short film shot on a discontinued ferry route. Won the cinematography prize at a Danish short film festival.",
     13, True, ""),
    ("teater-bag-scenen", "Bag scenen", "Backstage", "Nørrebro Egnsteater", 2022, "kultur",
     "Fotograf & klip", "DP & editor",
     "Dokumentation af en opsætning fra første læseprøve til premiere. Klippet ned til en trailer og en lang version.",
     "Documentation of a production from first read-through to opening night. Cut into a trailer and a long version.",
     14, False, ""),
    ("haandvaerk-serie", "Håndværk — seks portrætter", "Craft — Six Portraits", "Danske Håndværkslaug", 2021, "kultur",
     "Fotograf & klip", "DP & editor",
     "Seks korte portrætter af faglærte i deres værksteder. Fast opsætning, naturligt lys, ingen speak.",
     "Six short portraits of skilled trades in their workshops. Fixed setup, natural light, no voiceover.",
     15, False, ""),
    ("kaffebar-kampagne", "Ny bar, samme bønner", "New Bar, Same Beans", "Kaffebaren Syd", 2025, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Kampagnefilm i tre længder til åbning af ny filial. Leveret i 16:9, 1:1 og 9:16.",
     "Campaign film in three lengths for a new branch opening. Delivered in 16:9, 1:1 and 9:16.",
     16, False, ""),
    ("kirkegaarden", "Kirkegården om vinteren", "The Cemetery in Winter", "Egen produktion", 2019, "film",
     "Instruktør & fotograf", "Director & cinematographer",
     "Eksperimentalfilm på 16mm. Otte minutter, optaget over tre uger i januar.",
     "Experimental film on 16mm. Eight minutes, shot over three weeks in January.",
     17, False, ""),
    ("aarsmoede-2019", "Årsmøde 2019", "Annual Meeting 2019", "Foreningen Dansk Ungdomsliv", 2019, "kultur",
     "Fotograf", "Cinematographer",
     "Optagelse og klipning af foreningens årsmøde, inklusive fem taler og en paneldebat.",
     "Recording and editing of the association's annual meeting, including five speeches and a panel debate.",
     18, False, ""),
    ("vaerktoej-katalog", "Værktøjskatalog", "Tool Catalogue", "Hansen Værktøj", 2018, "erhverv",
     "Fotograf & klip", "DP & editor",
     "Fireogtyve korte produktvideoer til webshop. Ensartet opsætning, leveret på tre optagedage.",
     "Twenty-four short product videos for a webshop. Uniform setup, delivered across three shoot days.",
     19, False, ""),
    ("foerste-film", "Regnvejrsdage", "Rainy Days", "Egen produktion", 2011, "film",
     "Instruktør & fotograf", "Director & cinematographer",
     "Den første. Kortfilm optaget på lånt udstyr med venner som hold. Står her, fordi den stadig betyder noget.",
     "The first one. A short film shot on borrowed gear with friends as crew. It is here because it still matters.",
     20, False, ""),
]

# Cinematic-ish palettes: (shadow rgb, highlight rgb)
PALETTES = {
    "film": [((14, 20, 34), (196, 138, 92)), ((10, 16, 24), (120, 158, 176)),
             ((26, 16, 20), (208, 160, 120)), ((12, 22, 28), (150, 180, 170))],
    "kultur": [((22, 20, 30), (176, 152, 190)), ((16, 24, 30), (198, 176, 130)),
               ((28, 22, 18), (214, 168, 116)), ((14, 20, 26), (140, 166, 186))],
    "erhverv": [((18, 22, 24), (222, 196, 150)), ((20, 18, 22), (206, 178, 168)),
                ((12, 20, 22), (166, 196, 186)), ((24, 20, 16), (232, 204, 152))],
}

W, H = 1280, 720


def make_still(path, palette, seed):
    rng = random.Random(seed)
    lo, hi = palette
    img = Image.new("RGB", (W, H))
    px = img.load()

    # Diagonal gradient with a soft off-centre light source.
    cx = rng.uniform(0.25, 0.75) * W
    cy = rng.uniform(0.2, 0.6) * H
    angle = rng.uniform(0, math.pi)
    dx, dy = math.cos(angle), math.sin(angle)
    maxd = math.hypot(W, H)

    for y in range(H):
        for x in range(W):
            lin = ((x * dx + y * dy) / maxd + 1) / 2
            rad = 1 - min(1.0, math.hypot(x - cx, y - cy) / (maxd * 0.55))
            tv = max(0.0, min(1.0, lin * 0.55 + rad * 0.65))
            tv = tv ** 1.4
            px[x, y] = (
                int(lo[0] + (hi[0] - lo[0]) * tv),
                int(lo[1] + (hi[1] - lo[1]) * tv),
                int(lo[2] + (hi[2] - lo[2]) * tv),
            )

    img = img.filter(ImageFilter.GaussianBlur(radius=18))

    # A couple of soft out-of-focus shapes so it reads as a frame, not a swatch.
    overlay = Image.new("RGB", (W, H), (0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for _ in range(rng.randint(2, 4)):
        r = rng.randint(70, 260)
        ox = rng.randint(-100, W + 100)
        oy = rng.randint(-60, H + 60)
        shade = rng.randint(18, 60)
        od.ellipse([ox - r, oy - r, ox + r, oy + r], fill=(shade, shade, shade))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=90))
    img = Image.blend(img, Image.blend(img, overlay, 0.35), 0.5)

    # Vignette.
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W * 0.2, -H * 0.35, W * 1.2, H * 1.35], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(radius=140))
    black = Image.new("RGB", (W, H), (0, 0, 0))
    img = Image.composite(img, black, vig)

    # Grain.
    grain = Image.effect_noise((W, H), 14).convert("L").point(lambda v: v)
    img = Image.blend(img, Image.merge("RGB", (grain, grain, grain)), 0.045)

    img.save(path, "JPEG", quality=82, optimize=True)


def esc(s):
    return s.replace('"', '\\"')


for i, (pid, tda, ten, client, year, cat, rda, ren, dda, den, order, feat, vim) in enumerate(P):
    pal = PALETTES[cat][i % len(PALETTES[cat])]
    make_still(os.path.join(THUMBS, f"{pid}.jpg"), pal, seed=i * 977 + 13)
    fm = f"""---
title_da: "{esc(tda)}"
title_en: "{esc(ten)}"
client: "{esc(client)}"
year: {year}
category: "{cat}"
role_da: "{esc(rda)}"
role_en: "{esc(ren)}"
description_da: "{esc(dda)}"
description_en: "{esc(den)}"
vimeoId: "{vim}"
thumbnail: "/thumbs/{pid}.jpg"
order: {order}
featured: {str(feat).lower()}
draft: false
---
"""
    with open(os.path.join(PROD, f"{pid}.md"), "w", encoding="utf-8") as f:
        f.write(fm)

# Portrait placeholder for the about page.
make_still(os.path.join(IMG, "portrait.jpg"), ((20, 22, 26), (170, 150, 132)), seed=4242)

print(f"Wrote {len(P)} productions, {len(P)} stills, 1 portrait.")
