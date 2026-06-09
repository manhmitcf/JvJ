import { create } from "zustand";
import { type Therapist } from "@/types/therapist";
import {
  getTherapistProfile,
  updateTherapistProfile,
  toggleOnlineStatus,
  type UpdateProfileInput,
} from "../services/profile-service";

type ProfileStore = {
  profile: Therapist | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (input: UpdateProfileInput) => Promise<void>;
  toggleOnline: (isOnline: boolean) => Promise<void>;
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getTherapistProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  saveProfile: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await updateTherapistProfile(input);
      set({ profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  toggleOnline: async (isOnline) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    // Optimistic update
    set({ profile: { ...currentProfile, isOnline } });

    try {
      const newIsOnline = await toggleOnlineStatus(isOnline);
      set({ profile: { ...currentProfile, isOnline: newIsOnline } });
    } catch (error) {
      // Rollback on error
      set({ profile: currentProfile, error: (error as Error).message });
    }
  },
}));
