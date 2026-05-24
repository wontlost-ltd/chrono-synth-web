/**
 * Motion tokens — durations, easings, spring presets.
 *
 * Mirror of `chrono-synth-web/src/components/motion/motion.css` so the
 * native (Tauri) and React Native paths can reuse the same values
 * without parsing CSS at runtime.
 *
 * Reduced-motion: consumers must check `prefers-reduced-motion` (web)
 * or the platform equivalent before applying these durations. This
 * file does not encode that policy — it's the values, not the gate.
 */
export declare const duration: {
    /** Hover / focus / button-state transitions. */
    readonly fast: 120;
    /** Page transitions, panel slides, default for most UI. */
    readonly base: 200;
    /** Drawer open, complex composed entrances. */
    readonly slow: 320;
};
export declare const easing: {
    /** ease-in-out feel; default for most transitions. */
    readonly standard: "cubic-bezier(0.2, 0, 0, 1)";
    /** ease-out; for "thing arriving / settling". */
    readonly decel: "cubic-bezier(0, 0, 0, 1)";
    /** ease-in; for "thing leaving the viewport". */
    readonly accel: "cubic-bezier(0.4, 0, 1, 1)";
    /** Linear — only for progress bars, never for entrances. */
    readonly linear: "linear";
};
/**
 * Spring presets — for runtimes that support spring animations
 * (Framer Motion, react-native-reanimated, SwiftUI, Compose).
 * These are the {stiffness, damping, mass} tuples; consumers
 * translate to the native API.
 */
export declare const spring: {
    /** Snappy: window minimize/maximize, drag-release. */
    readonly snappy: {
        readonly stiffness: 380;
        readonly damping: 30;
        readonly mass: 1;
    };
    /** Soft: panel reveal, content slide. */
    readonly soft: {
        readonly stiffness: 220;
        readonly damping: 26;
        readonly mass: 1;
    };
    /** Bouncy: success acknowledgement, only when delight is intentional. */
    readonly bouncy: {
        readonly stiffness: 300;
        readonly damping: 14;
        readonly mass: 1;
    };
};
//# sourceMappingURL=motion.d.ts.map