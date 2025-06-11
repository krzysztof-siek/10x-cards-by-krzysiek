import { describe, it, expect } from "vitest";
import { usePractice } from "../usePractice";

// Dostęp do prywatnej funkcji compareAnswers - potrzebujemy najpierw zreeksportować ją
// Tworzymy funkcję testową, która da nam dostęp do compareAnswers
function getCompareAnswers() {
  // @ts-expect-error - używamy internals do testów
  return usePractice.__compareAnswers || (() => false);
}

describe("compareAnswers", () => {
  it("powinno zwrócić true dla identycznych odpowiedzi", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("odpowiedź", "odpowiedź")).toBe(true);
  });

  it("powinno ignorować wielkość liter", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("Odpowiedź", "odpowiedź")).toBe(true);
    expect(compareAnswers("ODPOWIEDŹ", "odpowiedź")).toBe(true);
  });

  it("powinno ignorować znaki interpunkcyjne", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("odpowiedź.", "odpowiedź")).toBe(true);
    expect(compareAnswers("odpowiedź!", "odpowiedź")).toBe(true);
    expect(compareAnswers("odpowiedź,", "odpowiedź")).toBe(true);
    expect(compareAnswers("(odpowiedź)", "odpowiedź")).toBe(true);
  });

  it("powinno ignorować dodatkowe białe znaki", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("  odpowiedź  ", "odpowiedź")).toBe(true);
    expect(compareAnswers("odpowiedź\t", "odpowiedź")).toBe(true);
    expect(compareAnswers("odpowiedź\n", "odpowiedź")).toBe(true);
    expect(compareAnswers("odpowiedź z wieloma spacjami", "odpowiedź z wieloma  spacjami")).toBe(true);
  });

  it("powinno zwrócić false dla różnych odpowiedzi", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("odpowiedź1", "odpowiedź2")).toBe(false);
    expect(compareAnswers("inna odpowiedź", "odpowiedź")).toBe(false);
  });

  it("powinno zwrócić false dla pustych lub undefined odpowiedzi", () => {
    const compareAnswers = getCompareAnswers();
    expect(compareAnswers("", "odpowiedź")).toBe(false);
    expect(compareAnswers("odpowiedź", "")).toBe(false);
    expect(compareAnswers("", "")).toBe(false);
    // @ts-expect-error - testujemy undefined
    expect(compareAnswers(undefined, "odpowiedź")).toBe(false);
    // @ts-expect-error - testujemy undefined
    expect(compareAnswers("odpowiedź", undefined)).toBe(false);
  });
});
