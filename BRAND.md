# Molit brand

Live version with visuals: `/brand` in the app.

## Name
**Molit.** Capital M, always with the period. Said *MO-lit*. Short for money literacy. The period is the attitude: say the number, full stop.

## Mark
Live mark: **M rising**. An M drawn as one line (down, up, then up further) ending on a dot. One stroke weight (8 on a 64 grid), round caps and joins, 45° turns, dot at 1.4× stroke. Bare by default; the ink tile exists only for app icons and favicons.

- Ink on paper. Lime on ink. Never a tile behind the lockup.
- Never rotate, outline, gradient, or shadow it. Minimum 16 px.
- Files: `public/brand/mark-*.svg`. Component: `src/components/logo.tsx`.
- Seven candidate marks live in `src/components/marks.tsx` and are shown side by side at `/brand/logos`. Switch the live one by changing `BRAND_MARK_ID` in `logo.tsx`, then run `npx tsx scripts/export-marks.tsx` to refresh the SVGs and favicon.

## Lockup rule (measured on Geist 700)
- Letter height (ascender of "l" = cap height) = 0.71 em; x-height = 0.536 em; period width = 0.236 em.
- The lockup is one SVG (`src/components/logo.tsx`): the wordmark is vector paths generated from the font file (`scripts/build-wordmark.ts`), and each mark declares its drawn ink box. Ink is aligned to letters, never box to box. Receipt: ink height 1.04× cap height, centred, 1% down.
- Gap between mark and wordmark = half the letter height.
- Clear space = one letter height on all sides. Minimum: 16 px mark alone, 20 px wordmark height in the lockup.
- Sources: Akrivi lockup grid, GOV.UK and Android brand guidelines, LogoDesign.net on optical alignment.

## Colour
| Token | Hex | Use |
|---|---|---|
| Paper | `#F3EFE6` | Background. Warm, never white. |
| Ink | `#101010` | Text, marks, bars. |
| Lime | `#D8FF3D` | The highlighter. Emphasis, mark tile, the period. |
| Lime deep | `#B9E21A` | Lime when it must read as text or a hover. |
| Red | `#E0442A` | Only "you spent more". Never decorative. |
| Muted | `#7A766C` | Eyebrows, hints. |

One accent. Charts use ink only (magnitude, not identity).

## Type
- **Geist** for everything: bold (700) at −4% tracking for display, regular for body. A neutral grotesk in the same family of feeling as Lovable's Camera Plain, with heavier weights available.
- **Geist Mono** for every number, date, count, command, and eyebrow. Money is data; it should look like data.

## Voice
1. Say the number. "You spent Rs 48,200." Not "a bit above average."
2. Short sentences. Full stops.
3. Honest, not harsh. Tell the truth about the number, never judge the person.
4. No exclamation marks. No emoji rain.
5. Admit the obvious. "You could do this in Notes. You haven't."
6. Small idea, said plainly. Not a platform, an assistant, or a revolution.

**Do**
> September is over.
> You spent Rs 48,200 across 63 expenses. That's about Rs 1,607 a day. 12% more than August.
> That's it. That's the app.

**Don't**
> 🎉 Great job this month!! Your spending journey is looking amazing 🚀

## Lines
- Money literacy. Full stop.
- You could do this in Notes. You haven't.
- Text it. Forget it. Know it on the 1st.
- Just the number.
- A small idea that intends to get bigger.
- That's it. That's the app.
