// Nothing may import @mui/styles (legacy JSS makeStyles, a React 19 blocker).
// It is not a dependency any more, this keeps it from coming back.
import fs from "node:fs";
import path from "node:path";

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

if (users.length > 0) {
  console.error("@mui/styles is not allowed. Imported by:");
  for (const file of users) console.error(`  ${path.relative(root, file)}`);
  process.exit(1);
}
console.log("no files import @mui/styles");
