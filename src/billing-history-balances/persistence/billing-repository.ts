import { database } from "../../roster-lunch-planning/persistence/database.js";
import type {
  Charge,
  PersonBalance,
} from "../../roster-lunch-planning/domain/models.js";
import type { ChargeDraft } from "../domain/billing.js";

type ChargeRow = {
  id: number;
  lunch_day_id: number;
  person_id: number;
  display_name: string;
  amount: number;
  paid: number;
};
const toCharge = (row: ChargeRow): Charge => ({
  id: row.id,
  lunchDayId: row.lunch_day_id,
  personId: row.person_id,
  displayName: row.display_name,
  amount: row.amount,
  paid: Boolean(row.paid),
});

export class BillingRepository {
  listCharges(lunchDayId: number): Charge[] {
    return (
      database
        .prepare(
          "SELECT id, lunch_day_id, person_id, display_name, amount, paid FROM charges WHERE lunch_day_id = ? ORDER BY display_name, person_id",
        )
        .all(lunchDayId) as ChargeRow[]
    ).map(toCharge);
  }

  hasPaidCharges(lunchDayId: number): boolean {
    return Boolean(
      database
        .prepare(
          "SELECT 1 FROM charges WHERE lunch_day_id = ? AND paid = 1 LIMIT 1",
        )
        .get(lunchDayId),
    );
  }

  replaceCharges(lunchDayId: number, drafts: ChargeDraft[]): Charge[] {
    const remove = database.prepare(
      "DELETE FROM charges WHERE lunch_day_id = ?",
    );
    const insert = database.prepare(
      "INSERT INTO charges (lunch_day_id, person_id, display_name, amount) VALUES (?, ?, ?, ?)",
    );
    database.transaction(() => {
      remove.run(lunchDayId);
      drafts.forEach((draft) =>
        insert.run(
          draft.lunchDayId,
          draft.personId,
          draft.displayName,
          draft.amount,
        ),
      );
    })();
    return this.listCharges(lunchDayId);
  }

  setPaid(id: number, paid: boolean): Charge {
    database
      .prepare("UPDATE charges SET paid = ? WHERE id = ?")
      .run(Number(paid), id);
    const row = database
      .prepare(
        "SELECT id, lunch_day_id, person_id, display_name, amount, paid FROM charges WHERE id = ?",
      )
      .get(id) as ChargeRow | undefined;
    if (!row) throw new Error("Charge was not found.");
    return toCharge(row);
  }

  listBalances(): PersonBalance[] {
    return database
      .prepare(
        `SELECT p.id AS person_id, p.display_name,
          COALESCE(SUM(CASE WHEN c.paid = 0 THEN c.amount ELSE 0 END), 0) AS outstanding_amount,
          COUNT(DISTINCT CASE WHEN c.paid = 0 THEN c.lunch_day_id END) AS outstanding_days
         FROM people p LEFT JOIN charges c ON c.person_id = p.id
         GROUP BY p.id, p.display_name
         HAVING p.archived = 0 OR outstanding_amount > 0
         ORDER BY p.display_name`,
      )
      .all()
      .map((row: any) => ({
        personId: row.person_id,
        displayName: row.display_name,
        outstandingAmount: row.outstanding_amount,
        outstandingDays: row.outstanding_days,
      }));
  }
}
