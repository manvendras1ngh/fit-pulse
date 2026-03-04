"use client";

import { createContext, useContext } from "react";
import type { UnitPreference } from "@/lib/types";

const KG_TO_LBS = 2.20462;

const UnitContext = createContext<UnitPreference>("kg");

export function UnitProvider({
  unit,
  children,
}: {
  unit: UnitPreference;
  children: React.ReactNode;
}) {
  return <UnitContext.Provider value={unit}>{children}</UnitContext.Provider>;
}

export function useUnit() {
  const unit = useContext(UnitContext);

  const toDisplayWeight = (kg: number): number =>
    unit === "lbs" ? Math.round(kg * KG_TO_LBS * 10) / 10 : kg;

  const toStorageWeight = (display: number): number =>
    unit === "lbs" ? Math.round((display / KG_TO_LBS) * 10) / 10 : display;

  const unitLabel = unit;

  return { unit, unitLabel, toDisplayWeight, toStorageWeight };
}
