# Family and Friends 4 — Practice Hub

A single-page hub linking to self-contained practice exercises for every unit
of Family and Friends 4. Each exercise auto-grades in the browser and sends
the student's score + answer log to the teacher via [Formspree](https://formspree.io).

Built the same way as the Family and Friends 3 hub: same shared engine, same
question schema, same marks table, same image-extraction workflow — just
applied to a new book.

## Structure

```
index.html                     ← the hub (Unit 1–15 cards)
assets/
  quiz.css                     ← shared styling for exercise pages
  quiz-engine.js                ← shared grading/name-screen/Formspree logic
units/
  unit1-lessons1-2.html         ← Unit 1, Lessons 1 & 2 (20 marks)
  unit1-lessons3-4.html         ← Unit 1, Lessons 3 & 4 (20 marks)
  unit1-lessons1-6.html         ← Unit 1, Skills Time full review (30 marks)
  ... (same pattern through Unit 15)
  block-review-1-3.html         ← combined review, Units 1–3 (30 marks)
  block-review-4-6.html         ← combined review, Units 4–6 (30 marks)
  block-review-7-9.html         ← combined review, Units 7–9 (30 marks)
  block-review-10-12.html       ← combined review, Units 10–12 (30 marks)
  block-review-13-15.html       ← combined review, Units 13–15 (30 marks)
  images/                       ← cropped workbook images embedded in exercises
```

## What's done vs. pending

- ⏳ Units 1–15: waiting on vocabulary/grammar/reading topics (page screenshots) to build each exercise.
- ⏳ Block reviews for Units 1–3, 4–6, 7–9, 10–12, 13–15: unlock automatically once their three units are built (or once the official Review page is provided).

The hub shows "Coming soon" cards for anything not built yet, so nothing
looks broken in the meantime. As each unit's screenshots arrive, its card
fills in with real content and links.

## Hosting on GitHub Pages

1. Create a new repository on GitHub (public, so Pages can serve it for free) — or add this as a subfolder of the same repo as the Family and Friends 3 hub.
2. Push this folder's contents to the repository's default branch:
   ```
   git init
   git add .
   git commit -m "Family and Friends 4 practice hub"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**, set **Source** to the `main`
   branch (root folder), and save.
4. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

No build step is required — everything is static HTML/CSS/JS.

## Formspree

All F4 exercises post to their own Formspree endpoint, separate from F3:
`https://formspree.io/f/mjybbpky`.
