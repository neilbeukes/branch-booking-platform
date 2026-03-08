import { describe, it, expect } from "vitest";
import {
  windowsOverlap,
  genReference,
  isPrismaConflictError,
  isValidString,
} from "./helpers.js";

describe("windowsOverlap", () => {
  it("returns true when windows overlap", () => {
    const startA = new Date("2025-03-01T10:00:00Z");
    const startB = new Date("2025-03-01T10:30:00Z");
    expect(windowsOverlap(startA, 60, startB, 60)).toBe(true); // A 10:00-11:00, B 10:30-11:30
  });

  it("returns false when windows do not overlap", () => {
    const startA = new Date("2025-03-01T10:00:00Z");
    const startB = new Date("2025-03-01T11:00:00Z");
    expect(windowsOverlap(startA, 60, startB, 60)).toBe(false); // A 10:00-11:00, B 11:00-12:00
  });

  it("returns true when one window fully contains the other", () => {
    const startA = new Date("2025-03-01T10:00:00Z");
    const startB = new Date("2025-03-01T10:15:00Z");
    expect(windowsOverlap(startA, 60, startB, 15)).toBe(true);
  });
});

describe("genReference", () => {
  it("starts with CAP-", () => {
    expect(genReference().startsWith("CAP-")).toBe(true);
  });

  it("returns uppercase alphanumeric after prefix", () => {
    const ref = genReference();
    const suffix = ref.slice(4);
    expect(suffix).toMatch(/^[A-Z0-9]+$/);
    expect(suffix.length).toBeGreaterThanOrEqual(6);
  });
});

describe("isPrismaConflictError", () => {
  it("returns true for object with code property", () => {
    expect(isPrismaConflictError({ code: "P2002" })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isPrismaConflictError(null)).toBe(false);
  });

  it("returns false for object without code", () => {
    expect(isPrismaConflictError({ message: "error" })).toBe(false);
  });
});

describe("isValidString", () => {
  it("returns true for non-empty string", () => {
    expect(isValidString("hello")).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isValidString(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidString(null as unknown as string)).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isValidString("   ")).toBe(false);
  });

  it("returns true for string with leading/trailing spaces but content", () => {
    expect(isValidString("  x  ")).toBe(true);
  });
});
