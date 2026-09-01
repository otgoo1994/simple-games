import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Lesson {
  id: number;
  lvl: number;
  start: boolean;
  startBtn: boolean;
  finish: boolean;
  won: boolean;
}

interface FinishStats {
  timePassed: number;
  score: number;
}

interface BirdState {
  alive: string;
  die: string;
  live: number;
  originalY: number;
}

type PipeNodeKey = 'top' | 'bottom' | 'block' | 'tagA' | 'tagB';

interface PipeVisual {
  id: number;
  type: 'normal' | 'answer';
  gapCenterRatio?: number;
  blockTop?: number;
  blockBottom?: number;
  topText?: string; // ← дээд зайд харуулах хариултын текст
  bottomText?: string; // ← доод зайд харуулах хариултын текст
}

interface PipeData {
  id: number;
  x: number;
  type: 'normal' | 'answer';
  gapCenterRatio: number;
  blockTop?: number;
  blockBottom?: number;
  correctIsA?: boolean;
  resolved?: boolean;
  answerQuestion?: QuestionItem;
  questionIdx?: number;
  questionShown?: boolean;
}

interface QuestionItem {
  question: string;
  correct: string;
  wrong: string;
}

interface ActiveQuestionState {
  index: number;
  question: QuestionItem;
  correctIsA: boolean;
}

const QUESTIONS: QuestionItem[] = [
  { question: 'Монгол Улсын нийслэл аль хот вэ?', correct: 'Улаанбаатар', wrong: 'Дархан' },
  { question: 'Нар аль зүгээс манддаг вэ?', correct: 'Зүүн', wrong: 'Баруун' },
  { question: 'Ус хэдэн хэмд хөлддөг вэ?', correct: '0°C', wrong: '-10°C' },
];

const TOTAL_QUESTIONS = QUESTIONS.length;
const QUESTION_POINTS = 10;
const QUESTION_TRIGGER_DISTANCE = 700;
const QUESTION_TRIGGER_RATIOS = [0.28, 0.55, 0.8];

export const Flappy = () => {
  const navigate = useNavigate();

  const bgImage = '/images/games/floppy/bg.jpg';
  const birdImage = '/images/games/floppy/bird.png';
  const birdDieImage = '/images/games/floppy/birdDie.png';
  const live3Image = '/images/games/floppy/live3.png';
  const live2Image = '/images/games/floppy/live2.png';
  const live1Image = '/images/games/floppy/live1.png';

  const flapSound = '/sounds/pass.mp3';
  const dieSound = '/sounds/die.wav';
  const goingSound = '/sounds/going.wav';

  const STATIC_LESSON = {
    id: 1,
    lvl: 1,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLImageElement | null>(null);
  const birdRef = useRef<HTMLImageElement | null>(null);
  const liveRef = useRef<HTMLImageElement | null>(null);
  const birdYRef = useRef(0);
  const birdVelocityRef = useRef(0); // px/s, эерэг = доошоо, сөрөг = дээшээ
  const birdRotationRef = useRef(0); // хамгийн сүүлд тавьсан эргэлтийн градус (lerp-д ашиглана)
  const scrolledRef = useRef(0);
  const pausedRef = useRef(true);
  const levelDistanceRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const bgLastFrameRef = useRef<number | null>(null);
  const birdLastFrameRef = useRef<number | null>(null);
  const bgAnimationRef = useRef<number | null>(null);
  const birdAnimationRef = useRef<number | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rebornTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const birdFallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipesDataRef = useRef<PipeData[]>([]);
  const pipeNodesRef = useRef<Record<number, Partial<Record<PipeNodeKey, HTMLDivElement | null>>>>(
    {},
  );
  const nextPipeIdRef = useRef(0);
  const distanceSincePipeRef = useRef(0);

  const [pipes, setPipes] = useState<PipeVisual[]>([]);

  const questionIndexRef = useRef(0);
  const questionsAnsweredRef = useRef(0); // зөв хариулсан асуултын тоо
  const pendingAnswerPipeIdRef = useRef<number | null>(null); // хариулт хүлээгдэж буй баганы id
  const pipeSpawnCountRef = useRef(0); // хэдэн "багана слот" (энгийн + хариултын) үүссэнийг тоолно
  const questionTriggerSpawnIndexRef = useRef<number[]>([]); // асуулт бүр аль дэх багана слот дээр гарахыг заана
  const triggerQuestionRef = useRef<() => void>(() => {});
  const distanceAfterLastQuestionRef = useRef<number | null>(null);

  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestionState | null>(null);

  const activeQuestionRef = useRef<ActiveQuestionState | null>(null);
  activeQuestionRef.current = activeQuestion;

  const [activeAnswerBanner, setActiveAnswerBanner] = useState<{
    question: string;
    aText: string;
    bText: string;
  } | null>(null);

  const [lesson, setLesson] = useState<Lesson>({
    id: STATIC_LESSON.id,
    lvl: STATIC_LESSON.lvl,
    start: false,
    startBtn: false,
    finish: false,
    won: false,
  });

  const lessonRef = useRef(lesson);
  const [finishStats, setFinishStats] = useState<FinishStats>({
    timePassed: 0,
    score: 0,
  });

  const [birdLive, setBirdLive] = useState(3);

  const [secondsStart, setSecondsStart] = useState<number | string>(3);

  const secondsRef = useRef<number | string>(3);

  // Таталцлын хурдатгал (px/s²).
  const GRAVITY_ACCEL_RATIO = 2.1;
  const FLAP_VELOCITY_RATIO = 0.5;
  const MAX_FALL_VELOCITY_RATIO = 1.5;
  const GRAVITY_X = 3;
  const MIN_LEVEL_DISTANCE = 1200;
  const MAX_LEVEL_DISTANCE = 4000;

  // Шувууны эргэлтийн (tilt) хязгаарууд (градус).
  const TILT_UP_DEG = -85; // дээшлэхдээ дээшээ гэдийнэ
  const TILT_DOWN_DEG = 80; // унахдаа урагшаа/доошоо тонгойно
  const ROTATION_LERP_SPEED = 8; // их байх тутам эргэлт ХУРДАН зорилтот өнцөгтөө хүрнэ

  const QUESTION_TRIGGER_DISTANCE_RATIO = 0.32; // container өргөний хэдэн хувь дээр trigger хийхийг заана
  const QUESTION_TRIGGER_DISTANCE_MIN = 240; // маш нарийн дэлгэц (жижиг утас) дээрх доод хязгаар
  const QUESTION_TRIGGER_DISTANCE_MAX = 560;

  const EXTRA_DISTANCE_AFTER_QUESTIONS = 1500;
  const PIPE_WIDTH = 80; // баганы өргөн (px)
  const PIPE_GAP_HEIGHT_RATIO = 0.72; // нүхний өндөр (container height-ийн хувиар) — өмнө нь 0.6 байсан
  const PIPE_SPAWN_DISTANCE = 620; // хэдэн px scroll болох тутамд шинэ багана (энгийн ЭСВЭЛ хариултын) гарах
  const PIPE_MIN_GAP_CENTER_RATIO = 0.36; // нүхний төвийн дээд хязгаар
  const PIPE_MAX_GAP_CENTER_RATIO = 0.64; // нүхний төвийн доод хязгаар
  const PIPE_SPEED_RATIO = 2.4; // баганы хурд (GRAVITY_X-тэй адил нэгжтэй)
  const ANSWER_BLOCK_HEIGHT_RATIO = 0.1; // голын хатуу block-ийн өндөр (ratio)
  const ANSWER_BLOCK_TOP_MIN = 0.35; // block-ийн дээд ирмэгийн доод хязгаар (ratio)
  const ANSWER_BLOCK_TOP_MAX = 0.35; // block-ийн дээд ирмэгийн дээд хязгаар (ratio)

  const birdStateRef = useRef<BirdState>({
    alive: birdImage,
    die: birdDieImage,
    live: 3,
    originalY: 0,
  });

  const soundsRef = useRef<{
    flap: HTMLAudioElement | null;
    die: HTMLAudioElement | null;
    going: HTMLAudioElement | null;
  }>({
    flap: null,
    die: null,
    going: null,
  });

  useEffect(() => {
    lessonRef.current = lesson;
  }, [lesson]);

  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) {
      return;
    }

    if (audio.src.includes('going')) {
      audio.volume = 0.1;
    }

    audio.pause();
    audio.currentTime = 0;

    void audio.play().catch(() => {
      // Browser autoplay restriction
    });
  }, []);

  const clearIntervalRef = (ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
    if (ref.current !== null) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const clearTimeoutRef = (ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (ref.current !== null) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const clearGameTimers = useCallback(() => {
    clearIntervalRef(startTimerRef);
    clearIntervalRef(fallTimerRef);

    clearTimeoutRef(countdownTimerRef);
    clearTimeoutRef(rebornTimerRef);
    clearTimeoutRef(blinkTimerRef);
    clearTimeoutRef(birdFallTimeoutRef);
  }, []);

  const setPipeNode = useCallback((id: number, key: PipeNodeKey, el: HTMLDivElement | null) => {
    if (!pipeNodesRef.current[id]) {
      pipeNodesRef.current[id] = {};
    }

    pipeNodesRef.current[id]![key] = el;
    if (el) {
      const pipe = pipesDataRef.current.find((p) => p.id === id);

      if (pipe) {
        el.style.left = `${pipe.x}px`;
      }
    }
  }, []);

  const finishGame = useCallback((result: boolean) => {
    pausedRef.current = true;

    const currentBird = birdStateRef.current;

    const timePassed = gameStartTimeRef.current
      ? Math.round((performance.now() - gameStartTimeRef.current) / 1000)
      : 0;

    const timePoint = timePassed * 2;
    const livePoint = currentBird.live * 20;
    const questionPoint = questionsAnsweredRef.current * QUESTION_POINTS;
    const score = timePoint + livePoint + questionPoint;

    setFinishStats({ timePassed, score });

    setLesson((prev) => ({
      ...prev,
      won: result,
      finish: true,
    }));

    lessonRef.current = {
      ...lessonRef.current,
      won: result,
      finish: true,
    };
  }, []);

  const flap = useCallback(() => {
    if (pausedRef.current || !lessonRef.current.start || lessonRef.current.finish) {
      return;
    }

    const container = containerRef.current;
    const height = container ? container.clientHeight : 600;
    birdVelocityRef.current = -(height * FLAP_VELOCITY_RATIO);

    playSound(soundsRef.current.flap);
  }, [playSound]);

  const handleTap = useCallback(
    (evt: React.PointerEvent) => {
      evt.preventDefault();
      flap();
    },
    [flap],
  );

  const triggerQuestion = useCallback(() => {
    const idx = questionIndexRef.current;

    if (idx >= TOTAL_QUESTIONS) {
      return;
    }

    questionIndexRef.current += 1;
    pausedRef.current = true;

    const q = QUESTIONS[idx];
    const correctIsA = Math.random() < 0.5;

    setActiveQuestion({ index: idx, question: q, correctIsA });
  }, []);

  triggerQuestionRef.current = triggerQuestion;

  const continueAfterQuestion = useCallback(() => {
    const current = activeQuestionRef.current;

    if (!current) {
      return;
    }

    const pendingId = pendingAnswerPipeIdRef.current;
    const pipe = pendingId !== null ? pipesDataRef.current.find((p) => p.id === pendingId) : null;

    if (pipe && pipe.answerQuestion) {
      setActiveAnswerBanner({
        question: pipe.answerQuestion.question,
        aText: pipe.correctIsA ? pipe.answerQuestion.correct : pipe.answerQuestion.wrong,
        bText: pipe.correctIsA ? pipe.answerQuestion.wrong : pipe.answerQuestion.correct,
      });
    }

    setActiveQuestion(null);

    bgLastFrameRef.current = null;
    birdLastFrameRef.current = null;
    pausedRef.current = false;

    flap();
  }, [flap]);

  const handleQuestionPassed = useCallback(() => {
    questionsAnsweredRef.current += 1;
    pendingAnswerPipeIdRef.current = null;
    setActiveAnswerBanner(null);

    // Сүүлийн (3 дахь) асуултыг ЯГ ДАВСАН МӨЧИД нэмэлт зайн тоолуургыг
    // 0-ээс эхлүүлнэ — тоглоом шууд дуусахгүй, эрэлхийлж нисэх завсарлага өгнө.
    if (questionsAnsweredRef.current >= TOTAL_QUESTIONS) {
      distanceAfterLastQuestionRef.current = 0;
    }
  }, []);

  const bgPosition = useCallback(
    (timestamp?: number) => {
      const background = backgroundRef.current;
      const container = containerRef.current;

      if (!background || !container || pausedRef.current) {
        bgLastFrameRef.current = null;
        bgAnimationRef.current = requestAnimationFrame(bgPosition);
        return;
      }

      const now = timestamp ?? performance.now();

      if (bgLastFrameRef.current === null) {
        bgLastFrameRef.current = now;
      }

      const rawDt = (now - bgLastFrameRef.current) / (1000 / 60);
      const dt = Math.min(Math.max(rawDt, 0), 4);
      bgLastFrameRef.current = now;

      if (levelDistanceRef.current === null) {
        const rawDistance = background.clientWidth * 0.95 - container.clientWidth;

        const distance = Math.min(Math.max(rawDistance, MIN_LEVEL_DISTANCE), MAX_LEVEL_DISTANCE);

        levelDistanceRef.current = distance;
        const estimatedSpawnSlots = Math.max(
          TOTAL_QUESTIONS + 1,
          Math.floor(distance / PIPE_SPAWN_DISTANCE),
        );

        questionTriggerSpawnIndexRef.current = QUESTION_TRIGGER_RATIOS.map((r) =>
          Math.min(estimatedSpawnSlots, Math.max(1, Math.round(r * estimatedSpawnSlots))),
        );
      }

      if (lessonRef.current.start && !lessonRef.current.finish) {
        scrolledRef.current += GRAVITY_X * dt;

        const bgWidth = background.clientWidth;

        if (bgWidth > 0) {
          scrolledRef.current = scrolledRef.current % bgWidth;
        }

        background.style.transform = `translateX(-${scrolledRef.current}px)`;
      }

      if (lessonRef.current.start && !lessonRef.current.finish) {
        const movedPipe = PIPE_SPEED_RATIO * dt;

        distanceSincePipeRef.current += movedPipe;

        if (distanceSincePipeRef.current >= PIPE_SPAWN_DISTANCE && !activeQuestionRef.current) {
          distanceSincePipeRef.current = 0;
          pipeSpawnCountRef.current += 1;

          const nextQuestionSlot =
            questionIndexRef.current < TOTAL_QUESTIONS
              ? questionTriggerSpawnIndexRef.current[questionIndexRef.current]
              : undefined;

          const shouldSpawnAnswerGate =
            pendingAnswerPipeIdRef.current === null &&
            nextQuestionSlot !== undefined &&
            pipeSpawnCountRef.current >= nextQuestionSlot;

          if (shouldSpawnAnswerGate) {
            const idx = questionIndexRef.current;
            questionIndexRef.current += 1;

            const correctIsA = Math.random() < 0.5;

            const blockTop =
              ANSWER_BLOCK_TOP_MIN + Math.random() * (ANSWER_BLOCK_TOP_MAX - ANSWER_BLOCK_TOP_MIN);
            const blockBottom = blockTop + ANSWER_BLOCK_HEIGHT_RATIO;

            const newPipe: PipeData = {
              id: nextPipeIdRef.current++,
              x: container.clientWidth,
              type: 'answer',
              gapCenterRatio: 0,
              blockTop,
              blockBottom,
              correctIsA,
              resolved: false,
              answerQuestion: QUESTIONS[idx],
              questionIdx: idx,
            };

            pipesDataRef.current.push(newPipe);
            pendingAnswerPipeIdRef.current = newPipe.id;

            const topText = correctIsA ? QUESTIONS[idx].correct : QUESTIONS[idx].wrong;
            const bottomText = correctIsA ? QUESTIONS[idx].wrong : QUESTIONS[idx].correct;

            setPipes((prev) => [
              ...prev,
              { id: newPipe.id, type: 'answer', blockTop, blockBottom, topText, bottomText },
            ]);
          } else {
            const gapCenterRatio =
              PIPE_MIN_GAP_CENTER_RATIO +
              Math.random() * (PIPE_MAX_GAP_CENTER_RATIO - PIPE_MIN_GAP_CENTER_RATIO);

            const newPipe: PipeData = {
              id: nextPipeIdRef.current++,
              x: container.clientWidth,
              type: 'normal',
              gapCenterRatio,
            };

            pipesDataRef.current.push(newPipe);

            setPipes((prev) => [...prev, { id: newPipe.id, type: 'normal', gapCenterRatio }]);
          }
        }

        let removedAny = false;

        pipesDataRef.current.forEach((pipe) => {
          pipe.x -= movedPipe;

          const nodes = pipeNodesRef.current[pipe.id];

          if (nodes) {
            if (nodes.top) nodes.top.style.left = `${pipe.x}px`;
            if (nodes.bottom) nodes.bottom.style.left = `${pipe.x}px`;
            if (nodes.block) nodes.block.style.left = `${pipe.x}px`;
            if (nodes.tagA) nodes.tagA.style.left = `${pipe.x}px`;
            if (nodes.tagB) nodes.tagB.style.left = `${pipe.x}px`;
          }

          if (pipe.x < -PIPE_WIDTH) {
            removedAny = true;
          }
        });

        if (removedAny) {
          const survivingIds = new Set(
            pipesDataRef.current.filter((p) => p.x >= -PIPE_WIDTH).map((p) => p.id),
          );

          pipesDataRef.current = pipesDataRef.current.filter((p) => survivingIds.has(p.id));

          Object.keys(pipeNodesRef.current).forEach((key) => {
            const id = Number(key);
            if (!survivingIds.has(id)) {
              delete pipeNodesRef.current[id];
            }
          });

          setPipes((prev) => prev.filter((p) => survivingIds.has(p.id)));
        }

        if (!lessonRef.current.finish && distanceAfterLastQuestionRef.current !== null) {
          distanceAfterLastQuestionRef.current += movedPipe;

          if (distanceAfterLastQuestionRef.current >= EXTRA_DISTANCE_AFTER_QUESTIONS) {
            finishGame(true);
          }
        }
      }

      if (!activeQuestionRef.current && pendingAnswerPipeIdRef.current !== null) {
        const pendingPipe = pipesDataRef.current.find(
          (p) => p.id === pendingAnswerPipeIdRef.current,
        );
        const bird = birdRef.current;

        if (
          pendingPipe &&
          !pendingPipe.resolved &&
          !pendingPipe.questionShown &&
          bird &&
          pendingPipe.answerQuestion
        ) {
          const birdLeft = bird.offsetLeft;
          const questionTriggerDistance = Math.min(
            QUESTION_TRIGGER_DISTANCE_MAX,
            Math.max(
              QUESTION_TRIGGER_DISTANCE_MIN,
              container.clientWidth * QUESTION_TRIGGER_DISTANCE_RATIO,
            ),
          );

          if (pendingPipe.x - birdLeft <= questionTriggerDistance) {
            pendingPipe.questionShown = true;
            pausedRef.current = true;

            setActiveQuestion({
              index: pendingPipe.questionIdx ?? 0,
              question: pendingPipe.answerQuestion,
              correctIsA: !!pendingPipe.correctIsA,
            });
          }
        }
      }

      bgAnimationRef.current = requestAnimationFrame(bgPosition);
    },
    [finishGame],
  );

  const reBornBird = useCallback(() => {
    const bird = birdRef.current;
    const container = containerRef.current;

    if (!bird) {
      return;
    }

    bird.style.top = `${birdStateRef.current.originalY}px`;

    bird.style.transform = 'rotate(0deg)';
    birdRotationRef.current = 0;

    birdYRef.current = birdStateRef.current.originalY;

    birdVelocityRef.current = 0;

    if (container) {
      const birdLeft = bird.offsetLeft;
      const safeGap = Math.max(240, container.clientWidth * 0.5);
      const safeX = birdLeft + safeGap;
      const allPipes = pipesDataRef.current;

      if (allPipes.length > 0) {
        const minX = Math.min(...allPipes.map((p) => p.x));
        const shift = safeX - minX;

        if (shift > 0) {
          allPipes.forEach((pipe) => {
            pipe.x += shift;

            const nodes = pipeNodesRef.current[pipe.id];
            if (nodes) {
              if (nodes.top) nodes.top.style.left = `${pipe.x}px`;
              if (nodes.bottom) nodes.bottom.style.left = `${pipe.x}px`;
              if (nodes.block) nodes.block.style.left = `${pipe.x}px`;
              if (nodes.tagA) nodes.tagA.style.left = `${pipe.x}px`;
              if (nodes.tagB) nodes.tagB.style.left = `${pipe.x}px`;
            }
          });
        }
      }

      distanceSincePipeRef.current = 0;
    }

    clearTimeoutRef(rebornTimerRef);

    rebornTimerRef.current = window.setTimeout(() => {
      const currentBird = birdRef.current;

      if (!currentBird) {
        return;
      }

      currentBird.style.opacity = '1';
      currentBird.classList.add('blink');

      clearTimeoutRef(blinkTimerRef);

      blinkTimerRef.current = window.setTimeout(() => {
        const rebornBirdElement = birdRef.current;

        if (!rebornBirdElement) {
          return;
        }

        rebornBirdElement.classList.remove('blink');

        pausedRef.current = false;
      }, 2000);
    }, 1000);
  }, []);

  const diedBird = useCallback(() => {
    const bird = birdRef.current;
    const container = containerRef.current;

    if (!pausedRef.current || !bird || !container) {
      return;
    }

    playSound(soundsRef.current.die);

    birdFallTimeoutRef.current = window.setTimeout(() => {
      const currentBird = birdRef.current;

      const currentContainer = containerRef.current;

      if (!currentBird || !currentContainer) {
        return;
      }

      currentBird.src = birdDieImage;

      currentBird.style.top = `${birdYRef.current - 50}px`;

      let currentTop = currentBird.offsetTop;

      const distance = currentContainer.clientHeight;

      window.setTimeout(() => {
        fallTimerRef.current = window.setInterval(() => {
          const birdElement = birdRef.current;

          const containerElement = containerRef.current;

          if (!birdElement || !containerElement) {
            clearIntervalRef(fallTimerRef);

            return;
          }

          if (currentTop < distance) {
            currentTop += (15 * containerElement.clientHeight) / 630;

            birdElement.style.top = `${currentTop}px`;

            return;
          }

          clearIntervalRef(fallTimerRef);

          if (birdStateRef.current.live > 1) {
            birdElement.style.opacity = '0';

            const newLive = birdStateRef.current.live - 1;

            birdStateRef.current.live = newLive;

            setBirdLive(newLive);

            birdElement.src = birdImage;

            if (liveRef.current) {
              if (newLive === 2) {
                liveRef.current.src = live2Image;
              } else if (newLive === 1) {
                liveRef.current.src = live1Image;
              }
            }

            reBornBird();
          } else {
            finishGame(false);
          }
        }, 20);
      }, 500);
    }, 20);
  }, [finishGame, playSound, reBornBird]);

  const jumpBird = useCallback(
    (timestamp?: number) => {
      const bird = birdRef.current;
      const container = containerRef.current;

      if (!bird || !container || pausedRef.current) {
        birdLastFrameRef.current = null;
        birdAnimationRef.current = requestAnimationFrame(jumpBird);
        return;
      }

      const now = timestamp ?? performance.now();

      if (birdLastFrameRef.current === null) {
        birdLastFrameRef.current = now;
      }

      const dtSeconds = Math.min(Math.max((now - birdLastFrameRef.current) / 1000, 0), 0.05);
      birdLastFrameRef.current = now;

      const height = container.clientHeight;

      const gravityAccel = height * GRAVITY_ACCEL_RATIO;
      const maxFallVelocity = height * MAX_FALL_VELOCITY_RATIO;
      birdVelocityRef.current += gravityAccel * dtSeconds;

      if (birdVelocityRef.current > maxFallVelocity) {
        birdVelocityRef.current = maxFallVelocity;
      }

      birdYRef.current += birdVelocityRef.current * dtSeconds;

      if (birdYRef.current < 0) {
        birdYRef.current = 0;
        birdVelocityRef.current = 0;
      }

      // const maxY = container.clientHeight * 0.8 - bird.clientHeight;
      const maxY = container.clientHeight - bird.clientHeight;

      if (birdYRef.current > maxY) {
        birdYRef.current = maxY;
        pausedRef.current = true;
        diedBird();
      }

      bird.style.top = `${birdYRef.current}px`;

      // === ЭРГЭЛТ (tilt) — velocity дээр үндэслэнэ, зөөлрүүлж (lerp) ===
      const flapVelocityMax = height * FLAP_VELOCITY_RATIO;

      let targetRotation = 0;

      if (birdVelocityRef.current < 0) {
        // Дээшилж байна — дээшээ гэдийнэ
        const upRatio = Math.min(1, -birdVelocityRef.current / flapVelocityMax);
        targetRotation = TILT_UP_DEG * upRatio;
      } else {
        // Унаж байна — урагшаа тонгойно
        const downRatio = Math.min(1, birdVelocityRef.current / maxFallVelocity);
        targetRotation = TILT_DOWN_DEG * downRatio;
      }

      birdRotationRef.current +=
        (targetRotation - birdRotationRef.current) * Math.min(1, ROTATION_LERP_SPEED * dtSeconds);

      bird.style.transform = `rotate(${birdRotationRef.current}deg)`;

      if (!pausedRef.current && lessonRef.current.start && !lessonRef.current.finish) {
        const birdLeft = bird.offsetLeft;
        const birdWidth = bird.clientWidth;
        const birdHeight = bird.clientHeight;
        const birdTop = birdYRef.current;
        const birdBottom = birdTop + birdHeight;
        const containerHeight = container.clientHeight;

        for (const pipe of pipesDataRef.current) {
          if (pipe.type === 'answer') {
            if (pipe.resolved) {
              continue;
            }

            const overlapsX = pipe.x < birdLeft + birdWidth && pipe.x + PIPE_WIDTH > birdLeft;

            if (overlapsX) {
              const blockTop = (pipe.blockTop ?? 0) * containerHeight;
              const blockBottom = (pipe.blockBottom ?? 0) * containerHeight;

              const inA = birdBottom <= blockTop;
              const inB = birdTop >= blockBottom;

              if (!inA && !inB) {
                // Голын block-д мөргөсөн
                pausedRef.current = true;
                diedBird();
                break;
              }

              const correctIsA = !!pipe.correctIsA;
              const inWrong = (inA && !correctIsA) || (inB && correctIsA);

              if (inWrong) {
                // Буруу хариулт руу орсон
                pausedRef.current = true;
                diedBird();
                break;
              }
            } else if (pipe.x + PIPE_WIDTH < birdLeft) {
              // Зөв нүхээр бүрэн нэвтэрсэн — асуултыг давлаа
              pipe.resolved = true;
              handleQuestionPassed();
            }

            continue;
          }

          // === NORMAL PIPE ===
          const overlapsX = pipe.x < birdLeft + birdWidth && pipe.x + PIPE_WIDTH > birdLeft;

          if (!overlapsX) {
            continue;
          }

          const gapHeight = containerHeight * PIPE_GAP_HEIGHT_RATIO;

          const gapCenter = containerHeight * pipe.gapCenterRatio;

          const gapTop = gapCenter - gapHeight / 2;
          const gapBottom = gapCenter + gapHeight / 2;

          if (birdTop < gapTop || birdBottom > gapBottom) {
            pausedRef.current = true;
            diedBird();
            break;
          }
        }
      }

      birdAnimationRef.current = requestAnimationFrame(jumpBird);
    },
    [diedBird, handleQuestionPassed],
  );

  const starter = useCallback(() => {
    const current = secondsRef.current;

    if (typeof current === 'number' && current > 1) {
      const next = current - 1;

      secondsRef.current = next;
      setSecondsStart(next);

      return;
    }

    secondsRef.current = 'УРАГШАА!!';
    setSecondsStart('УРАГШАА!!');

    clearIntervalRef(startTimerRef);

    countdownTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;

      gameStartTimeRef.current = performance.now();
      bgLastFrameRef.current = null;
      birdLastFrameRef.current = null;
      birdVelocityRef.current = 0;

      setLesson((prev) => ({
        ...prev,
        start: true,
      }));

      lessonRef.current = {
        ...lessonRef.current,
        start: true,
      };

      secondsRef.current = 3;
      setSecondsStart(3);
    }, 1000);
  }, []);

  const startGame = useCallback(() => {
    setLesson((prev) => ({
      ...prev,
      startBtn: true,
    }));

    lessonRef.current = {
      ...lessonRef.current,
      startBtn: true,
    };

    playSound(soundsRef.current.going);

    clearIntervalRef(startTimerRef);

    startTimerRef.current = window.setInterval(starter, 1000);
  }, [playSound, starter]);

  const resetParams = useCallback(() => {
    clearGameTimers();

    const newLesson: Lesson = {
      ...lessonRef.current,
      start: false,
      startBtn: false,
      finish: false,
      won: false,
    };

    setFinishStats({ timePassed: 0, score: 0 });

    scrolledRef.current = 0;
    levelDistanceRef.current = null;
    bgLastFrameRef.current = null;
    birdLastFrameRef.current = null;
    birdVelocityRef.current = 0;
    birdRotationRef.current = 0;
    gameStartTimeRef.current = 0;

    // Багануудыг бүрэн цэвэрлэнэ.
    pipesDataRef.current = [];
    pipeNodesRef.current = {};
    distanceSincePipeRef.current = 0;
    pipeSpawnCountRef.current = 0;
    setPipes([]);

    // Асуултын төлөвийг бүрэн цэвэрлэнэ.
    questionIndexRef.current = 0;
    questionsAnsweredRef.current = 0;
    pendingAnswerPipeIdRef.current = null;
    questionTriggerSpawnIndexRef.current = [];
    distanceAfterLastQuestionRef.current = null;
    setActiveQuestion(null);
    setActiveAnswerBanner(null);

    setBirdLive(3);
    birdStateRef.current.live = 3;

    secondsRef.current = 3;
    setSecondsStart(3);

    setLesson(newLesson);
    lessonRef.current = newLesson;

    pausedRef.current = true;

    birdYRef.current = birdStateRef.current.originalY;

    if (birdRef.current) {
      birdRef.current.style.opacity = '1';

      birdRef.current.style.top = `${birdStateRef.current.originalY}px`;

      birdRef.current.style.transform = 'rotate(0deg)';

      birdRef.current.src = birdImage;

      birdRef.current.classList.remove('blink');
    }

    if (liveRef.current) {
      liveRef.current.src = live3Image;
    }

    if (backgroundRef.current) {
      backgroundRef.current.style.transform = 'translateX(0)';
    }
  }, [clearGameTimers]);

  const restartGame = useCallback(() => {
    resetParams();

    window.setTimeout(() => {
      startGame();
    }, 0);
  }, [resetParams, startGame]);

  const getNextLesson = useCallback(() => {
    navigate('/subjects');
  }, [navigate]);

  useEffect(() => {
    soundsRef.current = {
      flap: new Audio(flapSound),
      die: new Audio(dieSound),
      going: new Audio(goingSound),
    };

    const bird = birdRef.current;

    if (bird) {
      const initialY = bird.offsetTop;

      birdYRef.current = initialY;

      birdStateRef.current.originalY = initialY;
    }

    pausedRef.current = true;

    bgAnimationRef.current = requestAnimationFrame(bgPosition);

    birdAnimationRef.current = requestAnimationFrame(jumpBird);

    return () => {
      clearGameTimers();

      if (bgAnimationRef.current !== null) {
        cancelAnimationFrame(bgAnimationRef.current);

        bgAnimationRef.current = null;
      }

      if (birdAnimationRef.current !== null) {
        cancelAnimationFrame(birdAnimationRef.current);

        birdAnimationRef.current = null;
      }

      const sounds = soundsRef.current;

      sounds.flap?.pause();
      sounds.die?.pause();
      sounds.going?.pause();
    };
  }, [bgPosition, jumpBird, clearGameTimers]);

  return (
    <div>
      <div
        className="floppy"
        ref={containerRef}
        onPointerDown={handleTap}
        style={{ touchAction: 'none', position: 'relative' }}
      >
        {/* BACKGROUND */}
        <img src={bgImage} alt="bg-image" ref={backgroundRef} className="background-img" />

        {/* PIPES */}
        {pipes.map((pipe) => {
          if (pipe.type === 'answer') {
            const blockTop = pipe.blockTop ?? 0;
            const blockBottom = pipe.blockBottom ?? 0;

            const tagStyle: React.CSSProperties = {
              position: 'absolute',
              left: 0,
              width: `${PIPE_WIDTH}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              pointerEvents: 'none',
            };

            // A/B тойрог badge-ийн оронд бодит хариултын ТЕКСТ-ийг харуулна.
            const answerTextStyle: React.CSSProperties = {
              background: 'rgba(255,255,255,0.92)',
              color: '#000',
              fontWeight: 700,
              borderRadius: 10,
              padding: '6px 10px',
              fontSize: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
            };

            return (
              <React.Fragment key={pipe.id}>
                {/* ДЭЭД нээлттэй зайн хариулт */}
                <div
                  ref={(el) => setPipeNode(pipe.id, 'tagA', el)}
                  style={{
                    ...tagStyle,
                    top: 0,
                    height: `${blockTop * 100}%`,
                  }}
                >
                  <span style={answerTextStyle}>{pipe.topText}</span>
                </div>

                {/* ГАНЦХАН BLOCK — голд нь */}
                <div
                  ref={(el) => setPipeNode(pipe.id, 'block', el)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: `${blockTop * 100}%`,
                    height: `${(blockBottom - blockTop) * 100}%`,
                    width: `${PIPE_WIDTH}px`,
                    background: '#4CAF50',
                    border: '6px solid #2e7d32',
                    boxSizing: 'border-box',
                    zIndex: 2,
                  }}
                />

                {/* ДООД нээлттэй зайн хариулт */}
                <div
                  ref={(el) => setPipeNode(pipe.id, 'tagB', el)}
                  style={{
                    ...tagStyle,
                    top: `${blockBottom * 100}%`,
                    height: `${(1 - blockBottom) * 100}%`,
                  }}
                >
                  <span style={answerTextStyle}>{pipe.bottomText}</span>
                </div>
              </React.Fragment>
            );
          }

          const gapCenterRatio = pipe.gapCenterRatio ?? 0.5;

          return (
            <React.Fragment key={pipe.id}>
              <div
                ref={(el) => setPipeNode(pipe.id, 'top', el)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${PIPE_WIDTH}px`,
                  height: `calc(${gapCenterRatio * 100}% - ${(PIPE_GAP_HEIGHT_RATIO * 100) / 2}%)`,
                  background: '#4CAF50',
                  borderBottom: '6px solid #2e7d32',
                  zIndex: 2,
                }}
              />
              <div
                ref={(el) => setPipeNode(pipe.id, 'bottom', el)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: `calc(${gapCenterRatio * 100}% + ${(PIPE_GAP_HEIGHT_RATIO * 100) / 2}%)`,
                  bottom: 0,
                  width: `${PIPE_WIDTH}px`,
                  background: '#4CAF50',
                  borderTop: '6px solid #2e7d32',
                  zIndex: 2,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* BIRD */}
        <img
          src={birdImage}
          ref={birdRef}
          alt="bird-image"
          className="bird-img"
          style={{ transition: 'transform 0.15s ease-out', zIndex: 3 }}
        />

        {/* LIVES */}
        <img src={live3Image} ref={liveRef} alt="live" className="live-img" />

        {/* START BUTTON */}
        {!lesson.startBtn && (
          <div className="start-button">
            <div
              className="start"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
            >
              ЭХЛЭХ
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {!lesson.start && <div className="start-cont">{secondsStart}</div>}

        {/* TAP HINT */}
        {lesson.start && !lesson.finish && !activeQuestion && (
          <div className="tap-hint">Дэлгэц дээр товшиж нисээрэй!</div>
        )}

        {/* PERSISTENT ANSWER REMINDER BANNER (continue дарсны дараа) */}
        {activeAnswerBanner && (
          <div
            style={{
              position: 'absolute',
              top: '4%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              maxWidth: 420,
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              borderRadius: 12,
              padding: '8px 14px',
              zIndex: 15,
              textAlign: 'center',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 4,
                wordBreak: 'break-word',
              }}
            >
              {activeAnswerBanner.question}
            </div>
          </div>
        )}

        {/* QUESTION OVERLAY */}
        {activeQuestion && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              maxWidth: 420,
              background: 'rgba(0,0,0,0.88)',
              color: '#fff',
              borderRadius: 16,
              padding: '16px 20px',
              zIndex: 20,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Асуулт {activeQuestion.index + 1} / {TOTAL_QUESTIONS}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 12,
                wordBreak: 'break-word',
              }}
            >
              {activeQuestion.question.question}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                marginBottom: 14,
                flexWrap: 'wrap',
              }}
            ></div>

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                continueAfterQuestion();
              }}
              style={{
                background: '#FFC107',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              ҮРГЭЛЖЛҮҮЛЭХ
            </button>
          </div>
        )}

        {/* FINISH */}
        {lesson.finish && (
          <div className="start-button">
            {lesson.won ? (
              <div className="won">
                БАЯР ХҮРГЭЕ!
                <div className="stat">
                  <table>
                    <tbody>
                      <tr>
                        <td>{finishStats.timePassed} СЕКУНД</td>

                        <td>{finishStats.score} ОНОО</td>
                      </tr>

                      <tr>
                        <td colSpan={2} align="center">
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              restartGame();
                            }}
                            className="start"
                          >
                            ДАХИН ОРОЛДОХ
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="lose">
                ХОЖИГДЛОО!
                <div className="stat">
                  <table>
                    <tbody>
                      <tr>
                        <td>{finishStats.timePassed} СЕКУНД</td>

                        <td>{finishStats.score} ОНОО</td>
                      </tr>

                      <tr>
                        <td colSpan={2} align="center">
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              restartGame();
                            }}
                            className="start"
                          >
                            ДАХИН ОРОЛДОХ
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
