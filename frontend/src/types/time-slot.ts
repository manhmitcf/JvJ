export type TimeSlotStatus = "available" | "booked" | "disabled";

export type TimeSlot = {
  id: string;
  therapistId: string;
  treatmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus;
};
