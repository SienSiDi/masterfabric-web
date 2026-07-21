"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as authApi from "@/lib/api/auth";
import { HttpError } from "@/lib/api/http";
import { useAuthStore } from "@/stores/useAuthStore";
import { buildViewUrl } from "@/lib/view-router";

export function LoginForm({ onSwitch }: { onSwitch: (sub: "register" | "forgot-password") => void }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setSession({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
      });
      toast.success(`Welcome back, ${res.user.email}`);
      router.push(buildViewUrl("app", "dashboard"));
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 401) toast.error("Invalid email or password");
        else if (err.status === 429) toast.error("Too many attempts. Try again in a minute.");
        else toast.error(err.body?.error ?? "Login failed");
      } else {
        toast.error("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <div className="flex justify-between text-xs text-muted-foreground">
        <button type="button" onClick={() => onSwitch("register")} className="hover:text-foreground underline-offset-2 hover:underline">
          Create account
        </button>
        <button type="button" onClick={() => onSwitch("forgot-password")} className="hover:text-foreground underline-offset-2 hover:underline">
          Forgot password?
        </button>
      </div>
    </form>
  );
}

export function RegisterForm({ onSwitch }: { onSwitch: (sub: "login") => void }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.register(email, password);
      const res = await authApi.login(email, password);
      setSession({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
      });
      toast.success(`Account created. Welcome, ${res.user.email}`);
      router.push(buildViewUrl("app", "dashboard"));
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 409) toast.error("Email already registered");
        else if (err.status === 422) toast.error(err.body?.message ?? "Invalid input");
        else toast.error(err.body?.error ?? "Registration failed");
      } else {
        toast.error("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="min 8 characters"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <Input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <div className="text-center text-xs text-muted-foreground">
        <button type="button" onClick={() => onSwitch("login")} className="hover:text-foreground underline-offset-2 hover:underline">
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}

export function ForgotPasswordForm({ onSwitch }: { onSwitch: (sub: "login") => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Password reset is not yet available. Please contact your administrator or use a new email to register.
      </div>
      <Button size="lg" variant="outline" onClick={() => onSwitch("login")} className="w-full">
        Back to sign in
      </Button>
    </div>
  );
}

export function AuthCard({ sub }: { sub: "login" | "register" | "forgot-password" }) {
  const router = useRouter();
  function switchSub(next: "login" | "register" | "forgot-password") {
    router.push(buildViewUrl("auth", next));
  }

  const titles: Record<typeof sub, { title: string; desc: string }> = {
    login: { title: "Sign in", desc: "Welcome back to MasterFabric Web-LLM" },
    register: { title: "Create account", desc: "Start running Gemma in your browser" },
    "forgot-password": { title: "Forgot password", desc: "Recover access to your account" },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{titles[sub].title}</CardTitle>
        <CardDescription>{titles[sub].desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {sub === "login" && <LoginForm onSwitch={switchSub} />}
        {sub === "register" && <RegisterForm onSwitch={switchSub} />}
        {sub === "forgot-password" && <ForgotPasswordForm onSwitch={switchSub} />}
      </CardContent>
    </Card>
  );
}
