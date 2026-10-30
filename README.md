# Bible Quiz

A family Bible quiz with easy, medium and hard levels for the Old and New Testament.
After each answer it shows the verse (NKJV) and a short explanation.

## How it's built

Plain HTML, CSS and JavaScript with no build step, so it runs straight from GitHub Pages.
It is a Progressive Web App: on a phone, open the site and choose "Add to Home Screen"
to install it like an app, and it keeps working offline. Later it can be wrapped into a
store app with a tool like Capacitor without rewriting it.

| File | Purpose |
| --- | --- |
| `index.html` | The screens: home, quiz, results |
| `app.js` | Quiz logic |
| `styles.css` | Look and feel, with light and dark mode |
| `data/questions.json` | The question bank |
| `manifest.webmanifest`, `service-worker.js`, `icons/` | Phone install and offline support |

## Question format

Each entry in `data/questions.json` looks like this:

```json
{
  "id": "ot-easy-001",
  "testament": "OT",
  "level": "easy",
  "question": "What did God create in the beginning?",
  "choices": ["The heavens and the earth", "The Garden of Eden", "Adam and Eve", "The sun and the moon"],
  "answer": 0,
  "reference": "Genesis 1:1",
  "verse": "In the beginning God created the heavens and the earth.",
  "explanation": "The very first verse of the Bible tells us that God is the Creator of everything that exists."
}
```

`testament` is `OT` or `NT`, `level` is `easy`, `medium` or `hard`, and `answer` is the
index of the correct choice (the app shuffles choices when it shows them).

## Run it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish with GitHub Pages

In the repository's Settings, open Pages, set the source to "Deploy from a branch",
and pick `main` with the `/ (root)` folder. The site appears at
https://gcstenger.github.io/biblequiz/.

## Scripture

Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson.
Used by permission. All rights reserved.
