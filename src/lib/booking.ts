import { differenceInDays } from "date-fns";

export interface BookingPrice {
  numNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export function calculateBookingPrice({
  nightlyRate,
  checkIn,
  checkOut,
  cleaningFee,
  serviceFeeRate = 0.08,
}: {
  nightlyRate: number;
  checkIn: Date;
  checkOut: Date;
  cleaningFee: number;
  serviceFeeRate?: number;
}): BookingPrice {
  const numNights = differenceInDays(checkOut, checkIn);
  const subtotal = nightlyRate * numNights;
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = subtotal + cleaningFee + serviceFee;
  return { numNights, subtotal, cleaningFee, serviceFee, total };
}
