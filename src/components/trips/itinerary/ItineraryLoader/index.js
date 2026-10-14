"use client";

import { useEffect, useState } from "react";
import { Bus, Camera, Coffee, IceCreamCone, Landmark, MapPin, Plane, TrainFront, Utensils } from "lucide-react";
import { useI18n } from "@/context/i18n";

// What orbits around the wizard while the AI plans the trip
const ORBIT_ICONS = [Plane, Utensils, TrainFront, Camera, IceCreamCone, Bus, Landmark, Coffee, MapPin];
const ORBIT_RADIUS = 104; // px, from the centre of the 16rem stage
const PHRASE_MS = 2600;

// Wizard colours: Lowfly's palette (coral hat, sea robe, sun gold, cream beard), from the theme variables,
// so he follows the light and dark themes like the rest of the app
const WIZARD = {
  robe: "var(--sea)",
  robeDark: "color-mix(in oklab, var(--sea) 72%, black)",
  hat: "var(--primary)",
  hatDark: "color-mix(in oklab, var(--primary) 78%, black)",
  gold: "var(--sun)",
  skin: "oklch(0.86 0.055 60)",
  skinDark: "oklch(0.78 0.07 50)",
  cheek: "var(--primary)",
  beard: "oklch(0.97 0.012 85)",
  beardShade: "oklch(0.86 0.02 85)",
  eye: "oklch(0.23 0.035 245)",
  wood: "color-mix(in oklab, var(--sun) 35%, oklch(0.4 0.06 50))",
};

// A friendly, elegant wizard waving his wand (an illustration in SVG, animated from globals.css)
function Wizard() {
  const c = WIZARD;
  return (
    // overflow-visible: at the top of its wave the wand's star leaves the 160-wide viewBox
    <svg viewBox="0 0 160 180" className="loader-bob h-40 w-36 overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="wizard-robe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.robe} />
          <stop offset="1" stopColor={c.robeDark} />
        </linearGradient>
        <linearGradient id="wizard-hat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.hatDark} />
          <stop offset="0.45" stopColor={c.hat} />
          <stop offset="1" stopColor={c.hat} />
        </linearGradient>
        <radialGradient id="wizard-glow">
          <stop offset="0" stopColor={c.gold} stopOpacity="0.9" />
          <stop offset="1" stopColor={c.gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="173" rx="42" ry="5" fill="currentColor" opacity="0.12" />

      {/* Robe, with its shaded side and golden hem */}
      <path d="M52 100 C49 126 41 150 34 170 Q80 178 126 170 C119 150 111 126 108 100 Q80 92 52 100 Z" fill="url(#wizard-robe)" />
      <path d="M52 100 C49 126 41 150 34 170 Q52 174 66 175 C62 150 61 124 64 98 Z" fill={c.robeDark} opacity="0.55" />
      <path d="M34 170 Q80 178 126 170" fill="none" stroke={c.gold} strokeWidth="3" strokeLinecap="round" />
      <path d="M47 160 l1.4 3 3 .4 -2.2 2 .6 3 -2.8 -1.5 -2.8 1.5 .6 -3 -2.2 -2 3 -.4 z" fill={c.gold} opacity="0.9" />
      <path d="M113 150 l1.1 2.4 2.5 .3 -1.8 1.7 .5 2.5 -2.3 -1.3 -2.3 1.3 .5 -2.5 -1.8 -1.7 2.5 -.3 z" fill={c.gold} opacity="0.8" />

      {/* Arm hanging on the left */}
      <path d="M54 104 C44 116 39 130 40 145 L51 146 C51 132 55 120 62 110 Z" fill={c.robeDark} />
      <path d="M40 145 L51 146" stroke={c.gold} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="45.5" cy="150" r="5" fill={c.skin} />

      {/* Face */}
      <circle cx="80" cy="88" r="15" fill={c.skin} />
      <circle cx="70.5" cy="93" r="3.2" fill={c.cheek} opacity="0.3" />
      <circle cx="89.5" cy="93" r="3.2" fill={c.cheek} opacity="0.3" />
      <ellipse className="loader-blink" cx="74" cy="87" rx="1.8" ry="2.3" fill={c.eye} />
      <ellipse className="loader-blink" cx="86" cy="87" rx="1.8" ry="2.3" fill={c.eye} />

      {/* Long wavy beard with soft shading */}
      <path
        d="M64 92 C60 106 61 124 70 138 C74 145 77 150 80 158 C83 150 87 145 91 138 C100 124 100 106 96 92 C90 101 70 101 64 92 Z"
        fill={c.beard}
      />
      <path d="M72 104 C70 116 73 128 79 140 M86 106 C88 118 86 128 82 138 M79 110 C78 122 80 132 80 146" fill="none" stroke={c.beardShade} strokeWidth="1.6" strokeLinecap="round" />
      {/* Moustache and nose */}
      <path d="M68 96 C72 91 77 92 80 95 C83 92 88 91 92 96 C88 99.5 83 99 80 96.5 C77 99 72 99.5 68 96 Z" fill={c.beard} stroke={c.beardShade} strokeWidth="0.8" />
      <ellipse cx="80" cy="92" rx="3.6" ry="3.2" fill={c.skinDark} />
      {/* Bushy eyebrows */}
      <path d="M68 82 Q73 78.5 78 82 Q73 83.5 68 82 Z M82 82 Q87 78.5 92 82 Q87 83.5 82 82 Z" fill={c.beard} />

      {/* Hat: brim, bent cone, golden band, moon and stars */}
      <ellipse cx="80" cy="75" rx="35" ry="7.5" fill={c.hatDark} />
      <path d="M55 74 C61 58 66 42 70 28 C73 16 84 6 102 4 C93 11 89 19 89 29 C90 45 98 60 106 74 Q80 80 55 74 Z" fill="url(#wizard-hat)" />
      <path d="M57 68 Q80 74 103 68 L105.5 73.5 Q80 80 54.5 73.5 Z" fill={c.gold} />
      <path d="M88 32 a7 7 0 1 0 6 10 a5.6 5.6 0 1 1 -6 -10 z" fill={c.gold} />
      <path d="M72 50 l1.6 3.4 3.7 .5 -2.7 2.6 .7 3.7 -3.3 -1.8 -3.3 1.8 .7 -3.7 -2.7 -2.6 3.7 -.5 z" fill={c.gold} />
      <circle cx="80" cy="22" r="1.4" fill={c.gold} />
      <circle cx="94" cy="58" r="1.2" fill={c.gold} />

      {/* Raised arm holding the wand */}
      <path d="M104 102 C115 99 123 93 129 85 L137 92 C129 103 119 110 108 114 Z" fill="url(#wizard-robe)" />
      <path d="M129 85 L137 92" stroke={c.gold} strokeWidth="2.4" strokeLinecap="round" />
      <g className="loader-wand">
        <circle cx="151" cy="50" r="11" fill="url(#wizard-glow)" />
        <path d="M134 88 L150 54" stroke={c.wood} strokeWidth="3.6" strokeLinecap="round" />
        <path d="M151 41 l2.2 5.2 5.6 .6 -4.2 3.8 1.2 5.5 -4.8 -2.9 -4.8 2.9 1.2 -5.5 -4.2 -3.8 5.6 -.6 z" fill={c.gold} />
      </g>
      <circle cx="134.5" cy="88" r="5.5" fill={c.skin} />

      {/* Sparkles from the wand */}
      <path className="loader-twinkle" d="M140 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" fill={c.gold} />
      <path className="loader-twinkle [animation-delay:.5s]" d="M126 44 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 z" fill={c.hat} />
      <path className="loader-twinkle [animation-delay:1s]" d="M156 70 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 z" fill={c.gold} />
    </svg>
  );
}

// Elapsed seconds as m:ss (1:05)
const minutesAndSeconds = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// While the AI creates the itinerary: the wizard, travel icons orbiting around him, playful travel phrases
// that change every few seconds, and how long it usually takes with the time so far (so nobody gives up)
export default function ItineraryLoader() {
  const { t } = useI18n();
  const phrases = t.trips.loaderPhrases;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPhraseIndex((index) => (index + 1) % phrases.length), PHRASE_MS);
    return () => clearInterval(timer);
  }, [phrases.length]);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      role="status"
      aria-live="polite"
      className="grid justify-items-center gap-4 rounded-xl bg-card px-5 py-8 text-center ring-1 ring-foreground/10 sm:py-10"
    >
      <div className="relative grid size-64 place-items-center">
        {/* Dashed orbit and the icons on it, kept upright while the ring turns */}
        <div aria-hidden className="absolute inset-[22px] rounded-full border-2 border-dashed border-muted-foreground/20" />
        <div aria-hidden className="loader-orbit absolute inset-0">
          {ORBIT_ICONS.map((Icon, index) => {
            const angle = (360 / ORBIT_ICONS.length) * index;
            return (
              <span
                key={index}
                className="absolute top-1/2 left-1/2 -mt-5 -ml-5"
                style={{ transform: `rotate(${angle}deg) translateY(-${ORBIT_RADIUS}px) rotate(-${angle}deg)` }}
              >
                <span className="loader-upright grid size-10 place-items-center rounded-full bg-background text-primary-ink shadow-sm ring-1 ring-foreground/10">
                  <Icon className="size-5" />
                </span>
              </span>
            );
          })}
        </div>
        <Wizard />
      </div>

      <div className="grid gap-1">
        <p className="font-heading text-lg font-bold">{t.trips.loaderTitle}</p>
        <p key={phraseIndex} className="min-h-6 text-muted-foreground duration-500 animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
          {phrases[phraseIndex]}
        </p>
      </div>

      {/* A quiet footnote, so the phrases above keep the spotlight. The time is not announced every second
          to screen readers: the section is already a live region */}
      <div className="grid gap-0.5 text-xs text-muted-foreground/70">
        <p>
          {t.trips.loaderWait}
          <span aria-hidden className="tabular-nums"> · {t.trips.loaderElapsed(minutesAndSeconds(elapsedSeconds))}</span>
        </p>
        <p>{t.trips.loaderKeepOpen}</p>
      </div>
    </section>
  );
}
