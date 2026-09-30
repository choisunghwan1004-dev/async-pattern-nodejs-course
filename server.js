const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const lessons = {
  callback: {
    title: "콜백 패턴",
    concept: "작업이 끝난 뒤 실행할 함수를 미리 전달하는 방식입니다.",
    key: "callback"
  },
  promise: {
    title: "Promise 패턴",
    concept: "비동기 작업의 성공과 실패를 하나의 객체로 관리합니다.",
    key: "promise"
  },
  "async-await": {
    title: "async / await",
    concept: "Promise 기반 비동기 코드를 읽기 쉬운 형태로 작성합니다.",
    key: "async-await"
  },
  "promise-all": {
    title: "Promise.all",
    concept: "서로 독립적인 여러 비동기 작업을 동시에 시작합니다.",
    key: "promise-all"
  },
  error: {
    title: "try / catch",
    concept: "비동기 작업에서 발생하는 오류를 안전하게 처리합니다.",
    key: "error"
  },
  flow: {
    title: "API 응답 흐름",
    concept: "브라우저의 요청부터 Node.js 서버의 응답까지 흐름을 이해합니다.",
    key: "flow"
  }
};

app.get("/api/lesson/:id", (req, res) => {
  const lesson = lessons[req.params.id];

  if (!lesson) {
    return res.status(404).json({ message: "학습 내용을 찾을 수 없습니다." });
  }

  res.json(lesson);
});

// 실제 실행을 흉내 내는 학습용 API
app.get("/api/run/:id", async (req, res) => {
  const id = req.params.id;

  try {
    if (id === "callback") {
      setTimeout(() => {
        res.json({
          title: "Callback 실행 결과",
          message: "작업이 끝난 후 callback 함수가 실행되었습니다.",
          steps: ["작업 시작", "1초 대기", "callback 실행", "결과 반환"]
        });
      }, 1000);
      return;
    }

    if (id === "promise") {
      const data = await new Promise(resolve =>
        setTimeout(() => resolve("Promise 완료!"), 1000)
      );
      return res.json({
        title: "Promise 실행 결과",
        message: data,
        steps: ["Promise 생성", "resolve 실행", "then/await에서 결과 수신"]
      });
    }

    if (id === "async-await") {
      const data = await new Promise(resolve =>
        setTimeout(() => resolve({
          city: "서울",
          temperature: "24°C",
          weather: "맑음"
        }), 1000)
      );
      return res.json({
        title: "async/await 실행 결과",
        message: "await가 Promise 결과를 기다린 뒤 다음 코드가 실행되었습니다.",
        data
      });
    }

    if (id === "promise-all") {
      const start = Date.now();

      const [user, orders, notice] = await Promise.all([
        new Promise(resolve => setTimeout(() => resolve("홍길동"), 900)),
        new Promise(resolve => setTimeout(() => resolve(["상품A", "상품B"]), 1200)),
        new Promise(resolve => setTimeout(() => resolve("공지사항 1건"), 600))
      ]);

      return res.json({
        title: "Promise.all 실행 결과",
        message: "3개 작업을 동시에 시작했습니다.",
        elapsed: `${Date.now() - start}ms`,
        data: { user, orders, notice }
      });
    }

    if (id === "error") {
      try {
        await delay(600);
        throw new Error("연습용 오류가 발생했습니다.");
      } catch (error) {
        return res.status(400).json({
          title: "try/catch 실행 결과",
          message: "오류를 catch 블록에서 잡았습니다.",
          error: error.message
        });
      }
    }

    if (id === "flow") {
      await delay(700);
      return res.json({
        title: "API 응답 흐름",
        steps: [
          "① 브라우저가 GET 요청",
          "② Express 서버가 요청 수신",
          "③ 비동기 작업 실행",
          "④ 작업 완료",
          "⑤ JSON 응답 반환"
        ]
      });
    }

    res.status(404).json({ message: "실행할 패턴이 없습니다." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 초급자용 코드 검사
app.post("/api/check", (req, res) => {
  const { lessonId, code } = req.body;
  const text = String(code || "").toLowerCase();

  const rules = {
    callback: ["function", "callback"],
    promise: ["promise", "resolve"],
    "async-await": ["async", "await"],
    "promise-all": ["promise.all"],
    error: ["try", "catch"],
    flow: ["fetch", "/api/"]
  };

  const required = rules[lessonId] || [];
  const missing = required.filter(word => !text.includes(word));

  res.json({
    passed: missing.length === 0,
    missing,
    message: missing.length === 0
      ? "정답에 필요한 핵심 문법이 모두 들어 있습니다!"
      : `힌트: ${missing.join(", ")} 를 코드에서 확인해 보세요.`
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" Node.js 비동기 패턴 학습 사이트");
  console.log(` http://localhost:${PORT}`);
  console.log("======================================");
  console.log("");
});
