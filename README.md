# exam-quizzer

Multi-select quizzes for ML4T (Machine Learning for Trading) exam preparation.

## Features

- **117 questions** across 12 topics covering the full ML4T syllabus
- **Multi-select format** — each question has 5 options with 1–4 correct answers
- **Quiz modes** — All Topics, Random 20, Random 40, or filter By Topic
- **Instant feedback** — per-option color coding (correct / incorrect / missed) with explanations
- **Results dashboard** — overall score + per-topic breakdown with review mode
- **Mobile-friendly** — responsive design with touch-sized targets

## Getting Started

Serve the project with any static file server:

```bash
# Python (built-in)
python -m http.server 8080

# Alternatively, use Node.js (npx)
npx serve .

# Alternatively, with VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

> **Note:** Opening `index.html` directly via `file://` won't work because the app uses `fetch()` to load the question bank.

## Topics Covered

| Topic | Questions |
|-------|-----------|
| Stock Data & Pandas | 8 |
| Portfolio Statistics & Sharpe Ratio | 9 |
| Market Mechanics & Order Types | 10 |
| Hedge Funds & Fund Types | 10 |
| Company Valuation & CAPM | 12 |
| Technical Analysis | 10 |
| Regression (Linear, KNN) | 10 |
| Decision Trees | 12 |
| Ensemble Methods | 10 |
| Overfitting & Bias-Variance | 8 |
| ML in Finance | 8 |
| Projects (Martingale, Learners) | 10 |

## Tech Stack

Vanilla HTML + CSS + JavaScript — zero dependencies, no build step.
