export const VALID_TAGS = ["Đúng giờ", "Tận tâm", "Dễ chịu", "Sạch sẽ"] as const;

export type ReviewTag = (typeof VALID_TAGS)[number];

export type Review = {
  id: string;
  customerName: string;
  customerAvatar: string | null;
  treatmentName: string;
  rating: number;
  comment: string;
  tags: string[];
  isVisible: boolean;
  createdAt: string;
};

/** Review with bookingId for customer review flow tracking. */
export type ReviewWithBookingId = Review & {
  bookingId: string;
};
