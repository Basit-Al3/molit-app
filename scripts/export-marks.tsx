/**
 * Writes every candidate mark to public/brand as standalone SVGs
 * (bare ink, bare lime, ink tile, lime tile) and refreshes the favicon.
 *   npx tsx scripts/export-marks.tsx
 */
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { MARKS, type MarkColors } from "../src/components/marks";
import { BRAND_MARK_ID, Logo } from "../src/components/logo";

const INK = "#101010", LIME = "#d8ff3d", PAPER = "#f3efe6";
const dir = join(process.cwd(), "public/brand");
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (f.endsWith(".svg")) unlinkSync(join(dir, f));

function svg(children: string, tile?: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${tile ? `<rect width="64" height="64" rx="16" fill="${tile}"/>` : ""}${children}</svg>\n`;
}
function body(draw: (c: MarkColors) => React.ReactNode, c: MarkColors) {
  return renderToStaticMarkup(<>{draw(c)}</>);
}

for (const m of MARKS) {
  writeFileSync(join(dir, `${m.id}-ink.svg`), svg(body(m.draw, { fg: INK, detail: PAPER })));
  writeFileSync(join(dir, `${m.id}-lime.svg`), svg(body(m.draw, { fg: LIME, detail: INK })));
  writeFileSync(join(dir, `${m.id}-tile-ink.svg`), svg(body(m.draw, { fg: LIME, detail: INK }), INK));
  writeFileSync(join(dir, `${m.id}-tile-lime.svg`), svg(body(m.draw, { fg: INK, detail: LIME }), LIME));
}
// Full lockups with the CSS variables resolved to hex.
const resolve = (markup: string) =>
  markup.replace(/var\(--ink\)/g, INK).replace(/var\(--lime\)/g, LIME).replace(/var\(--paper\)/g, PAPER).replace(/var\(--lime-deep\)/g, "#b9e21a").replace(/var\(--red\)/g, "#e0442a");
writeFileSync(join(dir, "logo-lockup-ink.svg"), resolve(renderToStaticMarkup(<Logo size={200} palette={{ mark: INK, detail: PAPER, word: INK, dot: "#b9e21a" }} />)) + "\n");
writeFileSync(join(dir, "logo-lockup-on-dark.svg"), resolve(renderToStaticMarkup(<Logo size={200} onDark />)) + "\n");
writeFileSync(join(dir, "logo-lockup-tile.svg"), resolve(renderToStaticMarkup(<Logo size={200} tile="ink" palette={{ mark: LIME, detail: INK, word: INK, dot: "#b9e21a" }} />)) + "\n");
const live = MARKS.find((m) => m.id === BRAND_MARK_ID)!;
writeFileSync(join(process.cwd(), "src/app/icon.svg"), svg(body(live.draw, { fg: LIME, detail: INK }), INK));
console.log(`exported ${MARKS.length * 4} mark svgs + 3 lockups, favicon = ${BRAND_MARK_ID}`);
