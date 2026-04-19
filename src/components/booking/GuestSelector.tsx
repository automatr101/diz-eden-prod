import { Minus, Plus } from "lucide-react";

interface GuestSelectorProps {
  adults: number;
  children: number;
  infants: number;
  maxGuests: number;
  onAdultsChange: (v: number) => void;
  onChildrenChange: (v: number) => void;
  onInfantsChange: (v: number) => void;
}

function Stepper({
  label,
  description,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-stone last:border-0">
      <div>
        <p className="text-body-md text-charcoal font-medium">{label}</p>
        <p className="text-body-md text-light-mid">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 border border-stone flex items-center justify-center text-mid hover:border-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-display text-lg text-charcoal">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 border border-stone flex items-center justify-center text-mid hover:border-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function GuestSelector({
  adults,
  children,
  infants,
  maxGuests,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
}: GuestSelectorProps) {
  const totalGuests = adults + children;
  const remaining = maxGuests - totalGuests;

  return (
    <div className="p-4">
      <Stepper
        label="Adults"
        description="Age 13+"
        value={adults}
        min={1}
        max={adults + remaining}
        onChange={onAdultsChange}
      />
      <Stepper
        label="Children"
        description="Ages 2–12"
        value={children}
        min={0}
        max={children + remaining}
        onChange={onChildrenChange}
      />
      <Stepper
        label="Infants"
        description="Under 2"
        value={infants}
        min={0}
        max={5}
        onChange={onInfantsChange}
      />
      <p className="mt-3 text-body-md text-light-mid">
        Maximum {maxGuests} guests (not including infants)
      </p>
    </div>
  );
}
