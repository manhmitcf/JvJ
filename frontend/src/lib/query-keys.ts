// TanStack Query cache keys
export const queryKeys = {
  // Public treatments
  publicTreatments: ["public", "treatments"] as const,
  publicTreatment: (id: string) => ["public", "treatment", id] as const,
  publicTherapistTreatments: (therapistId: string) => ["public", "therapist-treatments", therapistId] as const,

  // Therapist treatments
  therapistTreatments: ["therapist", "treatments"] as const,
};
