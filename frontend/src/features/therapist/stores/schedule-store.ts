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
  fetchSchedule: (startDate: string, endDate: string) => Promise<void>;
  createSlot: (data: { date: string; startTime: string; endTime: string; treatmentId?: string }) => Promise<void>;
  updateSlot: (slotId: string, updates: Partial<{ startTime: string; endTime: string; isAvailable: boolean }>) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
};

export const useScheduleStore = create<ScheduleStore>((set) => ({
  slots: [],
  isLoading: false,
  error: null,

  fetchSchedule: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const slots = await getTherapistSchedule(startDate, endDate);
      set({ slots, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createSlot: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const slot = await createTimeSlot(data);
      set((state) => ({ slots: [...state.slots, slot], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
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
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteSlot: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTimeSlot(slotId);
      set((state) => ({ slots: state.slots.filter((slot) => slot.id !== slotId), isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
