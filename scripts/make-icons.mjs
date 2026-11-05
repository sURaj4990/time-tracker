import sharp from "sharp";
import { readFileSync } from "node:fs";

const jobs = [
  ["assets/icon.svg", "assets/icon.png"],
  ["assets/splash-icon.svg", "assets/splash-icon.png"],
];

for (const [src, out] of jobs) {
  await sharp(readFileSync(src), { density: 300 })
    .resize(1024, 1024)
    .png()
    .toFile(out);
  console.log("wrote", out);
}
