// gta6-meme-x-01 entry (Node 22, standard library only).
// The entry is the X post itself: this program only hands the gate the
// post's address. It copies POST.json from the repository root to the
// output directory, where the house reads it and fetches the post from X.
// Nothing this program writes is judged.
//
// Before copying, it checks that POST.json names a real X status URL:
// https://x.com/<handle>/status/<digits>. A missing URL, a non-string
// URL, or anything that is not a status address (for example the
// placeholder the starter ships with) is refused loudly with a clear
// error and a non-zero exit, and no output file is written at all, so a
// broken entry can never pass the gate by accident.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// A real X status address: https://x.com/<handle>/status/<digits>.
// Handles are letters, digits and underscores; the status id is digits.
const STATUS_URL = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/;

const postPath = join(botDir, "POST.json");

let url: unknown;
try {
  url = (JSON.parse(readFileSync(postPath, "utf8")) as { url?: unknown }).url;
} catch (err) {
  console.error(`POST.json could not be read from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof url !== "string" || url.length === 0) {
  console.error(
    `Refusing to submit: POST.json has no url field (expected a string like https://x.com/<handle>/status/<digits>). No output was written.`,
  );
  process.exit(1);
}

if (!STATUS_URL.test(url)) {
  console.error(
    `Refusing to submit: POST.json url is not a real X status address: ${url}\nExpected https://x.com/<handle>/status/<digits>. No output was written.`,
  );
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
try {
  copyFileSync(postPath, join(outputDir, "POST.json"));
} catch (err) {
  console.error(`POST.json could not be copied from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}
