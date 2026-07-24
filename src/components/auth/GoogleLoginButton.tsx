"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

/**
 * Isolated Google Login button that uses the useGoogleLogin hook.
 * This component must be rendered inside a <GoogleOAuthProvider>.
 * By isolating it, the hook only runs when the provider is present.
 */
export function GoogleLoginButton({
  onToken,
  disabled,
  isLoading,
}: {
  onToken: (accessToken: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onToken(tokenResponse.access_token);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => login()}
      className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 hover:text-white h-11 rounded-none text-sm font-medium transition-all"
      disabled={disabled}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
      ) : (
        <>
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </>
      )}
    </Button>
  );
}
