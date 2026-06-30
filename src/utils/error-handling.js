import { isRedirectError } from "next/dist/client/components/redirect-error";

export function getErrorMessage(
  error,
  fallback = "Unexpected error occurred..."
) {
  if (isRedirectError(error)) throw error;

  if (typeof error === "string") return error;

  if (process.env.NODE_ENV === "production") return "Something went wrong...";

  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error)
    return String(error.message);

  return fallback;
}

// Install-Module -Name PowerShellGet -Force
// Install-Module PSReadLine - AllowPrerelease -Force
