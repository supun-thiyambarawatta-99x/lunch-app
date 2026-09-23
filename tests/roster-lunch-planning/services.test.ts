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
  it("marks a confirmed order for reconfirmation after attendance changes", async () => {
    const repository = {
      updateAttendance: async (
        _id: number,
        entries: LunchDay["attendance"],
      ) => {
        lunchDay.attendance = entries;
        lunchDay.orderNeedsReconfirmation = true;
      },
      getLunchDay: async () => lunchDay,
    };
    const service = new LunchDayService(repository as never);
    const result = await service.recordAttendance(1, [
      { ...lunchDay.attendance[0], attending: false },
      lunchDay.attendance[1],
    ]);
    expect(result.orderNeedsReconfirmation).toBe(true);
    await expect(service.getEligibleAttendees(1)).rejects.toThrow(
      "requires order reconfirmation",
    );
  });

  it("returns only attending people who do not bring home food", async () => {
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
      getLunchDay: async () => lunchDay,
    } as never);
    await expect(service.getEligibleAttendees(1)).resolves.toEqual([
      { personId: 1, displayName: "Asha" },
    ]);
  });

  it("deletes a lunch day through the repository", async () => {
    let deletedId: number | undefined;
    const service = new LunchDayService({
      deleteLunchDay: async (id: number) => {
        deletedId = id;
      },
    } as never);
    await service.deleteLunchDay(7);
    expect(deletedId).toBe(7);
  });

  it("rejects moving a person to a group number outside the lunch day's groups", async () => {
    const service = new LunchDayService({
      getLunchDay: async () => ({
        ...lunchDay,
        groups: [{ number: 1 }, { number: 2 }],
      }),
    } as never);
    await expect(service.moveToGroup(1, 1, 5)).rejects.toThrow(
      "Select a valid group",
    );
  });

  it("rejects moving a person who is not attending", async () => {
    const service = new LunchDayService({
      getLunchDay: async () => ({
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
    await expect(service.moveToGroup(1, 9, 2)).rejects.toThrow(
      "Only attending people",
    );
  });

  it("persists a valid group override and returns the refreshed lunch day", async () => {
    let overridePersonId: number | undefined;
    let overrideGroupNumber: number | undefined;
    const service = new LunchDayService({
      getLunchDay: async () => ({
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
      setGroupOverride: async (
        _id: number,
        personId: number,
        groupNumber: number,
      ) => {
        overridePersonId = personId;
        overrideGroupNumber = groupNumber;
      },
    } as never);
    const result = await service.moveToGroup(1, 1, 2);
    expect(overridePersonId).toBe(1);
    expect(overrideGroupNumber).toBe(2);
    expect(result.groups).toHaveLength(2);
  });
});

describe("RosterService", () => {
  it("delegates person removal to the repository and returns its status", async () => {
    const service = new RosterService({
      removePerson: async (id: number) => (id === 1 ? "deleted" : "archived"),
    } as never);
    await expect(service.removePerson(1)).resolves.toBe("deleted");
    await expect(service.removePerson(2)).resolves.toBe("archived");
  });
});
