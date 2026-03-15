import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Loader2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useIncrementVisitor,
  useLoginUser,
  useRegisterUser,
  useVisitorCount,
} from "../hooks/useQueries";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: visitorCount } = useVisitorCount();
  const incrementVisitor = useIncrementVisitor();
  const registerUser = useRegisterUser();
  const loginUser = useLoginUser();

  useEffect(() => {
    const token = localStorage.getItem("noor_session");
    if (token) {
      navigate({ to: "/quran" });
      return;
    }
    incrementVisitor.mutate();
  }, [navigate, incrementVisitor.mutate]);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const token = await registerUser.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });
      localStorage.setItem("noor_session", token);
      localStorage.setItem("noor_user_name", name.trim());
      toast.success("Welcome to Noor Quran!");
      navigate({ to: "/quran" });
    } catch {
      toast.error("Registration failed. Phone may already be registered.");
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    try {
      const token = await loginUser.mutateAsync({ phone: phone.trim() });
      localStorage.setItem("noor_session", token);
      toast.success("Welcome back!");
      navigate({ to: "/quran" });
    } catch {
      toast.error("Login failed. Phone number not found.");
    }
  };

  const currentYear = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <div className="min-h-screen flex flex-col geometric-pattern">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent" />
        <div className="relative px-4 py-16 text-center">
          {/* Decorative bismillah line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent" />
            <span className="font-arabic text-accent text-2xl">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1
              className="font-arabic text-6xl md:text-7xl text-accent mb-2"
              style={{ lineHeight: 1.4 }}
            >
              نور قرآن
            </h1>
            <p className="text-2xl font-bold text-foreground tracking-wide">
              Noor Quran
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              India's First Multi-Language Word-by-Word Quran
            </p>
          </motion.div>

          {/* Live reader count */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/30"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {visitorCount !== undefined
                ? Number(visitorCount).toLocaleString()
                : "…"}{" "}
              people reading now
            </span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </motion.div>
        </div>
      </header>

      {/* Auth Card */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Card header with decorative border */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-8">
              {/* Tab toggle */}
              <div className="flex rounded-xl overflow-hidden border border-border mb-8">
                <button
                  type="button"
                  data-ocid="auth.toggle_button"
                  onClick={() => {
                    setMode("register");
                    setName("");
                    setPhone("");
                  }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    mode === "register"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setName("");
                    setPhone("");
                  }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    mode === "login"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Login
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === "register" ? (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Create Account
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Join thousands reading the Quran daily
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-foreground">
                        Full Name
                      </Label>
                      <Input
                        id="reg-name"
                        data-ocid="auth.name_input"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="reg-phone"
                        data-ocid="auth.phone_input"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      />
                    </div>
                    <Button
                      data-ocid="auth.register_button"
                      onClick={handleRegister}
                      disabled={registerUser.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                    >
                      {registerUser.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Registering...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" /> Start Reading
                          Quran
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        Welcome Back
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Continue your Quran journey
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-phone" className="text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="login-phone"
                        data-ocid="auth.phone_input"
                        placeholder="Enter registered phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    <Button
                      data-ocid="auth.login_button"
                      onClick={handleLogin}
                      disabled={loginUser.isPending}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
                    >
                      {loginUser.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Logging in...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" /> Open the Quran
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Admin link */}
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Admin?{" "}
            <a href="/admin" className="text-accent hover:underline">
              Go to Admin Panel
            </a>
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Designed &amp; Developed by
        </p>
        <p className="text-accent font-bold text-lg">Shaik Munwarbhasha</p>
        <p className="text-xs text-muted-foreground mt-1">
          Magic Advertising | Nellore Print Hub
        </p>
        <a
          href="https://wa.me/919390535070"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs text-primary border border-primary/40 rounded-full px-4 py-1.5 hover:bg-primary/10 transition-colors"
        >
          Chat on WhatsApp
        </a>
        <p className="mt-4 text-xs text-muted-foreground/50">
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
