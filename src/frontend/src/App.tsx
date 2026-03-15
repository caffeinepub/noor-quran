import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Language =
  | "urdu"
  | "kannada"
  | "telugu"
  | "hindi"
  | "tamil"
  | "malayalam"
  | "english";

interface AyahData {
  ar: string;
  audio: string;
  urdu: string;
  kannada: string;
  hindi: string;
  telugu: string;
  tamil: string;
  malayalam: string;
  english: string;
}

const localData: AyahData[] = [
  {
    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
    kannada: "ಅಲ್ಲಾಹನ ಹೆಸರಿನಲ್ಲಿ, ಅತ್ಯಂತ ಕರುಣಾಮಯನು",
    hindi: "अल्लाह के नाम से जो बड़ा मेहरबान है",
    telugu: "అల్లాహ్ పేరుతో, అత్యంత దయామయుడు",
    tamil: "அளவற்ற அருளாளன் அல்லாஹ்வின் பெயரால்",
    malayalam: "പരമകാരുണികനും കരുണാനിധിയുമായ അല്ലാഹുവിന്റെ നാമത്തിൽ",
    english: "In the name of Allah, Most Gracious",
  },
];

const messages: Record<Language, { done: string; praise: string }> = {
  urdu: { done: "مکمل", praise: "ماشاء اللہ" },
  kannada: { done: "ಪೂರ್ಣಗೊಂಡಿದೆ", praise: "ಮಾಶಾ ಅಲ್ಲಾ" },
  telugu: { done: "పూర్తయింది", praise: "మాషా అల్లాహ్" },
  hindi: { done: "पूरा हुआ", praise: "माशा अल्लाह" },
  tamil: { done: "முடிந்தது", praise: "மாஷா அல்லாஹ்" },
  malayalam: { done: "പൂര്‍ത്തിയായി", praise: "മാഷാ അല്ലാഹ്" },
  english: { done: "Completed", praise: "MashaAllah" },
};

const langCodes: Record<Language, string> = {
  urdu: "ur-PK",
  kannada: "kn-IN",
  hindi: "hi-IN",
  telugu: "te-IN",
  tamil: "ta-IN",
  malayalam: "ml-IN",
  english: "en-GB",
};

const languageOptions: { value: Language; label: string }[] = [
  { value: "urdu", label: "Urdu (اردو)" },
  { value: "kannada", label: "Kannada (ಕನ್ನಡ)" },
  { value: "telugu", label: "Telugu (తెలుగు)" },
  { value: "hindi", label: "Hindi (हिन्दी)" },
  { value: "tamil", label: "Tamil (தமிழ்)" },
  { value: "malayalam", label: "Malayalam (മലയാളം)" },
  { value: "english", label: "English (Professional)" },
];

export default function App() {
  const [lang, setLang] = useState<Language>("urdu");
  const [isReading, setIsReading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stoppedRef = useRef(false);

  const speakAI = useCallback(
    (text: string, language: Language, onDone: () => void) => {
      const words = text.split(" ");
      let wordIdx = 0;

      function readWords() {
        if (stoppedRef.current) return;
        if (wordIdx < words.length) {
          const utterance = new SpeechSynthesisUtterance(words[wordIdx]);
          utterance.lang = langCodes[language];
          utterance.pitch = 0.85;
          utterance.rate = 0.82;
          utterance.onend = () => {
            wordIdx++;
            setTimeout(readWords, 400);
          };
          window.speechSynthesis.speak(utterance);
        } else {
          onDone();
        }
      }
      readWords();
    },
    [],
  );

  const playCycle = useCallback(
    (index: number, language: Language) => {
      if (stoppedRef.current || index >= localData.length) {
        if (index >= localData.length) {
          setProgress(100);
        }
        return;
      }

      const item = localData[index];
      setActiveIndex(index);

      const percent = Math.round(((index + 1) / localData.length) * 100);
      setProgress(percent);

      const el = ayahRefs.current[index];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

      const audio = new Audio(item.audio);
      audio.play().catch(() => {
        setTimeout(() => {
          speakAI(item[language], language, () =>
            playCycle(index + 1, language),
          );
        }, 600);
      });
      audio.onended = () => {
        setTimeout(() => {
          speakAI(item[language], language, () =>
            playCycle(index + 1, language),
          );
        }, 600);
      };
    },
    [speakAI],
  );

  const startReading = useCallback(() => {
    stoppedRef.current = false;
    setIsReading(true);
    setProgress(0);
    setActiveIndex(null);
    window.speechSynthesis.cancel();
    playCycle(0, lang);
  }, [lang, playCycle]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f8fafc", color: "#1e293b" }}
    >
      <header
        style={{
          background: "#1b5e20",
          borderBottom: "5px solid #c5a059",
          padding: "50px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            margin: 0,
            fontSize: "2.5rem",
            letterSpacing: "-1px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Noor Quran
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ margin: "10px 0 0", fontSize: "1.1rem", fontWeight: 400 }}
        >
          India’s First Quran on Multi-Language’s On Lafzi Meaning
        </motion.p>
      </header>

      <main className="flex-1" style={{ paddingBottom: "50px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            maxWidth: "600px",
            margin: "-40px auto 0",
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Language Picker */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="langPicker"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#1b5e20",
              }}
            >
              Select Language
            </label>
            <select
              id="langPicker"
              data-ocid="reader.select"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "1rem",
                background: "#fff",
                appearance: "none",
                cursor: "pointer",
                outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Button */}
          <button
            type="button"
            data-ocid="reader.primary_button"
            onClick={startReading}
            style={{
              width: "100%",
              background: "#1b5e20",
              color: "white",
              border: "none",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
            }}
          >
            ▶ Start Reading
          </button>

          {/* Progress Section */}
          <AnimatePresence>
            {isReading && (
              <motion.div
                data-ocid="reader.loading_state"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ margin: "25px 0", overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  <span>
                    {progress}% {messages[lang].done}
                  </span>
                  <span style={{ color: "#c5a059" }}>
                    {messages[lang].praise}
                  </span>
                </div>
                <div
                  style={{
                    background: "#e2e8f0",
                    height: "8px",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{
                      height: "100%",
                      background: "#c5a059",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ayah List */}
          <div style={{ marginTop: "30px" }}>
            {localData.map((item, i) => (
              <motion.div
                key={item.ar}
                ref={(el) => {
                  ayahRefs.current[i] = el;
                }}
                data-ocid={`reader.item.${i + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                style={{
                  padding: activeIndex === i ? "20px" : "30px 0",
                  borderBottom:
                    i < localData.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: activeIndex === i ? "#f0fdf4" : "transparent",
                  borderRadius: activeIndex === i ? "16px" : "0",
                  margin: activeIndex === i ? "10px -10px" : "0",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="font-arabic"
                  style={{
                    fontSize: "2.2rem",
                    textAlign: "right",
                    color: "#1b5e20",
                    marginBottom: "15px",
                    lineHeight: 1.8,
                    direction: "rtl",
                  }}
                >
                  {item.ar}
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    color: "#475569",
                  }}
                >
                  {item[lang]}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "#0f172a",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
          marginTop: "80px",
        }}
      >
        <div>
          <p style={{ opacity: 0.6, margin: "0 0 4px" }}>
            Designed &amp; Developed by
          </p>
          <h2
            style={{ color: "#c5a059", margin: "0 0 4px", fontSize: "1.5rem" }}
          >
            Shaik Munwarbhasha
          </h2>
          <p style={{ margin: "0 0 4px" }}>Graphic &amp; Web Designer</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.5, margin: "0 0 20px" }}>
            Magic Advertising | Nellore Print Hub
          </p>
          <a
            href="https://wa.me/919390535070"
            data-ocid="footer.link"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "5px",
              color: "#4ade80",
              textDecoration: "none",
              border: "1px solid #4ade80",
              padding: "12px 24px",
              borderRadius: "100px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(74,222,128,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
            }}
          >
            Chat with Shaik Munwar
          </a>
        </div>
        <div style={{ marginTop: "40px", opacity: 0.4, fontSize: "0.8rem" }}>
          © {currentYear}.{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
