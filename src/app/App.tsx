import { FormEvent, useEffect, useRef, useState } from "react";
import type { LunchDay, Person, PersonBalance } from "../roster-lunch-planning/domain/models";
import { BillingPanel } from "../billing-history-balances/ui/BillingPanel";
import { ToastTray } from "./ToastTray";
import { useToast } from "./useToast";
import { TrashIcon } from "./TrashIcon";
import { LandingScreen } from "./LandingScreen";
import "./landing.css";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const contentType = response.headers?.get?.("content-type") ?? "application/json";
  const body = typeof response.text === "function"
    ? await response.text()
    : JSON.stringify(await response.json());
  let result: { error?: string } & T;
  try {
    result = contentType.includes("application/json") ? JSON.parse(body) : ({} as { error?: string } & T);
  } catch {
    throw new Error(`API returned invalid JSON (${response.status}).`);
  }
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status}).`);
  if (!contentType.includes("application/json")) {
    throw new Error(`API returned an unexpected response (${response.status}).`);
  }
  return result as T;
}

const friendlyDateError = (message: string) =>
  message.toLowerCase().includes("already exists") || message.toLowerCase().includes("unique constraint")
    ? "This date already exists."
    : message;

const friendlyNameError = (message: string) =>
  message.toLowerCase().includes("already exists") || message.toLowerCase().includes("unique constraint")
    ? "This name already exists."
    : message;

export function App() {
  const [started, setStarted] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [lunchDays, setLunchDays] = useState<LunchDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<LunchDay | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dateError, setDateError] = useState("");
  const [error, setError] = useState("");
  const [orderInput, setOrderInput] = useState("");
  const [balances, setBalances] = useState<PersonBalance[]>([]);
  const { toasts, pushToast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const selectedDayRef = useRef<LunchDay | null>(null);
  const attendanceSaveChain = useRef(Promise.resolve());

  selectedDayRef.current = selectedDay;

  const refreshBalances = async () => {
    try {
      setBalances(await request<PersonBalance[]>("/api/balances"));
    } catch (failure) {
      pushToast("error", (failure as Error).message);
    }
  };

  const refreshLists = async () => {
    try {
      const dashboard = await request<{
        people: Person[];
        lunchDays: LunchDay[];
        balances: PersonBalance[];
      }>("/api/bootstrap");
      setPeople(dashboard.people);
      setLunchDays(dashboard.lunchDays);
      setBalances(dashboard.balances);
      setSelectedDay((current) => (current && !dashboard.lunchDays.some((day) => day.id === current.id) ? null : current));
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "Unable to load lunch data.";
      setError(message);
      pushToast("error", message);
    }
  };
  useEffect(() => {
    if (started) void refreshLists();
  }, [started]);

  useEffect(() => {
    if (!selectedDay) { setOrderInput(""); return; }
    setOrderInput(String(selectedDay.finalParcelOrder ?? selectedDay.parcelRecommendation));
  }, [selectedDay?.id, selectedDay?.finalParcelOrder, selectedDay?.parcelRecommendation, selectedDay?.orderNeedsReconfirmation]);

  useEffect(() => {
    setStarted(window.localStorage.getItem("lunch-ledger-started") === "true");
  }, []);

  const startWorkspace = () => {
    window.localStorage.setItem("lunch-ledger-started", "true");
    setStarted(true);
  };

  const submitPerson = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Enter a name.");
      return;
    }
    const duplicate = people.some(
      (person) => !person.archived && person.displayName.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setNameError("This name already exists.");
      return;
    }
    try {
      const created = await request<Person>("/api/people", { method: "POST", body: JSON.stringify({ displayName: trimmed }) });
      setPeople((current) => [...current, created].sort((left, right) => left.displayName.localeCompare(right.displayName)));
      setBalances((current) => [...current, { personId: created.id, displayName: created.displayName, outstandingAmount: 0, outstandingDays: 0 }].sort((left, right) => left.displayName.localeCompare(right.displayName)));
      setName("");
      setNameError("");
      nameInputRef.current?.focus();
      pushToast("success", "Person added.");
    } catch (failure) {
      setNameError(friendlyNameError((failure as Error).message));
    }
  };

  const removePerson = async (personId: number) => {
    try {
      const result = await request<{ status: "deleted" | "archived" }>(`/api/people/${personId}`, { method: "DELETE" });
      pushToast("success", result.status === "deleted" ? "Person removed." : "Person archived because they have existing lunch records.");
      setPeople((current) => current.filter((person) => person.id !== personId));
      setBalances((current) => current.filter((balance) => balance.personId !== personId));
    } catch (failure) {
      pushToast("error", (failure as Error).message);
    }
  };

  const createLunchDay = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const day = await request<LunchDay>("/api/lunch-days", { method: "POST", body: JSON.stringify({ date }) });
      setSelectedDay(day);
      setDateError("");
      setLunchDays((current) => [day, ...current.filter((existing) => existing.id !== day.id)]);
      pushToast("success", `Lunch day ${day.date} created.`);
    } catch (failure) {
      setDateError(friendlyDateError((failure as Error).message));
    }
  };

  const removeLunchDay = async (lunchDayId: number) => {
    try {
      await request(`/api/lunch-days/${lunchDayId}`, { method: "DELETE" });
      pushToast("success", "Lunch day removed.");
      setLunchDays((current) => current.filter((day) => day.id !== lunchDayId));
      setSelectedDay((current) => (current?.id === lunchDayId ? null : current));
    } catch (failure) {
      pushToast("error", (failure as Error).message);
    }
  };

  const updateAttendanceEntry = async (personId: number, changes: { attending?: boolean; bringsHomeFood?: boolean }) => {
    const currentDay = selectedDayRef.current;
    if (!currentDay) return;
    const lunchDayId = currentDay.id;
    const nextAttendance = currentDay.attendance.map((entry) => {
      if (entry.personId !== personId) return entry;
      const attending = changes.attending ?? entry.attending;
      return { ...entry, attending, bringsHomeFood: attending ? (changes.bringsHomeFood ?? entry.bringsHomeFood) : false };
    });
    const optimisticDay = { ...currentDay, attendance: nextAttendance };
    selectedDayRef.current = optimisticDay;
    setSelectedDay(optimisticDay);

    attendanceSaveChain.current = attendanceSaveChain.current
      .then(async () => {
        const day = await request<LunchDay>(`/api/lunch-days/${lunchDayId}/attendance`, { method: "PUT", body: JSON.stringify({ attendance: nextAttendance }) });
        selectedDayRef.current = day;
        setSelectedDay((current) => (current && current.id === day.id ? day : current));
      })
      .catch((failure) => {
        pushToast("error", (failure as Error).message);
      });
    await attendanceSaveChain.current;
  };

  const updateCapacity = async (parcelCapacity: number) => {
    if (!selectedDay) return;
    try {
      const day = await request<LunchDay>(`/api/lunch-days/${selectedDay.id}/capacity`, { method: "PUT", body: JSON.stringify({ parcelCapacity }) });
      setSelectedDay(day);
    } catch (failure) {
      pushToast("error", (failure as Error).message);
    }
  };

  const confirmOrder = async () => {
    if (!selectedDay) return;
    const finalParcelOrder = Number(orderInput);
    if (!finalParcelOrder) return;
    try {
      const day = await request<LunchDay>(`/api/lunch-days/${selectedDay.id}/order`, { method: "PUT", body: JSON.stringify({ finalParcelOrder }) });
      setSelectedDay(day);
      pushToast("success", "Parcel order confirmed.");
      await refreshLists();
    } catch (failure) {
      pushToast("error", (failure as Error).message);
    }
  };

  return <main>
    <ToastTray toasts={toasts} />
    {!started && <LandingScreen onStart={startWorkspace} />}
    <div style={{ display: started ? undefined : "none" }}>
    <header><p className="eyebrow">Office lunch management</p><h1>Lunch Ledger</h1><p>Plan shared lunch, then hand the financial record to billing.</p></header>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="layout">
    <div className="content">
    <section className="grid">
      <div>
        <h2>People</h2>
        <form onSubmit={submitPerson}>
          <input ref={nameInputRef} data-testid="roster-name-input" value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} placeholder="Display name" />
          <button className="btn-primary" type="submit" data-testid="roster-add-button">Add</button>
        </form>
        {nameError && <p className="error" data-testid="roster-name-error" role="alert">{nameError}</p>}
        <ul>
          {people.filter((person) => !person.archived).map((person) => (
            <li key={person.id}>
              <span>{person.displayName}</span>
              <button className="btn-icon-danger" title="Remove person" aria-label={`Remove ${person.displayName}`} data-testid={`remove-person-${person.id}`} onClick={() => void removePerson(person.id)}><TrashIcon /></button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Lunch days</h2>
        <form className="date-form" onSubmit={createLunchDay}>
          <input data-testid="lunch-day-date-input" type="date" value={date} onChange={(event) => { setDate(event.target.value); setDateError(""); }} />
          <button className="btn-primary" data-testid="lunch-day-create-button">Create day</button>
        </form>
        {dateError && <p className="error" data-testid="lunch-day-date-error" role="alert">{dateError}</p>}
        <ul>
          {lunchDays.map((day) => (
            <li key={day.id}>
              <button className="link" data-testid={`lunch-day-open-${day.id}`} onClick={() => setSelectedDay(day)}>{day.date}</button>
              <button className="btn-icon-danger" title="Remove lunch day" aria-label={`Remove lunch day ${day.date}`} data-testid={`remove-lunch-day-${day.id}`} onClick={() => void removeLunchDay(day.id)}><TrashIcon /></button>
            </li>
          ))}
        </ul>
      </div>
    </section>
    {selectedDay && <section className="planner">
      <div className="planner-heading">
        <div><p className="eyebrow">Planning {selectedDay.date}</p><h2>Today's lunch</h2></div>
        <button className="btn-secondary" data-testid="attendance-save-button" onClick={() => void refreshLists()}>Reload</button>
      </div>
      <div className="attendance">
        {selectedDay.attendance.map((entry) => (
          <label key={entry.personId}>
            <strong>{entry.displayName}</strong>
            <span>
              <input data-testid={`attendance-${entry.personId}`} type="checkbox" checked={entry.attending} onChange={(event) => void updateAttendanceEntry(entry.personId, { attending: event.target.checked })} /> Attending
            </span>
            <span>
              <input data-testid={`home-food-${entry.personId}`} type="checkbox" disabled={!entry.attending} checked={entry.bringsHomeFood} onChange={(event) => void updateAttendanceEntry(entry.personId, { bringsHomeFood: event.target.checked })} /> Home food
            </span>
          </label>
        ))}
      </div>
      <div className="summary">
        <div><p>Groups</p><strong>{selectedDay.groups.length}</strong></div>
        <div><p>People who didn't bring lunch</p><strong>{selectedDay.attendance.filter((entry) => entry.attending && !entry.bringsHomeFood).length}</strong></div>
        <div><label>People per parcel<input data-testid="parcel-capacity-input" type="number" min="1" value={selectedDay.parcelCapacity} onChange={(event) => void updateCapacity(Number(event.target.value))} /></label></div>
        <div><p>Recommended parcels</p><strong>{selectedDay.parcelRecommendation}</strong></div>
      </div>
      <div className="group-summary-card" data-testid="group-summary-card">
        <h3>Lunch coverage</h3>
        <div className="group-metrics">
          <div className="group-metric">
            <strong>{selectedDay.attendance.filter((entry) => entry.attending).length}</strong>
            <span>Total people</span>
          </div>
          <div className="group-metric">
            <strong>{selectedDay.groups.length}</strong>
            <span>Groups</span>
          </div>
          <div className="group-metric">
            <strong>{selectedDay.attendance.filter((entry) => entry.attending && entry.bringsHomeFood).length}</strong>
            <span>Total home food</span>
          </div>
          <div className="group-metric">
            <strong>{selectedDay.attendance.filter((entry) => entry.attending && !entry.bringsHomeFood).length}</strong>
            <span>People who didn't bring lunch</span>
          </div>
          <div className="group-metric">
            <strong>{selectedDay.parcelRecommendation}</strong>
            <span>Parcels needed</span>
          </div>
        </div>
      </div>
      <div className="order">
        <p>{selectedDay.finalParcelOrder === null ? "No final order yet." : `Final order: ${selectedDay.finalParcelOrder} parcels.`}</p>
        {selectedDay.orderNeedsReconfirmation && <p className="warning">Reconfirmation required after planning changes.</p>}
        <input data-testid="parcel-order-input" type="number" min="1" value={orderInput} onChange={(event) => setOrderInput(event.target.value)} />
        <button className="btn-primary" data-testid="parcel-order-confirm-button" onClick={() => void confirmOrder()}>{selectedDay.orderNeedsReconfirmation ? "Reconfirm order" : "Confirm order"}</button>
      </div>
    </section>}
    {selectedDay && <BillingPanel lunchDay={selectedDay} onError={setError} onToast={pushToast} onBalancesChanged={refreshBalances} />}
    </div>
    <aside className="balances-panel">
      <h2>Outstanding balances</h2>
      {balances.length === 0 ? <p>No outstanding balances.</p> : (
        <table className="borderless-table">
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.personId}>
                <td>{balance.displayName}</td>
                <td>
                  <strong>Rs. {(balance.outstandingAmount / 100).toFixed(2)}</strong>
                  <small>{balance.outstandingDays === 0 ? "settled" : `owes for ${balance.outstandingDays} ${balance.outstandingDays === 1 ? "day" : "days"}`}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </aside>
    </div>
    </div>
  </main>;
}
