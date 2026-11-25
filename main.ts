// pigeon-pitch-one-line — "Pigeon Pitch, One Line".
//
// The entry is one line (at most 200 characters): the elevator pitch a
// city pigeon gives to investors for its startup. This program copies
// the finished line to the output directory, so both graded runs write
// identical bytes. Node 22, standard library only, no network.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const MAX_PITCH_CHARS = 200;
const target = join(outDir, "entry.txt");

// Read as bytes so the copy below is byte-exact.
const source = readFileSync(join(here, "entry.txt"));
if (source.length === 0) throw new Error("entry.txt is empty");

const text = source.toString("utf8");
// Gate 1: 1–200 characters (counted by code point).
const charCount = [...text].length;
if (charCount < 1 || charCount > MAX_PITCH_CHARS) {
  throw new Error(
    `entry.txt is ${charCount} characters, expected 1–${MAX_PITCH_CHARS}`,
  );
}
// Gate 2: exactly one line — no line breaks and no trailing newline.
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry.txt must be a single line with no line breaks");
}
// Gate 3: no control characters — a pitch line is plain readable text,
// so tabs, bells and other invisible bytes have no place in it.
if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) {
  throw new Error("entry.txt must not contain control characters");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, source);
verifyCopy(source, target);
process.stdout.write(text);

// Reads the written file back and proves it is the same entry:
// same byte length first, then the same bytes. A silent truncation
// or a stray newline added by the filesystem would fail here.
function verifyCopy(original, writtenPath) {
  const copied = readFileSync(writtenPath);
  if (copied.length !== original.length) {
    throw new Error(
      `entry.txt copy is ${copied.length} bytes, expected ${original.length}`,
    );
  }
  if (!copied.equals(original)) {
    throw new Error("entry.txt copy mismatch");
  }
}
