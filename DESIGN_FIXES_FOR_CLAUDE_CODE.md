# Design Fixes for AI Research & Newsletter Studio

> **For Claude Code:** This document contains all the fixes needed to align the implementation with the original mockup design. Apply these changes systematically to match the visual spec.

---

## Executive Summary

**Problem:** Your implementation has 17 design deviations from the mockup.

**Impact:** Layout breaking issues, inconsistent typography, incorrect colors, wrong spacing.

**Solution:** Apply the fixes below in priority order (P0 → P1 → P2).

**Time Estimate:** 2-4 hours for complete fix.

---

## Critical Issues Found

### 🔴 P0 - Layout Breaking (Fix First)

1. **Column widths incorrect**
   - Current: Narrower than spec
   - Required: `370px minmax(620px, 1fr) 430px`

2. **Research Brief rows not using grid**
   - Current: Stacked vertically without structure
   - Required: 2-column grid `180px 1fr`

3. **Source cards in vertical list**
   - Current: Single column stack
   - Required: 3-column horizontal grid

4. **Draft blocks missing 3-column structure**
   - Current: Label and content only
   - Required: `150px 1fr auto` (label | content | actions)

5. **Subject lines not side-by-side**
   - Current: Stacked or single column
   - Required: `1fr 1fr` grid

### 🟡 P1 - Visual Polish (Fix Second)

6. **Typography too bold**
   - Headers using 700 weight instead of 600
   - Body text missing `-0.005em` letter-spacing

7. **Colors don't match**
   - Orange appears different shade
   - Background colors too saturated

8. **Spacing too tight**
   - Card padding 16-18px instead of 22px
   - Grid gap incorrect

9. **Border radius inconsistent**
   - Some cards using 10px instead of 12px

### 🟢 P2 - Polish Details (Fix Third)

10. **Score ring proportions off**
11. **Tag styling differs**
12. **Export grid wrong columns**
13. **Icon sizes inconsistent**
14. **Hover states don't match**

---

## Complete CSS Fixes

Apply this CSS to fix all issues:

```css
/* =================================================================
   CRITICAL LAYOUT FIXES
   ================================================================= */

/* 1. Main Grid - Column Widths */
.grid {
  display: grid;
  grid-template-columns: 370px minmax(620px, 1fr) 430px;
  gap: 18px;
  padding: 18px 24px 32px;
  align-items: start;
}

/* 2. Research Brief - 2-Column Grid */
.brief-rows {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}

.brief-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}

.brief-row:last-child {
  border-bottom: none;
}

.brief-row-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13.5px;
}

.brief-row-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text);
}

/* 3. Source Cards - 3-Column Horizontal Grid */
.src-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.src-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all .15s;
  min-width: 0;
}

.src-card:hover {
  border-color: var(--border-strong);
  background: #fff;
}

.src-card-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.src-card-text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.src-card-title {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.src-card-domain {
  font-size: 11.5px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 4. Draft Blocks - 3-Column Grid */
.block-list {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 18px;
}

.block {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
  transition: background .2s;
  cursor: pointer;
}

.block:last-child {
  border-bottom: none;
}

.block.active,
.block:hover {
  background: var(--surface-warm);
}

.block-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.block-text {
  font-size: 13px;
  line-height: 1.55;
}

.block-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
  min-width: 120px;
}

.chip {
  padding: 6px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all .15s;
}

.chip:hover {
  background: var(--orange-soft);
  border-color: #f5c8b0;
  color: var(--orange);
}

/* 5. Subject Lines - Side by Side Grid */
.subj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.subj-card {
  padding: 14px;
  background: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.subj-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.subj-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  transition: background .15s;
}

.subj-row:hover {
  background: rgba(0,0,0,0.03);
}

.subj-row.sel {
  background: var(--orange-soft);
}

.radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio.sel {
  border-color: var(--orange);
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--orange);
}

.subj-text {
  font-size: 13px;
}

.preview-text {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text);
  margin-top: 6px;
}

/* =================================================================
   TYPOGRAPHY FIXES
   ================================================================= */

body {
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  letter-spacing: -0.005em;
  -webkit-font-smoothing: antialiased;
}

.card-title {
  font-size: 16px;
  font-weight: 600;  /* NOT 700 */
  letter-spacing: -0.01em;
}

.card-sub {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 2px;
}

.section-label,
.tag-label,
.src-label,
.field-label {
  font-size: 13px;
  font-weight: 600;
}

.field-label {
  font-size: 11.5px;
  color: var(--muted);
  margin-bottom: 6px;
}

/* =================================================================
   COLOR PALETTE
   ================================================================= */

:root {
  --bg: #f7f3ef;
  --surface: #ffffff;
  --surface-warm: #fffaf6;
  --border: #e7ded6;
  --border-strong: #d9cdc1;
  --text: #171717;
  --muted: #6f6761;
  --muted-2: #9a918a;
  --orange: #f04b13;
  --orange-dark: #d83d08;
  --orange-soft: #fff0e8;
  --orange-soft-2: #fde6d9;
  --green: #137a3a;
  --green-soft: #e6f3ec;
  --blue-soft: #e7eef9;
  --warm-soft: #f5ece4;
}

/* =================================================================
   SPACING & CARDS
   ================================================================= */

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: box-shadow .25s, border-color .25s;
}

.pad-card {
  padding: 22px;
}

.card.hl {
  border-color: #f0b896;
  box-shadow: 0 0 0 4px rgba(240, 75, 19, 0.08);
}

.center-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* =================================================================
   SCORE RING
   ================================================================= */

.score-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
  margin-top: 4px;
}

.ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--orange);
  line-height: 1;
}

.ring-denom {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.score-summary {
  flex: 1;
}

.score-status {
  font-size: 15px;
  font-weight: 600;
  color: var(--green);
  margin-bottom: 6px;
}

.score-note {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.5;
}

/* =================================================================
   SCORE BARS
   ================================================================= */

.score-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-bar-row {
  display: grid;
  grid-template-columns: 150px 1fr 42px 18px;
  gap: 10px;
  align-items: center;
}

.score-bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.score-bar-track {
  height: 6px;
  background: #f1e7df;
  border-radius: 999px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .3s;
}

.score-bar-num {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 500;
  text-align: right;
}

/* =================================================================
   TAG INPUT SECTIONS
   ================================================================= */

.tag-section {
  margin-bottom: 18px;
}

.tag-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tag-label-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-count {
  font-size: 11px;
  color: var(--muted);
  background: var(--surface-warm);
  border: 1px solid var(--border);
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}

.tag-box {
  background: var(--surface-warm);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 44px;
  transition: border-color .15s, box-shadow .15s;
}

.tag-box.focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 3px rgba(240,75,19,0.08);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 4px 10px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
}

.tag.company {
  background: var(--orange-soft);
  border-color: #f5d6c2;
  color: #b53b09;
}

.tag.keyword {
  background: var(--surface);
  border-color: var(--border);
}

.tag-x {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 14px;
  line-height: 1;
}

.tag-x:hover {
  background: rgba(0,0,0,0.06);
  color: var(--text);
}

.tag-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  padding: 4px;
}

.tag-suggest {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-suggest-chip {
  padding: 4px 10px;
  background: transparent;
  border: 1px dashed var(--border-strong);
  border-radius: 999px;
  font-size: 11.5px;
  color: var(--muted);
  font-weight: 500;
  transition: all .15s;
}

.tag-suggest-chip:hover {
  border-style: solid;
  border-color: var(--orange);
  color: var(--orange);
  background: var(--orange-soft);
}

.tag-hint {
  font-size: 11px;
  color: var(--muted-2);
  margin-top: 6px;
  font-weight: 500;
}

/* =================================================================
   EXPORT SECTION
   ================================================================= */

.export-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 6px;
}

.export-grid:nth-of-type(2) {
  grid-template-columns: repeat(3, 1fr);
}

.coming-soon-label {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 16px;
  margin-bottom: 6px;
  font-weight: 500;
}

.exp-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-weight: 500;
  transition: all .15s;
}

.exp-tile:hover:not(:disabled) {
  background: var(--surface-warm);
  border-color: var(--border-strong);
}

.exp-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--surface-warm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.exp-tile.accent .exp-icon {
  background: var(--orange-soft);
}

.exp-label {
  font-size: 12.5px;
  color: var(--text);
}

.exp-tile.locked {
  background: var(--surface-warm);
  cursor: not-allowed;
}

.exp-tile.locked .exp-label {
  color: var(--muted-2);
}

.exp-lock {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* =================================================================
   BUTTONS & INPUTS
   ================================================================= */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13.5px;
  transition: all 0.15s;
  white-space: nowrap;
  border: none;
  cursor: pointer;
}

.btn.ghost {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}

.btn.ghost:hover {
  background: var(--surface-warm);
  border-color: var(--border-strong);
}

.btn.ghost.flash {
  background: var(--green-soft);
  border-color: #b9dec7;
  color: var(--green);
}

.btn.primary {
  background: var(--orange);
  color: #fff;
  border: 1px solid var(--orange);
  font-weight: 600;
}

.btn.primary:hover {
  background: var(--orange-dark);
}

.btn.primary.big {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 14px;
}

.btn.loading {
  opacity: 0.85;
  cursor: wait;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.title-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  outline: none;
  transition: border-color .15s;
}

.field-input:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 3px rgba(240,75,19,0.08);
}

/* =================================================================
   STEP INDICATORS
   ================================================================= */

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--orange);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-pill {
  background: var(--orange-soft);
  color: var(--orange);
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

.src-count {
  font-size: 12px;
  color: var(--muted);
  background: var(--surface-warm);
  border: 1px solid var(--border);
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.src-count-num {
  color: var(--text);
  font-weight: 600;
  margin-left: 4px;
}

/* =================================================================
   AUTO-SAVE INDICATOR
   ================================================================= */

.autosave {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--green);
  font-weight: 500;
}

/* =================================================================
   MISC
   ================================================================= */

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brief-cta-row {
  display: flex;
  justify-content: flex-end;
}

.brief-bullets {
  margin: 0;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.65;
}

.brief-bullets li {
  margin-bottom: 4px;
}
```

---

## React Component Fixes

### ScoreRing Component

```tsx
export function ScoreRing({ value }: { value: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#f1e7df"
          strokeWidth="9"
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#f04b13"
          strokeWidth="9"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className="ring-text">
        <div className="ring-num">{value}</div>
        <div className="ring-denom">/100</div>
      </div>
    </div>
  );
}
```

---

## Validation Checklist

After applying fixes, verify:

### Layout
- [ ] Left column is exactly 370px wide
- [ ] Right column is exactly 430px wide
- [ ] Grid gap is 18px between columns
- [ ] Card padding is 22px
- [ ] All cards have 12px border radius

### Research Brief
- [ ] Rows use 2-column grid: 180px label, flexible content
- [ ] Source cards display in 3-column horizontal grid
- [ ] Icons are 16px in brief row labels
- [ ] 6 source cards visible

### Newsletter Draft
- [ ] Blocks use 3-column grid: 150px | 1fr | auto
- [ ] Action chips are in right column with 120px min-width
- [ ] Subject lines are side-by-side (1fr 1fr grid)
- [ ] Title/subtitle use 1fr 1fr grid

### Typography
- [ ] Card titles use font-weight: 600 (not 700)
- [ ] Body text is 13.5px with -0.005em letter-spacing
- [ ] Labels are 13px with font-weight: 600

### Colors
- [ ] Orange is exactly #f04b13
- [ ] Background is #f7f3ef
- [ ] Company tags have #fff0e8 background
- [ ] All colors match CSS variables

### Score Section
- [ ] Ring is 120x120px
- [ ] Stroke width is 9px
- [ ] Radius is 46px
- [ ] Score bars use 150px 1fr 42px 18px grid

### Export Section
- [ ] First row has 4 tiles (4-column grid)
- [ ] Second row has 3 tiles (3-column grid)
- [ ] "Coming soon" label between rows
- [ ] Locked tiles show lock icon

---

## File References

Apply these fixes to:
- Main stylesheet (e.g., `globals.css`, `studio.css`, `tailwind.css`)
- Component files as needed
- Ensure CSS cascade/specificity is correct

---

## Priority Order

1. **First 30 min:** Apply P0 layout fixes
2. **Next 60 min:** Apply P1 typography and color fixes
3. **Next 60 min:** Apply P2 polish and component details
4. **Final 30 min:** Test and validate

---

## Quick Measurements Reference

```
LAYOUT
- Left:          370px
- Center:        minmax(620px, 1fr)
- Right:         430px
- Gap:           18px
- Card padding:  22px

TYPOGRAPHY
- Title:         16px / 600
- Body:          13.5px / 400
- Label:         13px / 600
- Small:         12px / 500

COLORS
- Orange:        #f04b13
- Orange soft:   #fff0e8
- Background:    #f7f3ef
- Border:        #e7ded6
- Text:          #171717

GRIDS
- Brief:         180px 1fr
- Block:         150px 1fr auto
- Sources:       repeat(3, minmax(0, 1fr))
- Subject:       1fr 1fr
- Export 1:      repeat(4, 1fr)
- Export 2:      repeat(3, 1fr)
```

---

## End Result

After applying all fixes, the implementation should:
- Match mockup layout exactly
- Use correct typography and spacing
- Display all grids properly
- Show consistent colors throughout
- Pass visual regression test against mockup screenshots
