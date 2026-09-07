import express from "express";
import { LunchRepository } from "../roster-lunch-planning/persistence/repositories.js";
import {
  LunchDayService,
  RosterService,
} from "../roster-lunch-planning/application/services.js";
import { BillingRepository } from "../billing-history-balances/persistence/billing-repository.js";
import { BillingService } from "../billing-history-balances/application/services.js";

const repository = new LunchRepository();
const rosterService = new RosterService(repository);
const lunchDayService = new LunchDayService(repository);
const billingService = new BillingService(
  new BillingRepository(),
  lunchDayService,
);

export const app = express();
app.use(express.json());

const handle = (action: () => unknown, response: express.Response) => {
  try {
    response.json(action());
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Request failed.",
    });
  }
};

app.get("/api/people", (_request, response) =>
  handle(() => rosterService.listPeople(), response),
);
app.post("/api/people", (request, response) =>
  handle(() => rosterService.createPerson(request.body.displayName), response),
);
app.post("/api/people/:id/archive", (request, response) =>
  handle(() => {
    rosterService.archivePerson(Number(request.params.id));
    return { ok: true };
  }, response),
);
app.delete("/api/people/:id", (request, response) =>
  handle(
    () => ({ status: rosterService.removePerson(Number(request.params.id)) }),
    response,
  ),
);
app.get("/api/lunch-days", (_request, response) =>
  handle(() => lunchDayService.listLunchDays(), response),
);
app.get("/api/lunch-days/:id", (request, response) =>
  handle(
    () => lunchDayService.getLunchDay(Number(request.params.id)),
    response,
  ),
);
app.delete("/api/lunch-days/:id", (request, response) =>
  handle(() => {
    lunchDayService.deleteLunchDay(Number(request.params.id));
    return { ok: true };
  }, response),
);
app.post("/api/lunch-days", (request, response) =>
  handle(() => lunchDayService.createLunchDay(request.body.date), response),
);
app.put("/api/lunch-days/:id/attendance", (request, response) =>
  handle(
    () =>
      lunchDayService.recordAttendance(
        Number(request.params.id),
        request.body.attendance,
      ),
    response,
  ),
);
app.put("/api/lunch-days/:id/capacity", (request, response) =>
  handle(
    () =>
      lunchDayService.setParcelCapacity(
        Number(request.params.id),
        request.body.parcelCapacity,
      ),
    response,
  ),
);
app.put("/api/lunch-days/:id/order", (request, response) =>
  handle(
    () =>
      lunchDayService.confirmParcelOrder(
        Number(request.params.id),
        request.body.finalParcelOrder,
      ),
    response,
  ),
);
app.put("/api/lunch-days/:id/groups/move", (request, response) =>
  handle(
    () =>
      lunchDayService.moveToGroup(
        Number(request.params.id),
        request.body.personId,
        request.body.groupNumber,
      ),
    response,
  ),
);
app.get("/api/lunch-days/:id/charges", (request, response) =>
  handle(() => billingService.listCharges(Number(request.params.id)), response),
);
app.put("/api/lunch-days/:id/charges", (request, response) =>
  handle(
    () =>
      billingService.allocateCharges(
        Number(request.params.id),
        request.body.totalAmount,
      ),
    response,
  ),
);
app.put("/api/charges/:id/payment-status", (request, response) =>
  handle(
    () =>
      billingService.setPaymentStatus(
        Number(request.params.id),
        request.body.paid,
      ),
    response,
  ),
);
app.get("/api/balances", (_request, response) =>
  handle(() => billingService.listBalances(), response),
);

export default app;
