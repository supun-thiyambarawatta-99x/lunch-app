import { describe, expect, it } from "vitest";
import {
  allocateGroups,
  applyGroupOverrides,
  recommendParcels,
} from "../../src/roster-lunch-planning/domain/allocation";
import type { Attendance } from "../../src/roster-lunch-planning/domain/models";

const attendees = (total: number, homeFoodIds: number[] = []): Attendance[] =>
  Array.from({ length: total }, (_, index) => ({
    personId: index + 1,
    displayName: `Person ${index + 1}`,
    attending: true,
    bringsHomeFood: homeFoodIds.includes(index + 1),
  }));

describe("allocation", () => {
  it("creates two groups of seven and balances four home-food attendees", () => {
    const groups = allocateGroups(attendees(14, [1, 2, 3, 4]));
    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.members.length)).toEqual([7, 7]);
    expect(groups.map((group) => group.homeFoodCount)).toEqual([2, 2]);
  });

  it("keeps group sizes and home-food counts within one", () => {
    const groups = allocateGroups(attendees(17, [1, 2, 3, 4, 5]));
    const sizes = groups.map((group) => group.members.length);
    const homeFoodCounts = groups.map((group) => group.homeFoodCount);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(
      Math.max(...homeFoodCounts) - Math.min(...homeFoodCounts),
    ).toBeLessThanOrEqual(1);
    expect(sizes.every((size) => size <= 7)).toBe(true);
  });

  it("rounds parcel recommendations upward for lunch-buying attendees", () => {
    expect(recommendParcels(attendees(14, [1, 2, 3, 4]), 2)).toBe(5);
    expect(recommendParcels(attendees(4, [1, 2, 3, 4]), 2)).toBe(0);
  });
});

describe("applyGroupOverrides", () => {
  it("moves a member to the requested group and updates both groups' counts", () => {
    const groups = allocateGroups(attendees(10, [1, 2]));
    const moved = applyGroupOverrides(groups, new Map([[1, 2]]));
    const sourceGroup = moved.find((group) =>
      group.members.some((member) => member.personId === 1),
    );
    expect(sourceGroup?.number).toBe(2);
    expect(
      moved.reduce((total, group) => total + group.members.length, 0),
    ).toBe(10);
  });

  it("rejects moves that would exceed the seven-person group limit", () => {
    const groups = allocateGroups(attendees(14));
    const overrides = new Map(
      Array.from({ length: 7 }, (_, index) => [index + 1, 2] as const),
    );
    const moved = applyGroupOverrides(groups, overrides);
    const groupTwo = moved.find((group) => group.number === 2)!;
    expect(groupTwo.members.length).toBeLessThanOrEqual(7);
    expect(
      moved.reduce((total, group) => total + group.members.length, 0),
    ).toBe(14);
  });
});
