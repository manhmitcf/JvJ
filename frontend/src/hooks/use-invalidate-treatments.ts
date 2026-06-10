import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateTreatments() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["public", "treatments"] });
    queryClient.invalidateQueries({ queryKey: ["public", "featured-treatments"] });
    queryClient.invalidateQueries({ queryKey: ["public", "therapist-treatments"] });
    queryClient.invalidateQueries({ queryKey: ["public", "approved-therapists"] });
  };

  return { invalidateAll };
}
