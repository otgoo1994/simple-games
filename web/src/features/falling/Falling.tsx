import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";

/* ---------- Төрлүүд ---------- */
interface Question {
  q: string;
  correct: string;
  wrong: string[];
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  text: string;
  correct: boolean;
  born: number;
}

type Screen = "start" | "playing" | "roundWin" | "gameover" | "victory";

interface PopFx {
  id: number;
  x: number;
  y: number;
  kind: "good" | "bad";
}

interface Dims {
  w: number;
  h: number;
}

/* ---------- Асуултын сан (3 түвшин) ---------- */
const QUESTIONS: Question[] = [
  {
    q: "Монгол улсын нийслэл аль хот вэ?",
    correct: "Улаанбаатар",
    wrong: ["Дархан", "Эрдэнэт", "Чойбалсан", "Сүхбаатар", "Ховд", "Мөрөн"],
  },
  {
    q: "7 × 6 = ?",
    correct: "42",
    wrong: ["36", "48", "40", "35", "49", "44"],
  },
  {
    q: "Нарны аймгийн хамгийн том гараг аль вэ?",
    correct: "Бархасбадь",
    wrong: ["Ангараг", "Дэлхий", "Нептун", "Ураан", "Сугар", "Плутон"],
  },
];

const START_LIVES = 3;
const HINT_USES = 2;
const BUBBLE_D = 68; // диаметр px
const SPAWN_MARGIN = 40; // экраны дээгүүр хичнээн хол үүсэх нэмэлт зай (px)

export const Falling: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("start");
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [hits, setHits] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hintUses, setHintUses] = useState(HINT_USES);
  const [hintActive, setHintActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [popFx, setPopFx] = useState<PopFx | null>(null);
  const [shakeLife, setShakeLife] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const dimsRef = useRef<Dims>({ w: 1280, h: 720 });

  const needed = 10 + round; // энэ шатанд шаардлагатай зөв дарц
  const speed = 78 + round * 16; // px/sec
  const spawnMs = Math.max(480, 860 - round * 90);
  const correctProb = 0.34;

  const question = QUESTIONS[round];

  /* ---------- хэмжээ (layout тооцоологдмогц шууд авна) ---------- */
  useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        dimsRef.current = {
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        };
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* ---------- бөмбөлөг үүсгэх — үргэлж дэлгэцний ДЭЭД ХЯЗГААРААС ГАДНА ---------- */
  const spawnBubble = useCallback(() => {
    const { w } = dimsRef.current;
    const isCorrect = Math.random() < correctProb;
    const text = isCorrect
      ? question.correct
      : question.wrong[Math.floor(Math.random() * question.wrong.length)];

    const maxX = Math.max(10, w - BUBBLE_D - 28);
    const x = 14 + Math.random() * maxX;

    idRef.current += 1;
    setBubbles((prev) => [
      ...prev,
      {
        id: idRef.current,
        x,
        // Хагас далд биш, БҮРЭН далд байхаар нэмэлт SPAWN_MARGIN нэмнэ
        y: -(BUBBLE_D + SPAWN_MARGIN),
        text,
        correct: isCorrect,
        born: performance.now(),
      },
    ]);
  }, [question, correctProb]);

  /* ---------- тоглоомын гол давталт ---------- */
  useEffect(() => {
    if (screen !== "playing") return;

    lastTsRef.current = null;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const { h } = dimsRef.current;

      setBubbles((prev) => {
        const next: Bubble[] = [];
        let missedCorrect = 0;
        for (const b of prev) {
          const ny = b.y + speed * dt;
          if (ny < h + BUBBLE_D) {
            next.push({ ...b, y: ny });
          } else if (b.correct) {
            missedCorrect += 1;
          }
        }
        if (missedCorrect > 0) {
          setLives((l) => Math.max(0, l - missedCorrect));
          setShakeLife(true);
          setTimeout(() => setShakeLife(false), 420);
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    spawnRef.current = setInterval(spawnBubble, spawnMs);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (spawnRef.current != null) clearInterval(spawnRef.current);
    };
  }, [screen, speed, spawnMs, spawnBubble]);

  /* ---------- шат солигдоход цэвэрлэх ---------- */
  useEffect(() => {
    setBubbles([]);
    setHits(0);
  }, [round]);

  /* ---------- ялалт / хожигдол шалгах ---------- */
  useEffect(() => {
    if (screen !== "playing") return;
    if (hits >= needed) {
      setScreen(round === QUESTIONS.length - 1 ? "victory" : "roundWin");
    }
  }, [hits, needed, screen, round]);

  useEffect(() => {
    if (screen !== "playing") return;
    if (lives <= 0) {
      setScreen("gameover");
    }
  }, [lives, screen]);

  /* ---------- дарах ---------- */
  const popBubble = (bubble: Bubble) => {
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    setPopFx({
      id: bubble.id,
      x: bubble.x,
      y: bubble.y,
      kind: bubble.correct ? "good" : "bad",
    });
    setTimeout(() => setPopFx(null), 420);

    if (bubble.correct) {
      setHits((h) => h + 1);
    } else {
      setLives((l) => Math.max(0, l - 1));
      setShakeLife(true);
      setTimeout(() => setShakeLife(false), 420);
    }
  };

  /* ---------- сануулга ---------- */
  const useHint = () => {
    if (hintUses <= 0 || hintActive || screen !== "playing") return;
    setHintUses((n) => n - 1);
    setHintActive(true);
    setTimeout(() => setHintActive(false), 1400);
  };

  const startGame = () => {
    setRound(0);
    setLives(START_LIVES);
    setHits(0);
    setBubbles([]);
    setHintUses(HINT_USES);
    setScreen("playing");
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setScreen("playing");
  };

  return (
    <div className="sq-root">
      <div className="sq-topbar">
        <div className="sq-menu-btn" onClick={() => setMenuOpen((v) => !v)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className={`sq-lives ${shakeLife ? "shake" : ""}`}>
          <svg className={`sq-heart`} viewBox="0 0 24 24" fill="#e2795a">
              <path d="M12 21s-7.5-4.6-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.4 1.1 4.1 2.3C10.2 6.1 11.6 5 13.6 5 17 5 18.6 8.4 22 11.7 19.5 16.4 12 21 12 21z" />
            </svg> <span className="sq-lives-text">x {lives}</span>
        </div>
      </div>

      {menuOpen && (
        <div className="sq-menu-panel">
          <b>Хэрхэн тоглох вэ</b>
          <br />
          Энэхүү тоглоом нь гурван шаттай бөгөөд дээрх асуулттай холбоотой хариултиуд дэлгэцийн дээрээс урсаж гарч ирэх болно. Зөв хариултыг нь&nbsp;
          <b>{needed}</b> удаа цуглуулбал тухайн шатаа давах болно. Буруу хариулт дээр дарах аль эсвэл зөв
          хариултыг дарж чадалгүй дэлгэцнээс гаргасан тохиолдолд амь хасагдана.
        </div>
      )}

      {/* ---------- Асуулт ---------- */}
      <div className="sq-question">
        <div className="sq-q-text">{question.q}</div>
      </div>

      {/* ---------- Тоглоомын талбай ---------- */}
      <div className="sq-play-area" ref={containerRef}>
        {bubbles.map((b) => (
          <div
            key={b.id}
            className={`sq-bubble ${hintActive && b.correct ? "hint-ring" : ""}`}
            style={{ left: b.x, top: b.y }}
            onClick={() => screen === "playing" && popBubble(b)}
          >
            {b.text}
          </div>
        ))}

        {popFx && (
          <div className={`sq-fx ${popFx.kind}`} style={{ left: popFx.x + 18, top: popFx.y }}>
            {popFx.kind === "good" ? "+1" : "−1 ♥"}
          </div>
        )}
        {screen === "start" && (
          <div className="sq-overlay">
            <div className="sq-emoji-big">🙂</div>
            <div className="sq-title">Зөв хариулт хайцгаая</div>
            <div className="sq-sub">
              Дээр асуулт гарч ирнэ. Зөв хариулттай бөмбөлгийг олон удаа дарж шат дав,
              бурууг бүү дар — 3 амьтай.
            </div>
            <button className="sq-btn" onClick={startGame}>Эхлүүлэх</button>
          </div>
        )}

        {screen === "roundWin" && (
          <div className="sq-overlay">
            <div className="sq-emoji-big">🎉</div>
            <div className="sq-title">Шат давлаа!</div>
            <div className="sq-sub">Дараагийн асуулт бэлэн боллоо. Хурд бага зэрэг нэмэгдэнэ.</div>
            <button className="sq-btn" onClick={nextRound}>Үргэлжлүүлэх</button>
          </div>
        )}

        {screen === "gameover" && (
          <div className="sq-overlay">
            <div className="sq-emoji-big">😵</div>
            <div className="sq-title">Тоглоом дууслаа</div>
            <div className="sq-sub">Та {round + 1}-р асуулт дээр бүдэрлээ. </div>
            <button className="sq-btn" onClick={startGame}>Дахин эхлэх</button>
          </div>
        )}

        {screen === "victory" && (
          <div className="sq-overlay">
            <div className="sq-emoji-big">🏆</div>
            <div className="sq-title">Та бүгдийг олоо!</div>
            <div className="sq-sub">Бүх {QUESTIONS.length} асуултыг {lives} амьтайгаар дуусгалаа. Гайхалтай!</div>
            <button className="sq-btn" onClick={startGame}>Дахин тоглох</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Falling;
