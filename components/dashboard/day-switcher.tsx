"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { PlanWithDays } from "@/lib/types";

interface DaySwitcherProps {
  plan: PlanWithDays;
  currentDayOfWeek: number;
  onSelect: (dayOfWeek: number | "freestyle") => void;
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function DaySwitcher({
  plan,
  currentDayOfWeek,
  onSelect,
}: DaySwitcherProps) {
  const currentDay = plan.days.find((d) => d.day_of_week === currentDayOfWeek);
  const currentLabel = currentDay ? currentDay.name : "Freestyle";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-fp-text-secondary hover:text-fp-text-primary">
        {currentLabel}
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-fp-border bg-fp-bg-card"
      >
        {plan.days.map((day) => (
          <DropdownMenuItem
            key={day.id}
            onClick={() => onSelect(day.day_of_week)}
            className={`text-sm ${
              day.day_of_week === currentDayOfWeek
                ? "font-semibold text-fp-accent"
                : "text-fp-text-secondary"
            }`}
          >
            {DAY_LABELS[day.day_of_week]} — {day.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => onSelect("freestyle")}
          className="text-sm text-fp-text-secondary"
        >
          Freestyle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
