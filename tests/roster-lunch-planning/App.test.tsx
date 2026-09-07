import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";

describe("App", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
  });

  it("renders coordinator controls with stable automation identifiers", async () => {
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(screen.getByTestId("roster-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("roster-add-button")).toBeInTheDocument();
    expect(screen.getByTestId("lunch-day-date-input")).toBeInTheDocument();
    expect(screen.getByTestId("lunch-day-create-button")).toBeInTheDocument();
  });

  it("submits a new roster person", async () => {
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    fireEvent.change(screen.getByTestId("roster-name-input"), { target: { value: "Asha" } });
    fireEvent.click(screen.getByTestId("roster-add-button"));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/people", expect.objectContaining({ method: "POST" })));
  });
});