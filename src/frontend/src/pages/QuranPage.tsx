import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Heart,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Square,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetQuranSettings } from "../hooks/useQueries";

const SURAH_LIST = [
  { n: 1, name: "Al-Fatiha", arabic: "الفاتحة", ayahs: 7 },
  { n: 2, name: "Al-Baqarah", arabic: "البقرة", ayahs: 286 },
  { n: 3, name: "Ali 'Imran", arabic: "آل عمران", ayahs: 200 },
  { n: 4, name: "An-Nisa", arabic: "النساء", ayahs: 176 },
  { n: 5, name: "Al-Ma'idah", arabic: "المائدة", ayahs: 120 },
  { n: 6, name: "Al-An'am", arabic: "الأنعام", ayahs: 165 },
  { n: 7, name: "Al-A'raf", arabic: "الأعراف", ayahs: 206 },
  { n: 8, name: "Al-Anfal", arabic: "الأنفال", ayahs: 75 },
  { n: 9, name: "At-Tawbah", arabic: "التوبة", ayahs: 129 },
  { n: 10, name: "Yunus", arabic: "يونس", ayahs: 109 },
  { n: 11, name: "Hud", arabic: "هود", ayahs: 123 },
  { n: 12, name: "Yusuf", arabic: "يوسف", ayahs: 111 },
  { n: 13, name: "Ar-Ra'd", arabic: "الرعد", ayahs: 43 },
  { n: 14, name: "Ibrahim", arabic: "إبراهيم", ayahs: 52 },
  { n: 15, name: "Al-Hijr", arabic: "الحجر", ayahs: 99 },
  { n: 16, name: "An-Nahl", arabic: "النحل", ayahs: 128 },
  { n: 17, name: "Al-Isra", arabic: "الإسراء", ayahs: 111 },
  { n: 18, name: "Al-Kahf", arabic: "الكهف", ayahs: 110 },
  { n: 19, name: "Maryam", arabic: "مريم", ayahs: 98 },
  { n: 20, name: "Ta-Ha", arabic: "طه", ayahs: 135 },
  { n: 21, name: "Al-Anbiya", arabic: "الأنبياء", ayahs: 112 },
  { n: 22, name: "Al-Hajj", arabic: "الحج", ayahs: 78 },
  { n: 23, name: "Al-Mu'minun", arabic: "المؤمنون", ayahs: 118 },
  { n: 24, name: "An-Nur", arabic: "النور", ayahs: 64 },
  { n: 25, name: "Al-Furqan", arabic: "الفرقان", ayahs: 77 },
  { n: 26, name: "Ash-Shu'ara", arabic: "الشعراء", ayahs: 227 },
  { n: 27, name: "An-Naml", arabic: "النمل", ayahs: 93 },
  { n: 28, name: "Al-Qasas", arabic: "القصص", ayahs: 88 },
  { n: 29, name: "Al-Ankabut", arabic: "العنكبوت", ayahs: 69 },
  { n: 30, name: "Ar-Rum", arabic: "الروم", ayahs: 60 },
  { n: 31, name: "Luqman", arabic: "لقمان", ayahs: 34 },
  { n: 32, name: "As-Sajdah", arabic: "السجدة", ayahs: 30 },
  { n: 33, name: "Al-Ahzab", arabic: "الأحزاب", ayahs: 73 },
  { n: 34, name: "Saba", arabic: "سبأ", ayahs: 54 },
  { n: 35, name: "Fatir", arabic: "فاطر", ayahs: 45 },
  { n: 36, name: "Ya-Sin", arabic: "يس", ayahs: 83 },
  { n: 37, name: "As-Saffat", arabic: "الصافات", ayahs: 182 },
  { n: 38, name: "Sad", arabic: "ص", ayahs: 88 },
  { n: 39, name: "Az-Zumar", arabic: "الزمر", ayahs: 75 },
  { n: 40, name: "Ghafir", arabic: "غافر", ayahs: 85 },
  { n: 41, name: "Fussilat", arabic: "فصلت", ayahs: 54 },
  { n: 42, name: "Ash-Shura", arabic: "الشورى", ayahs: 53 },
  { n: 43, name: "Az-Zukhruf", arabic: "الزخرف", ayahs: 89 },
  { n: 44, name: "Ad-Dukhan", arabic: "الدخان", ayahs: 59 },
  { n: 45, name: "Al-Jathiyah", arabic: "الجاثية", ayahs: 37 },
  { n: 46, name: "Al-Ahqaf", arabic: "الأحقاف", ayahs: 35 },
  { n: 47, name: "Muhammad", arabic: "محمد", ayahs: 38 },
  { n: 48, name: "Al-Fath", arabic: "الفتح", ayahs: 29 },
  { n: 49, name: "Al-Hujurat", arabic: "الحجرات", ayahs: 18 },
  { n: 50, name: "Qaf", arabic: "ق", ayahs: 45 },
  { n: 51, name: "Adh-Dhariyat", arabic: "الذاريات", ayahs: 60 },
  { n: 52, name: "At-Tur", arabic: "الطور", ayahs: 49 },
  { n: 53, name: "An-Najm", arabic: "النجم", ayahs: 62 },
  { n: 54, name: "Al-Qamar", arabic: "القمر", ayahs: 55 },
  { n: 55, name: "Ar-Rahman", arabic: "الرحمن", ayahs: 78 },
  { n: 56, name: "Al-Waqi'ah", arabic: "الواقعة", ayahs: 96 },
  { n: 57, name: "Al-Hadid", arabic: "الحديد", ayahs: 29 },
  { n: 58, name: "Al-Mujadila", arabic: "المجادلة", ayahs: 22 },
  { n: 59, name: "Al-Hashr", arabic: "الحشر", ayahs: 24 },
  { n: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", ayahs: 13 },
  { n: 61, name: "As-Saf", arabic: "الصف", ayahs: 14 },
  { n: 62, name: "Al-Jumu'ah", arabic: "الجمعة", ayahs: 11 },
  { n: 63, name: "Al-Munafiqun", arabic: "المنافقون", ayahs: 11 },
  { n: 64, name: "At-Taghabun", arabic: "التغابن", ayahs: 18 },
  { n: 65, name: "At-Talaq", arabic: "الطلاق", ayahs: 12 },
  { n: 66, name: "At-Tahrim", arabic: "التحريم", ayahs: 12 },
  { n: 67, name: "Al-Mulk", arabic: "الملك", ayahs: 30 },
  { n: 68, name: "Al-Qalam", arabic: "القلم", ayahs: 52 },
  { n: 69, name: "Al-Haqqah", arabic: "الحاقة", ayahs: 52 },
  { n: 70, name: "Al-Ma'arij", arabic: "المعارج", ayahs: 44 },
  { n: 71, name: "Nuh", arabic: "نوح", ayahs: 28 },
  { n: 72, name: "Al-Jinn", arabic: "الجن", ayahs: 28 },
  { n: 73, name: "Al-Muzzammil", arabic: "المزمل", ayahs: 20 },
  { n: 74, name: "Al-Muddaththir", arabic: "المدثر", ayahs: 56 },
  { n: 75, name: "Al-Qiyamah", arabic: "القيامة", ayahs: 40 },
  { n: 76, name: "Al-Insan", arabic: "الإنسان", ayahs: 31 },
  { n: 77, name: "Al-Mursalat", arabic: "المرسلات", ayahs: 50 },
  { n: 78, name: "An-Naba", arabic: "النبأ", ayahs: 40 },
  { n: 79, name: "An-Nazi'at", arabic: "النازعات", ayahs: 46 },
  { n: 80, name: "Abasa", arabic: "عبس", ayahs: 42 },
  { n: 81, name: "At-Takwir", arabic: "التكوير", ayahs: 29 },
  { n: 82, name: "Al-Infitar", arabic: "الانفطار", ayahs: 19 },
  { n: 83, name: "Al-Mutaffifin", arabic: "المطففين", ayahs: 36 },
  { n: 84, name: "Al-Inshiqaq", arabic: "الانشقاق", ayahs: 25 },
  { n: 85, name: "Al-Buruj", arabic: "البروج", ayahs: 22 },
  { n: 86, name: "At-Tariq", arabic: "الطارق", ayahs: 17 },
  { n: 87, name: "Al-A'la", arabic: "الأعلى", ayahs: 19 },
  { n: 88, name: "Al-Ghashiyah", arabic: "الغاشية", ayahs: 26 },
  { n: 89, name: "Al-Fajr", arabic: "الفجر", ayahs: 30 },
  { n: 90, name: "Al-Balad", arabic: "البلد", ayahs: 20 },
  { n: 91, name: "Ash-Shams", arabic: "الشمس", ayahs: 15 },
  { n: 92, name: "Al-Layl", arabic: "الليل", ayahs: 21 },
  { n: 93, name: "Ad-Duha", arabic: "الضحى", ayahs: 11 },
  { n: 94, name: "Ash-Sharh", arabic: "الشرح", ayahs: 8 },
  { n: 95, name: "At-Tin", arabic: "التين", ayahs: 8 },
  { n: 96, name: "Al-Alaq", arabic: "العلق", ayahs: 19 },
  { n: 97, name: "Al-Qadr", arabic: "القدر", ayahs: 5 },
  { n: 98, name: "Al-Bayyinah", arabic: "البينة", ayahs: 8 },
  { n: 99, name: "Az-Zalzalah", arabic: "الزلزلة", ayahs: 8 },
  { n: 100, name: "Al-Adiyat", arabic: "العاديات", ayahs: 11 },
  { n: 101, name: "Al-Qari'ah", arabic: "القارعة", ayahs: 11 },
  { n: 102, name: "At-Takathur", arabic: "التكاثر", ayahs: 8 },
  { n: 103, name: "Al-Asr", arabic: "العصر", ayahs: 3 },
  { n: 104, name: "Al-Humazah", arabic: "الهمزة", ayahs: 9 },
  { n: 105, name: "Al-Fil", arabic: "الفيل", ayahs: 5 },
  { n: 106, name: "Quraysh", arabic: "قريش", ayahs: 4 },
  { n: 107, name: "Al-Ma'un", arabic: "الماعون", ayahs: 7 },
  { n: 108, name: "Al-Kawthar", arabic: "الكوثر", ayahs: 3 },
  { n: 109, name: "Al-Kafirun", arabic: "الكافرون", ayahs: 6 },
  { n: 110, name: "An-Nasr", arabic: "النصر", ayahs: 3 },
  { n: 111, name: "Al-Masad", arabic: "المسد", ayahs: 5 },
  { n: 112, name: "Al-Ikhlas", arabic: "الإخلاص", ayahs: 4 },
  { n: 113, name: "Al-Falaq", arabic: "الفلق", ayahs: 5 },
  { n: 114, name: "An-Nas", arabic: "الناس", ayahs: 6 },
];

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

const LANGUAGES = [
  {
    value: "en.sahih",
    label: "English",
    ttsLang: "en-US",
    apiEdition: "en.sahih",
  },
  {
    value: "ur.jalandhry",
    label: "اردو Urdu",
    ttsLang: "ur-PK",
    apiEdition: "ur.jalandhry",
  },
  {
    value: "hi.hindi",
    label: "हिन्दी Hindi",
    ttsLang: "hi-IN",
    apiEdition: "hi.hindi",
  },
  {
    value: "bn.bengali",
    label: "বাংলা Bengali",
    ttsLang: "bn-BD",
    apiEdition: "bn.bengali",
  },
  {
    value: "ml.abdulhameed",
    label: "മലയാളം Malayalam",
    ttsLang: "ml-IN",
    apiEdition: "ml.abdulhameed",
  },
  {
    value: "ta.tamil",
    label: "தமிழ் Tamil",
    ttsLang: "ta-IN",
    apiEdition: "ta.tamil",
  },
  {
    value: "gu.ahmedali",
    label: "ગુજરાતી Gujarati",
    ttsLang: "gu-IN",
    apiEdition: "gu.ahmedali",
  },
  {
    value: "mr.sirur",
    label: "मराठी Marathi",
    ttsLang: "mr-IN",
    apiEdition: "mr.sirur",
  },
  {
    value: "te.tts",
    label: "తెలుగు Telugu",
    ttsLang: "te-IN",
    apiEdition: "en.sahih",
  },
  {
    value: "kn.tts",
    label: "ಕನ್ನಡ Kannada",
    ttsLang: "kn-IN",
    apiEdition: "en.sahih",
  },
  {
    value: "pa.tts",
    label: "ਪੰਜਾਬੀ Punjabi",
    ttsLang: "pa-IN",
    apiEdition: "en.sahih",
  },
];

const SPEED_OPTIONS = [
  { value: "0.5", label: "0.5x" },
  { value: "0.75", label: "0.75x" },
  { value: "1", label: "1x (Normal)" },
  { value: "1.25", label: "1.25x" },
  { value: "1.5", label: "1.5x" },
  { value: "2", label: "2x" },
];

// Helper: get voices, waiting for them to load if needed
function getVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      const handler = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      // Fallback after 2 seconds if voiceschanged never fires
      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      }, 2000);
    }
  });
}

export default function QuranPage() {
  const navigate = useNavigate();
  const [surahNum, setSurahNum] = useState(1);
  const [language, setLanguage] = useState("en.sahih");
  const [speed, setSpeed] = useState(1);
  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [transAyahs, setTransAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [playingTranslation, setPlayingTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stoppedRef = useRef(false);
  const pausedRef = useRef(false);
  const activeAyahRef = useRef<number | null>(null);
  const pausedAtAyahRef = useRef<number>(0);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const transAyahsRef = useRef<Ayah[]>([]);
  const autoPlayNextRef = useRef(false);
  const arabicAyahsRef = useRef<Ayah[]>([]);
  const playAyahByIndexRef = useRef<(index: number) => void>(() => {});

  // Bug 3 fix: language ref so speakTranslation always uses the latest language
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Bug 4 fix: speed ref so callbacks always use the latest speed
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const { data: settings } = useGetQuranSettings();

  useEffect(() => {
    transAyahsRef.current = transAyahs;
  }, [transAyahs]);

  useEffect(() => {
    arabicAyahsRef.current = arabicAyahs;
  }, [arabicAyahs]);

  useEffect(() => {
    activeAyahRef.current = activeAyah;
  }, [activeAyah]);

  useEffect(() => {
    const token = localStorage.getItem("noor_session");
    if (!token) navigate({ to: "/" });
  }, [navigate]);

  useEffect(() => {
    setLoadingAyahs(true);
    stopPlayback();
    setActiveAyah(null);
    setProgress(0);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then((r) =>
        r.json(),
      ),
      fetch(
        `https://api.alquran.cloud/v1/surah/${surahNum}/${
          LANGUAGES.find((l) => l.value === language)?.apiEdition ?? language
        }`,
      ).then((r) => r.json()),
    ])
      .then(([arabicData, transData]) => {
        const newArabic = arabicData.data?.ayahs ?? [];
        setArabicAyahs(newArabic);
        setTransAyahs(transData.data?.ayahs ?? []);
        arabicAyahsRef.current = newArabic;
        if (autoPlayNextRef.current && newArabic.length > 0) {
          autoPlayNextRef.current = false;
          // Trigger play after state settles
          setTimeout(() => {
            stoppedRef.current = false;
            pausedRef.current = false;
            setIsPlaying(true);
            setIsPaused(false);
            setProgress(0);
            setActiveAyah(null);
          }, 300);
        }
      })
      .catch(() => toast.error("Failed to load surah. Check your connection."))
      .finally(() => setLoadingAyahs(false));
  }, [surahNum, language]);

  const stopPlayback = useCallback(() => {
    stoppedRef.current = true;
    pausedRef.current = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setPlayingTranslation(false);
  }, []);

  const pausePlayback = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
    // Stop both audio and speech immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlayingTranslation(false);
    // Save current ayah index for resume
    pausedAtAyahRef.current = activeAyahRef.current ?? 0;
  }, []);

  const resumePlayback = useCallback(() => {
    pausedRef.current = false;
    stoppedRef.current = false;
    setIsPaused(false);
    // Restart from the ayah that was active when paused
    playAyahByIndexRef.current(pausedAtAyahRef.current);
  }, []);

  // Bug 3 fix: removed `language` from deps; uses languageRef.current instead
  // Bug 4 fix: removed `speed` from deps; uses speedRef.current (passed via spd param)
  // Bug 1 fix: Chrome keepAlive interval to prevent silent 15s cutoff
  const speakTranslation = useCallback(
    (text: string, spd: number, onDone: () => void) => {
      if (stoppedRef.current) {
        onDone();
        return;
      }

      setPlayingTranslation(true);

      // Bug 3: use languageRef instead of closed-over language
      const langConfig = LANGUAGES.find((l) => l.value === languageRef.current);
      const ttsLang = langConfig?.ttsLang ?? "en-US";

      if (!("speechSynthesis" in window)) {
        setPlayingTranslation(false);
        onDone();
        return;
      }

      // Cancel any current speech first
      window.speechSynthesis.cancel();

      // Wait for voices to load, then speak with a small delay after cancel
      getVoicesReady().then((voices) => {
        if (stoppedRef.current) {
          setPlayingTranslation(false);
          onDone();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = ttsLang;
        utterance.rate = spd;

        // Pick the best available voice: prefer Google, then male, then any matching lang
        const langPrefix = ttsLang.split("-")[0];
        const googleVoice = voices.find(
          (v) =>
            (v.lang.startsWith(ttsLang) || v.lang.startsWith(langPrefix)) &&
            v.name.toLowerCase().includes("google"),
        );
        const maleVoice = voices.find(
          (v) =>
            (v.lang.startsWith(ttsLang) || v.lang.startsWith(langPrefix)) &&
            (v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("man")),
        );
        const anyVoice = voices.find(
          (v) => v.lang.startsWith(ttsLang) || v.lang.startsWith(langPrefix),
        );

        if (googleVoice) utterance.voice = googleVoice;
        else if (maleVoice) utterance.voice = maleVoice;
        else if (anyVoice) utterance.voice = anyVoice;

        // Bug 1: more generous timeout
        const timeout = setTimeout(
          () => {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            window.speechSynthesis.cancel();
            setPlayingTranslation(false);
            onDone();
          },
          Math.max(text.length * 200, 15000),
        );

        // Bug 1: Chrome keepAlive — pause/resume every 10s to prevent silent stop
        let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
        keepAliveInterval = setInterval(() => {
          if (
            window.speechSynthesis.speaking &&
            !window.speechSynthesis.paused
          ) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);

        utterance.onend = () => {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          clearTimeout(timeout);
          setPlayingTranslation(false);
          onDone();
        };
        utterance.onerror = () => {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          clearTimeout(timeout);
          setPlayingTranslation(false);
          onDone();
        };

        // Small delay after cancel() is required on Chrome/Android to avoid silence
        setTimeout(() => {
          if (stoppedRef.current) {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            clearTimeout(timeout);
            setPlayingTranslation(false);
            onDone();
            return;
          }
          window.speechSynthesis.speak(utterance);
        }, 200);
      });
    },
    // Bug 3 & 4: removed language and speed from deps — use refs instead
    [],
  );

  // playAyahByIndex uses a ref-based approach so it doesn't close over stale arabicAyahs
  const playAyahByIndex = useCallback(
    (index: number) => {
      if (stoppedRef.current) return;

      const currentAyahs = arabicAyahsRef.current;

      if (index >= currentAyahs.length) {
        setProgress(100);
        setIsPlaying(false);
        setPlayingTranslation(false);
        const currentSurahNum = surahNum;
        if (currentSurahNum < 114) {
          const completedSurah = SURAH_LIST[currentSurahNum - 1];
          toast.success(
            `Surah ${completedSurah?.name} completed! MashaAllah 🌟`,
          );
          setTimeout(() => {
            autoPlayNextRef.current = true;
            setSurahNum((prev) => prev + 1);
          }, 1000);
        } else {
          toast.success("SubhanAllah! You have completed the entire Quran! 🌟");
        }
        return;
      }

      const ayah = currentAyahs[index];
      setActiveAyah(index);
      setPlayingTranslation(false);
      setProgress(Math.round(((index + 1) / currentAyahs.length) * 100));

      const el = ayahRefs.current[index];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

      const reciterBase =
        settings?.[0] ||
        "https://cdn.islamic.network/quran/audio/128/ar.alafasy";
      const audioUrl = `${reciterBase}/${ayah.number}.mp3`;

      const afterArabic = () => {
        if (stoppedRef.current) return;
        const translationText = transAyahsRef.current[index]?.text;
        if (translationText) {
          // Bug 4: pass speedRef.current so we always use the latest speed
          speakTranslation(translationText, speedRef.current, () => {
            // Bug 2: use ref to avoid stale closure in recursive chain
            if (!stoppedRef.current) playAyahByIndexRef.current(index + 1);
          });
        } else {
          // Bug 2: use ref to avoid stale closure
          playAyahByIndexRef.current(index + 1);
        }
      };

      const tryPlay = (url: string, fallback?: string) => {
        const audio = new Audio(url);
        // Bug 4: use speedRef.current instead of closed-over speed
        audio.playbackRate = speedRef.current;
        audioRef.current = audio;
        audio.onended = afterArabic;
        audio.onerror = () => {
          if (fallback) {
            tryPlay(fallback);
          } else {
            afterArabic();
          }
        };
        audio.play().catch(() => {
          if (fallback) tryPlay(fallback);
          else afterArabic();
        });
      };

      tryPlay(
        audioUrl,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
      );
    },
    // Bug 4: removed speed from deps — uses speedRef.current
    [settings, speakTranslation, surahNum],
  );

  useEffect(() => {
    playAyahByIndexRef.current = playAyahByIndex;
  }, [playAyahByIndex]);

  // Watch isPlaying state to trigger playback after auto-advance loads new ayahs
  useEffect(() => {
    if (
      isPlaying &&
      !isPaused &&
      arabicAyahs.length > 0 &&
      activeAyah === null &&
      !stoppedRef.current
    ) {
      playAyahByIndex(0);
    }
  }, [isPlaying, isPaused, arabicAyahs.length, activeAyah, playAyahByIndex]);

  const handlePlay = useCallback(() => {
    stoppedRef.current = false;
    pausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    setActiveAyah(null);
    playAyahByIndex(0);
  }, [playAyahByIndex]);

  const handleStop = useCallback(() => {
    stopPlayback();
    setActiveAyah(null);
    setProgress(0);
  }, [stopPlayback]);

  const handleWhatsAppShare = () => {
    const appUrl = window.location.origin;
    const arabicDua =
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n"مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا"\n(رواه الترمذي)';
    const english =
      "📖 Reading the Quran brings light to the heart.\nEvery letter you read earns ten rewards from Allah.\nThe Quran is the greatest treasure — share its blessings!";
    const urdu =
      "قرآن پڑھنا دل کو روشن کرتا ہے۔\nہر حرف پڑھنے پر دس نیکیاں ملتی ہیں۔\nاللہ کی سب سے بڑی نعمت کا حصہ بنیں!";
    const message = `${arabicDua}\n\n${english}\n\n${urdu}\n\n🌐 Read Now: ${appUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("noor_session");
    localStorage.removeItem("noor_user_name");
    navigate({ to: "/" });
  };

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const surahInfo = SURAH_LIST[surahNum - 1];
  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-arabic text-accent text-2xl">نور</span>
            <span className="font-bold text-foreground text-sm hidden sm:block">
              Noor Quran
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/duas">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className="w-4 h-4 mr-1" /> Duas
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="quran.share_button"
              onClick={handleWhatsAppShare}
              className="text-muted-foreground hover:text-green-400"
            >
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="quran.logout_button"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Controls bar */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Surah select */}
          <div className="flex-1">
            <Select
              value={String(surahNum)}
              onValueChange={(v) => setSurahNum(Number(v))}
            >
              <SelectTrigger
                data-ocid="quran.surah_select"
                className="bg-input border-border text-foreground w-full"
              >
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {surahNum}.
                    </span>
                    <span>{surahInfo?.name}</span>
                    <span className="font-arabic text-accent">
                      {surahInfo?.arabic}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-72 overflow-auto">
                {SURAH_LIST.map((s) => (
                  <SelectItem
                    key={s.n}
                    value={String(s.n)}
                    className="text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6 text-xs text-right">
                        {s.n}.
                      </span>
                      <span>{s.name}</span>
                      <span className="font-arabic text-accent ml-auto">
                        {s.arabic}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language select */}
          <div className="sm:w-48">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                data-ocid="quran.language_select"
                className="bg-input border-border text-foreground w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {LANGUAGES.map((l) => (
                  <SelectItem
                    key={l.value}
                    value={l.value}
                    className="text-foreground hover:bg-muted"
                  >
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed select */}
          <div className="sm:w-36">
            <Select
              value={String(speed)}
              onValueChange={(v) => setSpeed(Number(v))}
            >
              <SelectTrigger
                data-ocid="quran.speed_select"
                className="bg-input border-border text-foreground w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {SPEED_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-foreground hover:bg-muted"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Play/Pause/Stop controls */}
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button
                data-ocid="quran.play_button"
                onClick={handlePlay}
                disabled={loadingAyahs || arabicAyahs.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
              >
                <Play className="w-4 h-4 mr-1" /> Play
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    data-ocid="quran.play_button"
                    onClick={resumePlayback}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Resume
                  </Button>
                ) : (
                  <Button
                    data-ocid="quran.secondary_button"
                    onClick={pausePlayback}
                    variant="outline"
                    className="border-primary/60 text-primary hover:bg-primary/10 flex-1 sm:flex-none"
                  >
                    <Pause className="w-4 h-4 mr-1" /> Pause
                  </Button>
                )}
                <Button
                  data-ocid="quran.delete_button"
                  onClick={handleStop}
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                >
                  <Square className="w-4 h-4 mr-1" /> Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              data-ocid="quran.loading_state"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {isPaused
                    ? "⏸ Paused"
                    : playingTranslation
                      ? `Playing translation (${LANGUAGES.find((l) => l.value === language)?.label ?? language})`
                      : `Playing Surah ${surahInfo?.name} (Arabic)`}
                </span>
                <span className="text-accent font-semibold">
                  {progress}% ماشاء الله
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-muted" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Surah header */}
        {!loadingAyahs && arabicAyahs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border-b border-border"
          >
            <p className="text-muted-foreground text-xs mb-3 tracking-widest uppercase">
              Surah {surahNum}
            </p>
            <h2
              className="font-arabic text-5xl text-accent mb-2"
              style={{ lineHeight: 1.6 }}
            >
              {surahInfo?.arabic}
            </h2>
            <p className="text-foreground font-bold text-xl">
              {surahInfo?.name}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {surahInfo?.ayahs} Ayahs
            </p>
            {surahNum !== 9 && (
              <p
                className="font-arabic text-2xl text-primary mt-6"
                style={{ lineHeight: 2 }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            )}
          </motion.div>
        )}

        {/* Ayahs */}
        {loadingAyahs ? (
          <div className="space-y-6" data-ocid="quran.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 space-y-3"
              >
                <Skeleton className="h-10 w-full bg-muted" />
                <Skeleton className="h-5 w-3/4 bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {arabicAyahs.map((ayah, i) => (
              <motion.div
                key={ayah.number}
                ref={(el) => {
                  ayahRefs.current[i] = el;
                }}
                data-ocid={`quran.item.${i + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 1) }}
                className={`bg-card border rounded-xl p-5 sm:p-6 transition-all duration-300 ${
                  activeAyah === i
                    ? "border-primary/60 shadow-green bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                {/* Ayah number badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 rounded-full border border-accent/40 flex items-center justify-center text-xs text-accent font-bold">
                    {ayah.numberInSurah}
                  </div>
                  {activeAyah === i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-primary font-semibold">
                        {isPaused
                          ? "Paused"
                          : playingTranslation
                            ? "Playing Translation"
                            : "Playing Arabic"}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Arabic text */}
                <p
                  className="font-arabic text-right text-foreground mb-4"
                  dir="rtl"
                  style={{
                    fontSize: "1.8rem",
                    lineHeight: 2.2,
                    color: activeAyah === i ? "oklch(0.78 0.12 75)" : undefined,
                  }}
                >
                  {ayah.text}
                </p>

                {/* Translation */}
                {transAyahs[i] && (
                  <p
                    className={`text-sm leading-relaxed border-t border-border pt-3 transition-colors duration-300 ${
                      activeAyah === i && playingTranslation
                        ? "text-accent font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {transAyahs[i].text}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {arabicAyahs.length === 0 && !loadingAyahs && (
          <div data-ocid="quran.empty_state" className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a surah to begin reading
            </p>
          </div>
        )}
      </main>

      <footer className="bg-card border-t border-border px-4 py-6 text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Designed by{" "}
          <a
            href="https://wa.me/919390535070"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Magic Advertising
          </a>
          {" | "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/50 hover:text-muted-foreground text-xs"
          >
            Built with caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground/40 mt-1">
          © {currentYear} Noor Quran
        </p>
      </footer>
    </div>
  );
}
