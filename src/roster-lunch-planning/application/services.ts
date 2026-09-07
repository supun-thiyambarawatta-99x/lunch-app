import type { EligibleAttendee, LunchDay, Person } from "../domain/models.js";
import { LunchRepository } from "../persistence/repositories.js";

const nonBlankName = (displayName: string) => displayName.trim();
const positiveWholeNumber = (value: number, label: string) => {
  if (!Number.isInteger(value) || value < 1)
    throw new Error(`${label} must be a positive whole number.`);
};

export class RosterService {
  constructor(private readonly repository: LunchRepository) {}
  listPeople(): Person[] {
    return this.repository.listPeople();
  }
  createPerson(displayName: string): Person {
    const name = nonBlankName(displayName);
    if (!name) throw new Error("Display name is required.");
    return this.repository.createPerson(name);
  }
  archivePerson(id: number): void {
    this.repository.archivePerson(id);
  }

  removePerson(id: number): "deleted" | "archived" {
    return this.repository.removePerson(id);
  }
}

export class LunchDayService {
  constructor(private readonly repository: LunchRepository) {}
  createLunchDay(date: string): LunchDay {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error("A valid lunch date is required.");
    return this.repository.createLunchDay(date);
  }
  listLunchDays(): LunchDay[] {
    return this.repository.listLunchDays();
  }
  getLunchDay(id: number): LunchDay | null {
    return this.repository.getLunchDay(id);
  }
  recordAttendance(id: number, entries: LunchDay["attendance"]): LunchDay {
    this.repository.updateAttendance(id, entries);
    return this.requireLunchDay(id);
  }
  setParcelCapacity(id: number, parcelCapacity: number): LunchDay {
    positiveWholeNumber(parcelCapacity, "Parcel capacity");
    this.repository.updateParcelCapacity(id, parcelCapacity);
    return this.requireLunchDay(id);
  }
  confirmParcelOrder(id: number, finalParcelOrder: number): LunchDay {
    positiveWholeNumber(finalParcelOrder, "Final parcel order");
    this.repository.confirmParcelOrder(id, finalParcelOrder);
    return this.requireLunchDay(id);
  }
  getEligibleAttendees(id: number): EligibleAttendee[] {
    const lunchDay = this.requireLunchDay(id);
    if (lunchDay.orderNeedsReconfirmation)
      throw new Error("Lunch day requires order reconfirmation.");
    return lunchDay.attendance
      .filter((entry) => entry.attending && !entry.bringsHomeFood)
      .map(({ personId, displayName }) => ({ personId, displayName }));
  }
  deleteLunchDay(id: number): void {
    this.repository.deleteLunchDay(id);
  }
  moveToGroup(id: number, personId: number, groupNumber: number): LunchDay {
    const lunchDay = this.requireLunchDay(id);
    if (
      !Number.isInteger(groupNumber) ||
      groupNumber < 1 ||
      groupNumber > lunchDay.groups.length
    ) {
      throw new Error("Select a valid group for this lunch day.");
    }
    const isEligible = lunchDay.attendance.some(
      (entry) => entry.personId === personId && entry.attending,
    );
    if (!isEligible)
      throw new Error("Only attending people can be moved between groups.");
    this.repository.setGroupOverride(id, personId, groupNumber);
    return this.requireLunchDay(id);
  }
  private requireLunchDay(id: number): LunchDay {
    const lunchDay = this.repository.getLunchDay(id);
    if (!lunchDay) throw new Error("Lunch day was not found.");
    return lunchDay;
  }
}
