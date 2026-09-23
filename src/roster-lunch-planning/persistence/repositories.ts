import { database, databaseReady } from "./database.js";
import type { Attendance, LunchDay, Person } from "../domain/models.js";
import {
  allocateGroups,
  applyGroupOverrides,
  recommendParcels,
} from "../domain/allocation.js";

type PersonRow = {
  id: number | string;
  display_name: string;
  archived: number;
};
type LunchDayRow = {
  id: number | string;
  date: string;
  parcel_capacity: number;
  final_parcel_order: number | null;
  order_needs_reconfirmation: number;
};
type AttendanceRow = {
  person_id: number | string;
  display_name: string;
  attending: number;
  brings_home_food: number;
};
const toId = (value: number | string) => Number(value);
const toPerson = (row: PersonRow): Person => ({
  id: toId(row.id),
  displayName: row.display_name,
  archived: Boolean(row.archived),
});

export class LunchRepository {
  async listPeople(): Promise<Person[]> {
    await databaseReady;
    return (
      await database.query<PersonRow>(
        "SELECT id, display_name, archived FROM people ORDER BY archived, display_name",
      )
    ).map(toPerson);
  }

  async createPerson(displayName: string): Promise<Person> {
    await databaseReady;
    try {
      await database.execute("INSERT INTO people (display_name) VALUES ($1)", [
        displayName,
      ]);
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message))
        throw new Error("This name already exists.");
      throw error;
    }
    const [person] = await database.query<PersonRow>(
      "SELECT id, display_name, archived FROM people WHERE display_name = $1 AND archived = 0",
      [displayName],
    );
    return toPerson(person);
  }

  async archivePerson(id: number): Promise<void> {
    await databaseReady;
    await database.execute("UPDATE people SET archived = 1 WHERE id = $1", [
      id,
    ]);
  }

  async removePerson(id: number): Promise<"deleted" | "archived"> {
    await databaseReady;
    const referenced = await database.query<{ found: number }>(
      "SELECT 1 AS found FROM attendance WHERE person_id = $1 LIMIT 1",
      [id],
    );
    if (referenced.length) {
      await this.archivePerson(id);
      return "archived";
    }
    await database.execute("DELETE FROM people WHERE id = $1", [id]);
    return "deleted";
  }

  async createLunchDay(date: string): Promise<LunchDay> {
    await databaseReady;
    try {
      await database.execute(
        "INSERT INTO lunch_days (date, parcel_capacity) VALUES ($1, 2)",
        [date],
      );
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message))
        throw new Error("This date already exists.");
      throw error;
    }
    const [day] = await database.query<LunchDayRow>(
      "SELECT id, date, parcel_capacity, final_parcel_order, order_needs_reconfirmation FROM lunch_days WHERE date = $1",
      [date],
    );
    const activePeople = await database.query<{ id: number | string }>(
      "SELECT id FROM people WHERE archived = 0",
    );
    await Promise.all(
      activePeople.map((person) =>
        database.execute(
          "INSERT INTO attendance (lunch_day_id, person_id, attending, brings_home_food) VALUES ($1, $2, 1, 0)",
          [toId(day.id), toId(person.id)],
        ),
      ),
    );
    return (await this.getLunchDay(toId(day.id)))!;
  }

  async updateAttendance(
    lunchDayId: number,
    entries: Array<
      Pick<Attendance, "personId" | "attending" | "bringsHomeFood">
    >,
  ): Promise<void> {
    await databaseReady;
    await Promise.all(
      entries.map((entry) =>
        database.execute(
          "UPDATE attendance SET attending = $1, brings_home_food = $2 WHERE lunch_day_id = $3 AND person_id = $4",
          [
            Number(entry.attending),
            Number(entry.attending && entry.bringsHomeFood),
            lunchDayId,
            entry.personId,
          ],
        ),
      ),
    );
    await database.execute(
      "UPDATE lunch_days SET order_needs_reconfirmation = CASE WHEN final_parcel_order IS NULL THEN 0 ELSE 1 END WHERE id = $1",
      [lunchDayId],
    );
  }

  async updateParcelCapacity(
    lunchDayId: number,
    parcelCapacity: number,
  ): Promise<void> {
    await databaseReady;
    await database.execute(
      "UPDATE lunch_days SET parcel_capacity = $1, order_needs_reconfirmation = CASE WHEN final_parcel_order IS NULL THEN 0 ELSE 1 END WHERE id = $2",
      [parcelCapacity, lunchDayId],
    );
  }

  async confirmParcelOrder(
    lunchDayId: number,
    finalParcelOrder: number,
  ): Promise<void> {
    await databaseReady;
    await database.execute(
      "UPDATE lunch_days SET final_parcel_order = $1, order_needs_reconfirmation = 0 WHERE id = $2",
      [finalParcelOrder, lunchDayId],
    );
  }

  async deleteLunchDay(id: number): Promise<void> {
    await databaseReady;
    if (!(await this.getLunchDay(id)))
      throw new Error("Lunch day was not found.");
    await database.execute("DELETE FROM lunch_days WHERE id = $1", [id]);
  }

  async setGroupOverride(
    lunchDayId: number,
    personId: number,
    groupNumber: number,
  ): Promise<void> {
    await databaseReady;
    await database.execute(
      "INSERT INTO group_overrides (lunch_day_id, person_id, group_number) VALUES ($1, $2, $3) ON CONFLICT(lunch_day_id, person_id) DO UPDATE SET group_number = EXCLUDED.group_number",
      [lunchDayId, personId, groupNumber],
    );
  }

  private async getGroupOverrides(
    lunchDayId: number,
  ): Promise<Map<number, number>> {
    const rows = await database.query<{
      person_id: number | string;
      group_number: number;
    }>(
      "SELECT person_id, group_number FROM group_overrides WHERE lunch_day_id = $1",
      [lunchDayId],
    );
    return new Map(rows.map((row) => [toId(row.person_id), row.group_number]));
  }

  async getLunchDay(id: number): Promise<LunchDay | null> {
    await databaseReady;
    const [day] = await database.query<LunchDayRow>(
      "SELECT id, date, parcel_capacity, final_parcel_order, order_needs_reconfirmation FROM lunch_days WHERE id = $1",
      [id],
    );
    if (!day) return null;
    await this.backfillAttendance(toId(day.id));
    return this.hydrateLunchDay(day);
  }

  async listLunchDays(): Promise<LunchDay[]> {
    await databaseReady;
    const days = await database.query<LunchDayRow>(
      "SELECT id, date, parcel_capacity, final_parcel_order, order_needs_reconfirmation FROM lunch_days ORDER BY date DESC",
    );
    await Promise.all(days.map((day) => this.backfillAttendance(toId(day.id))));
    return Promise.all(days.map((day) => this.hydrateLunchDay(day)));
  }

  private async backfillAttendance(lunchDayId: number): Promise<void> {
    await database.execute(
      `INSERT INTO attendance (lunch_day_id, person_id, attending, brings_home_food) SELECT $1, p.id, 1, 0 FROM people p WHERE p.archived = 0 AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.lunch_day_id = $2 AND a.person_id = p.id)`,
      [lunchDayId, lunchDayId],
    );
  }

  private async hydrateLunchDay(day: LunchDayRow): Promise<LunchDay> {
    const id = toId(day.id);
    const attendance = (
      await database.query<AttendanceRow>(
        "SELECT a.person_id, p.display_name, a.attending, a.brings_home_food FROM attendance a JOIN people p ON p.id = a.person_id WHERE a.lunch_day_id = $1 ORDER BY p.display_name",
        [id],
      )
    ).map((entry) => ({
      personId: toId(entry.person_id),
      displayName: entry.display_name,
      attending: Boolean(entry.attending),
      bringsHomeFood: Boolean(entry.brings_home_food),
    }));
    return {
      id,
      date: day.date,
      parcelCapacity: day.parcel_capacity,
      parcelRecommendation: recommendParcels(attendance, day.parcel_capacity),
      finalParcelOrder: day.final_parcel_order,
      orderNeedsReconfirmation: Boolean(day.order_needs_reconfirmation),
      attendance,
      groups: applyGroupOverrides(
        allocateGroups(attendance),
        await this.getGroupOverrides(id),
      ),
    };
  }
}
