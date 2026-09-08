import { database } from "./database.js";
import type { Attendance, LunchDay, Person } from "../domain/models.js";
import {
  allocateGroups,
  applyGroupOverrides,
  recommendParcels,
} from "../domain/allocation.js";

type PersonRow = { id: number; display_name: string; archived: number };
type LunchDayRow = {
  id: number;
  date: string;
  parcel_capacity: number;
  final_parcel_order: number | null;
  order_needs_reconfirmation: number;
};
type AttendanceRow = {
  person_id: number;
  display_name: string;
  attending: number;
  brings_home_food: number;
};

const toPerson = (row: PersonRow): Person => ({
  id: row.id,
  displayName: row.display_name,
  archived: Boolean(row.archived),
});

export class LunchRepository {
  listPeople(): Person[] {
    return (
      database
        .prepare(
          "SELECT id, display_name, archived FROM people ORDER BY archived, display_name",
        )
        .all() as PersonRow[]
    ).map(toPerson);
  }

  createPerson(displayName: string): Person {
    try {
      const result = database
        .prepare("INSERT INTO people (display_name) VALUES (?)")
        .run(displayName);
      return {
        id: Number(result.lastInsertRowid),
        displayName,
        archived: false,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw new Error("This name already exists.");
      }
      throw error;
    }
  }

  archivePerson(id: number): void {
    database.prepare("UPDATE people SET archived = 1 WHERE id = ?").run(id);
  }

  removePerson(id: number): "deleted" | "archived" {
    try {
      const result = database
        .prepare("DELETE FROM people WHERE id = ?")
        .run(id);
      if (result.changes === 0) throw new Error("Person was not found.");
      return "deleted";
    } catch (error) {
      if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
        database.prepare("UPDATE people SET archived = 1 WHERE id = ?").run(id);
        return "archived";
      }
      throw error;
    }
  }

  createLunchDay(date: string): LunchDay {
    let lunchDayId: number;
    try {
      const result = database
        .prepare("INSERT INTO lunch_days (date) VALUES (?)")
        .run(date);
      lunchDayId = Number(result.lastInsertRowid);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw new Error("This date already exists.");
      }
      throw error;
    }
    const activePeople = database
      .prepare("SELECT id FROM people WHERE archived = 0")
      .all() as Array<{ id: number }>;
    const addAttendance = database.prepare(
      "INSERT INTO attendance (lunch_day_id, person_id, attending, brings_home_food) VALUES (?, ?, 1, 0)",
    );
    const transaction = database.transaction(() =>
      activePeople.forEach((person) =>
        addAttendance.run(lunchDayId, person.id),
      ),
    );
    transaction();
    return this.getLunchDay(lunchDayId)!;
  }

  updateAttendance(
    lunchDayId: number,
    entries: Array<
      Pick<Attendance, "personId" | "attending" | "bringsHomeFood">
    >,
  ): void {
    const update = database.prepare(
      "UPDATE attendance SET attending = ?, brings_home_food = ? WHERE lunch_day_id = ? AND person_id = ?",
    );
    const transaction = database.transaction(() =>
      entries.forEach((entry) =>
        update.run(
          Number(entry.attending),
          Number(entry.attending && entry.bringsHomeFood),
          lunchDayId,
          entry.personId,
        ),
      ),
    );
    transaction();
    database
      .prepare(
        "UPDATE lunch_days SET order_needs_reconfirmation = CASE WHEN final_parcel_order IS NULL THEN 0 ELSE 1 END WHERE id = ?",
      )
      .run(lunchDayId);
  }

  updateParcelCapacity(lunchDayId: number, parcelCapacity: number): void {
    database
      .prepare(
        "UPDATE lunch_days SET parcel_capacity = ?, order_needs_reconfirmation = CASE WHEN final_parcel_order IS NULL THEN 0 ELSE 1 END WHERE id = ?",
      )
      .run(parcelCapacity, lunchDayId);
  }

  confirmParcelOrder(lunchDayId: number, finalParcelOrder: number): void {
    database
      .prepare(
        "UPDATE lunch_days SET final_parcel_order = ?, order_needs_reconfirmation = 0 WHERE id = ?",
      )
      .run(finalParcelOrder, lunchDayId);
  }

  deleteLunchDay(id: number): void {
    const result = database
      .prepare("DELETE FROM lunch_days WHERE id = ?")
      .run(id);
    if (result.changes === 0) throw new Error("Lunch day was not found.");
  }

  setGroupOverride(
    lunchDayId: number,
    personId: number,
    groupNumber: number,
  ): void {
    database
      .prepare(
        "INSERT INTO group_overrides (lunch_day_id, person_id, group_number) VALUES (?, ?, ?) ON CONFLICT(lunch_day_id, person_id) DO UPDATE SET group_number = excluded.group_number",
      )
      .run(lunchDayId, personId, groupNumber);
  }

  private getGroupOverrides(lunchDayId: number): Map<number, number> {
    const rows = database
      .prepare(
        "SELECT person_id, group_number FROM group_overrides WHERE lunch_day_id = ?",
      )
      .all(lunchDayId) as Array<{ person_id: number; group_number: number }>;
    return new Map(rows.map((row) => [row.person_id, row.group_number]));
  }

  getLunchDay(id: number): LunchDay | null {
    const day = database
      .prepare(
        "SELECT id, date, parcel_capacity, final_parcel_order, order_needs_reconfirmation FROM lunch_days WHERE id = ?",
      )
      .get(id) as LunchDayRow | undefined;
    if (!day) return null;
    this.backfillAttendance(day.id);
    return this.hydrateLunchDay(day);
  }

  listLunchDays(): LunchDay[] {
    const days = database
      .prepare(
        "SELECT id, date, parcel_capacity, final_parcel_order, order_needs_reconfirmation FROM lunch_days ORDER BY date DESC",
      )
      .all() as LunchDayRow[];
    days.forEach((day) => this.backfillAttendance(day.id));
    return days.map((day) => this.hydrateLunchDay(day));
  }

  // Keeps existing lunch days in sync with people added to the roster after the day was created.
  private backfillAttendance(lunchDayId: number): void {
    database
      .prepare(
        `INSERT INTO attendance (lunch_day_id, person_id, attending, brings_home_food)
         SELECT ?, p.id, 1, 0 FROM people p
         WHERE p.archived = 0
           AND NOT EXISTS (
             SELECT 1 FROM attendance a
             WHERE a.lunch_day_id = ? AND a.person_id = p.id
           )`,
      )
      .run(lunchDayId, lunchDayId);
  }

  private hydrateLunchDay(day: LunchDayRow): LunchDay {
    const attendance = (
      database
        .prepare(
          `SELECT a.person_id, p.display_name, a.attending, a.brings_home_food FROM attendance a JOIN people p ON p.id = a.person_id WHERE a.lunch_day_id = ? ORDER BY p.display_name`,
        )
        .all(day.id) as AttendanceRow[]
    ).map((entry) => ({
      personId: entry.person_id,
      displayName: entry.display_name,
      attending: Boolean(entry.attending),
      bringsHomeFood: Boolean(entry.brings_home_food),
    }));
    return {
      id: day.id,
      date: day.date,
      parcelCapacity: day.parcel_capacity,
      parcelRecommendation: recommendParcels(attendance, day.parcel_capacity),
      finalParcelOrder: day.final_parcel_order,
      orderNeedsReconfirmation: Boolean(day.order_needs_reconfirmation),
      attendance,
      groups: applyGroupOverrides(
        allocateGroups(attendance),
        this.getGroupOverrides(day.id),
      ),
    };
  }
}
