import type {
  Charge,
  LunchDay,
  PersonBalance,
} from "../../roster-lunch-planning/domain/models.js";
import { LunchDayService } from "../../roster-lunch-planning/application/services.js";
import { splitCost } from "../domain/billing.js";
import { BillingRepository } from "../persistence/billing-repository.js";

export class BillingService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly lunchDayService: LunchDayService,
  ) {}

  allocateCharges(lunchDayId: number, totalAmount: number): Charge[] {
    const lunchDay = this.requireConfirmedLunchDay(lunchDayId);
    if (this.billingRepository.hasPaidCharges(lunchDayId))
      throw new Error("Cost cannot change after a payment has been recorded.");
    return this.billingRepository.replaceCharges(
      lunchDayId,
      splitCost(
        totalAmount,
        this.lunchDayService.getEligibleAttendees(lunchDay.id),
        lunchDay.id,
      ),
    );
  }

  setPaymentStatus(chargeId: number, paid: boolean): Charge {
    return this.billingRepository.setPaid(chargeId, paid);
  }
  listCharges(lunchDayId: number): Charge[] {
    return this.billingRepository.listCharges(lunchDayId);
  }
  listBalances(): PersonBalance[] {
    return this.billingRepository.listBalances();
  }
  private requireConfirmedLunchDay(id: number): LunchDay {
    const lunchDay = this.lunchDayService.getLunchDay(id);
    if (!lunchDay) throw new Error("Lunch day was not found.");
    if (lunchDay.finalParcelOrder === null || lunchDay.orderNeedsReconfirmation)
      throw new Error("Confirm the final parcel order before allocating cost.");
    return lunchDay;
  }
}
