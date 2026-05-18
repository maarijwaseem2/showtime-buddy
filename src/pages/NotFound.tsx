import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <section className="container flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center min-h-[50vh]">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-6">
        <Film className="h-7 w-7 text-primary-foreground" />
      </span>
      <h1 className="text-5xl sm:text-6xl font-extrabold">404</h1>
      <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-sm">
        This page left the theater early.
      </p>
      <Button asChild className="mt-8 bg-gradient-primary shadow-glow">
        <Link to="/">Back to movies</Link>
      </Button>
    </section>
  );
};

export default NotFound;
