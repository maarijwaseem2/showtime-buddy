import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, MailQuestion, ShieldCheck } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: (data) => {
      setStep(2);
      if (data.resetCode) {
        setCode(data.resetCode);
        toast.success(`Your reset code: ${data.resetCode}`, { duration: 15000 });
      } else {
        toast.success(data.message);
      }
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Request failed");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return authApi.resetPassword({ email, code, newPassword });
    },
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Reset failed"
      );
    },
  });

  return (
    <section className="container py-8 sm:py-12 max-w-md mx-auto w-full px-1">
      <article className="rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-card-elegant">
        <header className="text-center mb-6">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            {step === 1 ? (
              <MailQuestion className="h-6 w-6 text-primary-foreground" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            )}
          </span>
          <h1 className="text-2xl font-bold">
            {step === 1 ? "Forgot password" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 1
              ? "Enter your email and we'll issue a reset code"
              : `Enter the 6-digit code for ${email} and choose a new password`}
          </p>
        </header>

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestMutation.mutate();
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
            <Button
              type="submit"
              className="w-full bg-gradient-primary shadow-glow"
              disabled={requestMutation.isPending}
            >
              <KeyRound className="h-4 w-4" />
              {requestMutation.isPending ? "Sending..." : "Get reset code"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              resetMutation.mutate();
            }}
            className="space-y-4"
          >
            <fieldset className="space-y-1">
              <Label htmlFor="code">Reset code</Label>
              <Input
                id="code"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 bg-secondary border-border/60 tracking-[0.4em] text-center font-mono text-lg"
                placeholder="000000"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                id="newPassword"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-secondary border-border/60"
              />
              <p className="text-[11px] text-muted-foreground">
                Min 8 chars with upper, lower, and a number
              </p>
            </fieldset>
            <fieldset className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
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
              disabled={resetMutation.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {resetMutation.isPending ? "Resetting..." : "Reset password"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Use a different email
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </article>
    </section>
  );
};

export default ForgotPassword;
