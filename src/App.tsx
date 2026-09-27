import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, Calendar, MapPin, Volume2, VolumeX } from "lucide-react";
import "./App.css";

// Wedding date: 20 Dec 2026, 10:30 AM IST (05:00 UTC)
const WEDDING_TIMESTAMP = Date.UTC(2026, 11, 20, 5, 0, 0);
const VENUE_NAME = "SRS Convention Hall";
const VENUE_ADDRESS =
  "Mecdans Road, Near Meera Mohiddin Darga, Kotamitta, Nellore";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=SRS%20Convention%20Hall%20Kotamitta%20Nellore";

// Fade-in on scroll section helper
interface FadeSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}

const FadeSection: React.FC<FadeSectionProps> = ({
  children,
  delay = 0,
  className = "",
  id,
}) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Traditional Ornate Flourish Divider
const OrnateFlourish: React.FC = () => {
  return (
    <div className="divider-flourish">
      <span className="divider-line-left" />
      <svg
        width="34"
        height="14"
        viewBox="0 0 34 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M17 1c3 0 4 5 8 5s7-2 8-1c-2 4-6 6-9 5-3-1-4-4-7-4s-4 3-7 4c-3 1-7-1-9-5 1-1 4 1 8 1s5-5 8-5Z"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      </svg>
      <span className="divider-line-right" />
    </div>
  );
};

// Hanging Golden Lantern with subtle pendulum swinging motion
interface LanternProps {
  className?: string;
  swing?: number;
}

const Lantern: React.FC<LanternProps> = ({ className = "", swing = 0 }) => {
  return (
    <motion.svg
      className={className}
      width="46"
      height="120"
      viewBox="0 0 46 120"
      fill="none"
      aria-hidden="true"
      style={{ originY: 0, originX: 0.5 }}
      animate={{ rotate: [-3, 3, -3] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: swing,
      }}
    >
      <path d="M23 0v26" stroke="currentColor" strokeWidth="1" />
      <path d="M14 30h18l-3-4H17l-3 4Z" stroke="currentColor" strokeWidth="1" />
      <path
        d="M13 32h20c3 8 3 28 0 36H13c-3-8-3-28 0-36Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M19 38v24M27 38v24M13 50h20"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <path
        d="M17 70h12l-2 6h-8l-2-6ZM23 76v8"
        stroke="currentColor"
        strokeWidth="1"
      />
    </motion.svg>
  );
};

// Scratch Card Component with Canvas Gold Foil and Scratch Interaction
interface ScratchCardProps {
  onDone: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDoneRef = useRef(false);
  const isScratchingRef = useRef(false);

  const drawFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#d9b871");
    gradient.addColorStop(0.35, "#b8913f");
    gradient.addColorStop(0.6, "#efdca9");
    gradient.addColorStop(1, "#a97f33");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    for (let x = -height; x < width; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
  }, []);

  const triggerReveal = useCallback(() => {
    if (isDoneRef.current) return;
    isDoneRef.current = true;

    // Burst golden celebration confetti!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#d4af37", "#e6c875", "#a83232", "#f3e5ab"],
      });
    } catch {
      // ignore if confetti fails
    }

    onDone();
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      drawFoil();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFoil]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2, false);
    ctx.fill();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isScratchingRef.current = true;
    scratchAt(e.clientX, e.clientY);
    triggerReveal();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isScratchingRef.current = false;
  };

  return (
    <div className="absolute inset-0 z-20">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-pointer touch-none rounded-[inherit]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p
          className="font-arabic text-xl sm:text-2xl font-bold text-[oklch(0.26_0.07_25)] leading-[2.2] pb-1"
          dir="rtl"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="mt-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.35em] font-semibold text-[oklch(0.3_0.06_28)] font-body">
          Bismillah · In the name of Allah
        </p>
        <p className="font-display text-4xl sm:text-5xl font-bold leading-tight text-[oklch(0.26_0.07_25)] mt-1">
          Wedding Invitation
        </p>
        <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-[oklch(0.3_0.06_28)] font-body">
          You are cordially invited
        </p>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="mt-2 text-[oklch(0.28_0.06_28)]"
        >
          <svg
            width="52"
            height="40"
            viewBox="0 0 52 40"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="50"
              height="38"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M1 3l25 19L51 3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </motion.div>

        <p className="text-base sm:text-lg uppercase tracking-[0.25em] font-semibold text-[oklch(0.26_0.06_28)] font-body">
          Scratch to reveal
        </p>
        <p className="text-sm font-serif italic text-[oklch(0.3_0.06_28)] font-medium">
          one touch opens the invitation
        </p>
      </div>
    </div>
  );
};

// Countdown Timer with tabular numbers
const Countdown: React.FC = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, WEDDING_TIMESTAMP - now);
  const totalSeconds = Math.floor(diff / 1000);

  const units = [
    { label: "Days", value: Math.floor(totalSeconds / 86400) },
    { label: "Hours", value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((totalSeconds % 3600) / 60) },
    { label: "Seconds", value: totalSeconds % 60 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="ornate-frame rounded-2xl bg-card px-1 py-4 text-center sm:px-3 sm:py-6"
        >
          <div className="font-display font-bold text-2xl sm:text-4xl text-maroon tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="mt-1 font-body text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// December 2026 Calendar Grid
const CalendarWidget: React.FC = () => {
  // December 2026 starts on Tuesday (2 blank spaces: Sun, Mon)
  const calendarDays = useMemo(() => {
    return [...[null, null], ...Array.from({ length: 31 }, (_, i) => i + 1)];
  }, []);

  return (
    <div className="ornate-frame mx-auto max-w-sm rounded-3xl bg-card p-5">
      <p className="text-center font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
        December 2026
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <span key={idx} className="font-body text-[0.65rem] text-gold">
            {day}
          </span>
        ))}

        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <span key={`empty-${idx}`} />;
          }

          const isNikkah = day === 20;
          const isHaldi = day === 19;

          return (
            <div
              key={day}
              className="relative flex h-9 items-center justify-center"
            >
              {isNikkah && (
                <motion.span
                  className="calendar-halo"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span
                className={`calendar-day-circle ${
                  isNikkah
                    ? "calendar-day-nikkah"
                    : isHaldi
                      ? "calendar-day-haldi"
                      : "calendar-day-normal"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-4 font-body text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1">
          <i
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: "1.5px solid var(--gold)",
            }}
          />
          Haldi · 19
        </span>
        <span className="flex items-center gap-1">
          <i
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
            }}
          />
          Nikkah · 20
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const [revealed, setRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNasheed = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio("/nasheed.m4a");
      audio.loop = false; // Only play one time
      audio.volume = 0.15; // Low soft background volume
      audio.addEventListener("ended", () => {
        setIsAudioPlaying(false);
      });
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    audio.loop = false;
    audio.volume = 0.15;
    audio
      .play()
      .then(() => {
        setIsAudioPlaying(true);
      })
      .catch((err) => {
        console.log("Audio waiting for user gesture:", err);
      });
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) {
      playNasheed();
      return;
    }
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.volume = 0.15;
      audioRef.current.loop = false;
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current
        .play()
        .then(() => setIsAudioPlaying(true))
        .catch(() => {});
    }
  };

  const handleReveal = useCallback(() => {
    setIsRevealing(true);
    playNasheed();
    window.setTimeout(() => setRevealed(true), 900);
  }, [playNasheed]);

  const handleResetCard = () => {
    setRevealed(false);
    setIsRevealing(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Block page scrolling until the scratch card is revealed
  useEffect(() => {
    if (!revealed) {
      document.documentElement.classList.add("scroll-locked");
      document.body.classList.add("scroll-locked");

      const preventWheel = (e: WheelEvent) => {
        e.preventDefault();
      };

      const preventTouchMove = (e: TouchEvent) => {
        // Allow canvas scratching gestures to be handled natively with touch-action: none
        if ((e.target as HTMLElement)?.tagName?.toLowerCase() === "canvas") {
          return;
        }
        if (e.cancelable) {
          e.preventDefault();
        }
      };

      const preventKeyScroll = (e: KeyboardEvent) => {
        if (
          [
            "Space",
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
          ].includes(e.code)
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventWheel, { passive: false });
      window.addEventListener("touchmove", preventTouchMove, {
        passive: false,
      });
      window.addEventListener("keydown", preventKeyScroll);

      return () => {
        document.documentElement.classList.remove("scroll-locked");
        document.body.classList.remove("scroll-locked");
        window.removeEventListener("wheel", preventWheel);
        window.removeEventListener("touchmove", preventTouchMove);
        window.removeEventListener("keydown", preventKeyScroll);
      };
    } else {
      document.documentElement.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");
    }
  }, [revealed]);

  const handleAddToCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Juveriya-Azeez//Wedding//EN",
      "BEGIN:VEVENT",
      "UID:nikkah-20122026@juveriya-azeez",
      "DTSTAMP:20260101T000000Z",
      "DTSTART:20261220T050000Z",
      "DTEND:20261220T060000Z",
      "SUMMARY:Nikkah - Shaik Juveriya weds Azeez",
      `LOCATION:${VENUE_ADDRESS.replace(/,/g, "\\,")}`,
      "DESCRIPTION:Nikkah 10:30 AM - 11:30 AM\\nLunch at 12:00 Noon",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nikkah-20-dec-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Repeating Arabesque Geometric Watermark Pattern */}
      <div
        className="pointer-events-none fixed inset-0 arabesque-bg opacity-40"
        aria-hidden="true"
      />

      {/* Floating Controls: Audio & Scratch Reset */}
      {revealed && (
        <button
          onClick={toggleAudio}
          className="floating-audio-btn"
          title={isAudioPlaying ? "Mute nasheed" : "Play nasheed"}
          aria-label={
            isAudioPlaying
              ? "Mute background nasheed"
              : "Play background nasheed"
          }
        >
          {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{isAudioPlaying ? "Nasheed Playing" : "Muted"}</span>
        </button>
      )}

      {revealed && (
        <button
          onClick={handleResetCard}
          className="reset-scratch-btn"
          title="Scratch card again"
          aria-label="Scratch card again"
        >
          <RotateCcw size={14} />
          <span>Scratch Again</span>
        </button>
      )}

      {/* HERO SECTION: Scratch Card / Revealed Invitation */}
      <section className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8 sm:py-14">
        {/* Hanging Golden Lanterns */}
        <div className="pointer-events-none absolute top-0 left-2 text-gold/70">
          <Lantern />
        </div>
        <div className="pointer-events-none absolute top-0 right-2 text-gold/70">
          <Lantern swing={1.2} />
        </div>

        {/* The Card Container */}
        <div className="relative w-full">
          <div className="ornate-frame relative overflow-hidden rounded-[2rem] bg-card px-6 py-12 text-center sm:px-10 sm:py-16">
            <p
              className="font-arabic text-2xl sm:text-3xl font-bold text-maroon leading-[2.2] pb-1"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>

            <p className="mt-3 sm:mt-4 font-body text-xs sm:text-sm uppercase tracking-[0.3em] text-gold font-medium">
              Bismillah · In the name of Allah
            </p>
            <div className="my-2">
              <OrnateFlourish />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
              Wedding Invitation
            </p>

            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight text-maroon">
              Juveriya
            </h1>
            <p className="my-2 font-serif italic text-base sm:text-lg text-gold font-semibold">
              weds
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-maroon">
              Azeez
            </h1>

            <OrnateFlourish />

            {/* Gold Metallic Scratch Card Overlay */}
            <AnimatePresence>
              {!revealed && (
                <motion.div
                  className="absolute inset-0 rounded-[2rem]"
                  animate={isRevealing ? { opacity: 0 } : { opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                >
                  <ScratchCard onDone={handleReveal} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll Indicator (shown once revealed) */}
        {revealed && (
          <motion.a
            href="#countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="scroll-indicator"
          >
            <span>Scroll for Date &amp; Venue</span>
            <motion.svg
              width="22"
              height="34"
              viewBox="0 0 22 34"
              fill="none"
              aria-hidden="true"
              className="text-gold"
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <rect
                x="1"
                y="1"
                width="20"
                height="32"
                rx="10"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <motion.circle
                cx="11"
                cy="10"
                r="2.4"
                fill="currentColor"
                animate={{ cy: [9, 20, 9], opacity: [1, 0.2, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.svg>
          </motion.a>
        )}
      </section>

      {/* Formal Invitation Solicitations */}
      <FadeSection className="relative mx-auto max-w-2xl px-4 py-8">
        <div className="ornate-frame rounded-3xl bg-card p-7 text-center">
          <p
            className="font-arabic text-2xl sm:text-3xl font-bold text-maroon leading-[2.2] pb-1"
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <p className="mt-3 sm:mt-4 font-body text-xs sm:text-sm uppercase tracking-[0.3em] text-gold font-medium">
            Bismillah · In the name of Allah
          </p>
          <div className="my-3">
            <OrnateFlourish />
          </div>
          <p className="font-body text-sm sm:text-base text-foreground/80 leading-relaxed font-normal">
            Mr. Shaik Chand Basha & Mrs. Arifa solicit your gracious presence
            with family and friends on the auspicious occasion of the marriage
            of their daughter
          </p>
          <p className="mt-4 font-display text-xl sm:text-2xl font-bold text-maroon">
            Noor-E-Chashmi · Shaik Juveriya, B.Sc.
          </p>
          <p className="mt-3 font-body text-xs uppercase tracking-[0.3em] font-semibold text-gold">
            with
          </p>
          <p className="mt-3 font-display text-xl sm:text-2xl font-bold text-maroon">
            Barkhurdar Shaik Azeez, BBA
          </p>
          <p className="mt-2 font-body text-sm font-medium text-foreground/80">
            Procurement & Admin Executive
          </p>
          <p className="mt-1 font-body text-xs sm:text-sm text-muted-foreground font-medium">
            Trans Ocean Maritime Services LLC, Oman
          </p>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            Eldest son of Mr. Shaik Ameerjaani & Mrs. Thajunnisha.
          </p>
        </div>
      </FadeSection>

      {/* THE CELEBRATIONS SECTION */}
      <FadeSection
        id="celebrations"
        className="relative mx-auto max-w-2xl px-4 py-12"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-maroon">
            The celebrations
          </h2>
          <OrnateFlourish />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {/* Haldi Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="ornate-frame h-full rounded-3xl bg-card p-7 text-center"
          >
            <div className="text-3xl text-gold">✿</div>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-maroon">
              Haldi
            </h3>
            <p className="mt-2 font-serif text-base font-medium text-foreground/90">
              Saturday, 19 December 2026
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              An evening of colour & blessings
            </p>
          </motion.div>

          {/* Nikkah Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="ornate-frame h-full rounded-3xl bg-card p-7 text-center"
          >
            <div className="text-3xl text-gold">☾</div>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-maroon">
              Nikkah
            </h3>
            <p className="mt-2 font-serif text-base font-medium text-foreground/90">
              Sunday, 20 December 2026
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              10:30 AM – 11:30 AM · Lunch at 12:00 Noon
            </p>
          </motion.div>
        </div>
      </FadeSection>

      {/* THE VENUE SECTION */}
      <FadeSection id="venue" className="relative mx-auto max-w-2xl px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-maroon">
            The venue
          </h2>
          <OrnateFlourish />
        </div>

        <div className="mt-6">
          <div className="ornate-frame rounded-3xl bg-card p-8 text-center">
            <p className="font-display text-2xl sm:text-3xl font-bold text-maroon">
              {VENUE_NAME}
            </p>
            <p className="mt-3 font-body text-sm sm:text-base text-foreground/80 leading-relaxed">
              Mecdans Road, Near Meera Mohiddin Darga,
              <br />
              Kotamitta, Nellore
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6"
            >
              <MapPin size={14} style={{ marginRight: "6px" }} />
              Get directions
            </a>
          </div>
        </div>
      </FadeSection>

      {/* SEARCH / SAVE THE DATE CALENDAR SECTION */}
      <FadeSection
        id="calendar"
        className="relative mx-auto max-w-2xl px-4 py-12"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-maroon">
            Search the date
          </h2>
          <OrnateFlourish />
        </div>
        <div className="mt-6">
          <CalendarWidget />
        </div>
      </FadeSection>

      {/* COUNTING THE MOMENTS (COUNTDOWN) SECTION */}
      <FadeSection
        id="countdown"
        className="relative mx-auto max-w-2xl px-4 py-12"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-maroon">
            Counting the moments
          </h2>
          <OrnateFlourish />
        </div>

        <div className="mt-6">
          <Countdown />
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={handleAddToCalendar} className="btn-primary">
            <Calendar size={14} style={{ marginRight: "6px" }} />
            Add to calendar
          </button>
        </div>
      </FadeSection>

      {/* FOOTER SECTION */}
      <footer className="relative mx-auto max-w-2xl px-4 pt-8 pb-16 text-center">
        <OrnateFlourish />
        <p className="mt-4 font-body text-xs uppercase tracking-[0.3em] text-gold font-semibold">
          With best compliments from
        </p>
        <p className="mt-3 font-serif text-lg sm:text-xl font-medium text-maroon">
          Brother: Shaik Akbar, MBA
        </p>
        <p className="mt-8 font-serif text-base sm:text-lg italic text-foreground/80">
          Your presence and duas will make our joy complete.
        </p>
        <p className="mt-6 font-display text-3xl sm:text-4xl font-bold text-gold">
          Juveriya & Azeez
        </p>
      </footer>
    </main>
  );
}
