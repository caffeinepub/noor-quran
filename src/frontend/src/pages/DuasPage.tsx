import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { useGetAllDuas } from "../hooks/useQueries";

export default function DuasPage() {
  const { data: duas, isLoading } = useGetAllDuas();
  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

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
            Authentic Duas from the Quran and Sunnah
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
          {duas?.map((dua, i) => (
            <motion.div
              key={String(dua.id)}
              data-ocid={`duas.item.${i + 1}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
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
                    className="font-arabic text-right text-accent mb-4"
                    dir="rtl"
                    style={{ fontSize: "1.6rem", lineHeight: 2 }}
                  >
                    {dua.arabicText}
                  </p>
                )}

                {dua.text && (
                  <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-3">
                    {dua.text}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
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
