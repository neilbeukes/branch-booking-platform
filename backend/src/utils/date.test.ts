import { describe, it, expect } from "vitest";
import {
  localDateAndTimeToUTC,
  utcToLocalYMD,
  utcToLocalTime,
  localDateToUTCRange,
  todayInTimezone,
} from "./date.js";

const SAST = "Africa/Johannesburg";

describe("localDateAndTimeToUTC", () => {
  it("converts local date and time to UTC", () => {
    const utc = localDateAndTimeToUTC("2025-03-01", "14:00", SAST);
    expect(utc.toISOString()).toMatch(/2025-03-01T12:00:00\.000Z/); // SAST is UTC+2
  });
});

describe("utcToLocalYMD", () => {
  it("returns YYYY-MM-DD in given timezone", () => {
    const utc = new Date("2025-03-01T22:00:00.000Z"); // 00:00 next day in SAST
    expect(utcToLocalYMD(utc, SAST)).toBe("2025-03-02");
  });
});

describe("utcToLocalTime", () => {
  it("returns HH:mm in given timezone", () => {
    const utc = new Date("2025-03-01T10:00:00.000Z"); // 12:00 in SAST
    expect(utcToLocalTime(utc, SAST)).toBe("12:00");
  });
});

describe("localDateToUTCRange", () => {
  it("returns start and end of day in timezone as UTC", () => {
    const { start, end } = localDateToUTCRange("2025-03-01", SAST);
    expect(start.getTime()).toBeLessThan(end.getTime());
    expect(utcToLocalYMD(start, SAST)).toBe("2025-03-01");
    expect(utcToLocalYMD(end, SAST)).toBe("2025-03-02");
  });
});

describe("todayInTimezone", () => {
  it("returns string in YYYY-MM-DD format", () => {
    const today = todayInTimezone(SAST);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
