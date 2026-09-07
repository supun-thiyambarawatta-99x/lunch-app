import type {
  Charge,
  EligibleAttendee,
} from "../../roster-lunch-planning/domain/models.js";

export type ChargeDraft = Omit<Charge, "id" | "paid">;

export function splitCost(
  totalAmount: number,
  eligibleAttendees: EligibleAttendee[],
  lunchDayId: number,
): ChargeDraft[] {
  if (!Number.isInteger(totalAmount) || totalAmount < 0)
    throw new Error(
      "Total cost must be a non-negative whole number of smallest currency units.",
    );
  if (eligibleAttendees.length === 0)
    throw new Error("No eligible attendees exist for cost allocation.");
  const sorted = [...eligibleAttendees].sort(
    (left, right) =>
      left.displayName.localeCompare(right.displayName) ||
      left.personId - right.personId,
  );
  const baseAmount = Math.floor(totalAmount / sorted.length);
  const remainder = totalAmount % sorted.length;
  return sorted.map((person, index) => ({
    lunchDayId,
    personId: person.personId,
    displayName: person.displayName,
    amount: baseAmount + (index < remainder ? 1 : 0),
  }));
}
