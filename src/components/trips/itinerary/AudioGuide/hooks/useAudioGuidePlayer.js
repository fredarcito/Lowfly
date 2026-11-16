"use client";

import { useEffect, useRef, useState } from "react";
import { apiError, isCancelled } from "@/api/client";
import { getAudioGuide } from "@/api/audioGuide";
import { useI18n } from "@/context/i18n";
import { audioGuideHintSeen, rememberAudioGuideHint } from "@/store/audioGuideHint";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

// One audio guide at a time for the whole itinerary: which place, its steps, the audio element playing them, and
// whether the sheet is open, folded into the mini player, or closed. Each step stops at its end (the visitor walks
// to the next spot and taps the step's button), unless the next one is heard from the same spot (`autoNext`).
export const useAudioGuidePlayer = () => {
  const { lang } = useI18n();
  const audioRef = useRef(null);
  const requestRef = useRef(null);
  const waitTimerRef = useRef(null);
  const latestRef = useRef({});

  const [place, setPlace] = useState(null); // { key, source, title, mapName, town, lat, lng }
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [guide, setGuide] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [view, setView] = useState("closed"); // closed | open | mini
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [ended, setEnded] = useState(false);
  const [waitingNext, setWaitingNext] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [listened, setListened] = useState([]); // keys of the guides heard to the end

  const audioElement = () => (audioRef.current ??= new Audio());

  const stopWaiting = () => {
    clearTimeout(waitTimerRef.current);
    setWaitingNext(false);
  };

  const loadStep = (index, autoplay, steps = guide?.steps) => {
    if (!steps?.[index]) return;
    const audio = audioElement();
    stopWaiting();
    audio.src = steps[index].audio;
    setStepIndex(index);
    setTime({ current: 0, duration: 0 });
    setEnded(false);
    if (autoplay) audio.play().catch(() => setPlaying(false));
  };

  const dismissHint = () => {
    setShowHint(false);
    rememberAudioGuideHint();
  };

  const fetchGuide = (nextPlace) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    setError(null);
    setGuide(null);
    getAudioGuide({ ...nextPlace, lang }, { signal: controller.signal })
      .then((answer) => {
        setGuide(answer);
        setStatus("ready");
        loadStep(0, false, answer.steps);
      })
      .catch((failure) => {
        if (isCancelled(failure)) return;
        setError(apiError(failure));
        setStatus("error");
      });
  };

  // A stop's "Audio guide" button: the same place opens again where it was; another one starts from its first step.
  // `key`: the place's article, or where it is when it has none (the server then looks for its article)
  const open = ({ key, source, title, mapName, town, lat, lng }) => {
    setView("open");
    if (place?.key === key && status !== "error") return;
    audioRef.current?.pause();
    const nextPlace = { key, source, place: title, mapName, title, town, lat, lng };
    setPlace(nextPlace);
    setShowHint(!audioGuideHintSeen());
    fetchGuide(nextPlace);
  };

  const retry = () => place && fetchGuide(place);

  const togglePlay = () => {
    const audio = audioElement();
    if (playing) {
      audio.pause();
      return;
    }
    stopWaiting();
    if (ended) {
      audio.currentTime = 0;
      setEnded(false);
    }
    if (showHint) dismissHint();
    audio.play().catch(() => setPlaying(false));
  };

  const goTo = (index) => loadStep(index, true);

  // The step's button ("Ya estoy dentro"): the next step, or on the last one the visit is over
  const advance = () => {
    if (!guide) return;
    if (stepIndex < guide.steps.length - 1) {
      goTo(stepIndex + 1);
      return;
    }
    audioRef.current?.pause();
    setListened((keys) => (keys.includes(place.key) ? keys : [...keys, place.key]));
    setView("closed");
    loadStep(0, false);
  };

  // Folding the sheet: the mini player stays while something is playing or half heard
  const collapse = () => {
    const started = playing || time.current > 0 || stepIndex > 0 || status === "loading";
    setView(started ? "mini" : "closed");
  };

  const close = () => {
    audioRef.current?.pause();
    requestRef.current?.abort();
    stopWaiting();
    setView("closed");
    setPlace(null);
    setGuide(null);
    setStatus("idle");
  };

  // What the audio element's events need, always current
  useEffect(() => {
    latestRef.current = { guide, stepIndex, loadStep };
  });

  // The audio element's events, once
  useEffect(() => {
    const audio = audioElement();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setTime({ current: audio.currentTime, duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      const { guide: current, stepIndex: index, loadStep: load } = latestRef.current;
      const step = current?.steps[index];
      if (step?.autoNext && index < current.steps.length - 1) {
        setWaitingNext(true);
        waitTimerRef.current = setTimeout(() => load(index + 1, true, current.steps), AUDIO_GUIDE.autoNextSeconds * 1000);
      }
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("ended", onEnded);
      clearTimeout(waitTimerRef.current);
      requestRef.current?.abort();
    };
  }, []);

  // The lock screen and headphones: the step's name, and play, pause and the steps before and after
  useEffect(() => {
    if (!guide || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const step = guide.steps[stepIndex];
    navigator.mediaSession.metadata = new MediaMetadata({ title: step.title, artist: guide.title, album: "Lowfly" });
    const { loadStep: load } = latestRef.current;
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("previoustrack", stepIndex > 0 ? () => load(stepIndex - 1, true, guide.steps) : null);
    navigator.mediaSession.setActionHandler("nexttrack", stepIndex < guide.steps.length - 1 ? () => load(stepIndex + 1, true, guide.steps) : null);
  }, [guide, stepIndex]);

  const step = guide?.steps[stepIndex] ?? null;
  const duration = time.duration || step?.seconds || 0;

  return {
    place,
    status,
    error,
    guide,
    step,
    stepIndex,
    view,
    playing,
    ended,
    waitingNext,
    showHint,
    current: time.current,
    duration,
    progress: duration ? Math.min(1, time.current / duration) : 0,
    isListened: (key) => listened.includes(key),
    open,
    retry,
    togglePlay,
    goTo,
    advance,
    collapse,
    close,
    expand: () => setView("open"),
    dismissHint,
    cancelWaiting: stopWaiting,
  };
};
