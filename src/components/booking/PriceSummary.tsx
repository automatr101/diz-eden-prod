import type { BookingPrice } from "@/lib/booking";

interface PriceSummaryProps {
  nightlyRate: number;
  price: BookingPrice;
}

export default function PriceSummary({ nightlyRate, price }: PriceSummaryProps) {
  return (
    <div className="space-y-3 text-body-md">
      <div className="flex justify-between text-mid">
        <span>${nightlyRate} × {price.numNights} night{price.numNights !== 1 ? "s" : ""}</span>
        <span>${price.subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-mid">
        <span>Cleaning fee</span>
        <span>${price.cleaningFee}</span>
      </div>
      <div className="flex justify-between text-mid">
        <span>Service fee</span>
        <span>${price.serviceFee}</span>
      </div>
      <div className="border-t border-stone pt-3 flex justify-between font-medium text-charcoal">
        <span>Total (before taxes)</span>
        <span>${price.total.toLocaleString()}</span>
      </div>
    </div>
  );
}
