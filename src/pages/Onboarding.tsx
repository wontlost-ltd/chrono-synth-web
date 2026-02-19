import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompleteOnboarding } from '../api/queries/onboarding';
import { useCreateValue } from '../api/queries/values';
import { useCreateSimulation } from '../api/queries/simulations';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type Step = 'welcome' | 'values' | 'simulation' | 'done';

const STEPS: Step[] = ['welcome', 'values', 'simulation', 'done'];

interface ValueDraft {
  label: string;
  weight: number;
}

export function Onboarding() {
  const { t } = useTranslation();
  useDocumentTitle(t('onboarding.welcomeTitle'));
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const createValue = useCreateValue();
  const createSim = useCreateSimulation();

  const [step, setStep] = useState<Step>('welcome');
  const [values, setValues] = useState<ValueDraft[]>([
    { label: '', weight: 0.8 },
    { label: '', weight: 0.6 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);

  function updateValue(index: number, patch: Partial<ValueDraft>) {
    setValues(prev => prev.map((v, i) => i === index ? { ...v, ...patch } : v));
    setError(null);
  }

  async function handleValuesNext() {
    const filled = values.filter(v => v.label.trim());
    if (filled.length === 0) {
      setError(t('onboarding.atLeastOneValue'));
      return;
    }
    setError(null);
    try {
      for (const v of filled) {
        await createValue.mutateAsync({ label: v.label.trim(), weight: v.weight });
      }
      setStep('simulation');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('onboarding.valueError'));
    }
  }

  async function handleSimulationNext() {
    setError(null);
    try {
      const result = await createSim.mutateAsync({
        paths: [
          {
            id: 'default',
            label: t('onboarding.defaultPathLabel'),
            description: t('onboarding.defaultPathDescription'),
            initialConditions: { income: 300000, savings: 500000 },
            branches: [],
          },
        ],
        horizonYears: 10,
        age: 30,
      });
      try { localStorage.setItem('last-sim-id', result.simulationId); } catch { /* ignored */ }
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('onboarding.simError'));
    }
  }

  async function handleFinish() {
    try {
      await completeOnboarding.mutateAsync();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  }

  const isPending = createValue.isPending || createSim.isPending || completeOnboarding.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">ChronoSynth</h1>
        </div>

        <div className="mb-6 flex gap-1" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={t('onboarding.progressLabel', { step: stepIndex + 1, total: STEPS.length })}>
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated p-6">
          {step === 'welcome' && (
            <>
              <h2 className="mb-2 text-lg font-medium">{t('onboarding.welcomeTitle')}</h2>
              <p className="mb-6 text-sm text-text-secondary">{t('onboarding.welcomeDescription')}</p>
              <button onClick={() => setStep('values')} className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white">
                {t('onboarding.getStarted')}
              </button>
            </>
          )}

          {step === 'values' && (
            <>
              <h2 className="mb-2 text-lg font-medium">{t('onboarding.valuesTitle')}</h2>
              <p className="mb-4 text-sm text-text-secondary">{t('onboarding.valuesDescription')}</p>
              <div className="space-y-3">
                {values.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm"
                      placeholder={t('onboarding.valuePlaceholder', { index: i + 1 })}
                      aria-label={t('onboarding.valuePlaceholder', { index: i + 1 })}
                      value={v.label}
                      onChange={e => updateValue(i, { label: e.target.value })}
                    />
                    <input
                      type="range" min="0" max="1" step="0.1"
                      value={v.weight}
                      onChange={e => updateValue(i, { weight: +e.target.value })}
                      className="w-20"
                      aria-label={t('onboarding.weightAria', { value: v.weight.toFixed(1) })}
                    />
                    <span className="w-8 text-xs text-text-secondary">{v.weight.toFixed(1)}</span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setValues(prev => [...prev, { label: '', weight: 0.5 }])}
                  className="text-sm text-primary"
                >
                  {t('onboarding.addValue')}
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-warning" role="alert">{error}</p>}
              <button
                onClick={handleValuesNext}
                disabled={isPending}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isPending ? t('common.loading') : t('onboarding.next')}
              </button>
            </>
          )}

          {step === 'simulation' && (
            <>
              <h2 className="mb-2 text-lg font-medium">{t('onboarding.simulationTitle')}</h2>
              <p className="mb-4 text-sm text-text-secondary">{t('onboarding.simulationDescription')}</p>
              {error && <p className="mb-3 text-sm text-warning" role="alert">{error}</p>}
              <button
                onClick={handleSimulationNext}
                disabled={isPending}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isPending ? t('common.loading') : t('onboarding.createFirstSim')}
              </button>
            </>
          )}

          {step === 'done' && (
            <>
              <h2 className="mb-2 text-lg font-medium">{t('onboarding.doneTitle')}</h2>
              <p className="mb-6 text-sm text-text-secondary">{t('onboarding.doneDescription')}</p>
              <button
                onClick={handleFinish}
                disabled={isPending}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {t('onboarding.goToDashboard')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
