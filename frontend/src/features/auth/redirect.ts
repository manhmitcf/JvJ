import type { AuthUser } from "./auth-service";

const DEFAULT_CUSTOMER_LOGIN_REDIRECT = "/app/appointments";
const DEFAULT_THERAPIST_LOGIN_REDIRECT = "/therapist";
const DEFAULT_ADMIN_LOGIN_REDIRECT = "/admin";

function getDefaultLoginRedirectForUser(user: AuthUser) {
  if (user.role === "therapist") {
    return DEFAULT_THERAPIST_LOGIN_REDIRECT;
  }

  if (user.role === "admin") {
    return DEFAULT_ADMIN_LOGIN_REDIRECT;
  }

  return DEFAULT_CUSTOMER_LOGIN_REDIRECT;
}

export function getSafeLoginRedirect(redirect: string | null, user?: AuthUser) {
  const defaultRedirect = user ? getDefaultLoginRedirectForUser(user) : DEFAULT_CUSTOMER_LOGIN_REDIRECT;

  if (!redirect) {
    return defaultRedirect;
  }

  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return defaultRedirect;
  }

  return redirect;
}
