import { create } from "zustand";
import { type AdminBookingRow } from "@/types/admin";
import { getAdminBookingById, getAdminBookings, type AdminBookingFilters } from "../services/admin-booking-service";

type AdminBookingStore = {
  bookings: AdminBookingRow[];
  selectedBooking: AdminBookingRow | null;
  isLoading: boolean;
  error: string | null;
  fetchBookings: (filters?: AdminBookingFilters) => Promise<void>;
  selectBooking: (bookingId: string) => Promise<void>;
};

export const useAdminBookingStore = create<AdminBookingStore>((set) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,

  fetchBookings: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await getAdminBookings(filters);
      set((state) => ({
        bookings,
        selectedBooking: bookings.find((booking) => booking.id === state.selectedBooking?.id) ?? bookings[0] ?? null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const selectedBooking = await getAdminBookingById(bookingId);
      set({ selectedBooking, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
