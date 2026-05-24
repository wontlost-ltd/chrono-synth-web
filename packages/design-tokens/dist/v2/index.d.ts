/**
 * Design tokens v2 — semantic, theme-aware, math-driven.
 *
 * v1 (chronoDesignTokens in ../index.ts) remains exported for backward
 * compatibility; new code should import from this v2 entry. v1 will
 * be deprecated once all consumers migrate.
 */
export * from './colors.js';
export * from './typography.js';
export * from './spacing.js';
export * from './motion.js';
/**
 * The full v2 token set, indexed by theme. Consumers typically pick a
 * theme at app bootstrap and pass `tokensV2.themes[theme]` into a
 * provider; the rest of the constants (typography, spacing, motion) are
 * theme-independent.
 */
export declare const tokensV2: {
    readonly themes: {
        readonly light: {
            readonly color: import("./colors.js").SemanticColors;
        };
        readonly dark: {
            readonly color: import("./colors.js").SemanticColors;
        };
        readonly 'high-contrast': {
            readonly color: import("./colors.js").SemanticColors;
        };
    };
    readonly typography: {
        readonly families: {
            readonly display: "\"Inter Display\", system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif";
            readonly body: "Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif";
            readonly mono: "\"JetBrains Mono\", ui-monospace, \"SF Mono\", Menlo, Consolas, monospace";
        };
        readonly display: {
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
        readonly heading: {
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
        readonly body: {
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
        readonly mono: {
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
    };
    readonly spacing: {
        readonly baseUnit: 4;
        readonly space: {
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
        readonly radius: {
            readonly none: 0;
            readonly sm: 2;
            readonly md: 4;
            readonly lg: 8;
            readonly xl: 12;
            readonly '2xl': 16;
            readonly full: 9999;
        };
        readonly shadow: {
            readonly none: "none";
            readonly sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)";
            readonly md: "0 4px 6px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.05)";
            readonly lg: "0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.05)";
            readonly xl: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.10)";
            readonly elastic: "0 8px 24px -8px rgba(30, 58, 138, 0.30)";
        };
        readonly size: {
            readonly touchTarget: "44px";
            readonly touchTargetDense: "36px";
        };
    };
    readonly motion: {
        readonly duration: {
            readonly fast: 120;
            readonly base: 200;
            readonly slow: 320;
        };
        readonly easing: {
            readonly standard: "cubic-bezier(0.2, 0, 0, 1)";
            readonly decel: "cubic-bezier(0, 0, 0, 1)";
            readonly accel: "cubic-bezier(0.4, 0, 1, 1)";
            readonly linear: "linear";
        };
        readonly spring: {
            readonly snappy: {
                readonly stiffness: 380;
                readonly damping: 30;
                readonly mass: 1;
            };
            readonly soft: {
                readonly stiffness: 220;
                readonly damping: 26;
                readonly mass: 1;
            };
            readonly bouncy: {
                readonly stiffness: 300;
                readonly damping: 14;
                readonly mass: 1;
            };
        };
    };
};
export type DesignTokenTheme = keyof typeof tokensV2.themes;
//# sourceMappingURL=index.d.ts.map