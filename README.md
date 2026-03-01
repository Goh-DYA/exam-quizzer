# exam-quizzer

Multi-select quizzes for ML4T (Machine Learning for Trading) exam preparation.

## Features

- **141 questions** across 12 topics covering the full ML4T syllabus
- **Two question types** — Multi-select (117) and Scenario-based True/False (24)
- **Quiz modes** — All Topics, Random 20, Random 40, or filter By Topic
- **Question type filter** — All Types, Multi-Select only, or Scenarios only
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

| Topic | Multi-Select | Scenarios | Total |
|-------|--------------|-----------|-------|
| Stock Data & Pandas | 8 | 2 | 10 |
| Portfolio Statistics & Sharpe Ratio | 9 | 2 | 11 |
| Market Mechanics & Order Types | 10 | 2 | 12 |
| Hedge Funds & Fund Types | 10 | 2 | 12 |
| Company Valuation & CAPM | 12 | 2 | 14 |
| Technical Analysis | 10 | 2 | 12 |
| Regression (Linear, KNN) | 10 | 2 | 12 |
| Decision Trees | 12 | 2 | 14 |
| Ensemble Methods | 10 | 2 | 12 |
| Overfitting & Bias-Variance | 8 | 2 | 10 |
| ML in Finance | 8 | 2 | 10 |
| Projects (Martingale, Learners) | 10 | 2 | 12 |

## Tech Stack

Vanilla HTML + CSS + JavaScript — zero dependencies, no build step.
