import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";

describe("App", () => {
  afterEach(cleanup);

  const startApp = async () => {
    fireEvent.click(screen.getByTestId("landing-start-button"));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/bootstrap", expect.any(Object)));
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ people: [], lunchDays: [], balances: [] }),
    }));
  });

  it("renders coordinator controls with stable automation identifiers", async () => {
    render(<App />);
    await startApp();
    expect(screen.getByTestId("roster-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("roster-add-button")).toBeInTheDocument();
    expect(screen.getByTestId("lunch-day-date-input")).toBeInTheDocument();
    expect(screen.getByTestId("lunch-day-create-button")).toBeInTheDocument();
  });

  it("submits a new roster person", async () => {
    render(<App />);
    await startApp();
    fireEvent.change(screen.getByTestId("roster-name-input"), { target: { value: "Asha" } });
    fireEvent.click(screen.getByTestId("roster-add-button"));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/people", expect.objectContaining({ method: "POST" })));
  });

  it("shows an inline error for a duplicate name and clears it while typing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((path: string) =>
        Promise.resolve({
          ok: true,
          json: async () =>
            path === "/api/bootstrap"
              ? { people: [{ id: 1, displayName: "Asha", archived: false }], lunchDays: [], balances: [] }
              : [],
        }),
      ),
    );
    render(<App />);
    await startApp();
    await waitFor(() => expect(screen.getByText("Asha")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("roster-name-input"), { target: { value: "asha" } });
    fireEvent.click(screen.getByTestId("roster-add-button"));
    await waitFor(() =>
      expect(screen.getByTestId("roster-name-error")).toHaveTextContent("This name already exists."),
    );

    fireEvent.change(screen.getByTestId("roster-name-input"), { target: { value: "Asha B" } });
    expect(screen.queryByTestId("roster-name-error")).not.toBeInTheDocument();
  });

  it("blocks submitting a blank name", async () => {
    render(<App />);
    await startApp();
    const callsBefore = (fetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
    fireEvent.change(screen.getByTestId("roster-name-input"), { target: { value: "   " } });
    fireEvent.click(screen.getByTestId("roster-add-button"));
    await waitFor(() => expect(screen.getByTestId("roster-name-error")).toBeInTheDocument());
    expect((fetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(callsBefore);
  });
});