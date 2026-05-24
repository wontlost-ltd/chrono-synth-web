/**
 * Spacing scale — 4px base unit, 8px primary grid.
 *
 * Use the named tokens in components rather than raw pixel values.
 * Designers can adjust the scale globally without touching the code.
 *
 * The numeric suffix is the multiplier of the base unit (4px).
 *   space.2 = 8px   (the primary grid step)
 *   space.4 = 16px  (default gap between sibling elements)
 *   space.8 = 32px  (section break)
 */
export declare const baseUnit: 4;
export declare const space: {
    readonly 0: 0;
    readonly '0.5': 2;
    readonly 1: 4;
    readonly '1.5': 6;
    readonly 2: 8;
    readonly 3: 12;
    readonly 4: 16;
    readonly 5: 20;
    readonly 6: 24;
    readonly 7: 28;
    readonly 8: 32;
    readonly 10: 40;
    readonly 12: 48;
    readonly 16: 64;
    readonly 20: 80;
    readonly 24: 96;
    readonly 32: 128;
};
export type SpaceKey = keyof typeof space;
/** Border radius scale. */
export declare const radius: {
    readonly none: 0;
    readonly sm: 2;
    readonly md: 4;
    readonly lg: 8;
    readonly xl: 12;
    readonly '2xl': 16;
    readonly full: 9999;
};
/** Shadow scale — soft to hard, increasing depth. */
export declare const shadow: {
    readonly none: "none";
    readonly sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)";
    readonly md: "0 4px 6px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.05)";
    readonly lg: "0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.05)";
    readonly xl: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.10)";
    readonly elastic: "0 8px 24px -8px rgba(30, 58, 138, 0.30)";
};
//# sourceMappingURL=spacing.d.ts.map