import {
  database,
  databaseReady,
} from "../../roster-lunch-planning/persistence/database.js";
import type {
  Charge,
  PersonBalance,
} from "../../roster-lunch-planning/domain/models.js";
import type { ChargeDraft } from "../domain/billing.js";

type ChargeRow = {
  id: number | string;
  lunch_day_id: number | string;
  person_id: number | string;
  display_name: string;
  amount: number;
  paid: number;
};
const toCharge = (row: ChargeRow): Charge => ({
  id: Number(row.id),
  lunchDayId: Number(row.lunch_day_id),
  personId: Number(row.person_id),
  displayName: row.display_name,
  amount: row.amount,
  paid: Boolean(row.paid),
});

export class BillingRepository {
  async listCharges(lunchDayId: number): Promise<Charge[]> {
    await databaseReady;
    return (
      await database.query<ChargeRow>(
        "SELECT id, lunch_day_id, person_id, display_name, amount, paid FROM charges WHERE lunch_day_id = $1 ORDER BY display_name, person_id",
        [lunchDayId],
      )
    ).map(toCharge);
  }
  async hasPaidCharges(lunchDayId: number): Promise<boolean> {
    await databaseReady;
    return (
      (
        await database.query(
          "SELECT 1 FROM charges WHERE lunch_day_id = $1 AND paid = 1 LIMIT 1",
          [lunchDayId],
        )
      ).length > 0
    );
  }
  async replaceCharges(
    lunchDayId: number,
    drafts: ChargeDraft[],
  ): Promise<Charge[]> {
    await databaseReady;
    await database.execute("DELETE FROM charges WHERE lunch_day_id = $1", [
      lunchDayId,
    ]);
    await Promise.all(
      drafts.map((draft) =>
        database.execute(
          "INSERT INTO charges (lunch_day_id, person_id, display_name, amount) VALUES ($1, $2, $3, $4)",
          [draft.lunchDayId, draft.personId, draft.displayName, draft.amount],
        ),
      ),
    );
    return this.listCharges(lunchDayId);
  }
  async setPaid(id: number, paid: boolean): Promise<Charge> {
    await databaseReady;
    await database.execute("UPDATE charges SET paid = $1 WHERE id = $2", [
      Number(paid),
      id,
    ]);
    const [row] = await database.query<ChargeRow>(
      "SELECT id, lunch_day_id, person_id, display_name, amount, paid FROM charges WHERE id = $1",
      [id],
    );
    if (!row) throw new Error("Charge was not found.");
    return toCharge(row);
  }
  async listBalances(): Promise<PersonBalance[]> {
    await databaseReady;
    const rows = await database.query<{
      person_id: number | string;
      display_name: string;
      outstanding_amount: number;
      outstanding_days: number;
    }>(
      `SELECT p.id AS person_id, p.display_name, COALESCE(SUM(CASE WHEN c.paid = 0 THEN c.amount ELSE 0 END), 0) AS outstanding_amount, COUNT(DISTINCT CASE WHEN c.paid = 0 THEN c.lunch_day_id END) AS outstanding_days FROM people p LEFT JOIN charges c ON c.person_id = p.id GROUP BY p.id, p.display_name HAVING p.archived = 0 OR COALESCE(SUM(CASE WHEN c.paid = 0 THEN c.amount ELSE 0 END), 0) > 0 ORDER BY p.display_name`,
    );
    return rows.map((row) => ({
      personId: Number(row.person_id),
      displayName: row.display_name,
      outstandingAmount: Number(row.outstanding_amount),
      outstandingDays: Number(row.outstanding_days),
    }));
  }
}
