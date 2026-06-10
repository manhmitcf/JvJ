import { create } from "zustand";
import { type Booking } from "@/types/booking";
import {
  approveBooking as approveBookingService,
  completeBooking as completeBookingService,
  getTherapistBookings,
  rejectBooking as rejectBookingService,
  startBooking as startBookingService,
} from "../services/booking-service";

type BookingStore = {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  findBooking: (id: string) => Booking | undefined;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string, reason: string) => Promise<void>;
  startBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await getTherapistBookings();
      set({ bookings, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  findBooking: (id) => get().bookings.find((b) => b.id === id),

  approveBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await approveBookingService(bookingId);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === bookingId ? booking : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  rejectBooking: async (bookingId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await rejectBookingService(bookingId, reason);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === bookingId ? booking : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  startBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await startBookingService(bookingId);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === bookingId ? booking : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  completeBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await completeBookingService(bookingId);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === bookingId ? booking : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
