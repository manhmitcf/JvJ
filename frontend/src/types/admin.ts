import { type BookingStatus, type PaymentStatus } from "./booking";
import { type UserRole } from "./user";

export type AdminAccountStatus = "active" | "suspended" | "pending_approval" | "rejected";

export type AdminUserRow = {
  id: string;
  role: Exclude<UserRole, "guest">;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinedAt: string;
  status: AdminAccountStatus;
};

export type AdminOverviewMetrics = {
  totalCustomers: number;
  activeTherapists: number;
  newBookingsToday: number;
  pendingTherapistApprovals: number;
  unresolvedComplaints: number;
};

export type AdminChartPoint = {
  label: string;
  revenue: number;
  bookings: number;
};

export type AdminAlert = {
  id: string;
  title: string;
  description: string;
  tone: "teal" | "amber" | "red" | "slate";
  href: string;
};

export type TherapistApprovalStatus = "pending_approval" | "approved" | "rejected";

export type TherapistApproval = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  yearsOfExperience: number;
  specialties: string[];
  certificateUrls: string[];
  submittedAt: string;
  status: TherapistApprovalStatus;
  rejectionReason?: string;
};

export type AdminBookingRow = {
  id: string;
  code: string;
  customerName: string;
  therapistName: string;
  treatmentName: string;
  scheduledAt: string;
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  address: string;
  note?: string;
};
