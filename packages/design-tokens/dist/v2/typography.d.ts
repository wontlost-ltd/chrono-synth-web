/**
 * Typography scale — type-safe + math-driven.
 *
 * Three families:
 *  - display: large hero / billboard text (rare; usually one per page)
 *  - body: paragraphs, labels, defaults
 *  - mono: code, tabular numbers, IDs
 *
 * Scale uses a 1.25 modular ratio (Major Third) which lands cleanly on
 * pixel grid for all sizes ≥12px. Heights are tuned per scale step
 * (tight ratios for headings, looser for body).
 */
export interface TypeStyle {
    fontFamily: 'display' | 'body' | 'mono';
    fontSize: number;
    lineHeight: number;
    fontWeight: number;
    letterSpacing: number;
}
export declare const fontFamilies: {
    readonly display: "\"Inter Display\", system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif";
    readonly body: "Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif";
    readonly mono: "\"JetBrains Mono\", ui-monospace, \"SF Mono\", Menlo, Consolas, monospace";
};
export declare const display: {
    readonly '4xl': {
        readonly fontFamily: "display";
        readonly fontSize: 72;
        readonly lineHeight: 80;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.02;
    };
    readonly '3xl': {
        readonly fontFamily: "display";
        readonly fontSize: 60;
        readonly lineHeight: 64;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.02;
    };
    readonly '2xl': {
        readonly fontFamily: "display";
        readonly fontSize: 48;
        readonly lineHeight: 56;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.02;
    };
    readonly xl: {
        readonly fontFamily: "display";
        readonly fontSize: 36;
        readonly lineHeight: 44;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.01;
    };
    readonly lg: {
        readonly fontFamily: "display";
        readonly fontSize: 30;
        readonly lineHeight: 36;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.01;
    };
};
export declare const heading: {
    readonly h1: {
        readonly fontFamily: "body";
        readonly fontSize: 30;
        readonly lineHeight: 36;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.01;
    };
    readonly h2: {
        readonly fontFamily: "body";
        readonly fontSize: 24;
        readonly lineHeight: 32;
        readonly fontWeight: 700;
        readonly letterSpacing: -0.01;
    };
    readonly h3: {
        readonly fontFamily: "body";
        readonly fontSize: 20;
        readonly lineHeight: 28;
        readonly fontWeight: 600;
        readonly letterSpacing: 0;
    };
    readonly h4: {
        readonly fontFamily: "body";
        readonly fontSize: 18;
        readonly lineHeight: 24;
        readonly fontWeight: 600;
        readonly letterSpacing: 0;
    };
    readonly h5: {
        readonly fontFamily: "body";
        readonly fontSize: 16;
        readonly lineHeight: 24;
        readonly fontWeight: 600;
        readonly letterSpacing: 0;
    };
    readonly h6: {
        readonly fontFamily: "body";
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: 600;
        readonly letterSpacing: 0;
    };
};
export declare const body: {
    readonly lg: {
        readonly fontFamily: "body";
        readonly fontSize: 18;
        readonly lineHeight: 28;
        readonly fontWeight: 400;
        readonly letterSpacing: 0;
    };
    readonly md: {
        readonly fontFamily: "body";
        readonly fontSize: 16;
        readonly lineHeight: 24;
        readonly fontWeight: 400;
        readonly letterSpacing: 0;
    };
    readonly sm: {
        readonly fontFamily: "body";
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: 400;
        readonly letterSpacing: 0;
    };
    readonly xs: {
        readonly fontFamily: "body";
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: 400;
        readonly letterSpacing: 0.005;
    };
};
export declare const mono: {
    readonly md: {
        readonly fontFamily: "mono";
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: 400;
        readonly letterSpacing: 0;
    };
    readonly sm: {
        readonly fontFamily: "mono";
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: 400;
        readonly letterSpacing: 0;
    };
};
//# sourceMappingURL=typography.d.ts.map