/**
 * 跨运行时文案字典 — 冻结的 message ID 与中文文案
 * 所有运行时使用相同 ID，各端通过 ID 渲染对应语言
 * 模板变量使用 ICU MessageFormat 的 {name} 语法
 */
export type CopyMessageId = 'sync.unconfigured' | 'sync.disabled' | 'sync.idle' | 'sync.pulling' | 'sync.merging' | 'sync.pushing' | 'sync.paused' | 'sync.offline' | 'sync.conflicted' | 'sync.error' | 'portability.export_started' | 'portability.export_completed' | 'portability.export_failed' | 'portability.export_partial' | 'portability.import_dryrun' | 'portability.import_completed' | 'portability.import_failed' | 'portability.import_blocked' | 'conflict.empty_state' | 'conflict.blocking' | 'conflict.warning';
export declare const zhCNCatalog: Readonly<Record<CopyMessageId, string>>;
//# sourceMappingURL=copy-dictionary.d.ts.map