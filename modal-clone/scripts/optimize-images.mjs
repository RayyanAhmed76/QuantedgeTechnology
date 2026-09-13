/**
 * One-shot image optimizer for public/assets.
 * Resizes large photos and re-encodes in place (same filename/format).
 * Run: npm run optimize-images
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public");
const TARGETS = [
  path.join(ROOT, "assets"),
  ROOT, // favicon.png / apple icons if present
];

const SKIP = new Set([".gitkeep"]);

function maxWidthFor(file) {
  const base = path.basename(file).toLowerCase();
  if (base.includes("logo") || base.includes("icon") || base.includes("favicon") || base.startsWith("apple-")) {
    return 512;
  }
  if (base.includes("contact-bg")) return 1920;
  return 1600;
}

async function optimizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return null;
  if (SKIP.has(path.basename(file))) return null;

  const before = (await fs.stat(file)).size;
  const input = await fs.readFile(file);
  const image = sharp(input, { failOn: "none" });
  const meta = await image.metadata();
  const maxW = maxWidthFor(file);

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  if (meta.width && meta.width > maxW) {
    pipeline = pipeline.resize({
      width: maxW,
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  let out;
  if (ext === ".webp") {
    out = await pipeline.webp({ quality: 72, effort: 6 }).toBuffer();
  } else if (ext === ".jpg" || ext === ".jpeg") {
    out = await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  } else {
    const hasAlpha = meta.hasAlpha;
    if (!hasAlpha && (meta.width || 0) > 800) {
      out = await pipeline
        .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
        .toBuffer();
      if (out.length > before * 0.85 || out.length > 600_000) {
        const webp = await sharp(input, { failOn: "none" })
          .rotate()
          .resize({
            width: maxW,
            withoutEnlargement: true,
            fit: "inside",
          })
          .webp({ quality: 74, effort: 6 })
          .toBuffer();
        return { file, before, after: webp.length, convertTo: "webp", buffer: webp };
      }
    } else {
      out = await pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: hasAlpha ? undefined : true,
          quality: 80,
        })
        .toBuffer();
    }
  }

  if (out.length >= before) {
    return { file, before, after: before, skipped: true };
  }

  await fs.writeFile(file, out);
  return { file, before, after: out.length };
}

// Convert stubborn large PNGs to WebP and rewrite references in src/
async function rewriteRefs(oldUrl, newUrl) {
  const srcRoot = path.resolve("src");
  async function scan(dir) {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await scan(full);
        continue;
      }
      // Vite/React project: jsx/js/css as well as tsx
      if (!/\.(tsx?|jsx?|css|md|json)$/i.test(ent.name)) continue;
      let text = await fs.readFile(full, "utf8");
      if (!text.includes(oldUrl) && !text.includes(encodeURI(oldUrl))) continue;
      text = text.split(oldUrl).join(newUrl);
      text = text.split(encodeURI(oldUrl)).join(encodeURI(newUrl));
      await fs.writeFile(full, text);
      console.log("  ref updated:", path.relative(process.cwd(), full));
    }
  }
  await scan(srcRoot);
}

const results = [];
const conversions = [];

for (const dir of TARGETS) {
  let names;
  try {
    names = await fs.readdir(dir);
  } catch {
    continue;
  }

  const files =
    dir === ROOT
      ? names
          .filter((n) => /\.(png|jpe?g|webp)$/i.test(n))
          .map((n) => path.join(dir, n))
      : names
          .filter((n) => /\.(png|jpe?g|webp)$/i.test(n))
          .map((n) => path.join(dir, n));

  for (const file of files) {
    const result = await optimizeFile(file);
    if (!result) continue;
    if (result.convertTo === "webp") {
      conversions.push(result);
    } else {
      results.push(result);
    }
  }
}

for (const item of conversions) {
  const webpPath = item.file.replace(/\.png$/i, ".webp");
  await fs.writeFile(webpPath, item.buffer);
  await fs.unlink(item.file);
  const oldUrl = "/" + path.relative(ROOT, item.file).replace(/\\/g, "/");
  const newUrl = "/" + path.relative(ROOT, webpPath).replace(/\\/g, "/");
  console.log(
    `CONVERT ${path.basename(item.file)} → ${path.basename(webpPath)} ${(item.before / 1024).toFixed(0)}KB → ${(item.after / 1024).toFixed(0)}KB`,
  );
  await rewriteRefs(oldUrl, newUrl);
  results.push({
    file: webpPath,
    before: item.before,
    after: item.after,
    converted: true,
  });
}

let saved = 0;
for (const r of results) {
  const delta = r.before - r.after;
  saved += Math.max(0, delta);
  const label = path.relative(process.cwd(), r.file);
  if (r.skipped) {
    console.log(`SKIP  ${label} (no gain)`);
  } else {
    console.log(
      `OK    ${label} ${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB (−${(delta / 1024).toFixed(0)}KB)${r.converted ? " [webp]" : ""}`,
    );
  }
}
console.log(`\nSaved ~${(saved / 1024 / 1024).toFixed(1)} MB total`);
