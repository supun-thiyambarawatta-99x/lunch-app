import { describe, expect, it } from "vitest";
import {
  LunchDayService,
  RosterService,
} from "../../src/roster-lunch-planning/application/services";
import type { LunchDay } from "../../src/roster-lunch-planning/domain/models";

const lunchDay: LunchDay = {
  id: 1,
  date: "2026-09-04",
  parcelCapacity: 2,
  parcelRecommendation: 1,
  finalParcelOrder: 1,
  orderNeedsReconfirmation: false,
  attendance: [
    {
      personId: 1,
      displayName: "Asha",
      attending: true,
      bringsHomeFood: false,
    },
    { personId: 2, displayName: "Ben", attending: true, bringsHomeFood: true },
  ],
  groups: [],
};

describe("LunchDayService", () => {
  it("marks a confirmed order for reconfirmation after attendance changes", () => {
    const repository = {
      updateAttendance: (_id: number, entries: LunchDay["attendance"]) => {
        lunchDay.attendance = entries;
        lunchDay.orderNeedsReconfirmation = true;
      },
      getLunchDay: () => lunchDay,
    };
    const service = new LunchDayService(repository as never);
    const result = service.recordAttendance(1, [
      { ...lunchDay.attendance[0], attending: false },
      lunchDay.attendance[1],
    ]);
    expect(result.orderNeedsReconfirmation).toBe(true);
    expect(() => service.getEligibleAttendees(1)).toThrow(
      "requires order reconfirmation",
    );
  });

  it("returns only attending people who do not bring home food", () => {
    lunchDay.orderNeedsReconfirmation = false;
    lunchDay.attendance = [
      {
        personId: 1,
        displayName: "Asha",
        attending: true,
        bringsHomeFood: false,
      },
      {
        personId: 2,
        displayName: "Ben",
        attending: true,
        bringsHomeFood: true,
      },
      {
        personId: 3,
        displayName: "Chen",
        attending: false,
        bringsHomeFood: false,
      },
    ];
    const service = new LunchDayService({
      getLunchDay: () => lunchDay,
    } as never);
    expect(service.getEligibleAttendees(1)).toEqual([
      { personId: 1, displayName: "Asha" },
    ]);
  });

  it("deletes a lunch day through the repository", () => {
    let deletedId: number | undefined;
    const service = new LunchDayService({
      deleteLunchDay: (id: number) => {
        deletedId = id;
      },
    } as never);
    service.deleteLunchDay(7);
    expect(deletedId).toBe(7);
  });

  it("rejects moving a person to a group number outside the lunch day's groups", () => {
    const service = new LunchDayService({
      getLunchDay: () => ({
        ...lunchDay,
        groups: [{ number: 1 }, { number: 2 }],
      }),
    } as never);
    expect(() => service.moveToGroup(1, 1, 5)).toThrow("Select a valid group");
  });

  it("rejects moving a person who is not attending", () => {
    const service = new LunchDayService({
      getLunchDay: () => ({
        ...lunchDay,
        attendance: [
          {
            personId: 9,
            displayName: "Absent",
            attending: false,
            bringsHomeFood: false,
          },
        ],
        groups: [{ number: 1 }, { number: 2 }],
      }),
    } as never);
    expect(() => service.moveToGroup(1, 9, 2)).toThrow("Only attending people");
  });

  it("persists a valid group override and returns the refreshed lunch day", () => {
    let overridePersonId: number | undefined;
    let overrideGroupNumber: number | undefined;
    const service = new LunchDayService({
      getLunchDay: () => ({
        ...lunchDay,
        attendance: [
          {
            personId: 1,
            displayName: "Asha",
            attending: true,
            bringsHomeFood: false,
          },
        ],
        groups: [{ number: 1 }, { number: 2 }],
      }),
      setGroupOverride: (
        _id: number,
        personId: number,
        groupNumber: number,
      ) => {
        overridePersonId = personId;
        overrideGroupNumber = groupNumber;
      },
    } as never);
    const result = service.moveToGroup(1, 1, 2);
    expect(overridePersonId).toBe(1);
    expect(overrideGroupNumber).toBe(2);
    expect(result.groups).toHaveLength(2);
  });
});

describe("RosterService", () => {
  it("delegates person removal to the repository and returns its status", () => {
    const service = new RosterService({
      removePerson: (id: number) => (id === 1 ? "deleted" : "archived"),
    } as never);
    expect(service.removePerson(1)).toBe("deleted");
    expect(service.removePerson(2)).toBe("archived");
  });
});
