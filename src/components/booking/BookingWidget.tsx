import { useState, useMemo } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Star, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AvailabilityCalendar from "./AvailabilityCalendar";
import GuestSelector from "./GuestSelector";
import PriceSummary from "./PriceSummary";
import { calculateBookingPrice } from "@/lib/booking";
import { useAvailability } from "@/hooks/useAvailability";
import { useNavigate } from "react-router-dom";
import type { Property } from "@/lib/properties";

interface BookingWidgetProps {
  property: Property;
}

export default function BookingWidget({ property }: BookingWidgetProps) {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const { data: unavailableDates = [] } = useAvailability();

  const price = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    return calculateBookingPrice({
      nightlyRate: property.basePrice,
      checkIn: dateRange.from,
      checkOut: dateRange.to,
      cleaningFee: property.cleaningFee ?? 0,
    });
  }, [dateRange, property.basePrice, property.cleaningFee]);

  const totalGuests = adults + children;
  const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}${infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}`;

  const handleReserve = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    const params = new URLSearchParams({
      property: property.slug,
      checkIn: format(dateRange.from, "yyyy-MM-dd"),
      checkOut: format(dateRange.to, "yyyy-MM-dd"),
      guests: String(totalGuests),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="border border-stone bg-card p-6 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
      {/* Price & Rating */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-display text-2xl text-foreground">GHS {property.basePrice.toLocaleString()}</span>
          <span className="text-body-md text-light-mid"> / night</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-gold text-gold" />
          <span className="text-body-md text-foreground font-medium">5.0</span>
        </div>
      </div>

      {/* Date & Guest Picker */}
      <div className="mt-6 grid grid-cols-2 border border-stone">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button className="border-r border-b border-stone p-3 text-left hover:bg-cream/50 transition-colors">
              <span className="text-label-sm text-gold">Check-in</span>
              <p className="mt-1 text-body-md text-foreground">
                {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Select date"}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" side="bottom">
            <AvailabilityCalendar
              unavailableDates={unavailableDates}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                if (range?.from && range?.to) setCalendarOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <button
          className="border-b border-stone p-3 text-left hover:bg-cream/50 transition-colors"
          onClick={() => setCalendarOpen(true)}
        >
          <span className="text-label-sm text-gold">Check-out</span>
          <p className="mt-1 text-body-md text-foreground">
            {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Select date"}
          </p>
        </button>

        <Popover open={guestOpen} onOpenChange={setGuestOpen}>
          <PopoverTrigger asChild>
            <button className="col-span-2 p-3 text-left hover:bg-cream/50 transition-colors flex items-center justify-between">
              <div>
                <span className="text-label-sm text-gold">Guests</span>
                <p className="mt-1 text-body-md text-foreground">{guestLabel}</p>
              </div>
              <ChevronDown size={16} className="text-light-mid" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
              <GuestSelector
              adults={adults}
              children={children}
              infants={infants}
              maxGuests={property.maxGuests}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
              onInfantsChange={setInfants}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* CTA */}
      <button
        onClick={handleReserve}
        disabled={!dateRange?.from || !dateRange?.to}
        className="mt-4 w-full bg-gold py-4 text-label-lg font-semibold tracking-widest text-eden transition-all duration-300 hover:bg-gold-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {price ? "Reserve" : "Check Availability"}
      </button>

      {/* Price Summary */}
      {price && (
        <div className="mt-6">
          <PriceSummary nightlyRate={property.basePrice} price={price} />
        </div>
      )}
    </div>
  );
}
