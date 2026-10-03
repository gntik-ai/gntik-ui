import type { TimeSlot } from './TimeSlotPicker';

const busy = new Set(['09:00', '09:30', '12:00', '14:30', '15:00', '18:30']);

/** Half-hour slots from 09:00 to 21:00 with a few already taken. */
export const sampleTimeSlots: TimeSlot[] = Array.from({ length: 25 }, (_, i) => {
  const minutes = 9 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return { value, available: !busy.has(value) };
});
