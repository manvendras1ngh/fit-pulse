const KG_TO_LBS = 2.20462;

export type WeightUnit = "kg" | "lbs";

/** Convert a weight stored in kg to the user's preferred display unit. */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  if (unit === "lbs") {
    return Math.round(kg * KG_TO_LBS * 100) / 100;
  }
  return kg;
}

/** Convert a weight from the user's display unit back to kg for storage. */
export function toStorageWeight(value: number, unit: WeightUnit): number {
  if (unit === "lbs") {
    return Math.round((value / KG_TO_LBS) * 100) / 100;
  }
  return value;
}
