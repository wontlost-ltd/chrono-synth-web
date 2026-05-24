/**
 * Design tokens v2 — semantic colour layer.
 *
 * v1 (chronoDesignTokens) was a flat set of "name → hex" pairs. v2 is
 * intentionally semantic: each token names *what it means* rather than
 * *what it looks like*. Two themes (light, dark) supply concrete values
 * for the same set of semantic keys; consumers reference the keys, never
 * raw hex.
 *
 * Mapping to CSS custom properties: each token surfaces as
 * `--chrono-color-<dotted-path>` (lowercase + dots → hyphens). The
 * accompanying `themes/*.css` file in chrono-synth-web emits these as
 * :root and [data-theme="dark"] selectors.
 */
interface SemanticColors {
    /** Page-level surfaces, ordered light → elevated. */
    surface: {
        canvas: string;
        elevated: string;
        overlay: string;
        inverse: string;
    };
    /** Foreground text, ordered primary → tertiary. */
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        link: string;
    };
    /** Borders, ordered low → high contrast. */
    border: {
        subtle: string;
        default: string;
        strong: string;
        focus: string;
    };
    /** Brand */
    brand: {
        primary: string;
        primaryHover: string;
        primaryActive: string;
        secondary: string;
        secondaryHover: string;
        accent: string;
        accentHover: string;
    };
    /** Status — semantic intent, not raw colour names. */
    status: {
        success: string;
        warning: string;
        danger: string;
        info: string;
        /** Sync / lifecycle states; used by web + desktop status badges. */
        active: string;
        paused: string;
        syncing: string;
        offline: string;
        completed: string;
    };
    /** Chart palette — 6 hues with predictable order, plus grid + diff cues. */
    chart: {
        series: [string, string, string, string, string, string];
        grid: string;
        positive: string;
        negative: string;
    };
    /** Neutral grey scale, light → mid → dark. */
    neutral: {
        1: string;
        2: string;
        3: string;
    };
}
export declare const colorTokensLight: SemanticColors;
export declare const colorTokensDark: SemanticColors;
/**
 * High-contrast variant — meets WCAG AAA for body text on the canvas
 * surface (≥7:1 contrast). Use as a tertiary theme behind a user
 * preference toggle.
 */
export declare const colorTokensHighContrast: SemanticColors;
export type { SemanticColors };
//# sourceMappingURL=colors.d.ts.map