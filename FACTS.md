# xBloom fact sheet

Compiled 2026-09-01. Every number below carries the URL it came from. Numbering in
brackets points to the Sources list at the end. Anything I could not confirm from a
fetched page is marked UNVERIFIED.

A note on the help centre. The pages at `tbdxsupport.zendesk.com/hc/...` return 403 to
plain fetchers. I read them through the public Help Center API instead [32]. The
article URLs cited are the human-readable pages for the same content.

---

## Models

Both models are listed for sale on xbloom.com today.

| | xBloom Original | xBloom Studio |
|---|---|---|
| Price (xbloom.com, 2026-09-01) | $799.00 [21] | $599.00 [20] |
| Grinder | 48 mm conical steel burrs, 30 settings [28] | 48 mm burrs, 80 settings, 18.75 µm per step [1] |
| Grinder RPM control | UNVERIFIED (no source found) | 60-120 RPM, 10 RPM steps, default 120 [1] |
| Water temperature | Up to 95 °C / 203 °F. UNVERIFIED lower bound [see note] | 40-98 °C / 104-208 °F at the spout, plus RT and BP [1][2] |
| Water tank | 700 ml / 23.67 oz [28] | 946 ml / 32 oz [1] |
| Plumb-in water line | Not documented [28] | Yes. Tank or tap, switchable in the app [3][10] |
| Built-in scale | No [27] | Yes. 2 kg max, 0.1 g under 1 kg, 1 g from 1-2 kg [1] |
| Pouring mechanism | Solid-state electrostatic nodes [27] | Mechanical rotating nozzle [27] |
| Physical controls | App plus a rear button and the dock [27] | Three knobs and an LED matrix [1] |
| Vibration/agitation | Dock arm vibration exists; amplitude set in app [7] | Dock arm vibration, amplitude set in app [7] |
| Dose in the app recipe editor | Fixed at 15 g [7] | 5-18 g recommended by the dripper spec [1][16] |
| Cup/carafe limit | UNVERIFIED | Carafe over 300 ml, height under 100 mm (3.93 in) [2]. Omni Dripper 2 page says cup height 105 mm or less [16] |
| Connectivity | Bluetooth and Wi-Fi [17][27] | Bluetooth 5.0 or below in the spec table [1]; the app page claims Wi-Fi and Bluetooth for both [17] |

Note on the Original's temperature floor. Retail and review pages give the ceiling
(95 °C / 203 °F) but no floor [28]. Treat the Original's minimum as UNVERIFIED.

Which is current. The Studio is the newer machine and costs less. xBloom has not
published a discontinuation notice for the Original that I could find, and both product
pages return live inventory [20][21]. The app supports both [30]. UNVERIFIED: whether
xBloom still manufactures the Original.

Hardware facts that shape a recipe:

- Omni Dripper 2 holds 160 ml of liquid and 5-18 g of grounds [1][16]. A recipe over
  ~160 ml needs several pours, not one big one.
- The Studio's brewer module tops out at 500 ml of water per brew when driven from the
  app, and defaults to 250 ml when driven from the knobs [2].
- Grinding sessions should stay under 30 seconds with 60 seconds between them [2].
- Storage and operating temperature: 5-38 °C [1].

---

## Recipe parameters

The app's real field names, taken from the share-page JavaScript bundle [31]:
`dose`, `grandWater` (total water), `pourCount`, `pourList`, `volume`, `pausing`,
`pattern`, `temperature`, `isEnableVibrationBefore`, `isEnableVibrationAfter`,
`cupType`, `adaptedModel`, `roast`, `flavor`, `varietal`, `producer`, `elevation`,
`teaRecipePerVolumn`. Useful if the form should round-trip a shared recipe.

| Parameter | Original range | Studio range | Unit | Notes | Source |
|---|---|---|---|---|---|
| Dose | Fixed 15 g in Recipe-Edit | 5-18 g | g | Original's lock is from a 2024 release note; UNVERIFIED whether still true. Studio's 5-18 g is the Omni Dripper 2 spec, not a stated app limit. One reviewer says the app slider stops at 18 g and 25 g needs a workaround | [7][1][16][25] |
| Grind size | 1-30 | 1-80 | integer step | Studio: 1 = fine (espresso), 80 = coarse (French press, cold brew). 18.75 µm per step, about 180 µm at 1 and 1050 µm at 80 | [28][1][2][24] |
| Grind on/off | Yes ("Grinding Off") | Yes. Turn left knob fully right to show OFF | boolean | Lets you brew pre-ground coffee | [9][2] |
| Grinder RPM | UNVERIFIED | 60-120, step 10 | RPM | Default 120. Low RPM = wider particle spread and more body. High RPM = cleaner cup | [1][23][25] |
| Water temperature | up to 95 | 40-98, plus RT and BP | °C | Step is 1 °C. RT = room temperature, BP = boiling point. Heater itself runs 40-100 °C. Set per pour, not just per recipe | [28][1][2][25] |
| Number of pours | Supported since app v1.0.15 | up to 9 | count | A v1.0.14 release note reads "Limit recipe to a maximum of 9 pours". One review says 10. Treat 9 as the documented cap | [9][8][27] |
| Per-pour volume | UNVERIFIED | UNVERIFIED min/max | ml or g | Real recipes show 30-120 ml per pour. Total is capped by the 500 ml brewer limit and by dripper headroom | [26][2] |
| Total water (`grandWater`) | UNVERIFIED | up to 500 from the app | ml | 250 ml default from the knobs | [2] |
| Ratio | Adjustable | Adjustable | 1:N | Set before brewing. Changing it moves the difference into the final pour unless you edit the pours | [25] |
| Flow rate | UNVERIFIED | 3.0-3.5, step 0.1 | ml/s | App only. The knobs cannot set it. A review wished for 2-8 ml/s; that is not a spec | [2][25][26] |
| Pour pattern | Yes | Centered / Spiral / Circular | enum | Centered = straight down in one spot. Spiral = centre outward, then outer edge inward. Circular = largest radius only | [2] |
| Pause after pour (`pausing`) | UNVERIFIED | UNVERIFIED min/max | s | Real recipes show 0, 17, 21 and 26 s. Bloom rest is normally 30-45 s | [26][23][22] |
| Agitation before pour | Available | `isEnableVibrationBefore` | boolean | The dock arm shakes the dripper side to side | [31][25] |
| Agitation after pour | Available | `isEnableVibrationAfter` | boolean | Same mechanism | [31][25] |
| Vibration amplitude | Set in app | Set in app | UNVERIFIED scale | "Set dock arm vibration amplitude" added in app v1.0.11 / v1.0.15. It is a machine-level setting, not a per-pour one. The number of levels is UNVERIFIED | [7] |
| Bloom | First pour | First pour | - | There is no separate bloom object. The first pour in `pourList` is the bloom. Give it its own volume, temperature and pause | [25][4] |
| Pouring radius | UNVERIFIED | Adjustable | - | Machine setting under Advance Features, matched to the dripper's radius. xBloom says leave it at default. Too wide and water spills | [3] |
| Cup type | - | Omni Dripper vs other dripper | enum | Changes the overflow threshold. Set it wrong and the machine stalls with WAIT | [14] |
| Tea recipe | UNVERIFIED | Steep up to 360 s, multi-temperature | s | Separate recipe type added in app 2.1.0 / firmware V12.0D.400 | [11][30] |
| Grind-only mode | Yes | Yes (FreeSolo grinder module) | - | Standalone | [2] |
| Brew-only mode | Yes | Yes (FreeSolo brewer module) | - | Standalone. Weigh with the scale module | [2] |

Recipe-builder cautions for the developer:

- Temperature is not a plain number. The scale is `RT`, then 40-98 in 1 °C steps, then
  `BP`. Model it as an enum with a numeric middle, not as an integer input [2].
- Flow rate has a very narrow real range (3.0-3.5 ml/s). A slider from 1 to 10 would be
  wrong [2].
- Grind scale differs by model: 1-30 on the Original, 1-80 on the Studio. The form must
  branch on model [28][1].
- Dose may be locked at 15 g on the Original [7].
- Order matters: xBloom's own instructions are set global specs first (grind, ratio,
  dose), then add pours one at a time until the water is fully distributed, then save [4].

---

## How recipes get to the machine

Four routes, all documented [2]:

1. **NFC recipe card.** Tap a physical card on top of the machine. The machine reads the
   grind and brew parameters off the NFC chip. This works with no internet and no phone
   [2][19]. xPod bags ship with a card; the reusable Omni Dripper ships with a
   rewritable card that holds up to 18 profiles [16 sibling article, see 25 note].
2. **Bluetooth from the app.** Pair the phone, pick a recipe, tap Start. The app pushes
   the recipe to the machine. Since the December 2024 firmware you no longer need to
   scan a card first [2][10]. The Studio's spec table lists Bluetooth 5.0 [1].
3. **Auto Mode (Studio only).** The machine stores three recipes on board, slots A, B and
   C, and brews them with one press. No phone, no card. Ships with light, medium and dark
   roast presets. You replace any slot from the app: Settings, Auto Mode, Auto Mode
   Recipe, replace, Sync. Needs app v2.0.0 or later. Toggle Auto Mode and Pro Mode by
   pressing the middle knob three times [5][6][12].
4. **On-machine editing.** The knobs adjust grind size and coffee:water ratio mid-recipe.
   Everything else (grind speed, temperature, pour pattern, pour count) is app-only
   [2][5].

**Sharing.** Yes, recipes are shareable between users. The app has "How do I share
recipes?" and "How do I save recipes shared by others" articles [18]. Sharing produces a
public link of the form `https://share-h5.xbloom.com/?id=<token>`. xBloom publishes its
own three Auto Mode presets this way [5]:

- Light roast: `https://share-h5.xbloom.com/?id=yt6qpBQfZwsB0100lMbbkQ%3D%3D`
- Medium roast: `https://share-h5.xbloom.com/?id=BJvMmnDQ1wSW04sBNKjiDg%3D%3D`
- Dark roast: `https://share-h5.xbloom.com/?id=Pb2cpZRS0buoBuAaQxPueQ%3D%3D`

The share page is a single-page app that reads the recipe from
`https://client-api.xbloom.com/RecipeDetail.html`. The `id` in the URL is an encoded
token, not a plain recipe id. UNVERIFIED: whether the app also generates QR codes.
Recipes can also be pinned or removed in the list [and the list has search and trending
sections since app v2.0.0] [6].

**Offline.** The app caches recipes. You can edit a recipe and send it to the machine
with no internet [17]. The machine reads NFC recipes with no internet at all [19].

**One machine, several phones.** Supported. Pressing the rear/right knob three times
disconnects the current user so a new phone can pair [1].

---

## Starting recipes

### xBloom's own Auto Mode presets

xBloom ships three presets keyed to roast level: A light, B medium, C dark [12]. The
exact parameter values live behind the three share links above, which I could not decode
into plain numbers. Marked UNVERIFIED.

### xBloom's published filter baseline (Copilot mode)

From xBloom's own Basic Barista guide [23]:

- Dose 15 g
- Ratio 1:16, so 240 ml total water
- Grind 35-40
- Temperature 90-93 °C
- Grinder 90 RPM
- Pour pattern spiral
- Three pours: bloom 45 ml with a 30-45 s rest, then 100 ml, then 95 ml

### A real published Studio recipe, for shape

Colombia Finca Milan, as shown in the app [26]:

- Dose 15 g, grind 60, 60 RPM, 95 °C, ratio 1:17, total 255 ml
- Pour 1: 45 ml, then pause 17 s
- Pour 2: 30 ml, then pause 21 s
- Pour 3: 120 ml, then pause 26 s
- Pour 4: 60 ml, no pause

### Grind starting points by method (Studio 1-80 scale) [24]

| Method | Microns | Studio setting |
|---|---|---|
| Espresso | 180-380 | 1-11 |
| V60 | 400-700 | 12-28 |
| Pour-over, general | 410-930 | 13-40 |
| French press | 690-1050 | 27-80 |
| Cold brew | 800-1050 | 33-80 |

CoffeeGeek reports the chart printed under the Studio's water tank cap as espresso 1-15,
Aeropress 15-40, pour-over 30-70, French press 55-80 [26]. The two charts disagree.
Basic Barista's is the tighter and more recent guide; xBloom's on-machine chart is
broader. Show a range, not a single number.

### Roast-level grind adjustment [24]

- Light roasts are denser. Go 2-3 settings finer.
- Dark roasts give up solubles easily. Go coarser to stay clean.

### Ratios [22]

xBloom's own guidance: 1:16 standard, 1:15 or 1:14 for a stronger cup, 1:17 or 1:18 for
a lighter one. The common specialty band is 1:15 to 1:17.

---

## Brewing theory for beginners

Short version, all of it mainstream specialty-coffee consensus and all of it echoed on
xBloom's own pages [22][23][24].

**Extraction.** Hot water dissolves solids out of ground coffee. Pull too little and the
cup is sour, thin and salty. Pull too much and it is bitter, harsh and drying. Everything
below is a lever on how much you pull.

**Grind size.** The biggest lever [23]. Finer grounds have more surface area and slow the
water down, so they extract more. Coarser grounds extract less and drain faster. Change
grind before you change anything else.

**Water temperature.** Hotter water dissolves more, faster. xBloom's baseline is
90-93 °C [23]; their blog says about 93 °C [22]. Lower it 2-3 °C to soften a harsh cup.

**Bloom.** Fresh coffee holds carbon dioxide from roasting. That gas pushes water away
and makes extraction uneven. Wetting the grounds with roughly twice their weight in water
and waiting 30-45 seconds lets the gas escape [22]. On the xBloom this is simply the
first pour in the recipe.

**Agitation.** Stirring or shaking the bed mixes water through the grounds and raises
extraction. The xBloom does it by vibrating the dock arm before or after a pour [25].
Use it sparingly. Too much agitation packs fines into the filter and stalls the brew.

**Ratio.** Coffee weight to water weight. 1:16 means 15 g of coffee to 240 g of water.
Ratio sets strength. Grind and temperature set extraction. They are separate knobs.

**Fresh beans and a scale.** Coffee stales within weeks of roasting, and stale coffee
does not bloom. Volume measures are unreliable because grind size changes how much
coffee fits in a scoop. Weigh everything. The Studio has a scale built in [1]; the
Original does not [27].

---

## Dial-in and troubleshooting rules

### Taste-driven rules, from xBloom's own guide [23][24]

| Symptom | Cause | Fix |
|---|---|---|
| Sour, sharp, thin | Under-extracted | Grind 3-5 settings finer, or raise the temperature |
| Bitter, harsh, drying | Over-extracted | Grind 3-5 settings coarser, or drop the temperature 2-3 °C |
| Flat, weak, no sweetness | Ratio too wide | Try 1:15 instead of 1:16 before touching grind |
| Muddy, heavy, unclear | Too many fines, or over-agitation | Grind coarser, raise RPM toward 120, cut agitation |
| Too thin in body | Grind too clean | Drop RPM toward 60 for a wider particle spread |

Change one variable at a time, and move 3-5 grind settings per step [24].

### Brew-behaviour problems

**Channeling.** Water carves a fast path through the bed and skips the rest, so the cup
tastes both sour and bitter at once. xBloom's advice is to keep the pour even and
consistent [22]. On the machine, switch the pour pattern from centered to spiral or
circular so the water lands over the whole bed [2]. Level the bed before brewing. Reduce
agitation.

**Stalled drawdown.** The bed does not drain. Grind coarser, cut agitation, and lower the
dose so the bed is shallower. On the Studio a stall often trips the overflow protection:
the panel shows WAIT and pouring pauses until it is safe [15][14].

**WAIT or "Paused, Resume On Device".** This is overflow protection, not a fault [15].
xBloom's checklist [14]: remove the scale's factory tape, put the cup down before
grinding starts, keep the cup off the machine wall, never lift the cup mid-brew, and set
the correct cup type in the app so the machine uses the right threshold. Do not use an
espresso grind for pour-over [13].

**Grinding error.** Check for a jammed bean or foreign object, restart with three quick
presses of the right knob, then recalibrate the grinder [13].

**Grinder overload.** Very hard beans. xBloom advises against espresso-grinding anything
above Agtron +100 [13].

**Scale drifting or overloading.** Keep the load under 2 kg. Remove the factory tape.
Plug the machine straight into the wall, not a power strip, because ungrounded
neighbours upset the scale. Then run scale calibration [13].

**Brewing error.** Check the tank and lines have water, then descale [13].

**Grinder overheating.** Keep each grind under 30 seconds with a 60-second gap [2][13].

---

## Sources

Every URL below was fetched. Items 1-19 are xBloom help centre articles read through the
Help Center API (item 32) because the HTML pages return 403.

1. https://tbdxsupport.zendesk.com/hc/en-us/articles/25198204646939-Getting-started — the Studio user manual, section 1.4 holds the full spec table
2. https://tbdxsupport.zendesk.com/hc/en-us/articles/25198266531355-Three-Creative-Modes — Autopilot, Copilot, FreeSolo; grind, temperature, pour pattern and flow-rate ranges
3. https://tbdxsupport.zendesk.com/hc/en-us/articles/25198572238875-Settings — units, water source, pouring radius, calibration
4. https://tbdxsupport.zendesk.com/hc/en-us/articles/27094427432987-How-do-I-create-a-new-recipe
5. https://tbdxsupport.zendesk.com/hc/en-us/articles/31951971970459-What-Is-Auto-Mode-and-How-Do-You-Use-It — includes the three preset share links
6. https://tbdxsupport.zendesk.com/hc/en-us/articles/32242135059611-Update-Overview-iOS-V2-0-0-Android-V2-0-2
7. https://tbdxsupport.zendesk.com/hc/en-us/articles/28699759710875-Update-Overview-iOS-V1-0-11-Android-V1-0-15 — Original dose locked at 15 g; vibration amplitude setting
8. https://tbdxsupport.zendesk.com/hc/en-us/articles/28133576076827-Update-Overview-iOS-V1-0-10-Android-V1-0-14 — 9-pour cap
9. https://tbdxsupport.zendesk.com/hc/en-us/articles/30078405464859-Update-Overview-iOS-V1-0-13-Android-V1-0-17
10. https://tbdxsupport.zendesk.com/hc/en-us/articles/32241113958555-Firmware-Update-Summary-December-2024
11. https://tbdxsupport.zendesk.com/hc/en-us/articles/38554558508955-V12-0D-400-Firmware-Update-Summary
12. https://tbdxsupport.zendesk.com/hc/en-us/articles/32193387828891-V12-0D-210-Firmware-Update-Summary
13. https://tbdxsupport.zendesk.com/hc/en-us/articles/28666127699867-xBloom-Studio-Troubleshooting-Tips
14. https://tbdxsupport.zendesk.com/hc/en-us/articles/26644507176859-What-does-WAIT-on-the-machine-panel-mean
15. https://tbdxsupport.zendesk.com/hc/en-us/articles/21630735783707-What-does-Paused-Resume-On-Device-mean
16. https://tbdxsupport.zendesk.com/hc/en-us/articles/25915864027675-How-do-I-brew-my-favorite-coffee-beans-with-the-Omni-Dripper-2
17. https://tbdxsupport.zendesk.com/hc/en-us/articles/25198423801115-Using-the-xBloom-App
18. https://tbdxsupport.zendesk.com/hc/en-us/articles/29118404822299-How-do-I-share-recipes
19. https://tbdxsupport.zendesk.com/hc/en-us/articles/13127092123163-Can-I-use-the-xBloom-machine-without-it-being-connected-to-the-internet
20. https://xbloom.com/products/xbloom-studio.json — official Shopify product record, $599.00
21. https://xbloom.com/products/xbloom-original.json — official Shopify product record, $799.00
22. https://xbloom.com/blogs/news/mastering-pour-over-coffee-tips-for-consistency-and-precision — xBloom's own ratio, temperature and bloom guidance
23. https://thebasicbarista.com/en-us/blogs/article/how-to-dial-in-your-xbloom-studio-using-copilot-mode — baseline recipe and taste-driven fixes
24. https://thebasicbarista.com/en-us/blogs/article/xbloom-studio-grind-size-guide — grind chart by method and micron
25. https://nucleuscoffee.com/en/blogs/focus-xbloom-studio/focus-xbloom-studio-2-variables-de-controle — roaster's variable-by-variable breakdown
26. https://coffeegeek.co/equipment/coffee-machines/pour-over/test-xbloom-studio — a real four-pour recipe with pause times; the under-cap grind chart
27. https://www.wholelattelove.com/blogs/reviews/xbloom-studio-review — Original vs Studio comparison table
28. https://www.wholelattelove.com/products/xbloom-original — Original spec table, 30 grind settings, 23.67 oz tank, 48 mm conical burrs
29. https://www.baristamagazine.com/test-drive-the-xbloom-studio/ — confirms 1-80 grind, 60-120 RPM, 40-98 °C
30. https://apps.apple.com/us/app/xbloom-coffee/id6473127142 — app version history, supported machines, tea recipes
31. https://share-h5.xbloom.com/assets/Home-N9kunfWn.js — the share page's own JavaScript; source of the real API field names
32. https://tbdxsupport.zendesk.com/api/v2/help_center/en-us/articles.json — the API used to read all 107 help centre articles

Blocked, for the record. `manuals.plus/xbloom/fw-01a-coffee-machine-manual` and
`device.report/manuals/xBloom-coffee-machine-user-manual` both return 403 to fetchers.
Both claim to hold the xBloom Original (model FW-01A) manual, which would settle the
Original's temperature floor and app-side ranges. FOR PHILIP: opening either in a normal
browser would close several of the gaps below.

---

## Unknowns

Ranked by how much they matter to the recipe-builder form.

1. **Per-pour volume min and max.** No published limit. Observed values run 30-120 ml.
   The practical ceiling is the Omni Dripper 2's 160 ml headroom and the brewer's 500 ml
   total. Suggest the form accept 5-160 ml per pour and validate the sum against 500 ml.
2. **Pause duration min and max.** No published limit. Observed 0-45 s. Tea recipes go to
   360 s, so the firmware clearly handles long waits [11].
3. **Vibration amplitude scale.** Documented as a feature, never as a set of values.
   Number of levels, units and default all unknown [7].
4. **Dose min and max as enforced by the app.** The 5-18 g figure is the dripper's
   recommendation, not a stated slider range [1][16]. One roaster reports the app stops
   at 18 g [25].
5. **The Original's temperature floor**, and whether its recipe editor still locks dose at
   15 g in current app versions. The lock is from a 2024 release note [7].
6. **The three Auto Mode presets' actual parameter values.** They are published only as
   share links [5]. Opening them in the xBloom app would reveal the numbers.
7. **QR code sharing.** Share links exist. Whether the app renders them as QR codes is
   unconfirmed.
8. **Max pour count on the Original**, and whether the Studio's cap is 9 or 10 [8][27].
9. **Whether the Original is still in production**, as opposed to still in stock.
10. **Grinder RPM control on the Original.** No source says it exists.
