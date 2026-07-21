// Math Trail — activity catalog, milestones and session windows.
// Curriculum: Kate Snow, "Preschool Math at Home" + concrete materials on hand.

export const ACTIVITIES = {

// ════════ SUBITIZING ════════
dice_flash:{ name:'Dice Flash', teaches:['Subitizing'], category:'subitizing', weight:4, chapter:[1], startLevel:2,
  materials:'🎲 1 die',
  levels:{1:'Re-roll until faces 1–3 only',2:'Accept faces 1–4 (re-roll 5s and 6s)',3:'All faces 1–6 — full challenge'},
  layout:
`  Roll the die flat on the table.
  ┌───────┐
  │ • • • │  ← example: 3 dots
  │   •   │
  │ • • • │
  └───────┘
  See the whole dot pattern at once!`,
  script:[
    "Roll ONE die onto the table.",
    "Say: 'Look! What do you see?' — wait 2 seconds.",
    "No hints — let her eyes recognize the pattern.",
    "If she answers: 'Yes! [X]! You saw it so fast!'",
    "Roll again. New face — new flash. 4–5 rolls total."],
  camo_script:[
    "Roll the die: 'A sleeping monster woke up with spots!'",
    "'How many spots before it goes back to sleep?'",
    "Celebrate with a roar. Roll again.",
    "'New monster! How many spots this time?'"]},

dino_flash:{ name:'Dino Cluster Flash', teaches:['Subitizing'], category:'subitizing', weight:4, startLevel:2,
  materials:'🦕 3–6 dinos (one color) + 1 bowl',
  levels:{1:'Clusters of 2–3 dinos',2:'Clusters of 4 (square shape)',3:'Clusters of 5–6 (X shape · two rows of 3)'},
  layout:
`  Arrange dinos in a tight cluster:
  🦕 🦕       🦕 🦕 🦕
  🦕 🦕   or     🦕
  (4 = square)  (5 = X shape)
  Cover with bowl → lift fast!`,
  script:[
    "Pick dinos of the SAME color (see today's level).",
    "Arrange in a tight cluster: square (4) or X (5).",
    "Cover with an upturned bowl. Say: 'Ready?'",
    "Lift the bowl fast. Wait 2 seconds silently.",
    "No counting aloud — she sees the whole shape!",
    "Say: 'Yes! [X] dinos — like a [square/star]!'"],
  camo_script:[
    "Say: 'The dino crew is hiding in the cave!'",
    "Cover: 'Shhh — all inside!'",
    "Lift fast: 'The crew came out!'",
    "'How many in the crew?' — wait, no hints.",
    "Cheer: 'The whole crew is here!'"]},

build_match:{ name:'Build & Match', teaches:['Subitizing','One More / One Less'], category:'subitizing', weight:3,
  materials:'🔵 Snap cubes (10 per color × 7 colors)',
  levels:{1:'Sticks of 2–4 cubes',2:'Sticks of 4–6 cubes',3:'Sticks of 6–8 + \"build one MORE than mine\"'},
  layout:
`  You build:  🟦🟦🟦🟦  (4 cubes)
  She copies: 🟩🟩🟩🟩  (any color, same count)
  Line up side by side to check:
  ══════════ same length? ══════════`,
  script:[
    "Build a stick of cubes of one color (today's level).",
    "Say: 'Can you build one just like mine?'",
    "She builds her own — any colors she wants.",
    "Line them up side by side.",
    "Say: 'Do they match? Same length?'",
    "If off: 'Mine has [X], yours has [Y] — add or remove!'"],
  camo_script:[
    "Say: 'Two trains must match to race!'",
    "Build: 'My train is ready — build yours!'",
    "Line up: 'Are they even at the starting line?'",
    "Adjust: 'Perfect match! The race starts now!'"]},

five_frame:{ name:'Five-Frame Grid', teaches:['Subitizing','Five-Frame'], category:'subitizing', weight:3, chapter:[4],
  materials:'📄 Paper + pen + 🦕 dinos or cubes',
  levels:{1:'Fill and count 1–5 together',2:'Ask: how many FILLED? how many EMPTY?',3:'Flash it — she says the number without counting'},
  layout:
`  Draw on paper (30 sec):
  ┌──┬──┬──┬──┬──┐
  │🦕│🦕│🦕│  │  │  ← 3 filled
  └──┴──┴──┴──┴──┘
  "How many dinos? How many
   empty rooms are left?"`,
  script:[
    "Draw a row of 5 boxes — the five-frame.",
    "Put some dinos in, one per box, left to right.",
    "Ask: 'How many dinos are in the frame?'",
    "Then: 'How many empty boxes are left?'",
    "Change the amount. Repeat 4–5 rounds.",
    "At Level 3: cover, lift fast — no counting!"],
  camo_script:[
    "Say: 'This is the dino hotel — 5 rooms!'",
    "'Some guests checked in — how many?'",
    "'How many rooms are still empty?'",
    "'New guests arrive!' — change and repeat."]},

// ════════ COUNTING 6–10 (current focus) ════════
long_row_count:{ name:'Count 6–10: Row · Circle · Scatter', teaches:['One-to-One Counting','Counting 6–10'], category:'counting', weight:4, chapter:[1], startLevel:2,
  materials:'🔵 6–10 snap cubes (one color)',
  levels:{1:'Straight ROW of 6–10 — touch each cube (she owns this!)',2:'CIRCLE of 6–10 — mark where you started!',3:'SCATTERED pile — she moves each cube aside as she counts'},
  layout:
`  L1 Row:    🟦🟦🟦🟦🟦🟦🟦🟦
  L2 Circle:    🟦 🟦
             🟦      🟦
                🟦 🟦
  L3 Scatter: 🟦  🟦    🟦
                🟦   🟦  🟦
  Same cubes — harder shapes!`,
  script:[
    "Arrange the cubes for today's level: row, circle, or scattered.",
    "ROW: touch each cube left to right as you count.",
    "CIRCLE: pick a starting cube and REMEMBER it — stop when you're back!",
    "SCATTER: move each cube aside as it gets counted — no cube counted twice.",
    "If she skips or repeats: 'Hmm, let's try slower.'",
    "Big question at the end: 'How do we KNOW we counted them all?'"],
  camo_script:[
    "Say: 'The storm scattered the dino train wagons!'",
    "'Move each wagon back to the track as you count it!'",
    "Circle: 'The wagons made a round track — where did the train start?'",
    "'The train is complete — [X] wagons! Choo choo!'"]},

number_line:{ name:'Number Line 0–10', teaches:['Written Numerals','Number Order'], category:'counting', weight:2, chapter:[5],
  materials:'📄 Paper squares with numbers 0–10 written',
  levels:{1:'Order cards 1–5',2:'Order 0–10 together',3:'She orders 0–10 alone — then hide one: what is missing?'},
  layout:
`  Write numbers on paper squares:
  [0][1][2][3][4][5][6][7][8][9][10]
  Shuffle → she puts them in order.
  Then: hide one — "what's missing?"`,
  script:[
    "Write 0–10 on small paper squares (today's level).",
    "Shuffle them on the table.",
    "Say: 'Let's build the number road — in order!'",
    "Start from ZERO — 'zero means none!'",
    "Count along the finished line together, touching each.",
    "Level 3: she closes eyes, you hide one — 'what's missing?'"],
  camo_script:[
    "Say: 'The number road broke into pieces!'",
    "'Help the dinos rebuild it — in order!'",
    "'Now walk the dino down the road: 0, 1, 2...'",
    "'Oh no, a piece was stolen! Which one?'"]},

thinking_questions:{ name:'Number Detective', teaches:['Ordinals','Class Inclusion'], category:'counting', weight:2, chapter:[1],
  materials:'🦕 8–10 dinos (mix 2 colors, e.g. 6 blue + 2 yellow)',
  levels:{1:'\"Show me the 3rd / the 5th dino\"',2:'\"Show me the 8th\" in a row of 8–10',3:'\"More BLUE dinos... or more DINOS?\"'},
  layout:
`  Row of 8 dinos:
  🦕🦕🦕🦕🦕🦕🦕🦕
  "Show me the 8th dino!"  (ordinal)
  Mix: 6 blue + 2 yellow:
  "More BLUE dinos... or more DINOS?"`,
  script:[
    "Line up 8–10 dinos in a row.",
    "Ask: 'Show me the FIRST dino... the THIRD...'",
    "Level 2: 'Show me the 8th dino!' — let her count to it.",
    "Level 3: use 6 blue + 2 yellow together.",
    "Ask: 'Are there more BLUE dinos or more DINOS?'",
    "Whatever she says: 'How do you know?' — no correcting rush."],
  camo_script:[
    "Say: 'You are the dino detective!'",
    "'Find suspect number 3 in the line-up!'",
    "'Now find suspect number 8!'",
    "'Final mystery: more blue dinos or more dinos?'"]},

// ════════ ONE MORE / ONE LESS ════════
one_more_tower:{ name:'One More Tower', teaches:['One More / One Less','Subitizing'], category:'one_more_less', weight:4,
  materials:'🔵 Snap cubes (any color)',
  levels:{1:'Towers of 2–4',2:'Towers of 4–6',3:'She PREDICTS before touching — mix more and less'},
  layout:
`  Start:    🟦🟦🟦     (3 cubes)
  One more: 🟦🟦🟦🟦   (4 — one MORE!)
  One less: 🟦🟦🟦     (3 — one LESS!)
  ↑ Tower grows and shrinks!`,
  script:[
    "Build a tower together (today's level size).",
    "Count: 'How many? [X].'",
    "Hand her ONE cube: 'Add this one!'",
    "'Now how many? [X+1]! That is ONE MORE than [X]!'",
    "Remove one: 'One falls off! ONE LESS — [X-1]!'",
    "Repeat 4–5 times. Let her predict before adding/removing."],
  camo_script:[
    "Say: 'The tower needs one more floor!'",
    "Add: 'Now [X+1] floors! One MORE!'",
    "Remove: 'Oh no! One floor fell! Now [X-1]! ONE LESS!'"]},

one_less_sneak:{ name:'One Less Sneaky Remove', teaches:['One More / One Less','Subitizing'], category:'one_more_less', weight:4,
  materials:'🦕 4–6 dinos (one color)',
  levels:{1:'Start with 3–4 dinos',2:'Start with 5–6 dinos',3:'Sometimes sneak TWO away!'},
  layout:
`  Line up 5 dinos:
  🦕 🦕 🦕 🦕 🦕
  Eyes closed → sneak ONE away:
  🦕 🦕 🦕 🦕
  'One ran away! How many left?'`,
  script:[
    "Line up dinos (today's level). Count together.",
    "Say: 'Close your eyes! No peeking!'",
    "Remove ONE dino. Hide it in your hand.",
    "'Open! One ran away! How many now?'",
    "Wait — let her figure it out. No hints.",
    "Reveal: 'Here it is! It came back! Back to [X]!'"],
  camo_script:[
    "Say: 'The dinos are playing hide and seek!'",
    "Eyes closed. Remove one: 'One dino hid!'",
    "'Open! How many dinos are still out?'",
    "Reveal: 'Found you! The whole crew is back!'"]},

roll_one_more:{ name:'Roll & One More', teaches:['One More / One Less','Subitizing'], category:'one_more_less', weight:3,
  materials:'🎲 1 die + snap cubes (any color)',
  levels:{1:'One MORE only',2:'Mix one more and one less',3:'Challenge: \"TWO more than [X]?\"'},
  layout:
`  Roll the die → see [4]
  ┌───────┐
  │ • •   │
  │       │  → 4 dots
  │ • •   │
  └───────┘
  Build 4 cubes → add ONE MORE → [5]!`,
  script:[
    "Roll the die. Look at the number together.",
    "Build that exact number of cubes side by side.",
    "Say: 'You have [X]. What is ONE MORE than [X]?'",
    "Wait — let her think before touching anything.",
    "Add 1 cube: 'One more! [X+1]! Was she right?'",
    "Roll again. Repeat. Then try: 'ONE LESS than [X]?'"],
  camo_script:[
    "Roll: 'The die shows [X] rocket boosters!'",
    "Build [X] cubes: 'We need ONE more booster to launch!'",
    "Add 1: 'Now [X+1] boosters — blast off!'"]},

changing_numbers:{ name:'Changing Numbers', teaches:['One More / One Less','Number Flexibility'], category:'one_more_less', weight:3,
  materials:'🔵 5–6 snap cubes',
  levels:{1:'Change 5 into 4 (take one away)',2:'Any number ± 1 — \"what did you DO?\"',3:'Change by 2: turn 5 into 3'},
  layout:
`  Row of 5 cubes: 🟦🟦🟦🟦🟦
  Ask: "Make it become 4!"
  (take away one... or add to go up!)
  "What did you DO to change it?"`,
  script:[
    "Make a row of 5 cubes. Count it together.",
    "Ask: 'Can you make it become 4?'",
    "Let her act — no hints about adding/removing.",
    "Then the key question: 'What did you DO?'",
    "'You took ONE away — 5 became 4!'",
    "Now up: 'Make 4 become 6!' — she explains again."],
  camo_script:[
    "Say: 'This is a magic number machine!'",
    "'The machine wants FOUR — make it happen!'",
    "'What magic did you do?'",
    "'Now the machine wants SIX! More magic!'"]},

// ════════ PART-PART-WHOLE / COMPOSITION ════════
break_cubes:{ name:'Break-Apart Cubes', teaches:['Part-Part-Whole','Number Composition'], category:'composition', weight:4,
  materials:'🔵🟡 Snap cubes (2 different colors, 10 each)',
  levels:{1:'Whole of 4–5',2:'Whole of 6',3:'She names BOTH parts before snapping'},
  layout:
`  Build ONE stick — two colors:
  🟡🟡🟡 + 🔵🔵🔵 = 6 total
  ━━━━━━━━━━━━━━━━━━━━━━━━
  Snap apart → "3 yellow AND 3 blue"
  Push back  → "together = 6!"`,
  script:[
    "Build a stick (today's level) — use 2 colors.",
    "Hold it up: 'ONE whole stick — [X] cubes total!'",
    "Snap apart slowly: 'Oh! It broke into two parts!'",
    "Hold each part: '[A] yellow... [B] blue.'",
    "Say: '[A] AND [B] together make [X]!'",
    "She pushes back: 'Fixed! The whole is [X] again!'"],
  camo_script:[
    "Say: 'The spaceship engine broke into two pieces!'",
    "Snap: '[A] pieces here, [B] there!'",
    "Say: 'Fix the engine — push them together!'",
    "Joined: 'Fixed! [X] total — ready to fly!'"]},

hidden_dinos:{ name:'Hidden Dino Mystery', teaches:['Part-Part-Whole','Number Composition'], category:'composition', weight:4,
  materials:'🦕 5–6 dinos (one color) + 1 bowl',
  levels:{1:'Total of 3–4 dinos',2:'Total of 5',3:'Total of 6'},
  layout:
`  Start: 5 dinos all outside
  🦕 🦕 🦕  ← 3 visible outside
  🥣 bowl  ← 2 hidden inside
  "3 outside + ? inside = 5 total"`,
  script:[
    "Count out the dinos together (today's total). Line them up.",
    "'Watch — [Z] dinos go into the cave!' Slide them under bowl.",
    "Point to those outside: 'These [Y] are outside.'",
    "Say: 'How many are hiding inside the cave?'",
    "Wait quietly — no hints.",
    "Peek together: '[Z]! [Y] AND [Z] make [total]!'"],
  camo_script:[
    "Say: 'Some dinos ran into the cave to sleep!'",
    "Slide some under bowl: 'Shhh — they are sleeping!'",
    "Point: '[Y] dinos are still awake outside.'",
    "'How many are napping inside?'",
    "Lift: 'You found them! [Z] were sleeping!'"]},

dino_bowl_parts:{ name:'Dino Bowl Parts', teaches:['Part-Part-Whole','Number Composition'], category:'composition', weight:3,
  materials:'🦕 5–6 dinos (2 colors) + 2 matching bowls',
  levels:{1:'Total of 4 (2+2 · 3+1)',2:'Total of 5',3:'Total of 6'},
  layout:
`  Pick 5 dinos: 3 RED + 2 GREEN
  🥣 Red bowl    🥣 Green bowl
  🦕🦕🦕         🦕🦕
     3       +      2      = 5
  "Three AND two make FIVE!"`,
  script:[
    "Pick dinos of 2 different colors (today's total).",
    "Put each color into its matching color bowl.",
    "Point: 'Red bowl has [A]. Green bowl has [B].'",
    "'[A] AND [B] together — how many dinos total?'",
    "Pour both bowls together and count: '[total]!'",
    "Say: '[A] and [B] MAKE [total]!' — clap the rhythm."],
  camo_script:[
    "Say: 'Two dino families are having a party!'",
    "[A] red in bowl: 'Red family — [A] dinos!'",
    "[B] green in bowl: 'Green family — [B] dinos!'",
    "Combine: 'They all met! How many at the party?'",
    "'[total] dinos at the party! Hooray!'"]},

ppw_mat:{ name:'Part-Part-Whole Mat', teaches:['Part-Part-Whole','Number Composition'], category:'composition', weight:3,
  materials:'🦕 5–6 dinos + paper (draw the mat below)',
  levels:{1:'Whole of 4',2:'Whole of 5 — try all splits',3:'Whole of 6'},
  layout:
`  Draw on paper (30 sec):
  ┌──────────────────┐
  │   WHOLE:  [ 5 ]  │ ← all dinos start here
  └────────┬─────────┘
     ┌─────┴──────┐
  ┌──┴────┐  ┌────┴──┐
  │ PART1 │  │ PART2 │
  │  [3]  │  │  [2]  │
  └───────┘  └───────┘`,
  script:[
    "Draw the diagram: 1 big box top, 2 smaller below.",
    "Put the dinos in the WHOLE box (today's level).",
    "Slide some to Part 1: 'These go here.'",
    "Remaining go to Part 2: 'And these here.'",
    "Say: '[A] AND [B] together make the whole!'",
    "Try all splits: 4+1, 3+2, 1+4, 2+3 — same whole!"],
  camo_script:[
    "Say: 'The dino island has two secret camps!'",
    "Top box: 'All the dinos live on the island.'",
    "Split: 'Some sleep in the forest, some at the beach!'",
    "Count: '[A] forest, [B] beach — still all of them!'"]},

two_bowl_split:{ name:'Two-Bowl Split', teaches:['Part-Part-Whole','Number Composition'], category:'composition', weight:3,
  materials:'🦕 5–6 dinos + 2 bowls + tweezers',
  levels:{1:'4–5 dinos',2:'6 dinos',3:'She predicts the TOTAL before counting'},
  layout:
`  🥣 Bowl 1 (left)    🥣 Bowl 2 (right)
  ←─── she splits freely ───→
  Tweezers to pick each dino.
  She decides — no direction!`,
  script:[
    "Place 2 bowls. Put the dinos between them (today's level).",
    "Hand her the tweezers: 'Move dinos into the bowls!'",
    "Don't direct — let her choose amounts freely.",
    "Count each bowl when done.",
    "Say: '[A] in bowl 1, [B] in bowl 2!'",
    "Say: '[A] AND [B] together make [total]!'"],
  camo_script:[
    "Say: 'The dinos need two camps for the night!'",
    "Tweezers: 'Move each dino to a camp!'",
    "Count: '[A] in camp 1, [B] in camp 2!'",
    "'All dinos are safe! [total] in total!'"]},

// ════════ NUMBER STORIES (Kate Snow ch. 7) ════════
addition_stories:{ name:'Addition Stories', teaches:['Addition Stories','Counting On'], category:'stories', weight:3, chapter:[7],
  materials:'🔵🟨 Snap cubes (2 colors)',
  levels:{1:'Totals up to 4',2:'Totals of 5–6',3:'She answers WITHOUT recounting from 1'},
  layout:
`  Tell it with cubes:
  "I had 3 cubes..."    🟦🟦🟦
  "then I got 2 MORE!"  🟨🟨
  (leave a small gap between groups)
  "How many do I have now?"`,
  script:[
    "Tell a tiny story: 'I had [A] cubes...' — place them.",
    "'...then I got [B] MORE!' — place the second group apart.",
    "Ask: 'How many cubes do I have NOW?'",
    "Let her count — or recognize without counting!",
    "Repeat with new numbers (today's level).",
    "Swap roles: SHE tells a story, you solve it!"],
  camo_script:[
    "Say: 'The dino found [A] berries...' — place cubes.",
    "'...then found [B] MORE berries! Yum!'",
    "'How many berries does the dino have now?'",
    "'Now YOU tell me a berry story!'"]},

penny_subtraction:{ name:'Take-Away Stories', teaches:['Subtraction Stories'], category:'stories', weight:3, chapter:[7],
  materials:'🔵 Snap cubes (one color)',
  levels:{1:'From 3–4, take away 1',2:'From 5, take away 1–2',3:'From 6 — and she retells the story back'},
  layout:
`  "I had 5 cubes..."  🟦🟦🟦🟦🟦
  "then I LOST 2!"    🟦🟦🟦 ✋(take 2)
  "How many are left?"
  Act it out — SHE takes them away!`,
  script:[
    "Tell it: 'I had [A] cubes...' — place them in a row.",
    "'...then I LOST [B]!' — SHE takes them away.",
    "Ask: 'How many do I have left?'",
    "Wait — let her count or just see it.",
    "Repeat with new numbers (today's level).",
    "Level 3: 'Tell me the story back — what happened?'"],
  camo_script:[
    "Say: 'The dino had [A] cookies...'",
    "'...but a sneaky bird took [B]!' — she grabs them.",
    "'How many cookies are left for the dino?'",
    "'Poor dino! Let's tell another cookie story!'"]},

// ════════ COUNTING ON / TEN-FRAME ════════
two_dice_counton:{ name:'Two-Dice Count-On', teaches:['Counting On','Subitizing'], category:'counting_on', weight:2,
  materials:'🎲🎲 2 dice + snap cubes',
  levels:{1:'Re-roll until one die shows 1–2',2:'Any roll — always start from the bigger',3:'She finds the bigger die herself, no help'},
  layout:
`  Roll both dice:
  ┌─────┐    ┌─────┐
  │ • • │    │ •   │
  │ •   │  + │     │  → 3+1=4
  │ • • │    │ •   │
  └─────┘    └─────┘
  Start at bigger number, count on!`,
  script:[
    "Roll both dice. Identify the BIGGER number.",
    "Say: 'This one has [X]. Hold that in your head!'",
    "Point to smaller die: 'Count on from [X]!'",
    "Touch each dot on smaller die while counting.",
    "'[X]... [X+1]... [X+2]...' — land on total.",
    "Build a cube tower for the total to see it!"],
  camo_script:[
    "Say: 'Two engines — the big one is already running!'",
    "'Engine 1 is at [X]. Count the extra power!'",
    "Touch dots on small die: '[X+1]... [X+2]...'",
    "'[total] power — blast off!'"]},

finger_peek:{ name:'Peek-a-Boo Fingers (6–10)', teaches:['Finger Subitizing','Counting On'], category:'counting_on', weight:2, chapter:[4],
  materials:'🖐️ Hands only — no materials needed',
  levels:{1:'5+1 and 5+2 only',2:'5+3 and 5+4 too',3:'\"How many UP? How many DOWN?\"'},
  layout:
`  Anchor always on 5 (full hand):
  5 + 1 = 6  → 🖐️ + 1 finger
  5 + 2 = 7  → 🖐️ + 2 fingers
  5 + 3 = 8  → 🖐️ + 3 fingers
  5 + 4 = 9  → 🖐️ + 4 fingers
  No counting finger by finger!`,
  script:[
    "Hold up 5 fingers (full hand). Say: 'Five!'",
    "Add 1 on the other hand: 'And ONE more!'",
    "'Five and one more — SIX!'",
    "Wiggle the extra finger.",
    "Work through today's level the same way.",
    "Level 3: 'How many fingers UP? How many DOWN?'"],
  camo_script:[
    "Say: 'My whole hand is a full crew — five!'",
    "Add 1 finger: 'One new friend joined the crew!'",
    "'Five crew plus one new friend — SIX!'",
    "She copies hands."]},

ten_frame_hidden:{ name:'Hidden Counters (Ten-Frame)', teaches:['Counting On','Ten-Frame'], category:'counting_on', weight:3, chapter:[4],
  materials:'📄 Paper ten-frame + 🦕 dinos or cubes',
  levels:{1:'Fill top row of 5 + extras — count all',2:'COVER the 5: \"five and 2 more — how many?\"',3:'\"How many EMPTY boxes to fill 10?\"'},
  layout:
`  Ten-frame — top row always 5:
  ┌─┬─┬─┬─┬─┐
  │●│●│●│●│●│ ← cover this row!
  ├─┼─┼─┼─┼─┤
  │●│●│ │ │ │ ← 2 showing
  └─┴─┴─┴─┴─┘
  "FIVE hiding and 2 more — how many?"`,
  script:[
    "Draw a ten-frame: 2 rows of 5 boxes.",
    "Fill the TOP row completely: 'A full five!'",
    "Add some to the bottom row (today's level).",
    "Cover the top row with your hand or paper.",
    "'FIVE are hiding... and [B] more. How many total?'",
    "Encourage counting ON from five: '5... 6, 7!'"],
  camo_script:[
    "Say: 'Five dinos went to sleep under the blanket!'",
    "'[B] dinos are still awake on the bottom!'",
    "'How many dinos in the whole bedroom?'",
    "'Count from the sleeping five: 5... 6, 7!'"]},

race_to_ten:{ name:'Race to Ten', teaches:['Ten-Frame','Counting On'], category:'counting_on', weight:3, chapter:[4],
  materials:'📄 Paper ten-frame each + 🎲 1 die + cubes',
  levels:{1:'Race to FIVE (five-frame)',2:'Race to TEN',3:'Each turn ask: \"how many MORE do you need?\"'},
  layout:
`  Draw a ten-frame each:
  ┌─┬─┬─┬─┬─┐
  │●│●│●│ │ │
  ├─┼─┼─┼─┼─┤
  │ │ │ │ │ │
  └─┴─┴─┴─┴─┘
  Roll die → add that many cubes.
  First to FILL the frame wins!`,
  script:[
    "Draw one frame each (today's level: 5 or 10 boxes).",
    "Take turns: roll the die, add that many cubes.",
    "One cube per box — fill left to right.",
    "Say your progress: 'I have 6 — almost there!'",
    "Level 3: 'How many MORE do you need to win?'",
    "First full frame wins — rematch immediately!"],
  camo_script:[
    "Say: 'The dino hotels are filling up for the night!'",
    "'Roll to see how many guests arrive!'",
    "'My hotel has 6 guests — 4 rooms left!'",
    "'Full hotel! Everybody sleeps! You win!'"]},

// ════════ COMPARISON (Kate Snow ch. 6) ════════
dice_war:{ name:'Dice War: More · Fewer · Equal', teaches:['More vs. Fewer','Equal','Subitizing'], category:'comparison', weight:2, chapter:[6],
  materials:'🎲🎲 2 dice',
  levels:{1:'Ask only \"who has MORE?\"',2:'Mix in FEWER and EQUAL rounds',3:'\"How many more do you have than me?\"'},
  layout:
`  Each person rolls ONE die (you vs. child):
        ┌─────┐        ┌─────┐
        │ • • │        │ •   │
        │ •   │        │     │
        │ • • │        │ •   │
        └─────┘        └─────┘
           5               2
  MORE? FEWER? or EQUAL?!`,
  script:[
    "Each person rolls one die.",
    "Both look at dice side by side.",
    "Say: 'I have [X]. You have [Y].'",
    "Ask (today's level): 'Who has MORE? FEWER?'",
    "Same roll?! 'EQUAL! We have the SAME!' — celebrate it.",
    "Winner takes both dice. Play 5 rounds!"],
  camo_script:[
    "Say: 'The dice are power creatures!'",
    "'My creature has [X] power spots, yours [Y]!'",
    "'More spots = stronger! Or... EQUAL power?!'",
    "Roar together for the winner — or a double roar for a tie."]},

// ════════ PATTERNS ════════
pattern_train:{ name:'Pattern Train', teaches:['Patterns ABAB / ABB / AAB'], category:'patterns', weight:1,
  materials:'🔵🟡 Snap cubes (2–3 colors)',
  levels:{1:'ABAB only',2:'ABB and AAB',3:'SHE creates a pattern — you copy it'},
  layout:
`  ABAB: 🔵🟡🔵🟡🔵🟡
  ABB:  🔵🟡🟡🔵🟡🟡
  AAB:  🔵🔵🟡🔵🔵🟡
  Build → she snaps on the NEXT cube!`,
  script:[
    "Start a pattern train (today's level).",
    "'Red, blue, red, blue — what comes next?'",
    "Let her pick and snap the cube on.",
    "After ABAB is easy: move to ABB or AAB.",
    "Level 3: let her START a pattern — you copy it!"],
  camo_script:[
    "Say: 'The train cars have a secret order!'",
    "Build: 'Red car, blue car, red car, blue car...'",
    "'What car comes next in the secret?'",
    "She snaps it on: 'You know the secret!'"]},

pattern_dinos:{ name:'Dino Color Parade', teaches:['Patterns ABAB / ABB'], category:'patterns', weight:1,
  materials:'🦕 Dinos (2 colors, 7 each) + tweezers',
  levels:{1:'ABAB parade',2:'AAB parade',3:'She invents the parade rule'},
  layout:
`  Use 2 dino colors for a parade:
  🟥🟩🟥🟩🟥🟩  ← ABAB parade
  🟥🟥🟩🟥🟥🟩  ← AAB parade
  Tweezers to place each dino!`,
  script:[
    "Pick 2 dino colors (e.g. red and green).",
    "Start a parade (today's level pattern).",
    "'Red, green, red, green — who marches next?'",
    "Hand tweezers: 'Add the next marcher!'",
    "Let her continue — then invent her own rule."],
  camo_script:[
    "Say: 'The dinos are in a parade!'",
    "'Red dino, green dino, red dino...'",
    "'Who marches next in the parade?'",
    "She picks and places with tweezers."]},

// ════════ SHAPES & SORTING ════════
shape_sort:{ name:'Shape Detective', teaches:['Shape Recognition','Sorting by Attribute'], category:'shapes', weight:1,
  materials:'🧱 Lego blocks (small / medium / large)',
  levels:{1:'Sort by SIZE',2:'Sort by SHAPE',3:'Two attributes: \"big squares only!\"'},
  layout:
`  Target shapes in the Lego blocks:
  ■ Square   ▬ Rectangle
  Also sort by SIZE:
  🔹 small   🔷 medium   🔵 large
  Sort by SHAPE or SIZE — not color!`,
  script:[
    "Spread a mix of Lego blocks on the table.",
    "Hold one up: 'What shape is this?'",
    "Name it: 'Rectangle! Two long, two short sides!'",
    "Sort into groups (today's level attribute).",
    "Challenge: 'Find me all the squares!'",
    "Level 3: 'Find the BIG squares only!'"],
  camo_script:[
    "Say: 'The shapes are lost and need their homes!'",
    "Draw 2–3 home zones on paper.",
    "She places each block: 'Square goes to square home!'",
    "'All shapes found their homes!'"]},

lego_build:{ name:'Lego Build & Count', teaches:['Subitizing','One More / One Less'], category:'shapes', weight:1,
  materials:'🧱 Lego blocks (~300 pcs, small/med/large)',
  levels:{1:'Build with exactly 4–5 blocks',2:'Exactly 6–8 blocks',3:'\"Add 2 more rooms — now how many?\"'},
  layout:
`  Build using exactly [5] blocks:
  Count each block as you place it.
  "1, 2, 3, 4, 5 — done!"
  Then: add ONE more → [6]
  Then: remove ONE → [5] again`,
  script:[
    "Say: 'We build something using exactly [X] blocks!'",
    "Count each block aloud as you place it together.",
    "When done: 'How many blocks in our building?'",
    "Add 1: 'One more room! Now how many?'",
    "Remove 1: 'One room fell! Now how many?'"],
  camo_script:[
    "Say: 'We are building a dino house — [X] blocks only!'",
    "Count: '1, 2, 3... — house is done!'",
    "Add 1: 'The dino needs one more room!'",
    "Remove 1: 'One room broke! Now how many?'"]},

// ════════ WORKBOOK ════════
workbook_page:{ name:'Workbook Page', teaches:['Number Recognition','Written Numerals'], category:'workbook', weight:1,
  materials:'📖 Preschool Math Workbook (Modern Kid Press) + cubes/dinos to match pictures',
  levels:{1:'Point and talk only — no writing',2:'Build the page with real cubes/dinos',3:'She explains the page back to you'},
  layout:
`  Kate Snow method — always link to objects:
  • Point and talk first — no writing yet
  • Get cubes or dinos to match pictures
  • Ask "show me with cubes" not "tell me"
  • 1 page max — stop when interest drops`,
  script:[
    "Open workbook to current chapter page.",
    "'Let's look at this page together.'",
    "Point to images: 'What do you see here?'",
    "Get real cubes or dinos to match the pictures.",
    "'Build this with cubes — just like the page!'",
    "Praise effort, not correctness."],
  camo_script:[
    "Say: 'This book has a secret message!'",
    "'Can you find all the [X]s on this page?'",
    "Get cubes to match: 'Build the picture!'",
    "'You solved the book's secret!'"]}
};

// ─────────────────────────────────────────────────────
// CATEGORY LABELS + BUCKETS
// ─────────────────────────────────────────────────────
export const CAT_LABEL = {
  subitizing:'Subitizing', counting:'Counting 6–10', one_more_less:'One More / One Less',
  composition:'Part-Part-Whole', stories:'Number Stories', counting_on:'Counting On · Frames',
  comparison:'Comparison', patterns:'Patterns', shapes:'Shapes & Sorting', workbook:'Workbook'
};
export const COMPOSITION_IDS = ['break_cubes','hidden_dinos','dino_bowl_parts','ppw_mat','two_bowl_split'];

// Approximate minutes per activity (shown on the daily plan card)
export const MINS = {
  dice_flash:3, dino_flash:3, build_match:5, five_frame:5,
  long_row_count:5, number_line:6, thinking_questions:4,
  one_more_tower:4, one_less_sneak:3, roll_one_more:4, changing_numbers:4,
  break_cubes:5, hidden_dinos:4, dino_bowl_parts:5, ppw_mat:6, two_bowl_split:5,
  addition_stories:5, penny_subtraction:4,
  two_dice_counton:4, finger_peek:2, ten_frame_hidden:5, race_to_ten:7,
  dice_war:5, pattern_train:5, pattern_dinos:5, shape_sort:6, lego_build:7, workbook_page:6
};

// ─────────────────────────────────────────────────────
// SKILL TRAIL MILESTONES (ordered path)
// ─────────────────────────────────────────────────────
export const MILESTONES = [
  { id:'count5',  label:'Counting 1–5',                    ids:[], target:0, pre:true,
    detail:'One-to-one, solid' },
  { id:'sub34',   label:'Subitizing to 3–4',               ids:[], target:0, pre:true,
    detail:'Sees small groups instantly' },
  { id:'count10', label:'Counting 6–10 one-to-one',        ids:['long_row_count','number_line','thinking_questions'], target:5,
    detail:'No skips, no double-counts' },
  { id:'sub56',   label:'Subitizing 5–6',                  ids:['dice_flash','dino_flash','build_match','five_frame'], target:6,
    detail:'Dice faces & clusters at a glance' },
  { id:'oml',     label:'One More / One Less',             ids:['one_more_tower','one_less_sneak','roll_one_more','changing_numbers'], target:5,
    detail:'Predicts without recounting' },
  { id:'frames',  label:'Five & Ten Frames · Counting On', ids:['finger_peek','ten_frame_hidden','race_to_ten','two_dice_counton'], target:5,
    detail:'6–9 as \u201c5 and some more\u201d' },
  { id:'ppw',     label:'Part-Part-Whole to 6',            ids:COMPOSITION_IDS, target:5,
    detail:'Numbers hide inside numbers' },
  { id:'compare', label:'More · Fewer · Equal',            ids:['dice_war'], target:4,
    detail:'Including equal — and zero' },
  { id:'stories', label:'Add & Subtract Stories',          ids:['addition_stories','penny_subtraction'], target:4,
    detail:'Acting out change with objects' },
  { id:'patshapes', label:'Patterns · Shapes',             ids:['pattern_train','pattern_dinos','shape_sort','lego_build'], target:4,
    detail:'The 20% variety track' }
];

// ─────────────────────────────────────────────────────
// SESSION WINDOWS → ACTIVITY POOLS
// ─────────────────────────────────────────────────────
export const WINDOWS = {
  morning:{ label:'🌅 Morning', time:'~8–11 AM',
    pool:['dice_flash','dino_flash','build_match','five_frame','long_row_count','thinking_questions',
          'one_more_tower','one_less_sneak','roll_one_more','changing_numbers','finger_peek','pattern_train'] },
  afternoon:{ label:'☀️ Afternoon', time:'~12–5 PM',
    pool:Object.keys(ACTIVITIES) },
  bedtime:{ label:'🌙 Bedtime', time:'~8 PM',
    pool:['dino_flash','one_less_sneak','finger_peek','hidden_dinos','pattern_dinos',
          'thinking_questions','addition_stories','penny_subtraction'] }
};
