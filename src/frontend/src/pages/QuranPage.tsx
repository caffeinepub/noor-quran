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
import { BookOpen, Heart, LogOut, Play, Share2, Square } from "lucide-react";
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

const _SURAH_OFFSETS = [
  0, 1, 8, 294, 494, 670, 790, 955, 1031, 1106, 1235, 1344, 1455, 1498, 1550,
  1649, 1777, 1905, 2016, 2126, 2261, 2396, 2474, 2592, 2656, 2733, 2960, 3053,
  3141, 3229, 3289, 3323, 3353, 3426, 3480, 3525, 3608, 3790, 3878, 3953, 4058,
  4134, 4187, 4276, 4335, 4372, 4407, 4445, 4484, 4513, 4558, 4618, 4667, 4729,
  4784, 4862, 4958, 4987, 5009, 5033, 5046, 5060, 5071, 5082, 5100, 5126, 5155,
  5184, 5237, 5289, 5341, 5385, 5413, 5441, 5461, 5481, 5511, 5561, 5611, 5657,
  5699, 5741, 5770, 5789, 5808, 5844, 5882, 5900, 5919, 5937, 5960, 5981, 5996,
  6011, 6020, 6028, 6036, 6044, 6052, 6060, 6068, 6073, 6081, 6089, 6090, 6098,
  6106, 6114, 6117, 6125, 6130, 6136, 6141, 6147, 6153, 6157, 6160, 6163, 6165,
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
    speechLang: "en-US",
    apiEdition: "en.sahih",
  },
  {
    value: "ur.jalandhry",
    label: "اردو Urdu",
    speechLang: "ur-PK",
    apiEdition: "ur.jalandhry",
  },
  {
    value: "hi.hindi",
    label: "हिन्दी Hindi",
    speechLang: "hi-IN",
    apiEdition: "hi.hindi",
  },
  {
    value: "bn.bengali",
    label: "বাংলা Bengali",
    speechLang: "bn-IN",
    apiEdition: "bn.bengali",
  },
  {
    value: "ml.abdulhameed",
    label: "മലയാളം Malayalam",
    speechLang: "ml-IN",
    apiEdition: "ml.abdulhameed",
  },
  {
    value: "ta.tamil",
    label: "தமிழ் Tamil",
    speechLang: "ta-IN",
    apiEdition: "ta.tamil",
  },
  {
    value: "gu.ahmedali",
    label: "ગુજરાતી Gujarati",
    speechLang: "gu-IN",
    apiEdition: "gu.ahmedali",
  },
  {
    value: "mr.sirur",
    label: "मराठी Marathi",
    speechLang: "mr-IN",
    apiEdition: "mr.sirur",
  },
  {
    value: "te.tts",
    label: "తెలుగు Telugu",
    speechLang: "te-IN",
    apiEdition: "en.sahih",
  },
  {
    value: "kn.tts",
    label: "ಕನ್ನಡ Kannada",
    speechLang: "kn-IN",
    apiEdition: "en.sahih",
  },
  {
    value: "pa.tts",
    label: "ਪੰਜਾਬੀ Punjabi",
    speechLang: "pa-IN",
    apiEdition: "en.sahih",
  },
];

export default function QuranPage() {
  const navigate = useNavigate();
  const [surahNum, setSurahNum] = useState(1);
  const [language, setLanguage] = useState("en.sahih");
  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [transAyahs, setTransAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [playingTranslation, setPlayingTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stoppedRef = useRef(false);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { data: settings } = useGetQuranSettings();

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
        `https://api.alquran.cloud/v1/surah/${surahNum}/${LANGUAGES.find((l) => l.value === language)?.apiEdition ?? language}`,
      ).then((r) => r.json()),
    ])
      .then(([arabicData, transData]) => {
        setArabicAyahs(arabicData.data?.ayahs ?? []);
        setTransAyahs(transData.data?.ayahs ?? []);
      })
      .catch(() => toast.error("Failed to load surah. Check your connection."))
      .finally(() => setLoadingAyahs(false));
  }, [surahNum, language]);

  const stopPlayback = useCallback(() => {
    stoppedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlayingTranslation(false);
  }, []);

  // Speak translation text using Web Speech API
  const speakTranslation = useCallback(
    (text: string, onDone: () => void) => {
      if (!window.speechSynthesis || stoppedRef.current) {
        onDone();
        return;
      }
      window.speechSynthesis.cancel();
      const langConfig = LANGUAGES.find((l) => l.value === language);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langConfig?.speechLang ?? "en-US";
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.onend = () => {
        setPlayingTranslation(false);
        onDone();
      };
      utterance.onerror = () => {
        setPlayingTranslation(false);
        onDone();
      };
      setPlayingTranslation(true);
      window.speechSynthesis.speak(utterance);
    },
    [language],
  );

  const playAyah = useCallback(
    (index: number) => {
      if (stoppedRef.current || index >= arabicAyahs.length) {
        if (index >= arabicAyahs.length) {
          setProgress(100);
          setIsPlaying(false);
          setPlayingTranslation(false);
          toast.success("Surah completed! MashaAllah 🌟");
        }
        return;
      }

      const ayah = arabicAyahs[index];
      setActiveAyah(index);
      setPlayingTranslation(false);
      setProgress(Math.round(((index + 1) / arabicAyahs.length) * 100));

      const el = ayahRefs.current[index];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

      const reciterBase =
        settings?.[0] ||
        "https://cdn.islamic.network/quran/audio/128/ar.alafasy";
      const audioUrl = `${reciterBase}/${ayah.number}.mp3`;

      // After Arabic audio ends, speak translation, then go to next ayah
      const afterArabic = () => {
        if (stoppedRef.current) return;
        const translationText = transAyahs[index]?.text;
        if (translationText) {
          speakTranslation(translationText, () => {
            if (!stoppedRef.current) playAyah(index + 1);
          });
        } else {
          playAyah(index + 1);
        }
      };

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {
        const fallbackAudio = new Audio(
          `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        );
        audioRef.current = fallbackAudio;
        fallbackAudio.play().catch(() => {});
        fallbackAudio.onended = afterArabic;
      });
      audio.onended = afterArabic;
    },
    [arabicAyahs, transAyahs, settings, speakTranslation],
  );

  const handlePlay = useCallback(() => {
    stoppedRef.current = false;
    setIsPlaying(true);
    setProgress(0);
    setActiveAyah(null);
    playAyah(0);
  }, [playAyah]);

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

          {/* Play/Stop */}
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
              <Button
                data-ocid="quran.play_button"
                onClick={handleStop}
                variant="destructive"
                className="flex-1 sm:flex-none"
              >
                <Square className="w-4 h-4 mr-1" /> Stop
              </Button>
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
                  {playingTranslation
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
                        {playingTranslation
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
