/**
 * 跨运行时设计令牌
 * 纯值常量，零运行时依赖
 * typography 使用平台无关数值描述符，font family 分平台提供
 *
 * v1 = chronoDesignTokens (below). v2 = ./v2 (semantic + theme-aware,
 * preferred for new code). v1 stays for backward compatibility.
 */
export * as v2 from './v2/index.js';
export declare const chronoDesignTokens: {
    readonly color: {
        readonly canvas: "#f7f2e8";
        readonly ink: "#1f1a17";
        readonly accent: "#9e4c28";
        readonly accentMuted: "#d9a57f";
        readonly borderSubtle: "#d8cbb8";
        readonly focusRing: "#7a3419";
        readonly success: "#2f6b3b";
        readonly danger: "#9f2621";
        /** 同步状态色 — 映射 RuntimeSyncStateV1 的每个状态 */
        readonly status: {
            readonly idle: "#2f6b3b";
            readonly pulling: "#0369A1";
            readonly merging: "#0369A1";
            readonly pushing: "#0369A1";
            readonly paused: "#6B7280";
            readonly offline: "#6B7280";
            readonly conflicted: "#C2410C";
            readonly error: "#9f2621";
            readonly unconfigured: "#6B7280";
            readonly disabled: "#6B7280";
        };
        readonly surface: {
            readonly default: "#FFFDF8";
            readonly subdued: "#F7F7F2";
            readonly critical: "#FEF2F2";
        };
    };
    readonly space: {
        readonly xs: 4;
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 20;
        readonly xl: 32;
    };
    readonly radius: {
        readonly sm: 4;
        readonly md: 10;
        readonly lg: 18;
    };
    readonly size: {
        readonly touchMin: 44;
    };
    readonly borderWidth: {
        readonly sm: 1;
        readonly md: 2;
    };
    readonly border: {
        readonly focusRing: {
            readonly width: 2;
            readonly offset: 2;
            readonly color: "#7a3419";
        };
    };
    readonly motion: {
        readonly fast: 120;
        readonly normal: 180;
        readonly slow: 280;
        readonly reduced: 0;
        readonly syncPulseMs: 1200;
        readonly conflictAttentionMs: 300;
    };
    readonly icon: {
        readonly syncSpinner: "sync-spinner";
        readonly offlineCloud: "cloud-offline";
        readonly conflictWarning: "alert-triangle";
        readonly errorAlert: "alert-circle";
        readonly pausedClock: "clock-pause";
        readonly checkCircle: "check-circle";
        readonly settingsGear: "settings";
        readonly disabledSlash: "slash";
    };
    readonly typography: {
        readonly family: {
            readonly display: {
                readonly web: readonly ["Iowan Old Style", "Palatino Linotype", "serif"];
                readonly native: "Iowan Old Style";
            };
            readonly body: {
                readonly web: readonly ["Avenir Next", "Segoe UI", "sans-serif"];
                readonly native: "Avenir Next";
            };
        };
        readonly size: {
            readonly sm: 14;
            readonly md: 16;
            readonly lg: 20;
            readonly xl: 32;
        };
        readonly lineHeight: {
            readonly sm: 20;
            readonly md: 24;
            readonly lg: 28;
            readonly xl: 40;
        };
        readonly weight: {
            readonly regular: 400;
            readonly medium: 500;
            readonly bold: 700;
        };
    };
};
//# sourceMappingURL=index.d.ts.map