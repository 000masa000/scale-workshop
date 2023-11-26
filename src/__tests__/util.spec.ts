import { describe, it, expect } from "vitest";

import {
  autoKeyColors,
  formatExponential,
  formatHertz,
  gapKeyColors,
  parseChordInput,
} from "../utils";
import { DEFAULT_NUMBER_OF_COMPONENTS } from "../constants";

function naiveExponential(x: number, fractionDigits = 3) {
  if (Math.abs(x) < 10000) {
    return x.toFixed(fractionDigits);
  }
  const f = 10 ** (Math.floor(Math.log10(Math.abs(x))) - fractionDigits);
  return (Math.round(x / f) * f).toExponential();
}

describe("Exponential formatter", () => {
  it("leaves a small number as is", () => {
    expect(formatExponential(1234.567)).toBe("1234.567");
  });

  it("doesn't use scientific notation for tiny numbers", () => {
    expect(formatExponential(0.001)).toBe("0.001");
  });

  it("uses scientific notation for large numbers", () => {
    expect(formatExponential(123456.789)).toBe("1.235e+5");
  });

  it("can handle very large numbers", () => {
    expect(formatExponential(23456789e32)).toBe("2.346e+39");
  });

  it("agrees with the naive implementation", () => {
    const value = Math.random() * 10000;
    expect(formatExponential(value)).toBe(naiveExponential(value));
  });
});

describe("Hertz formatter", () => {
  it("leaves resonable frequencies as is", () => {
    expect(formatHertz(12.345)).toBe("12.345Hz");
    expect(formatHertz(21234.567)).toBe("21234.567Hz");
  });

  it("supports millihertz", () => {
    expect(formatHertz(123.456e-3)).toBe("123.456mHz");
  });

  it("supports microhertz", () => {
    expect(formatHertz(123.456e-6)).toBe("123.456µHz");
  });

  it("supports kilohertz", () => {
    expect(formatHertz(123.456e3)).toBe("123.456kHz");
  });

  it("supports megahertz", () => {
    expect(formatHertz(123.456e6)).toBe("123.456MHz");
  });

  it("supports ronnahertz", () => {
    expect(formatHertz(123.456e27)).toBe("123.456RHz");
  });

  it("falls back to exponential format for unreasonably large frequencies", () => {
    expect(formatHertz(1.23456e40)).toBe("1.235e+40Hz");
  });

  it("zeros out with unreasonably small frequencies", () => {
    expect(formatHertz(1.23456e-40)).toBe("0.000qHz");
  });
});

describe("Auto key color algorithm", () => {
  it("produces the chromatic scale starting from A with 12 notes", () => {
    const colors = autoKeyColors(12);
    expect(colors.join(" ")).toBe(
      "white black white white black white black white white black white black"
    );
  });

  it("produces something resonable with 17 notes", () => {
    const colors = autoKeyColors(17);
    expect(colors.join(" ")).toBe(
      "white white black white white white black white white black white white white black white white black"
    );
  });
});

describe("Gap key color algorithm", () => {
  it("produces a chromatic layout with the major scale in 12edo", () => {
    const colors = gapKeyColors(7 / 12, 7, 1);
    expect(colors.join(" ")).toBe(
      "white black white black white white black white black white black white"
    );
  });
});

describe("Chord input parser", () => {
  it("parses many types of intervals with many separators supported", () => {
    const text = "3:2400.&11/3|1\\5;[-1,1> [0 0 1>-4/1";
    const intervals = parseChordInput(text);
    expect(intervals[0].monzo.vector.length).toBe(DEFAULT_NUMBER_OF_COMPONENTS);
    expect(intervals[0].type).toBe("ratio");
    expect(intervals[1].type).toBe("cents");
    expect(intervals[2].type).toBe("ratio");
    expect(intervals[3].type).toBe("equal temperament");
    expect(intervals[4].type).toBe("monzo");

    expect(intervals[0].totalCents()).toBeCloseTo(1901.955);
    expect(intervals[1].totalCents()).toBeCloseTo(2400);
    expect(intervals[2].totalCents()).toBeCloseTo(2249.36);
    expect(intervals[3].totalCents()).toBeCloseTo(240);
    expect(intervals[4].totalCents()).toBeCloseTo(701.955);
    expect(intervals[5].totalCents()).toBeCloseTo(386.31);
  });
});
