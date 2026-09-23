import type { EligibleAttendee, LunchDay, Person } from "../domain/models.js";
import { LunchRepository } from "../persistence/repositories.js";

const positiveWholeNumber = (value: number, label: string) => {
  if (!Number.isInteger(value) || value < 1)
    throw new Error(`${label} must be a positive whole number.`);
};

export class RosterService {
  constructor(private readonly repository: LunchRepository) {}
  listPeople(): Promise<Person[]> {
    return this.repository.listPeople();
  }
  createPerson(displayName: string): Promise<Person> {
    const name = displayName.trim();
    if (!name) throw new Error("Display name is required.");
    return this.repository.createPerson(name);
  }
  archivePerson(id: number): Promise<void> {
    return this.repository.archivePerson(id);
  }
  removePerson(id: number): Promise<"deleted" | "archived"> {
    return this.repository.removePerson(id);
  }
}

export class LunchDayService {
  constructor(private readonly repository: LunchRepository) {}
  createLunchDay(date: string): Promise<LunchDay> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error("A valid lunch date is required.");
    return this.repository.createLunchDay(date);
  }
  listLunchDays(): Promise<LunchDay[]> {
    return this.repository.listLunchDays();
  }
  getLunchDay(id: number): Promise<LunchDay | null> {
    return this.repository.getLunchDay(id);
  }
  async recordAttendance(
    id: number,
    entries: LunchDay["attendance"],
  ): Promise<LunchDay> {
    await this.repository.updateAttendance(id, entries);
    return this.requireLunchDay(id);
  }
  async setParcelCapacity(
    id: number,
    parcelCapacity: number,
  ): Promise<LunchDay> {
    positiveWholeNumber(parcelCapacity, "Parcel capacity");
    await this.repository.updateParcelCapacity(id, parcelCapacity);
    return this.requireLunchDay(id);
  }
  async confirmParcelOrder(
    id: number,
    finalParcelOrder: number,
  ): Promise<LunchDay> {
    positiveWholeNumber(finalParcelOrder, "Final parcel order");
    await this.repository.confirmParcelOrder(id, finalParcelOrder);
    return this.requireLunchDay(id);
  }
  async getEligibleAttendees(id: number): Promise<EligibleAttendee[]> {
    const lunchDay = await this.requireLunchDay(id);
    if (lunchDay.orderNeedsReconfirmation)
      throw new Error("Lunch day requires order reconfirmation.");
    return lunchDay.attendance
      .filter((entry) => entry.attending && !entry.bringsHomeFood)
      .map(({ personId, displayName }) => ({ personId, displayName }));
  }
  deleteLunchDay(id: number): Promise<void> {
    return this.repository.deleteLunchDay(id);
  }
  async moveToGroup(
    id: number,
    personId: number,
    groupNumber: number,
  ): Promise<LunchDay> {
    const lunchDay = await this.requireLunchDay(id);
    if (
      !Number.isInteger(groupNumber) ||
      groupNumber < 1 ||
      groupNumber > lunchDay.groups.length
    )
      throw new Error("Select a valid group for this lunch day.");
    if (
      !lunchDay.attendance.some(
        (entry) => entry.personId === personId && entry.attending,
      )
    )
      throw new Error("Only attending people can be moved between groups.");
    await this.repository.setGroupOverride(id, personId, groupNumber);
    return this.requireLunchDay(id);
  }
  private async requireLunchDay(id: number): Promise<LunchDay> {
    const lunchDay = await this.repository.getLunchDay(id);
    if (!lunchDay) throw new Error("Lunch day was not found.");
    return lunchDay;
  }
}
