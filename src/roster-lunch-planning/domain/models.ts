export type Person = {
  id: number;
  displayName: string;
  archived: boolean;
};

export type Attendance = {
  personId: number;
  displayName: string;
  attending: boolean;
  bringsHomeFood: boolean;
};

export type Group = {
  number: number;
  members: Attendance[];
  homeFoodCount: number;
  lunchBuyingCount: number;
};

export type LunchDay = {
  id: number;
  date: string;
  parcelCapacity: number;
  parcelRecommendation: number;
  finalParcelOrder: number | null;
  orderNeedsReconfirmation: boolean;
  attendance: Attendance[];
  groups: Group[];
};

export type EligibleAttendee = Pick<Attendance, "personId" | "displayName">;

export type Charge = {
  id: number;
  lunchDayId: number;
  personId: number;
  displayName: string;
  amount: number;
  paid: boolean;
};

export type PersonBalance = {
  personId: number;
  displayName: string;
  outstandingAmount: number;
  outstandingDays: number;
};
