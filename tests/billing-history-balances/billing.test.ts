import { describe, expect, it } from "vitest";
import { splitCost } from "../../src/billing-history-balances/domain/billing";
import { BillingService } from "../../src/billing-history-balances/application/services";

describe("splitCost", () => {
  it("preserves the total and assigns remainders by display name", () => {
    const charges = splitCost(
      100,
      [
        { personId: 3, displayName: "Chen" },
        { personId: 1, displayName: "Asha" },
        { personId: 2, displayName: "Ben" },
      ],
      4,
    );
    expect(
      charges.map((charge) => [charge.displayName, charge.amount]),
    ).toEqual([
      ["Asha", 34],
      ["Ben", 33],
      ["Chen", 33],
    ]);
    expect(charges.reduce((total, charge) => total + charge.amount, 0)).toBe(
      100,
    );
  });

  it("rejects allocation without eligible attendees", () => {
    expect(() => splitCost(100, [], 4)).toThrow("No eligible attendees");
  });
});

describe("BillingService", () => {
  const lunchDayService = {
    getLunchDay: async () => ({
      id: 4,
      finalParcelOrder: 2,
      orderNeedsReconfirmation: false,
    }),
    getEligibleAttendees: async () => [{ personId: 1, displayName: "Asha" }],
  };

  it("blocks allocation after any charge was paid", async () => {
    const service = new BillingService(
      { hasPaidCharges: async () => true } as never,
      lunchDayService as never,
    );
    await expect(service.allocateCharges(4, 100)).rejects.toThrow(
      "cannot change after a payment",
    );
  });

  it("blocks allocation when the final order is unconfirmed", async () => {
    const service = new BillingService(
      { hasPaidCharges: async () => false } as never,
      {
        ...lunchDayService,
        getLunchDay: async () => ({
          id: 4,
          finalParcelOrder: null,
          orderNeedsReconfirmation: false,
        }),
      } as never,
    );
    await expect(service.allocateCharges(4, 100)).rejects.toThrow(
      "Confirm the final parcel order",
    );
  });
});
