export type UserRole = "guest" | "customer" | "therapist" | "admin";

export type User = {
  id: string;
  role: Exclude<UserRole, "guest">;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  avatarUrl?: string;
};
