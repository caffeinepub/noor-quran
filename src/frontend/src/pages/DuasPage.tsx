import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Pause, Play, Square } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetAllDuas } from "../hooks/useQueries";

const DUA_LANGUAGES = [
  { value: "en", label: "English", ttsLang: "en-US" },
  { value: "ur", label: "اردو Urdu", ttsLang: "ur-PK" },
  { value: "hi", label: "हिन्दी Hindi", ttsLang: "hi-IN" },
  { value: "bn", label: "বাংলা Bengali", ttsLang: "bn-BD" },
  { value: "ml", label: "മലയാളം Malayalam", ttsLang: "ml-IN" },
  { value: "ta", label: "தமிழ் Tamil", ttsLang: "ta-IN" },
  { value: "gu", label: "ગુજરાતી Gujarati", ttsLang: "gu-IN" },
  { value: "mr", label: "मराठी Marathi", ttsLang: "mr-IN" },
  { value: "te", label: "తెలుగు Telugu", ttsLang: "te-IN" },
  { value: "kn", label: "ಕನ್ನಡ Kannada", ttsLang: "kn-IN" },
  { value: "pa", label: "ਪੰਜਾਬੀ Punjabi", ttsLang: "pa-IN" },
];

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
      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(window.speechSynthesis.getVoices());
      }, 2000);
    }
  });
}

function speakText(
  text: string,
  ttsLang: string,
  rate: number,
  onDone: () => void,
  cancelledRef: React.MutableRefObject<boolean>,
) {
  if (cancelledRef.current) {
    onDone();
    return;
  }
  if (!("speechSynthesis" in window)) {
    onDone();
    return;
  }

  window.speechSynthesis.cancel();

  getVoicesReady().then((voices) => {
    if (cancelledRef.current) {
      onDone();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLang;
    utterance.rate = rate;

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

    const timeout = setTimeout(
      () => {
        window.speechSynthesis.cancel();
        onDone();
      },
      Math.max(text.length * 150, 8000),
    );

    utterance.onend = () => {
      clearTimeout(timeout);
      onDone();
    };
    utterance.onerror = () => {
      clearTimeout(timeout);
      onDone();
    };

    setTimeout(() => {
      if (cancelledRef.current) {
        clearTimeout(timeout);
        onDone();
        return;
      }
      window.speechSynthesis.speak(utterance);
    }, 200);
  });
}

function parseTranslations(text: string): Record<string, string> {
  try {
    if (text?.startsWith("{")) return JSON.parse(text);
  } catch {
    /* fallback */
  }
  return { en: text };
}

export default function DuasPage() {
  const { data: duas, isLoading } = useGetAllDuas();
  const [language, setLanguage] = useState("en");
  const [playingDuaId, setPlayingDuaId] = useState<bigint | null>(null);
  const [playPhase, setPlayPhase] = useState<"arabic" | "translation" | "idle">(
    "idle",
  );
  const [isPaused, setIsPaused] = useState(false);
  const cancelledRef = useRef(false);
  const pausedAtDuaRef = useRef<bigint | null>(null);
  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  const stopDua = useCallback(() => {
    cancelledRef.current = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlayingDuaId(null);
    setPlayPhase("idle");
    setIsPaused(false);
  }, []);

  // cleanup on unmount
  useEffect(() => () => stopDua(), [stopDua]);

  const playDua = useCallback(
    (duaId: bigint, arabicText: string, translationsJson: string) => {
      cancelledRef.current = false;
      setPlayingDuaId(duaId);
      setIsPaused(false);
      pausedAtDuaRef.current = duaId;

      const translations = parseTranslations(translationsJson);
      const langConfig = DUA_LANGUAGES.find((l) => l.value === language);
      const ttsLang = langConfig?.ttsLang ?? "en-US";
      const meaningText = translations[language] || translations.en || "";

      // Step 1: Play Arabic using ar-SA TTS
      setPlayPhase("arabic");
      speakText(
        arabicText,
        "ar-SA",
        1,
        () => {
          if (cancelledRef.current) return;
          // Step 2: Play meaning in chosen language
          if (meaningText) {
            setPlayPhase("translation");
            speakText(
              meaningText,
              ttsLang,
              1,
              () => {
                if (!cancelledRef.current) {
                  setPlayingDuaId(null);
                  setPlayPhase("idle");
                }
              },
              cancelledRef,
            );
          } else {
            setPlayingDuaId(null);
            setPlayPhase("idle");
          }
        },
        cancelledRef,
      );
    },
    [language],
  );

  const pauseDua = useCallback(() => {
    cancelledRef.current = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsPaused(true);
    setPlayPhase("idle");
  }, []);

  return (
    <div className="min-h-screen flex flex-col geometric-pattern">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/quran">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <span className="font-arabic text-accent text-xl">الأدعية</span>
          <span className="font-bold text-foreground">Duas Collection</span>
          <div className="ml-auto">
            <Select
              value={language}
              onValueChange={(v) => {
                stopDua();
                setLanguage(v);
              }}
            >
              <SelectTrigger
                data-ocid="duas.language_select"
                className="bg-input border-border text-foreground w-44 h-8 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {DUA_LANGUAGES.map((l) => (
                  <SelectItem
                    key={l.value}
                    value={l.value}
                    className="text-foreground hover:bg-muted text-xs"
                  >
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1
            className="font-arabic text-4xl text-accent mb-2"
            style={{ lineHeight: 1.6 }}
          >
            الأدعية المأثورة
          </h1>
          <p className="text-muted-foreground">
            Authentic Duas -- tap Play to hear Arabic then meaning
          </p>
        </motion.div>

        {isLoading && (
          <div className="space-y-4" data-ocid="duas.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 space-y-3"
              >
                <Skeleton className="h-8 w-1/2 bg-muted" />
                <Skeleton className="h-16 w-full bg-muted" />
                <Skeleton className="h-5 w-3/4 bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && duas && duas.length === 0 && (
          <div
            data-ocid="duas.empty_state"
            className="text-center py-16 bg-card border border-border rounded-2xl"
          >
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-semibold">No duas yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              The admin will add duas soon, inshallah.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {duas?.map((dua, i) => {
            const isActive = playingDuaId === dua.id;
            const translations = parseTranslations(dua.text);
            const meaningText = translations[language] || translations.en || "";

            return (
              <motion.div
                key={String(dua.id)}
                data-ocid={`duas.item.${i + 1}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive
                    ? "border-primary/60 shadow-[0_0_20px_oklch(0.5_0.15_150/0.15)]"
                    : "border-border"
                }`}
              >
                <div className="h-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="font-bold text-foreground text-lg">
                      {dua.title}
                    </h3>
                    <span className="text-accent text-xs font-bold border border-accent/30 rounded-full px-2 py-0.5">
                      #{i + 1}
                    </span>
                  </div>

                  {dua.arabicText && (
                    <p
                      className="font-arabic text-right mb-4 transition-colors duration-300"
                      dir="rtl"
                      style={{
                        fontSize: "1.6rem",
                        lineHeight: 2,
                        color:
                          isActive && playPhase === "arabic"
                            ? "oklch(0.78 0.12 75)"
                            : "oklch(var(--accent))",
                      }}
                    >
                      {dua.arabicText}
                    </p>
                  )}

                  {meaningText && (
                    <p
                      className={`text-sm leading-relaxed border-t border-border pt-3 transition-colors duration-300 ${
                        isActive && playPhase === "translation"
                          ? "text-accent font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {meaningText}
                    </p>
                  )}

                  {/* Playback controls */}
                  <div className="mt-4 flex items-center gap-2">
                    {!isActive || isPaused ? (
                      <Button
                        data-ocid={`duas.play_button.${i + 1}`}
                        size="sm"
                        onClick={() =>
                          playDua(dua.id, dua.arabicText, dua.text)
                        }
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Play
                      </Button>
                    ) : (
                      <>
                        <Button
                          data-ocid={`duas.secondary_button.${i + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={pauseDua}
                          className="border-primary/60 text-primary hover:bg-primary/10"
                        >
                          <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                        </Button>
                        <Button
                          data-ocid={`duas.delete_button.${i + 1}`}
                          size="sm"
                          variant="destructive"
                          onClick={stopDua}
                        >
                          <Square className="w-3.5 h-3.5 mr-1" /> Stop
                        </Button>
                      </>
                    )}
                    {isActive && (
                      <span className="text-xs text-primary flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {playPhase === "arabic"
                          ? "Playing Arabic"
                          : "Playing Meaning"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <footer className="bg-card border-t border-border px-4 py-6 text-center mt-8">
        <p className="text-xs text-muted-foreground/50">
          © {currentYear}.{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
