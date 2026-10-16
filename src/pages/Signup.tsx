import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Film, UserPlus } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return authApi.register({ email, password, fullName, phone: phone || undefined });
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success("Account created successfully");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Signup failed");
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
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join ShowSeat to book your favorite movies
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
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
                placeholder="+92 3XX XXXXXXX"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
              <p className="text-[11px] text-muted-foreground">
                Min 8 chars with upper, lower, and a number
              </p>
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
            </fieldset>
            <Button
              type="submit"
              className="w-full bg-gradient-primary shadow-glow"
              disabled={mutation.isPending}
            >
              <UserPlus className="h-4 w-4" />
              {mutation.isPending ? "Creating..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </article>
      </section>
    </>
  );
};

export default Signup;
