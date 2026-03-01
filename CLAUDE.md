# CLAUDE.md — Project Guide for exam-quizzer

## Project Overview
A zero-dependency, mobile-friendly multi-select quiz web app for ML4T (Machine Learning for Trading) exam preparation. Vanilla HTML + CSS + JavaScript — no framework, no build step.

## File Structure
```
index.html              # Single-page app (3 screens: home, quiz, results)
css/style.css           # Mobile-first responsive styles
js/app.js               # Quiz engine, UI rendering, scoring
js/questions.json       # 141-question bank (117 multi-select + 24 scenarios)
resources/              # Source materials (gitignored, not deployed)
```

## Running Locally
```bash
python -m http.server 8080
# Open http://localhost:8080
```
Any static file server works (VS Code Live Server, `npx serve`, etc.). The app uses `fetch()` to load questions.json, so opening index.html directly via `file://` will fail due to CORS.

## Question Bank Rules
- Every question has exactly **5 options** (a–e)
- Each question has **1–4 correct answers** (never 0, never 5)
- Schema per question in questions.json:
  ```json
  { "id": 1, "topic": "...", "difficulty": "medium|hard",
    "question": "...", "options": [{"id": "a", "text": "..."}],
    "correctAnswers": ["a", "c"], "explanation": "..." }
  ```
- Valid topics: stock-data, portfolio-stats, market-mechanics, hedge-funds, valuation, technical-analysis, regression, decision-trees, ensemble-methods, overfitting, ml-finance, projects

## Scoring
- **Strict grading**: the user must select exactly the correct set of answers for 1 point
- Per-option feedback is always shown (green = correct, red = incorrect, amber = missed)

## Coding Conventions
- No external dependencies — everything is vanilla JS/CSS/HTML
- Mobile-first CSS with media queries at 768px and 1024px
- CSS custom properties for theming (defined in `:root` of style.css)
- State managed via a plain `state` object in app.js
- All DOM rendering done through template literals and innerHTML
