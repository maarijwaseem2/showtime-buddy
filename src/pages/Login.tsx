import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Film, LogIn } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const from = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    if (token && user?.role === "ADMIN") navigate("/admin", { replace: true });
    else if (token && user?.role === "USER") navigate(from.startsWith("/admin") ? "/" : from, { replace: true });
  }, [token, user, navigate, from]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success(`Welcome back, ${data.user.fullName}`);
      if (data.user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from.startsWith("/admin") ? "/" : from, { replace: true });
      }
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    },
  });

  return (
    <>
      <section className="container py-8 sm:py-12 max-w-md mx-auto w-full px-1">
        <article className="rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-card-elegant">
          <header className="text-center mb-6">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Film className="h-6 w-6 text-primary-foreground" />
            </span>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Book tickets and manage your shows
            </p>
          </header>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <fieldset className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
                placeholder="you@example.com"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <span className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </span>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
            </fieldset>
            <Button
              type="submit"
              className="w-full bg-gradient-primary shadow-glow"
              disabled={mutation.isPending}
            >
              <LogIn className="h-4 w-4" />
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </article>
      </section>
    </>
  );
};

export default Login;
