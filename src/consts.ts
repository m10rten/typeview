import type { StyleFn, TypeViewTheme } from "./types.js";

/* ANSI styling helpers (no external packages) */
export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[60m",
  },
} as const;

export function style(...codes: string[]): StyleFn {
  return (s: string) => `${codes.join("")}${s}${ANSI.reset}`;
}

export function buildDefaultTheme(): TypeViewTheme {
  return {
    header: style(ANSI.dim, ANSI.fg.green),
    title: style(ANSI.bold, ANSI.fg.cyan),
    footer: style(ANSI.dim, ANSI.fg.gray),
    controls: style(ANSI.dim, ANSI.fg.gray),
    slideIndicator: style(ANSI.fg.yellow),
    body: style(ANSI.fg.white),
    notice: style(ANSI.fg.magenta),
  };
}
