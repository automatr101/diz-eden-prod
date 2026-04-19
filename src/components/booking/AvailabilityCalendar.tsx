import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { isSameDay, addDays, addYears } from "date-fns";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  unavailableDates: Date[];
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
}

export default function AvailabilityCalendar({
  unavailableDates,
  selected,
  onSelect,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const maxDate = addYears(today, 1);

  const isUnavailable = (date: Date) =>
    unavailableDates.some((d) => isSameDay(d, date));

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={2}
      disabled={[{ before: today }, { after: maxDate }, isUnavailable]}
      fromMonth={today}
      toMonth={maxDate}
      className="p-3 pointer-events-auto"
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "font-display text-lg text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 text-white/50 hover:text-white border border-white/10 rounded-lg inline-flex items-center justify-center transition-colors hover:bg-white/5"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-gold uppercase tracking-widest w-10 font-body text-[10px] font-bold",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative",
        day: cn(
          "h-10 w-10 p-0 font-body text-body-md text-white hover:bg-white/10 rounded-lg transition-colors inline-flex items-center justify-center"
        ),
        day_range_start: "bg-gold text-eden hover:bg-white rounded-l-lg rounded-r-none font-bold",
        day_range_end: "bg-gold text-eden hover:bg-white rounded-r-lg rounded-l-none font-bold",
        day_range_middle: "bg-gold/20 text-white rounded-none",
        day_selected: "bg-gold text-eden font-bold",
        day_today: "border border-gold text-gold font-bold",
        day_outside: "text-white/20",
        day_disabled: "text-white/20 opacity-30 line-through bg-red-500/5",
        day_hidden: "invisible",
      }}
    />
  );
}
