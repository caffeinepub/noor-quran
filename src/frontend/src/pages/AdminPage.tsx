import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookHeart,
  Eye,
  Loader2,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddDua,
  useAdminLogin,
  useDeleteDua,
  useGetAllDuas,
  useGetAllUsers,
  useGetQuranSettings,
  useSetReciterUrl,
  useSetSurahEnabled,
  useVisitorCount,
} from "../hooks/useQueries";

const SURAH_NAMES = [
  "Al-Fatiha",
  "Al-Baqarah",
  "Ali 'Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
];

const DUA_TRANSLATE_LANGS = [
  { key: "en", label: "English" },
  { key: "ur", label: "Urdu" },
  { key: "hi", label: "Hindi" },
  { key: "bn", label: "Bengali" },
  { key: "ml", label: "Malayalam" },
  { key: "ta", label: "Tamil" },
  { key: "gu", label: "Gujarati" },
  { key: "mr", label: "Marathi" },
  { key: "te", label: "Telugu" },
  { key: "kn", label: "Kannada" },
  { key: "pa", label: "Punjabi" },
];

async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // data[0] is array of [translated, original] pairs
    return (data[0] as [string, string][]).map((item) => item[0]).join("");
  } catch {
    return "";
  }
}

async function translateToAllLanguages(arabicText: string): Promise<string> {
  const results = await Promise.all(
    DUA_TRANSLATE_LANGS.map(async ({ key }) => {
      const translated = await translateText(arabicText, key);
      return [key, translated] as [string, string];
    }),
  );
  const obj: Record<string, string> = {};
  for (const [key, val] of results) {
    obj[key] = val;
  }
  return JSON.stringify(obj);
}

function formatDate(ts: bigint): string {
  try {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reciterUrl, setReciterUrl] = useState("");
  const [duaTitle, setDuaTitle] = useState("");
  const [duaArabic, setDuaArabic] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const adminLogin = useAdminLogin();
  const { data: users, isLoading: usersLoading } = useGetAllUsers(adminToken);
  const { data: visitorCount } = useVisitorCount();
  const { data: settings, isLoading: settingsLoading } = useGetQuranSettings();
  const setReciter = useSetReciterUrl();
  const setSurahEnabled = useSetSurahEnabled();
  const { data: duas, isLoading: duasLoading } = useGetAllDuas();
  const addDua = useAddDua();
  const deleteDua = useDeleteDua();

  const handleAdminLogin = async () => {
    if (!username || !password) {
      toast.error("Enter credentials");
      return;
    }
    try {
      const token = await adminLogin.mutateAsync({ username, password });
      setAdminToken(token);
      toast.success("Admin access granted");
    } catch {
      toast.error("Invalid admin credentials");
    }
  };

  const handleSaveReciter = async () => {
    try {
      await setReciter.mutateAsync({ adminToken, url: reciterUrl });
      toast.success("Reciter URL updated");
    } catch {
      toast.error("Failed to update reciter URL");
    }
  };

  const handleToggleSurah = async (surahNum: number, enabled: boolean) => {
    try {
      await setSurahEnabled.mutateAsync({
        adminToken,
        surahNumber: BigInt(surahNum),
        enabled,
      });
      toast.success(`Surah ${surahNum} ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update surah");
    }
  };

  const handleAddDua = async () => {
    if (!duaTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!duaArabic.trim()) {
      toast.error("Arabic text is required");
      return;
    }
    try {
      setIsTranslating(true);
      toast.info("Translating to all languages...");
      const translationsJson = await translateToAllLanguages(duaArabic.trim());
      setIsTranslating(false);

      await addDua.mutateAsync({
        adminToken,
        title: duaTitle.trim(),
        text: translationsJson,
        arabicText: duaArabic.trim(),
      });
      setDuaTitle("");
      setDuaArabic("");
      toast.success("Dua added with translations in all 11 languages!");
    } catch {
      setIsTranslating(false);
      toast.error("Failed to add dua");
    }
  };

  const handleDeleteDua = async (duaId: bigint) => {
    try {
      await deleteDua.mutateAsync({ adminToken, duaId });
      toast.success("Dua deleted");
    } catch {
      toast.error("Failed to delete dua");
    }
  };

  const getSurahEnabled = (n: number): boolean => {
    if (!settings?.[1]) return true;
    const entry = settings[1].find(([num]) => Number(num) === n);
    return entry ? entry[1] : true;
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center geometric-pattern px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-accent" />
                <div>
                  <h1 className="font-bold text-xl text-foreground">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Noor Quran Management
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-username" className="text-foreground">
                    Username
                  </Label>
                  <Input
                    id="admin-username"
                    data-ocid="admin.username_input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="bg-input border-border text-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    data-ocid="admin.password_input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-input border-border text-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                </div>
                <Button
                  data-ocid="admin.login_button"
                  onClick={handleAdminLogin}
                  disabled={adminLogin.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-5"
                >
                  {adminLogin.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Access Admin
                      Panel
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center mt-4 text-xs text-muted-foreground">
                <a href="/" className="hover:text-foreground">
                  ← Back to Noor Quran
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground">Noor Quran Admin</span>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← View Site
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdminToken("")}
              className="text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Tabs defaultValue="users">
          <TabsList className="bg-card border border-border mb-6 p-1 rounded-xl">
            <TabsTrigger
              value="users"
              data-ocid="admin.users_tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              <Users className="w-4 h-4 mr-1.5" /> Users
            </TabsTrigger>
            <TabsTrigger
              value="visitors"
              data-ocid="admin.visitors_tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              <Eye className="w-4 h-4 mr-1.5" /> Visitors
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              data-ocid="admin.settings_tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              <Settings className="w-4 h-4 mr-1.5" /> Settings
            </TabsTrigger>
            <TabsTrigger
              value="duas"
              data-ocid="admin.duas_tab"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              <BookHeart className="w-4 h-4 mr-1.5" /> Duas
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">Registered Users</h2>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {users?.length ?? 0} users
                </Badge>
              </div>
              {usersLoading ? (
                <div className="p-4 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-muted" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">#</TableHead>
                      <TableHead className="text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Phone
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Registered
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user, i) => (
                      <TableRow
                        key={user.phone}
                        data-ocid={`admin.row.${i + 1}`}
                        className="border-border hover:bg-muted/30"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.phone}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(user.registeredAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!usersLoading && (!users || users.length === 0) && (
                <div
                  data-ocid="admin.empty_state"
                  className="py-12 text-center text-muted-foreground"
                >
                  No users registered yet
                </div>
              )}
            </div>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm mb-2">
                  Total Visitors
                </p>
                <p className="text-5xl font-bold text-primary">
                  {visitorCount !== undefined
                    ? Number(visitorCount).toLocaleString()
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  People who have opened the app
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm mb-2">
                  Registered Readers
                </p>
                <p className="text-5xl font-bold text-accent">
                  {users?.length ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Users with accounts
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-1">
                  Audio Reciter
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Current:{" "}
                  <span className="text-primary">
                    {settings?.[0] || "Default (Al-Afasy)"}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="admin.reciter_url_input"
                    value={reciterUrl}
                    onChange={(e) => setReciterUrl(e.target.value)}
                    placeholder="https://cdn.islamic.network/quran/audio/128/ar.minshawi"
                    className="bg-input border-border text-foreground flex-1"
                  />
                  <Button
                    data-ocid="admin.save_reciter_button"
                    onClick={handleSaveReciter}
                    disabled={setReciter.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {setReciter.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">
                  Surah Visibility (first 20)
                </h3>
                {settingsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full bg-muted" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SURAH_NAMES.map((name, i) => {
                      const n = i + 1;
                      const enabled = getSurahEnabled(n);
                      return (
                        <div
                          key={n}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border"
                        >
                          <span className="text-sm text-foreground">
                            <span className="text-muted-foreground mr-2 text-xs">
                              {n}.
                            </span>
                            {name}
                          </span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(v) => handleToggleSurah(n, v)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Duas Tab */}
          <TabsContent value="duas">
            <div className="space-y-6">
              {/* Add dua form */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Add New Dua
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Paste the Arabic text -- translations into all 11 languages
                  will be generated automatically.
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Title</Label>
                    <Input
                      data-ocid="admin.dua_title_input"
                      value={duaTitle}
                      onChange={(e) => setDuaTitle(e.target.value)}
                      placeholder="Dua for forgiveness"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Arabic Text</Label>
                    <Textarea
                      data-ocid="admin.dua_arabic_input"
                      value={duaArabic}
                      onChange={(e) => setDuaArabic(e.target.value)}
                      placeholder="رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً ..."
                      className="bg-input border-border text-foreground font-arabic text-right text-xl"
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                  <Button
                    data-ocid="admin.add_dua_button"
                    onClick={handleAddDua}
                    disabled={addDua.isPending || isTranslating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Translating to 11 languages...
                      </>
                    ) : addDua.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add Dua
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Duas list */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground">All Duas</h3>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    {duas?.length ?? 0}
                  </Badge>
                </div>
                {duasLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full bg-muted" />
                    ))}
                  </div>
                ) : duas && duas.length > 0 ? (
                  <div className="divide-y divide-border">
                    {duas.map((dua, i) => (
                      <div
                        key={String(dua.id)}
                        data-ocid={`admin.row.${i + 1}`}
                        className="p-4 flex items-start justify-between gap-4 hover:bg-muted/20"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {dua.title}
                          </p>
                          {dua.arabicText && (
                            <p
                              className="font-arabic text-accent text-lg text-right mt-1"
                              dir="rtl"
                              style={{ lineHeight: 1.8 }}
                            >
                              {dua.arabicText.length > 60
                                ? `${dua.arabicText.slice(0, 60)}...`
                                : dua.arabicText}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {dua.text?.startsWith("{")
                              ? "✓ Translations in 11 languages stored"
                              : dua.text?.slice(0, 60)}
                          </p>
                        </div>
                        <Button
                          data-ocid={`admin.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDua(dua.id)}
                          disabled={deleteDua.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    data-ocid="admin.empty_state"
                    className="py-10 text-center text-muted-foreground"
                  >
                    No duas yet. Add your first dua above.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
