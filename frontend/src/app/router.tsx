import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { RequireRole } from "@/features/auth/RequireRole";
import { AppointmentDetailPage } from "@/features/booking/AppointmentDetailPage";
import { AppointmentsPage } from "@/features/booking/AppointmentsPage";
import { BookingWizardPage } from "@/features/booking/BookingWizardPage";
import { CalendarPage } from "@/features/customer/CalendarPage";
import { CustomerHomePage } from "@/features/customer/pages/CustomerHomePage";
import { ProfilePage } from "@/features/customer/ProfilePage";
import {
  AdminBookingsPage,
  AdminHomePage,
  AdminSpaAddPage,
  AdminSpasPage,
  AdminSpaDetailPage,
  AdminTherapistApprovalsPage,
  AdminUsersPage,
} from "@/features/admin/pages/AdminPages";
import { AdminLoginPage } from "@/features/admin/pages/AdminLoginPage";
import { AdminRegisterPage } from "@/features/admin/pages/AdminRegisterPage";
import {
  TherapistBookingsPage,
  TherapistHomePage,
  TherapistProfilePage,
  TherapistSchedulePage,
  TherapistTreatmentFormPage,
  TherapistTreatmentsPage,
  TherapistWalletPage,
} from "@/features/therapist/pages/TherapistPages";
import { HomePage } from "@/features/public/pages/HomePage";
import { TherapistDetailPage } from "@/features/public/pages/TherapistDetailPage";
import { TreatmentDetailPage } from "@/features/public/pages/TreatmentDetailPage";
import { TreatmentListingPage } from "@/features/public/pages/TreatmentListingPage";
import { SpaDetailPage } from "@/features/spas/SpaDetailPage";
import { SpaListingPage } from "@/features/spas/SpaListingPage";
import { CustomerPaymentPage } from "@/features/payments/CustomerPaymentPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/treatments", element: <TreatmentListingPage /> },
      { path: "/treatments/:treatmentId", element: <TreatmentDetailPage /> },
      { path: "/therapists/:therapistId", element: <TherapistDetailPage /> },
      { path: "/spas", element: <SpaListingPage /> },
      { path: "/spas/:spaId", element: <SpaDetailPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/admin/login", element: <AdminLoginPage /> },
      { path: "/admin/register", element: <AdminRegisterPage /> },
    ],
  },
  {
    element: (
      <RequireRole allowedRoles={["customer"]}>
        <DashboardLayout area="Customer" />
      </RequireRole>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/app", element: <CustomerHomePage /> },
      { path: "/app/treatments", element: <TreatmentListingPage /> },
      { path: "/app/treatments/:treatmentId", element: <TreatmentDetailPage /> },
      { path: "/app/bookings/new", element: <BookingWizardPage /> },
      { path: "/app/appointments", element: <AppointmentsPage /> },
      { path: "/app/appointments/:bookingId", element: <AppointmentDetailPage /> },
      { path: "/app/payments/:bookingId", element: <CustomerPaymentPage /> },
      { path: "/app/calendar", element: <CalendarPage /> },
      { path: "/app/profile", element: <ProfilePage /> },
    ],
  },
  {
    element: (
      <RequireRole allowedRoles={["therapist"]}>
        <DashboardLayout area="Therapist" />
      </RequireRole>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/therapist", element: <TherapistHomePage /> },
      {
        path: "/therapist/treatments",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistTreatmentsPage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/treatments/new",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistTreatmentFormPage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/treatments/:treatmentId/edit",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistTreatmentFormPage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/schedule",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistSchedulePage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/bookings",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistBookingsPage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/profile",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistProfilePage />
          </RequireRole>
        ),
      },
      {
        path: "/therapist/wallet",
        element: (
          <RequireRole allowedRoles={["therapist"]} allowedTherapistStatuses={["approved"]}>
            <TherapistWalletPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    element: (
      <RequireRole allowedRoles={["admin"]} unauthenticatedRedirectTo="/admin/login">
        <DashboardLayout area="Admin" />
      </RequireRole>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/admin", element: <AdminHomePage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/therapist-approvals", element: <AdminTherapistApprovalsPage /> },
      { path: "/admin/bookings", element: <AdminBookingsPage /> },
      { path: "/admin/spas", element: <AdminSpasPage /> },
      { path: "/admin/spas/new", element: <AdminSpaAddPage /> },
      { path: "/admin/spas/:spaId", element: <AdminSpaDetailPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
