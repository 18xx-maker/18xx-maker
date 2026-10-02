// MUI and Emotion are gone: the chrome is src/ui (CSS Modules, Base UI). This
// keeps them from coming back through an import.
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
for (const dir of ["src", "electron", "tests", "e2e", ".storybook"]) {
  if (fs.existsSync(path.join(root, dir))) walk(path.join(root, dir));
}

const pattern = /["'](@mui|@emotion)\//;
const users = files.filter((file) =>
  pattern.test(fs.readFileSync(file, "utf8")),
);

if (users.length > 0) {
  console.error("@mui and @emotion are not allowed. Imported by:");
  for (const file of users) console.error(`  ${path.relative(root, file)}`);
  process.exit(1);
}
console.log("no files import @mui or @emotion");
