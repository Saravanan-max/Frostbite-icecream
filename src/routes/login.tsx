import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IceCream } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({ redirect: (s.redirect as string) || "/" }),
  head: () => ({ meta: [{ title: "Sign in — FrostBite" }] }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
      }
      toast.success(mode === "signin" ? "Welcome back!" : "Account created");
      navigate({ to: search.redirect });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + search.redirect,
        },
      });
      if (error) toast.error(error.message ?? "Google sign-in failed");
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-soft">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <IceCream className="h-6 w-6 text-accent" strokeWidth={2.2} />
          <span className="font-display text-xl text-accent">FROST<span className="text-primary">—BITE</span></span>
        </Link>
        <p className="font-script text-2xl leading-none text-primary">
          {mode === "signin" ? "Welcome back to" : "Join the"}
        </p>
        <h1 className="mt-1 font-display text-4xl text-accent">
          {mode === "signin" ? "Happiness" : "Scoop Club"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to track your orders." : "Create an account to start ordering."}
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading || loading}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-border bg-card py-3 text-sm font-bold uppercase tracking-widest text-accent transition-colors hover:border-primary disabled:opacity-50"
        >
          <GoogleIcon /> {googleLoading ? "Opening Google…" : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="submit" disabled={loading || googleLoading}
            className="w-full rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.1z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.4-4.3 2.2-6.9 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 38.9 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6 5C40.9 36 43.5 30.6 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
