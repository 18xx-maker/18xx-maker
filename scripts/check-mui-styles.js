// The number of files importing @mui/styles (legacy JSS makeStyles, the React
// 19 blocker) may only go down. When you migrate files, lower MAX to the new
// count in the same PR.
import fs from "node:fs";
import path from "node:path";

const MAX = 0;

const root = path.join(import.meta.dirname, "..");
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(js|jsx|mjs|cjs)$/.test(entry.name)) files.push(full);
  }
};
for (const dir of ["src", "electron", "tests", ".storybook"]) {
  if (fs.existsSync(path.join(root, dir))) walk(path.join(root, dir));
}

const users = files.filter((file) =>
  /from\s+["']@mui\/styles|require\(["']@mui\/styles|import\(["']@mui\/styles/.test(
    fs.readFileSync(file, "utf8"),
  ),
);

console.log(`${users.length} files import @mui/styles (max ${MAX})`);
if (users.length > MAX) {
  console.error("New @mui/styles usage is not allowed. Offending set:");
  for (const file of users) console.error(`  ${path.relative(root, file)}`);
  process.exit(1);
}
if (users.length < MAX) {
  console.error(`Lower MAX in scripts/check-mui-styles.js to ${users.length}`);
  process.exit(1);
}
