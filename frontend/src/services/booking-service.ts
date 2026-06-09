import { apiClient, type PaginatedData } from "@/lib/api-client";
import { type Booking } from "@/types/booking";
import { type BookingDto } from "@/types/api";
import { mapBooking, mapBookingWithDisplay, type BookingWithDisplay } from "@/services/mappers/booking-mapper";

type CreateBookingPayload = {
  timeslot_id: string;
  treatment_id: string;
  therapist_id: string;
  address: string;
  contact_phone: string;
  note?: string;
};

type CancelBookingPayload = {
  reason?: string;
};

export const bookingService = {
  async listBookings(): Promise<BookingWithDisplay[]> {
    const response = await apiClient.get<PaginatedData<BookingDto>>("/bookings/");
    return response.data.results.map(mapBookingWithDisplay);
  },

  async getBooking(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<BookingDto>(`/bookings/${id}/`);
      return mapBooking(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  async getBookingWithDisplay(id: string): Promise<BookingWithDisplay | null> {
    try {
      const response = await apiClient.get<BookingDto>(`/bookings/${id}/`);
      return mapBookingWithDisplay(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  async listBookingsByCustomer(customerId: string): Promise<BookingWithDisplay[]> {
    // Backend CustomerBookingListView automatically filters by request.user
    const response = await apiClient.get<PaginatedData<BookingDto>>("/bookings/");
    return response.data.results.map(mapBookingWithDisplay);
  },

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const response = await apiClient.post<BookingDto>("/bookings/create/", payload);
    return mapBooking(response.data);
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const payload: CancelBookingPayload = reason ? { reason } : {};
    const response = await apiClient.post<BookingDto>(`/bookings/${id}/cancel/`, payload);
    return mapBooking(response.data);
  },

  // Payment status methods kept for backward compatibility with payment flow
  async setBookingPaymentPending(id: string): Promise<Booking> {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    // Payment status is updated via payment service, not booking service
    // This method is a no-op placeholder for now
    return booking;
  },

  async markBookingPaid(id: string): Promise<Booking> {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    // Payment status is updated via payment service
    return booking;
  },

  async markBookingPaymentFailed(id: string): Promise<Booking> {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    // Payment status is updated via payment service
    return booking;
  },
};
