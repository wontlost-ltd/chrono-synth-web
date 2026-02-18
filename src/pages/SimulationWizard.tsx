import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useCreateSimulation } from '../api/queries/simulations';
import type { CreateSimulationRequest } from '../types';

interface PathDraft {
  id: string;
  label: string;
  description: string;
  income: number;
  savings: number;
  branches: Array<{ label: string; probability: number; conditions: Record<string, number> }>;
}

const EMPTY_PATH: PathDraft = {
  id: '', label: '', description: '', income: 300000, savings: 500000, branches: [],
};

function validateStep0(paths: PathDraft[]): string | null {
  for (let i = 0; i < paths.length; i++) {
    if (!paths[i]!.id.trim()) return `路径 ${i + 1} 的 ID 不能为空`;
    if (!paths[i]!.label.trim()) return `路径 ${i + 1} 的名称不能为空`;
  }
  const ids = paths.map(p => p.id.trim());
  if (new Set(ids).size !== ids.length) return '路径 ID 不能重复';
  return null;
}

function validateStep1(paths: PathDraft[]): string | null {
  for (const p of paths) {
    if (p.branches.length === 0) continue;
    for (const br of p.branches) {
      if (!br.label.trim()) return `路径 "${p.label}" 中有分支名称为空`;
      if (Number.isNaN(br.probability)) return `分支 "${br.label}" 的概率不是有效数字`;
      if (br.probability < 0 || br.probability > 1) return `分支 "${br.label}" 的概率必须在 0-1 之间`;
    }
    const sum = p.branches.reduce((s, br) => s + br.probability, 0);
    if (Math.abs(sum - 1) > 0.01 && p.branches.length > 0) {
      return `路径 "${p.label}" 分支概率之和 (${sum.toFixed(2)}) 应为 1.0`;
    }
  }
  return null;
}

function validateStep2(age: number, horizonYears: number, paths: PathDraft[]): string | null {
  if (Number.isNaN(age) || age < 1 || age > 120) return '年龄必须在 1-120 之间';
  if (Number.isNaN(horizonYears) || horizonYears < 1 || horizonYears > 80) return '模拟年数必须在 1-80 之间';
  for (const p of paths) {
    if (!Number.isFinite(p.income) || p.income < 0) return `路径 "${p.label}" 的收入必须是有效的非负数`;
    if (!Number.isFinite(p.savings) || p.savings < 0) return `路径 "${p.label}" 的储蓄必须是有效的非负数`;
  }
  return null;
}

export function SimulationWizard() {
  const navigate = useNavigate();
  const createSim = useCreateSimulation();

  const [step, setStep] = useState(0);
  const [paths, setPaths] = useState<PathDraft[]>([{ ...EMPTY_PATH }]);
  const [age, setAge] = useState(35);
  const [horizonYears, setHorizonYears] = useState(10);
  const [validationError, setValidationError] = useState<string | null>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepContentRef.current?.focus();
  }, [step]);

  function updatePath(index: number, patch: Partial<PathDraft>) {
    setPaths(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));
    setValidationError(null);
  }

  function addBranch(pathIndex: number) {
    setPaths(prev => prev.map((p, i) =>
      i === pathIndex
        ? { ...p, branches: [...p.branches, { label: '', probability: 0.5, conditions: {} }] }
        : p
    ));
  }

  function tryNext() {
    let err: string | null = null;
    if (step === 0) err = validateStep0(paths);
    else if (step === 1) err = validateStep1(paths);
    else if (step === 2) err = validateStep2(age, horizonYears, paths);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    const body: CreateSimulationRequest = {
      paths: paths.map(p => ({
        id: p.id,
        label: p.label,
        description: p.description,
        initialConditions: { income: p.income, savings: p.savings },
        branches: p.branches,
      })),
      horizonYears,
      age,
    };

    try {
      const result = await createSim.mutateAsync(body);
      try { localStorage.setItem('last-sim-id', result.simulationId); } catch { /* ignored */ }
      navigate(`/simulations/${encodeURIComponent(result.simulationId)}/paths`);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : '创建模拟失败');
    }
  }

  const STEPS = ['定义路径', '分支设置', '参数配置', '预览提交'];

  return (
    <>
      <PageHeader title="创建人生模拟" subtitle={`步骤 ${step + 1}/${STEPS.length}: ${STEPS[step]}`} />

      <div className="mb-6 flex gap-1" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="向导进度">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>

      {validationError && (
        <div id="wizard-error" className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning" role="alert">
          {validationError}
        </div>
      )}

      <div ref={stepContentRef} tabIndex={-1} className="outline-none" aria-live="polite">
      {step === 0 && (
        <div className="space-y-4">
          {paths.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">路径 {i + 1}</h3>
                {paths.length > 1 && (
                  <button type="button" onClick={() => setPaths(prev => prev.filter((_, j) => j !== i))} className="text-xs text-warning" aria-label={`删除路径 ${i + 1}`}>删除</button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-text-secondary">ID</span>
                  <input className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={p.id} onChange={e => updatePath(i, { id: e.target.value })} placeholder="stable" required aria-invalid={validationError?.includes('ID') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
                </label>
                <label className="block">
                  <span className="text-xs text-text-secondary">名称</span>
                  <input className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={p.label} onChange={e => updatePath(i, { label: e.target.value })} placeholder="稳定路径" required aria-invalid={validationError?.includes('名称') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-text-secondary">描述</span>
                  <input className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={p.description} onChange={e => updatePath(i, { description: e.target.value })} placeholder="保持现状" />
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setPaths(prev => [...prev, { ...EMPTY_PATH }])} className="rounded-lg border border-dashed border-border px-4 py-2 text-sm text-text-secondary hover:border-primary">
            + 添加路径
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {paths.map((p, pi) => (
            <div key={pi} className="rounded-xl border border-border bg-surface-elevated p-4">
              <h3 className="mb-3 font-medium">{p.label || `路径 ${pi + 1}`} 的分支</h3>
              {p.branches.map((br, bi) => (
                <div key={bi} className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="block">
                    <span className="sr-only">分支名称</span>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
                      value={br.label} placeholder="分支名称"
                      aria-invalid={validationError?.includes('分支名称') || undefined}
                      aria-describedby={validationError ? 'wizard-error' : undefined}
                      onChange={e => {
                        const branches = [...p.branches];
                        branches[bi] = { ...br, label: e.target.value };
                        updatePath(pi, { branches });
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">概率</span>
                    <input
                      type="number" step="0.1" min="0" max="1"
                      className="w-full rounded-lg border border-border px-3 py-1.5 text-sm"
                      value={br.probability}
                      onChange={e => {
                        const branches = [...p.branches];
                        branches[bi] = { ...br, probability: +e.target.value };
                        updatePath(pi, { branches });
                      }}
                      aria-invalid={validationError?.includes('概率') || undefined}
                      aria-describedby={validationError ? 'wizard-error' : undefined}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => updatePath(pi, { branches: p.branches.filter((_, j) => j !== bi) })}
                    className="text-xs text-warning"
                    aria-label={`删除分支 ${br.label || bi + 1}`}
                  >
                    删除
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addBranch(pi)} className="text-sm text-primary">+ 添加分支</button>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs text-text-secondary">年龄</span>
              <input type="number" min="1" max="120" className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={age} onChange={e => { setAge(+e.target.value); setValidationError(null); }} aria-invalid={validationError?.includes('年龄') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
            </label>
            <label className="block">
              <span className="text-xs text-text-secondary">模拟年数</span>
              <input type="number" min="1" max="80" className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={horizonYears} onChange={e => { setHorizonYears(+e.target.value); setValidationError(null); }} aria-invalid={validationError?.includes('模拟年数') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
            </label>
            {paths.map((p, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 sm:col-span-2">
                <label className="block">
                  <span className="text-xs text-text-secondary">{p.label || `路径${i + 1}`} 收入</span>
                  <input type="number" min="0" className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={p.income} onChange={e => updatePath(i, { income: +e.target.value })} aria-invalid={validationError?.includes('收入') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
                </label>
                <label className="block">
                  <span className="text-xs text-text-secondary">{p.label || `路径${i + 1}`} 储蓄</span>
                  <input type="number" min="0" className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-sm" value={p.savings} onChange={e => updatePath(i, { savings: +e.target.value })} aria-invalid={validationError?.includes('储蓄') || undefined} aria-describedby={validationError ? 'wizard-error' : undefined} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <h3 className="mb-3 font-medium">配置摘要</h3>
          <pre className="overflow-x-auto rounded-lg bg-surface p-3 text-xs">
            {JSON.stringify({ paths: paths.map(p => ({ id: p.id, label: p.label, branches: p.branches.length })), age, horizonYears }, null, 2)}
          </pre>
        </div>
      )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => { setStep(s => s - 1); setValidationError(null); }}
          disabled={step === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-30"
        >
          上一步
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={tryNext} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
            下一步
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createSim.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {createSim.isPending ? '创建中...' : '创建模拟'}
          </button>
        )}
      </div>
    </>
  );
}
