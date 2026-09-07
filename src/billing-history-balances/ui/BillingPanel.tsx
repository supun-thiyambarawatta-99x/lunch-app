import { useEffect, useState } from "react";
import type { Charge, LunchDay } from "../../roster-lunch-planning/domain/models";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
  return result;
}

type ToastType = "success" | "error";

export function BillingPanel({ lunchDay, onError, onToast, onBalancesChanged }: { lunchDay: LunchDay; onError: (message: string) => void; onToast: (type: ToastType, text: string) => void; onBalancesChanged: () => void }) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [totalAmount, setTotalAmount] = useState("");
  const canAllocate = lunchDay.finalParcelOrder !== null && !lunchDay.orderNeedsReconfirmation;
  const refresh = async () => {
    try { setCharges(await request<Charge[]>(`/api/lunch-days/${lunchDay.id}/charges`)); } catch (error) { onError(error instanceof Error ? error.message : "Unable to load billing data."); }
  };
  useEffect(() => { void refresh(); }, [lunchDay.id]);
  const allocate = async () => {
    try {
      const totalInCents = Math.round(Number(totalAmount) * 100);
      await request(`/api/lunch-days/${lunchDay.id}/charges`, { method: "PUT", body: JSON.stringify({ totalAmount: totalInCents }) });
      onToast("success", "Cost allocated.");
      await refresh();
      onBalancesChanged();
    } catch (error) { onToast("error", (error as Error).message); }
  };
  const changePayment = async (charge: Charge) => {
    try {
      await request(`/api/charges/${charge.id}/payment-status`, { method: "PUT", body: JSON.stringify({ paid: !charge.paid }) });
      onToast("success", charge.paid ? "Charge marked unpaid." : "Charge marked paid.");
      await refresh();
      onBalancesChanged();
    } catch (error) { onToast("error", (error as Error).message); }
  };
  const toRupees = (amountInCents: number) => (amountInCents / 100).toFixed(2);
  return <section className="billing"><h2>Billing and balances</h2><div className="billing-entry"><label>Total cost (Rs.)<input data-testid="billing-total-amount-input" type="number" min="0" step="0.01" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} /></label><button className="btn-primary" data-testid="billing-allocate-button" disabled={!canAllocate || totalAmount === ""} onClick={() => void allocate()}>Allocate cost</button></div>{!canAllocate && <p className="warning">Confirm the current parcel order before allocating cost.</p>}<div><h3>Charges</h3>{charges.length === 0 ? <p>No charges allocated.</p> : <table className="borderless-table"><tbody>{charges.map((charge) => <tr key={charge.id}><td>{charge.displayName}</td><td>Rs. {toRupees(charge.amount)}</td><td><button className="btn-secondary" data-testid={`charge-payment-${charge.id}`} onClick={() => void changePayment(charge)}>{charge.paid ? "Mark unpaid" : "Mark paid"}</button></td></tr>)}</tbody></table>}</div></section>;
}