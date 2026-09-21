import type { Attendance, Group } from "./models.js";

const MAX_GROUP_SIZE = 8;

const byNameThenId = (left: Attendance, right: Attendance) =>
  left.displayName.localeCompare(right.displayName) ||
  left.personId - right.personId;

const chooseGroup = (groups: Group[], count: (group: Group) => number) =>
  groups
    .filter((group) => group.members.length < MAX_GROUP_SIZE)
    .sort(
      (left, right) =>
        count(left) - count(right) ||
        left.members.length - right.members.length ||
        left.number - right.number,
    )[0];

export function allocateGroups(attendance: Attendance[]): Group[] {
  const attendees = attendance
    .filter((entry) => entry.attending)
    .sort(byNameThenId);
  const groupCount = Math.ceil(attendees.length / MAX_GROUP_SIZE);
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    number: index + 1,
    members: [],
    homeFoodCount: 0,
    lunchBuyingCount: 0,
  }));

  for (const entry of attendees.filter((entry) => entry.bringsHomeFood)) {
    const group = chooseGroup(groups, (candidate) => candidate.homeFoodCount);
    group.members.push(entry);
    group.homeFoodCount += 1;
  }

  for (const entry of attendees.filter((entry) => !entry.bringsHomeFood)) {
    const group = chooseGroup(groups, (candidate) => candidate.members.length);
    group.members.push(entry);
    group.lunchBuyingCount += 1;
  }

  return groups;
}

export function applyGroupOverrides(
  groups: Group[],
  overrides: Map<number, number>,
): Group[] {
  if (overrides.size === 0) return groups;
  const validTargets = new Set(groups.map((group) => group.number));
  const allMembers = groups.flatMap((group) =>
    group.members.map((member) => ({ member, originalGroup: group.number })),
  );

  const perGroupMembers = new Map<
    number,
    Array<{ member: Attendance; originalGroup: number }>
  >(groups.map((group) => [group.number, []]));
  for (const entry of allMembers) {
    const target = overrides.get(entry.member.personId);
    const destination =
      target && target !== entry.originalGroup && validTargets.has(target)
        ? target
        : entry.originalGroup;
    perGroupMembers.get(destination)!.push(entry);
  }

  for (const [groupNumber, members] of perGroupMembers) {
    if (members.length <= MAX_GROUP_SIZE) continue;
    const staying = members.filter(
      (entry) => entry.originalGroup === groupNumber,
    );
    const moving = members
      .filter((entry) => entry.originalGroup !== groupNumber)
      .sort((left, right) => left.member.personId - right.member.personId);
    const capacityLeft = Math.max(MAX_GROUP_SIZE - staying.length, 0);
    perGroupMembers.set(groupNumber, [
      ...staying,
      ...moving.slice(0, capacityLeft),
    ]);
    for (const rejected of moving.slice(capacityLeft)) {
      perGroupMembers.get(rejected.originalGroup)!.push(rejected);
    }
  }

  for (const group of groups) {
    const finalMembers = (perGroupMembers.get(group.number) ?? [])
      .map((entry) => entry.member)
      .sort(byNameThenId);
    group.members = finalMembers;
    group.homeFoodCount = finalMembers.filter(
      (member) => member.bringsHomeFood,
    ).length;
    group.lunchBuyingCount = finalMembers.filter(
      (member) => !member.bringsHomeFood,
    ).length;
  }

  return groups;
}

export function recommendParcels(
  attendance: Attendance[],
  parcelCapacity: number,
): number {
  if (!Number.isInteger(parcelCapacity) || parcelCapacity < 1) {
    throw new Error("Parcel capacity must be a positive whole number.");
  }

  const lunchBuyingCount = attendance.filter(
    (entry) => entry.attending && !entry.bringsHomeFood,
  ).length;
  return Math.ceil(lunchBuyingCount / parcelCapacity);
}
