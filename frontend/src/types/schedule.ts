export type TimeSlot = {
  id: string;
  therapistId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: string;
};

export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type DaySchedule = {
  date: string;
  dayOfWeek: WeekDay;
  slots: TimeSlot[];
};
