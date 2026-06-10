import { create } from "zustand";
import { type TimeSlot } from "@/types/schedule";
import {
  createTimeSlot,
  deleteTimeSlot,
  getTherapistSchedule,
  updateTimeSlot,
} from "../services/schedule-service";

type ScheduleStore = {
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  lastFetchParams: { startDate: string; endDate: string } | null;
  fetchSchedule: (startDate: string, endDate: string) => Promise<void>;
  createSlot: (data: { date: string; startTime: string; endTime: string; treatmentId?: string }) => Promise<TimeSlot>;
  updateSlot: (slotId: string, updates: Partial<{ startTime: string; endTime: string; isAvailable: boolean }>) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
  clearError: () => void;
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  slots: [],
  isLoading: false,
  error: null,
  lastFetchParams: null,

  fetchSchedule: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const slots = await getTherapistSchedule(startDate, endDate);
      set({ slots, isLoading: false, lastFetchParams: { startDate, endDate } });
    } catch (error) {
      console.error("[ScheduleStore] fetchSchedule error:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createSlot: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const slot = await createTimeSlot(data);
      const { lastFetchParams } = get();
      if (lastFetchParams) {
        await get().fetchSchedule(lastFetchParams.startDate, lastFetchParams.endDate);
      }
      return slot;
    } catch (error) {
      console.error("[ScheduleStore] createSlot error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateSlot: async (slotId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const slot = await updateTimeSlot(slotId, updates);
      set((state) => ({
        slots: state.slots.map((item) => (item.id === slotId ? slot : item)),
        isLoading: false,
      }));
    } catch (error) {
      console.error("[ScheduleStore] updateSlot error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteSlot: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTimeSlot(slotId);
      set((state) => ({ slots: state.slots.filter((slot) => slot.id !== slotId), isLoading: false }));
    } catch (error) {
      console.error("[ScheduleStore] deleteSlot error:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
