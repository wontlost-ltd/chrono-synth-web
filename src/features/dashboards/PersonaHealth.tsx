/**
 * PersonaHealth — single-persona health dashboard (P2.7 scaffold).
 *
 * The full P2.7 deliverable is multi-week (radar + decision-trend +
 * memory-stack + tools-pie + drift-timeline + tenant ops board); this
 * scaffold ships the radar chart and the layout shell so the surface
 * is reachable behind the experimental flag while the remaining
 * charts land incrementally.
 *
 * Mounted under /personas/:personaId/health (route registration in a
 * follow-up PR). For now the component is a function consumers can
 * import and mount when ready.
 *
 * Behind the `experimental.values_health_dashboard` feature flag —
 * default OFF, opt-in via localStorage `chrono.flag.experimental.values_health_dashboard=true`
 * during dev, or remote provider in prod.
 */

import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFeatureFlag } from '../../lib/featureFlags';
import { ValueRadar, type ValueRadarPoint } from './charts/ValueRadar';

interface PersonaHealthProps {
  personaId: string;
  /** Radar data points; the parent fetches and supplies them. Empty
   *  array renders the empty-state. */
  values: ReadonlyArray<ValueRadarPoint>;
}

export function PersonaHealth({ personaId, values }: PersonaHealthProps) {
  const { t } = useTranslation();
  const enabled = useFeatureFlag('experimental.values_health_dashboard', false);

  if (!enabled) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('personaHealth.title')}
          subtitle={t('personaHealth.subtitle', { personaId })}
        />
        <EmptyState
          illustration="search"
          title={t('personaHealth.disabled.title')}
          message={t('personaHealth.disabled.message')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('personaHealth.title')}
        subtitle={t('personaHealth.subtitle', { personaId })}
      />

      <section
        aria-labelledby="persona-health-radar-heading"
        className="rounded-xl border border-border bg-surface-elevated p-4"
      >
        <h2 id="persona-health-radar-heading" className="mb-3 text-base font-semibold text-text-primary">
          {t('personaHealth.radar.heading')}
        </h2>
        {values.length === 0 ? (
          <EmptyState
            illustration="memories"
            message={t('personaHealth.radar.empty')}
          />
        ) : (
          <ValueRadar
            data={values}
            legendLabels={{
              current: t('personaHealth.radar.legend.current'),
              d7: t('personaHealth.radar.legend.d7'),
              d30: t('personaHealth.radar.legend.d30'),
            }}
          />
        )}
      </section>

      {/* Future sections — to be filled by P2.7 remainder PRs:
        *   - DecisionTrend (line, 30d)
        *   - MemoryStack (stacked bar, growth + confidence)
        *   - ToolMix (pie, 7d)
        *   - DriftTimeline (with alert markers)
        */}
    </div>
  );
}
