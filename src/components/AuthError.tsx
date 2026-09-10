"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-screen px-4 py-16 md:py-32 dark:bg-transparent">
          <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
            <div className="p-6">
              <div>
                <Link
                  href="/"
                  aria-label="go home"
                  className="flex items-center gap-1"
                >
                  <Image
                    src="/queyk-light.png"
                    width={25}
                    height={25}
                    alt="queyk's logo"
                    className="size-4.5 invert md:size-5.5"
                  />
                  <p className="mb-0.5 font-semibold md:text-xl">Queyk</p>
                </Link>
                <h1 className="mt-4 mb-1 text-xl font-semibold">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  Loading error details...
                </p>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

function ErrorContent() {
  const search = useSearchParams();
  const error = search.get("error");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/error?error=AccessDenied",
      });
    } catch {
      setLoading(false);
    }
  };

  function getErrorContent() {
    switch (error) {
      case "AccessDenied":
      case "FORBIDDEN":
      case "access_denied":
        return {
          title: "Access Denied",
          message:
            "Access restricted. You must use your official Immaculada Concepcion College email (@immaculada.edu.ph) to sign in.",
          showGoogleButton: true,
          showHomeButton: true,
        };
      case "Verification":
      case "state_mismatch":
        return {
          title: "Session Expired",
          message:
            "Authentication session expired or verification was interrupted. Please try signing in again.",
          showGoogleButton: true,
          showHomeButton: true,
        };
      case "Configuration":
        return {
          title: "Service Unavailable",
          message:
            "There's an issue with the authentication service. Please try again later or contact support.",
          showGoogleButton: false,
          showHomeButton: true,
        };
      default:
        return {
          title: "Access Denied",
          message:
            "Access restricted. You must use your official Immaculada Concepcion College email (@immaculada.edu.ph) to sign in.",
          showGoogleButton: true,
          showHomeButton: true,
        };
    }
  }

  const errorContent = getErrorContent();

  return (
    <section className="flex min-h-screen px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5">
        <div className="p-6">
          <div>
            <Link
              href="/"
              aria-label="go home"
              className="flex items-center gap-1"
            >
              <Image
                src="/queyk-light.png"
                width={25}
                height={25}
                alt="queyk's logo"
                className="size-4.5 invert md:size-5.5"
              />
              <p className="mb-0.5 font-semibold md:text-xl">Queyk</p>
            </Link>
            <h1 className="mt-4 mb-1 text-xl font-semibold">
              {errorContent.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {errorContent.message}
            </p>
          </div>

          <div className="mt-3 space-y-3">
            {errorContent.showGoogleButton && (
              <Button
                type="button"
                variant="default"
                disabled={loading}
                onClick={handleSignIn}
                className="w-full font-semibold"
              >
                <FaGoogle className="size-4" />
                <span>Sign in with Google</span>
              </Button>
            )}

            {errorContent.showHomeButton && (
              <Button
                asChild
                variant={errorContent.showGoogleButton ? "outline" : "default"}
                className="w-full font-semibold"
              >
                <Link href="/">Go to Home</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
