import { type ReactNode } from "react";
import { PermissionDenied } from "@/components/shared/PermissionDenied";
import { useAuthStore } from "./auth-store";
import { type TherapistStatus } from "@/types/therapist";
import { type UserRole } from "@/types/user";

type RequireRoleProps = {
  allowedRoles: UserRole[];
  allowedTherapistStatuses?: TherapistStatus[];
  children: ReactNode;
};

export function RequireRole({ allowedRoles, allowedTherapistStatuses, children }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <PermissionDenied />;
  }

  if (user.role === "therapist" && allowedTherapistStatuses && (!("status" in user) || !allowedTherapistStatuses.includes(user.status))) {
    return <PermissionDenied />;
  }

  return children;
}
