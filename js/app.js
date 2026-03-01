// === State ===
const state = {
  allQuestions: [],
  quizQuestions: [],
  answers: [],
  submitted: [],
  currentIndex: 0,
  quizMode: null,
  selectedTopics: [],
  shuffleEnabled: true,
  reviewMode: false
};

// === Topic metadata (populated from questions.json) ===
let topicMeta = {};

// === DOM refs ===
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const homeScreen = $('#home-screen');
const quizScreen = $('#quiz-screen');
const resultsScreen = $('#results-screen');

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();
  setupEventListeners();
});

async function loadQuestions() {
  try {
    const resp = await fetch('js/questions.json');
    const data = await resp.json();
    state.allQuestions = data.questions;
    topicMeta = {};
    data.metadata.topics.forEach(t => {
      topicMeta[t.id] = t.name;
    });
    buildTopicCheckboxes(data.metadata.topics);
  } catch (err) {
    console.error('Failed to load questions:', err);
  }
}

function buildTopicCheckboxes(topics) {
  const container = $('#topic-checkboxes');
  const counts = {};
  state.allQuestions.forEach(q => {
    counts[q.topic] = (counts[q.topic] || 0) + 1;
  });
  container.innerHTML = topics.map(t => `
    <label class="checkbox-option">
      <input type="checkbox" value="${t.id}" class="topic-cb">
      <span class="checkbox-label">${t.name} <span class="topic-count">(${counts[t.id] || 0})</span></span>
    </label>
  `).join('');
}

// === Event Listeners ===
function setupEventListeners() {
  // Quiz mode radios
  $$('input[name="quiz-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const topicSelector = $('#topic-selector');
      if (radio.value === 'byTopic' && radio.checked) {
        topicSelector.classList.remove('hidden');
      } else if (radio.checked) {
        topicSelector.classList.add('hidden');
      }
    });
  });

  $('#start-quiz-btn').addEventListener('click', startQuiz);
  $('#submit-btn').addEventListener('click', submitAnswer);
  $('#next-btn').addEventListener('click', nextQuestion);
  $('#prev-btn').addEventListener('click', prevQuestion);
  $('#review-btn').addEventListener('click', reviewAnswers);
  $('#new-quiz-btn').addEventListener('click', newQuiz);
}

// === Quiz Flow ===
function startQuiz() {
  const mode = document.querySelector('input[name="quiz-mode"]:checked').value;
  state.quizMode = mode;
  state.shuffleEnabled = $('#shuffle-toggle').checked;
  state.reviewMode = false;

  let questions = [];

  if (mode === 'byTopic') {
    const selected = [...$$('.topic-cb:checked')].map(cb => cb.value);
    if (selected.length === 0) {
      alert('Please select at least one topic.');
      return;
    }
    state.selectedTopics = selected;
    questions = state.allQuestions.filter(q => selected.includes(q.topic));
  } else {
    questions = [...state.allQuestions];
  }

  if (state.shuffleEnabled) {
    questions = shuffleArray([...questions]);
  }

  if (mode === 'random20') {
    questions = questions.slice(0, 20);
  } else if (mode === 'random40') {
    questions = questions.slice(0, 40);
  }

  if (questions.length === 0) {
    alert('No questions available for the selected options.');
    return;
  }

  state.quizQuestions = questions;
  state.answers = questions.map(() => ({ selected: [] }));
  state.submitted = questions.map(() => false);
  state.currentIndex = 0;

  showScreen(quizScreen);
  renderQuestion(0);
}

function renderQuestion(index) {
  const q = state.quizQuestions[index];
  const total = state.quizQuestions.length;

  // Progress
  $('#question-counter').textContent = `Question ${index + 1} of ${total}`;
  $('#progress-fill').style.width = `${((index + 1) / total) * 100}%`;
  $('#topic-label').textContent = topicMeta[q.topic] || q.topic;

  // Question text
  $('#question-text').textContent = q.question;

  // Options
  const container = $('#options-container');
  const isSubmitted = state.submitted[index];
  const userSelected = new Set(state.answers[index].selected);
  const correctSet = new Set(q.correctAnswers);

  container.innerHTML = q.options.map(opt => {
    let stateClass = '';
    let statusText = '';
    const wasSelected = userSelected.has(opt.id);
    const isCorrect = correctSet.has(opt.id);

    if (isSubmitted) {
      if (wasSelected && isCorrect) {
        stateClass = 'correct';
        statusText = 'Correct';
      } else if (wasSelected && !isCorrect) {
        stateClass = 'incorrect';
        statusText = 'Wrong';
      } else if (!wasSelected && isCorrect) {
        stateClass = 'missed';
        statusText = 'Missed';
      }
    }

    const lockedClass = isSubmitted || state.reviewMode ? 'locked' : '';
    const selectedClass = wasSelected && !isSubmitted ? 'selected' : '';
    const checked = wasSelected ? 'checked' : '';
    const disabled = isSubmitted || state.reviewMode ? 'disabled' : '';

    return `
      <label class="option-row ${stateClass} ${lockedClass} ${selectedClass}">
        <input type="checkbox" value="${opt.id}" ${checked} ${disabled} class="option-cb">
        <span class="option-label"><span class="option-id">${opt.id})</span> ${opt.text}</span>
        ${statusText ? `<span class="option-status">${statusText}</span>` : ''}
      </label>
    `;
  }).join('');

  // Add click handlers for non-submitted options
  if (!isSubmitted && !state.reviewMode) {
    container.querySelectorAll('.option-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        updateSelection(index);
      });
    });
  }

  // Feedback
  const feedbackSection = $('#feedback-section');
  if (isSubmitted) {
    feedbackSection.classList.remove('hidden');
    const result = gradeAnswer(index);
    const feedbackResult = $('#feedback-result');

    if (result.isCorrect) {
      feedbackResult.textContent = 'Correct!';
      feedbackResult.className = 'feedback-result result-correct';
    } else if (result.hasPartial) {
      feedbackResult.textContent = `Partial — ${result.correctCount}/${result.totalCorrect} correct answers selected`;
      feedbackResult.className = 'feedback-result result-partial';
    } else {
      feedbackResult.textContent = 'Incorrect';
      feedbackResult.className = 'feedback-result result-incorrect';
    }

    $('#explanation-text').textContent = q.explanation;
  } else {
    feedbackSection.classList.add('hidden');
  }

  // Navigation buttons
  $('#prev-btn').disabled = index === 0;

  if (isSubmitted || state.reviewMode) {
    $('#submit-btn').classList.add('hidden');
    $('#next-btn').classList.remove('hidden');
    if (index === total - 1 && !state.reviewMode) {
      $('#next-btn').textContent = 'See Results';
    } else if (index === total - 1 && state.reviewMode) {
      $('#next-btn').textContent = 'Back to Results';
    } else {
      $('#next-btn').textContent = 'Next';
    }
  } else {
    $('#submit-btn').classList.remove('hidden');
    $('#next-btn').classList.add('hidden');
  }
}

function updateSelection(index) {
  const checkboxes = $$('#options-container .option-cb');
  state.answers[index].selected = [...checkboxes]
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // Update visual selected state
  checkboxes.forEach(cb => {
    const row = cb.closest('.option-row');
    if (cb.checked) {
      row.classList.add('selected');
    } else {
      row.classList.remove('selected');
    }
  });
}

function submitAnswer() {
  const index = state.currentIndex;
  if (state.answers[index].selected.length === 0) {
    alert('Please select at least one option.');
    return;
  }
  state.submitted[index] = true;
  renderQuestion(index);
}

function nextQuestion() {
  const total = state.quizQuestions.length;
  if (state.currentIndex < total - 1) {
    state.currentIndex++;
    renderQuestion(state.currentIndex);
    window.scrollTo(0, 0);
  } else {
    if (state.reviewMode) {
      showScreen(resultsScreen);
    } else {
      showResults();
    }
  }
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion(state.currentIndex);
    window.scrollTo(0, 0);
  }
}

// === Grading ===
function gradeAnswer(index) {
  const q = state.quizQuestions[index];
  const selected = new Set(state.answers[index].selected);
  const correct = new Set(q.correctAnswers);

  const isCorrect = selected.size === correct.size &&
    [...selected].every(s => correct.has(s));

  const correctCount = [...selected].filter(s => correct.has(s)).length;
  const hasPartial = correctCount > 0 && !isCorrect;

  return { isCorrect, hasPartial, correctCount, totalCorrect: correct.size };
}

// === Results ===
function showResults() {
  let totalCorrect = 0;
  const total = state.quizQuestions.length;

  // Per-topic scores
  const topicScores = {};
  state.quizQuestions.forEach((q, i) => {
    if (!topicScores[q.topic]) {
      topicScores[q.topic] = { correct: 0, total: 0 };
    }
    topicScores[q.topic].total++;
    const result = gradeAnswer(i);
    if (result.isCorrect) {
      totalCorrect++;
      topicScores[q.topic].correct++;
    }
  });

  const pct = Math.round((totalCorrect / total) * 100);

  // Overall score
  $('#overall-score').innerHTML = `
    <div class="score-number">${pct}%</div>
    <div class="score-detail">${totalCorrect} out of ${total} correct</div>
  `;

  // Topic breakdown
  const topicList = $('#topic-scores');
  topicList.innerHTML = Object.entries(topicScores)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([topicId, score]) => {
      const topicPct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
      return `
        <div class="topic-score-row">
          <span class="topic-score-name">${topicMeta[topicId] || topicId}</span>
          <div class="topic-score-right">
            <span class="topic-score-value">${score.correct}/${score.total} (${topicPct}%)</span>
            <div class="topic-score-bar">
              <div class="topic-score-bar-fill" style="width: ${topicPct}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

  showScreen(resultsScreen);
}

function reviewAnswers() {
  state.reviewMode = true;
  state.currentIndex = 0;
  showScreen(quizScreen);
  renderQuestion(0);
}

function newQuiz() {
  state.reviewMode = false;
  showScreen(homeScreen);
}

// === Utilities ===
function showScreen(screen) {
  [homeScreen, quizScreen, resultsScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
  window.scrollTo(0, 0);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
