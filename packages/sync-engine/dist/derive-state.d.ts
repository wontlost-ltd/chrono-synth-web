/**
 * 纯函数同步状态推导器
 * 接收当前快照与事件，返回新快照（无 I/O 副作用）
 * 不合法的状态转换被静默忽略（返回原快照重新计算能力）
 */
import { type RuntimeSyncEvent, type SyncStatusSnapshotV1 } from '@chrono/contracts';
export declare function deriveRuntimeSyncState(snapshot: SyncStatusSnapshotV1, event: RuntimeSyncEvent): SyncStatusSnapshotV1;
//# sourceMappingURL=derive-state.d.ts.map