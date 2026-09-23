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
  async allocateCharges(
    lunchDayId: number,
    totalAmount: number,
  ): Promise<Charge[]> {
    const lunchDay = await this.requireConfirmedLunchDay(lunchDayId);
    if (await this.billingRepository.hasPaidCharges(lunchDayId))
      throw new Error("Cost cannot change after a payment has been recorded.");
    return this.billingRepository.replaceCharges(
      lunchDayId,
      splitCost(
        totalAmount,
        await this.lunchDayService.getEligibleAttendees(lunchDay.id),
        lunchDay.id,
      ),
    );
  }
  setPaymentStatus(chargeId: number, paid: boolean): Promise<Charge> {
    return this.billingRepository.setPaid(chargeId, paid);
  }
  listCharges(lunchDayId: number): Promise<Charge[]> {
    return this.billingRepository.listCharges(lunchDayId);
  }
  listBalances(): Promise<PersonBalance[]> {
    return this.billingRepository.listBalances();
  }
  private async requireConfirmedLunchDay(id: number): Promise<LunchDay> {
    const lunchDay = await this.lunchDayService.getLunchDay(id);
    if (!lunchDay) throw new Error("Lunch day was not found.");
    if (lunchDay.finalParcelOrder === null || lunchDay.orderNeedsReconfirmation)
      throw new Error("Confirm the final parcel order before allocating cost.");
    return lunchDay;
  }
}
