const lessons = [
  {
    id: "callback",
    title: "콜백 패턴",
    tip: "콜백은 '작업이 끝나면 이 함수를 실행해 주세요'라고 전달하는 방식입니다.",
    explanation: "함수를 다른 함수의 인자로 전달하고, 비동기 작업이 끝났을 때 그 함수를 실행합니다.",
    code: `function getData(callback) {
  setTimeout(() => {
    callback(null, "완료!");
  }, 1000);
}

getData((error, data) => {
  console.log(data);
});`
  },
  {
    id: "promise",
    title: "Promise 패턴",
    tip: "Promise는 미래에 완료될 작업의 결과를 표현합니다.",
    explanation: "resolve는 성공, reject는 실패를 나타냅니다. then/catch 또는 await와 함께 사용할 수 있습니다.",
    code: `function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("완료!");
    }, 1000);
  });
}

getData().then(data => {
  console.log(data);
});`
  },
  {
    id: "async-await",
    title: "async / await",
    tip: "async 함수 안에서 await를 사용하면 Promise 결과를 기다릴 수 있습니다.",
    explanation: "Promise를 사용하면서도 코드가 위에서 아래로 읽히기 때문에 초급자에게 가장 중요한 패턴입니다.",
    code: `async function getData() {
  const data = await fetchData();
  console.log(data);
}

getData();`
  },
  {
    id: "promise-all",
    title: "Promise.all",
    tip: "서로 기다릴 필요가 없는 작업은 동시에 실행할 수 있습니다.",
    explanation: "여러 Promise를 배열로 넣으면 모든 작업이 완료된 뒤 결과를 배열로 받을 수 있습니다.",
    code: `const [user, orders] = await Promise.all([
  getUser(),
  getOrders()
]);

console.log(user);
console.log(orders);`
  },
  {
    id: "error",
    title: "try / catch",
    tip: "비동기 작업에서 오류가 생기면 catch에서 처리할 수 있습니다.",
    explanation: "try 안에서 작업하고 오류가 발생하면 catch 블록으로 이동합니다.",
    code: `try {
  const data = await getData();
  console.log(data);
} catch (error) {
  console.log(error);
}`
  },
  {
    id: "flow",
    title: "API 응답 흐름",
    tip: "프론트엔드는 fetch로 서버에 요청하고 서버는 JSON으로 응답할 수 있습니다.",
    explanation: "웹 서비스의 기본 흐름인 브라우저 → API → Node.js → 비동기 작업 → JSON 응답을 이해합니다.",
    code: `async function loadData() {
  const response = await fetch("/api/async-await");
  const data = await response.json();

  console.log(data);
}

loadData();`
  }
];

let currentIndex = -1;
const completed = new Set();

const cards = document.getElementById("lessonCards");

function renderCards() {
  cards.innerHTML = lessons.map((lesson, index) => `
    <button class="lesson-card ${completed.has(lesson.id) ? "done" : ""}"
      onclick="openLesson(${index})">
      <span class="number">${index + 1}</span>
      <span class="lesson-icon">${iconFor(lesson.id)}</span>
      <span class="card-text">
        <strong>${lesson.title}</strong>
        <small>${lesson.explanation}</small>
      </span>
      <span class="arrow">›</span>
    </button>
  `).join("");

  document.getElementById("progress").style.width =
    `${completed.size / lessons.length * 100}%`;

  document.getElementById("progressText").textContent =
    `${completed.size} / ${lessons.length} 학습 완료`;
}

function iconFor(id) {
  if (id === "callback") return "</>";
  if (id === "promise") return "🔗";
  if (id === "async-await") return "async";
  if (id === "promise-all") return "▱";
  if (id === "error") return "!";
  return "API";
}

function openLesson(index) {
  currentIndex = index;
  const lesson = lessons[index];

  document.getElementById("lesson").classList.remove("hidden");
  document.getElementById("lessonNumber").textContent =
    `LESSON ${index + 1} / 6`;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonConcept").textContent = lesson.explanation;
  document.getElementById("lessonTip").textContent = lesson.tip;
  document.getElementById("exampleCode").textContent = lesson.code;
  document.getElementById("editor").value = lesson.code;
  document.getElementById("answerResult").textContent =
    "코드를 수정한 다음 코드 확인을 눌러보세요.";
  document.getElementById("runResult").textContent =
    "아직 실행하지 않았습니다.";

  document.getElementById("lesson").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeLesson() {
  document.getElementById("lesson").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetEditor() {
  if (currentIndex < 0) return;
  document.getElementById("editor").value = lessons[currentIndex].code;
  document.getElementById("answerResult").textContent =
    "코드를 초기 상태로 되돌렸습니다.";
}

async function runSelected() {
  if (currentIndex < 0) return;

  const id = lessons[currentIndex].id;
  const output = document.getElementById("runResult");

  output.textContent = "실행 중...";

  try {
    const response = await fetch(`/api/run/${id}`);
    const data = await response.json();

    output.textContent = JSON.stringify(data, null, 2);

    completed.add(id);
    renderCards();
  } catch (error) {
    output.textContent = `실행 오류: ${error.message}`;
  }
}

async function checkAnswer() {
  if (currentIndex < 0) return;

  const id = lessons[currentIndex].id;
  const code = document.getElementById("editor").value;
  const result = document.getElementById("answerResult");

  result.textContent = "코드를 확인하는 중...";

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lessonId: id,
        code
      })
    });

    const data = await response.json();

    if (data.passed) {
      result.className = "answer-result success";
      result.textContent = "🎉 정답! " + data.message;
      completed.add(id);
      renderCards();
    } else {
      result.className = "answer-result hint";
      result.textContent = "💡 " + data.message;
    }
  } catch (error) {
    result.textContent = "서버 연결을 확인하세요.";
  }
}

function nextLesson() {
  if (currentIndex >= lessons.length - 1) {
    alert("🎉 모든 학습을 완료했습니다!");
    closeLesson();
    return;
  }

  openLesson(currentIndex + 1);
}

function goHome() {
  closeLesson();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

renderCards();
