/* =========================================================
   Family and Friends — shared quiz engine (used by F3 and F4 practice hubs)
   Every exercise page defines a `QUIZ_CONFIG` object, then
   loads this file. Keeps the grading/name-screen/Formspree
   logic in one place instead of copy-pasted per file.
   ========================================================= */

(function () {
  const config = window.QUIZ_CONFIG;
  if (!config) {
    console.error("QUIZ_CONFIG is missing — define it before loading quiz-engine.js");
    return;
  }

  const FORMSPREE_URL = config.formspreeUrl;
  const LESSON_SET = config.lessonSet;
  const sections = config.sections;
  const TOTAL_MARKS = config.totalMarks || sections.reduce((sum, s) => sum + s.points, 0);

  /* ---------- OPTIONAL YOUTUBE THUMBNAIL → CLICK TO PLAY ---------- */
  window.loadYouTubeVideo = function (wrapId, videoId) {
    const id = wrapId || "yt-video-wrap";
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.removeAttribute("onclick");
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="Story video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  };

  /* ---------- BUILD FLAT QUESTION LIST ---------- */
  let flatQuestions = [];
  sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      flatQuestions.push({ ...q, sectionTitle: sec.title, id: `q_${sIdx}_${qIdx}` });
    });
  });

  const form = document.getElementById("quiz-form");

  /* ---------- RENDER QUIZ ---------- */
  function renderQuiz() {
    let html = "";
    sections.forEach((sec, sIdx) => {
      html += `<div class="section-title"><span>${sec.title}</span><span class="pts">${sec.points} marks</span></div>`;
      if (sec.intro) html += sec.intro;
      sec.questions.forEach((q, qIdx) => {
        const id = `q_${sIdx}_${qIdx}`;
        const num = flatQuestions.findIndex((x) => x.id === id) + 1;
        html += `<div class="question" id="wrap_${id}">`;
        html += `<div class="prompt"><span class="qnum">${num}.</span>${q.prompt}</div>`;
        if (q.emoji) html += `<span class="emoji-clue">${q.emoji}</span>`;
        if (q.type === "mcq") {
          html += `<div class="options">`;
          q.options.forEach((opt) => {
            html += `<label><input type="radio" name="${id}" value="${opt.replace(/"/g, "&quot;")}"> ${opt}</label>`;
          });
          html += `</div>`;
        } else if (q.type === "text") {
          html += `<input type="text" name="${id}" autocomplete="off">`;
        }
        html += `</div>`;
      });
    });
    form.innerHTML = html + `<div id="submit-row"><button type="submit" class="btn">Submit my answers ✔</button></div>`;
  }

  /* ---------- NAME SCREEN ---------- */
  let studentName = "";
  document.getElementById("start-btn").addEventListener("click", () => {
    const nameInput = document.getElementById("student-name");
    const val = nameInput.value.trim();
    if (!val) {
      document.getElementById("name-error").style.display = "block";
      return;
    }
    studentName = val;
    document.getElementById("name-screen").classList.add("hidden");
    renderQuiz();
    form.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- GRADING ---------- */
  function normalize(str) {
    return (str || "").toString().trim().toLowerCase().replace(/[.!?]+$/, "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let score = 0;
    const review = [];

    flatQuestions.forEach((q, idx) => {
      const fd = new FormData(form);
      let studentAnswer = "";
      let isCorrect = false;

      if (q.type === "mcq") {
        studentAnswer = fd.get(q.id) || "";
        isCorrect = studentAnswer === q.answer;
      } else if (q.type === "text") {
        studentAnswer = fd.get(q.id) || "";
        isCorrect = q.accept.includes(normalize(studentAnswer));
      }

      if (isCorrect) score += 1;

      review.push({
        num: idx + 1,
        section: q.sectionTitle,
        prompt: q.prompt.replace(/____/g, "___"),
        studentAnswer: studentAnswer || "(no answer)",
        correctAnswer: q.type === "mcq" ? q.answer : q.accept[0],
        isCorrect,
      });
    });

    showResults(score, review);
    sendToFormspree(score, review);
  });

  /* ---------- SHOW RESULTS ---------- */
  function showResults(score, review) {
    form.classList.add("hidden");
    const results = document.getElementById("results");
    results.classList.remove("hidden");

    const pct = Math.round((score / TOTAL_MARKS) * 100);
    let msg = "Keep practising — you'll get there!";
    if (pct >= 90) msg = "Excellent work! 🌟";
    else if (pct >= 70) msg = "Great job! 👏";
    else if (pct >= 50) msg = "Good effort — review the ones you missed.";

    let html = `<div class="score-banner">
        <div>${studentName}, here is your result:</div>
        <div class="big">${score} / ${TOTAL_MARKS}</div>
        <div class="msg">${pct}% — ${msg}</div>
      </div>`;

    html += `<div class="card"><h2 style="color:var(--teal-dark);margin-top:0;">Answer review</h2>`;
    review.forEach((r) => {
      html += `<div class="review-item ${r.isCorrect ? "correct" : "incorrect"}">
        <span class="tag">${r.isCorrect ? "✔ Correct" : "✘ Incorrect"} — Question ${r.num}</span>
        <div>${r.prompt}</div>
        <div class="yours">Your answer: <strong>${escapeHtml(r.studentAnswer)}</strong></div>
        ${r.isCorrect ? "" : `<div class="correct-ans">Correct answer: <strong>${escapeHtml(r.correctAnswer)}</strong></div>`}
      </div>`;
    });
    html += `</div>`;
    html += `<div id="send-status">Sending your result to your teacher...</div>`;
    if (config.backLink) {
      html += `<div style="text-align:center;"><a class="back-link" href="${config.backLink}">← Back to all units</a></div>`;
    }

    results.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  /* ---------- SEND TO TEACHER VIA FORMSPREE ---------- */
  function sendToFormspree(score, review) {
    const wrongList =
      review
        .filter((r) => !r.isCorrect)
        .map((r) => `Q${r.num} (${r.section}): "${r.prompt}" — student answered "${r.studentAnswer}", correct answer is "${r.correctAnswer}"`)
        .join("\n") || "None — perfect score!";

    const fullAnswerLog = review
      .map((r) => `Q${r.num}: ${r.isCorrect ? "CORRECT" : "WRONG"} — student: "${r.studentAnswer}" | correct: "${r.correctAnswer}"`)
      .join("\n");

    const payload = {
      "Lesson set": LESSON_SET,
      "Student name": studentName,
      Score: `${score} / ${TOTAL_MARKS} (${Math.round((score / TOTAL_MARKS) * 100)}%)`,
      Date: new Date().toLocaleString(),
      "Questions answered wrong": wrongList,
      "Full answer log": fullAnswerLog,
    };

    fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        const statusEl = document.getElementById("send-status");
        if (!statusEl) return;
        if (res.ok) {
          statusEl.textContent = "✔ Your result has been sent to your teacher.";
          statusEl.style.color = "var(--green)";
        } else {
          statusEl.textContent = "⚠ Could not send your result automatically. Please tell your teacher your score.";
          statusEl.style.color = "var(--red)";
        }
      })
      .catch(() => {
        const statusEl = document.getElementById("send-status");
        if (!statusEl) return;
        statusEl.textContent = "⚠ Could not send your result automatically (no connection). Please tell your teacher your score.";
        statusEl.style.color = "var(--red)";
      });
  }
})();
