const state = {
  moduleIndex: 0,
  lessonIndex: 0,
  progress: JSON.parse(localStorage.getItem("voddy-course-progress") || "{}"),
  projectPath: localStorage.getItem("voddy-project-path") || "Path\\To\\VOD Review Bot"
};

const els = {
  moduleNav: document.getElementById("moduleNav"),
  lessonNav: document.getElementById("lessonNav"),
  overview: document.getElementById("overview"),
  lessonView: document.getElementById("lessonView"),
  lessonContent: document.getElementById("lessonContent"),
  progressPercent: document.getElementById("progressPercent"),
  progressFill: document.getElementById("progressFill"),
  markLessonDone: document.getElementById("markLessonDone"),
  resetProgress: document.getElementById("resetProgress"),
  openOverview: document.getElementById("openOverview"),
  openSettings: document.getElementById("openSettings"),
  settingsView: document.getElementById("settingsView"),
  pathForm: document.getElementById("pathForm"),
  projectPath: document.getElementById("projectPath"),
  resetPath: document.getElementById("resetPath"),
  currentProjectPath: document.getElementById("currentProjectPath"),
  quizDialog: document.getElementById("quizDialog"),
  quizTitle: document.getElementById("quizTitle"),
  quizBody: document.getElementById("quizBody"),
  gradeQuiz: document.getElementById("gradeQuiz")
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lessonKey(moduleIndex, lessonIndex) {
  return `${window.COURSE.modules[moduleIndex].id}:${lessonIndex}`;
}

function saveProgress() {
  localStorage.setItem("voddy-course-progress", JSON.stringify(state.progress));
  renderProgress();
}

function renderProgress() {
  const total = window.COURSE.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const done = Object.values(state.progress).filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  els.progressPercent.textContent = `${percent}%`;
  els.progressFill.style.width = `${percent}%`;
}

function renderModules() {
  els.moduleNav.innerHTML = window.COURSE.modules.map((mod, index) => {
    const done = mod.lessons.filter((_, lessonIndex) => state.progress[lessonKey(index, lessonIndex)]).length;
    return `
      <button class="module-button ${index === state.moduleIndex && !els.lessonView.hidden ? "active" : ""}" type="button" data-module="${index}">
        <strong>${index + 1}. ${escapeHtml(mod.title)}</strong>
        <span>${done}/${mod.lessons.length} lessons done - ${escapeHtml(mod.goal)}</span>
      </button>
    `;
  }).join("");
}

function renderLessons() {
  const mod = window.COURSE.modules[state.moduleIndex];
  els.lessonNav.innerHTML = mod.lessons.map((lesson, index) => {
    const done = state.progress[lessonKey(state.moduleIndex, index)];
    return `
      <button class="lesson-button ${index === state.lessonIndex ? "active" : ""}" type="button" data-lesson="${index}">
        ${done ? "✓ " : ""}${index + 1}. ${escapeHtml(lesson.title)}
      </button>
    `;
  }).join("");
}

function list(items, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

function fileLinks(files) {
  return `
    <div class="file-list">
      ${files.map((file) => {
        const displayPath = resolveCoursePath(file);
        return `<span>${escapeHtml(displayPath)}</span>`;
      }).join("")}
    </div>
  `;
}

function resolveCoursePath(file) {
  return file.replaceAll("{PROJECT_ROOT}", state.projectPath);
}

function renderLesson() {
  const mod = window.COURSE.modules[state.moduleIndex];
  const lesson = mod.lessons[state.lessonIndex];
  const key = lessonKey(state.moduleIndex, state.lessonIndex);
  els.overview.hidden = true;
  els.settingsView.hidden = true;
  els.lessonView.hidden = false;
  renderModules();
  renderLessons();
  els.markLessonDone.textContent = state.progress[key] ? "Lesson Done" : "Mark Lesson Done";
  els.markLessonDone.disabled = Boolean(state.progress[key]);
  els.lessonContent.innerHTML = `
    <div class="lesson-header">
      <div class="eyebrow">Module ${state.moduleIndex + 1}: ${escapeHtml(mod.title)}</div>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.summary)}</p>
    </div>

    <section class="section">
      <h4>Plain-English Explanation</h4>
      ${list(lesson.concepts)}
    </section>

    <section class="section callout">
      <h4>C#/Unity Comparison</h4>
      <p>${escapeHtml(lesson.unity)}</p>
    </section>

    <section class="section">
      <h4>Code Walkthrough</h4>
      ${list(lesson.walkthrough, true)}
    </section>

    <section class="section">
      <h4>Project Files</h4>
      ${fileLinks(lesson.files)}
    </section>

    <section class="section">
      <h4>Mini Exercise</h4>
      <p>${escapeHtml(lesson.exercise)}</p>
    </section>

    <section class="section">
      <h4>Review Questions</h4>
      ${list(lesson.review, true)}
    </section>

    <section class="section">
      <h4>Practical Test</h4>
      <p>${escapeHtml(mod.test)}</p>
    </section>

    <div class="lesson-actions">
      <button class="secondary-button" type="button" id="prevLesson">Previous</button>
      <button class="secondary-button" type="button" id="nextLesson">Next</button>
      <button class="primary-button" type="button" id="openQuiz">Open Module Quiz</button>
    </div>
  `;

  document.getElementById("prevLesson").addEventListener("click", previousLesson);
  document.getElementById("nextLesson").addEventListener("click", nextLesson);
  document.getElementById("openQuiz").addEventListener("click", () => openQuiz(state.moduleIndex));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showOverview() {
  els.overview.hidden = false;
  els.settingsView.hidden = true;
  els.lessonView.hidden = true;
  renderModules();
  els.markLessonDone.textContent = "Mark Lesson Done";
  els.markLessonDone.disabled = true;
}

function showSettings() {
  els.overview.hidden = true;
  els.lessonView.hidden = true;
  els.settingsView.hidden = false;
  els.markLessonDone.textContent = "Mark Lesson Done";
  els.markLessonDone.disabled = true;
  els.projectPath.value = state.projectPath;
  els.currentProjectPath.textContent = state.projectPath;
  renderModules();
}

function selectModule(moduleIndex) {
  state.moduleIndex = moduleIndex;
  state.lessonIndex = 0;
  renderLesson();
}

function selectLesson(lessonIndex) {
  state.lessonIndex = lessonIndex;
  renderLesson();
}

function previousLesson() {
  if (state.lessonIndex > 0) {
    state.lessonIndex -= 1;
  } else if (state.moduleIndex > 0) {
    state.moduleIndex -= 1;
    state.lessonIndex = window.COURSE.modules[state.moduleIndex].lessons.length - 1;
  }
  renderLesson();
}

function nextLesson() {
  const mod = window.COURSE.modules[state.moduleIndex];
  if (state.lessonIndex < mod.lessons.length - 1) {
    state.lessonIndex += 1;
  } else if (state.moduleIndex < window.COURSE.modules.length - 1) {
    state.moduleIndex += 1;
    state.lessonIndex = 0;
  }
  renderLesson();
}

function markCurrentLessonDone() {
  if (els.lessonView.hidden) return;
  state.progress[lessonKey(state.moduleIndex, state.lessonIndex)] = true;
  saveProgress();
  renderModules();
  renderLessons();
  els.markLessonDone.textContent = "Lesson Done";
  els.markLessonDone.disabled = true;
}

function openQuiz(moduleIndex) {
  const mod = window.COURSE.modules[moduleIndex];
  els.quizTitle.textContent = `Module ${moduleIndex + 1} Quiz: ${mod.title}`;
  els.quizBody.innerHTML = mod.quiz.map((question, qIndex) => `
    <div class="quiz-question" data-question="${qIndex}">
      <h4>${qIndex + 1}. ${escapeHtml(question.q)}</h4>
      ${question.options.map((option, oIndex) => `
        <label class="quiz-option">
          <input type="radio" name="q${qIndex}" value="${oIndex}" />
          ${escapeHtml(option)}
        </label>
      `).join("")}
    </div>
  `).join("");
  els.quizDialog.showModal();
}

function gradeQuiz() {
  const mod = window.COURSE.modules[state.moduleIndex];
  let score = 0;
  for (let i = 0; i < mod.quiz.length; i += 1) {
    const selected = els.quizBody.querySelector(`input[name="q${i}"]:checked`);
    if (selected && Number(selected.value) === mod.quiz[i].answer) score += 1;
  }
  const existing = els.quizBody.querySelector(".quiz-result");
  if (existing) existing.remove();
  const result = document.createElement("div");
  result.className = "quiz-result";
  result.textContent = `Score: ${score}/${mod.quiz.length}. ${score === mod.quiz.length ? "Clean clear. Move on." : "Review the missed idea, then try again."}`;
  els.quizBody.append(result);
}

els.moduleNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-module]");
  if (!button) return;
  selectModule(Number(button.dataset.module));
});

els.lessonNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lesson]");
  if (!button) return;
  selectLesson(Number(button.dataset.lesson));
});

els.markLessonDone.addEventListener("click", markCurrentLessonDone);
els.openOverview.addEventListener("click", showOverview);
els.openSettings.addEventListener("click", showSettings);
els.gradeQuiz.addEventListener("click", gradeQuiz);
els.pathForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = els.projectPath.value.trim() || "Path\\To\\VOD Review Bot";
  state.projectPath = value;
  localStorage.setItem("voddy-project-path", value);
  showSettings();
});
els.resetPath.addEventListener("click", () => {
  state.projectPath = "Path\\To\\VOD Review Bot";
  localStorage.removeItem("voddy-project-path");
  showSettings();
});
els.resetProgress.addEventListener("click", () => {
  if (!confirm("Reset all course progress?")) return;
  state.progress = {};
  saveProgress();
  renderModules();
  renderLessons();
  if (!els.lessonView.hidden) renderLesson();
});

renderProgress();
renderModules();
showOverview();
