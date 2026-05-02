import { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { DataTable, type Column } from '../components/ui/DataTable';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import {
  useAdminDeploymentProfile,
  useAdminGovernance,
  useAdminPersonas,
  useAdminTasks,
  useAdminWallets,
  useAuditLogs,
  useCreateOrganization,
  useGenerateScimToken,
  useOrganizationMembers,
  useOrganizations,
  useUpdateAdminDeploymentProfile,
  useUpsertOrganizationMember,
  type AdminGovernanceResponse,
  type AdminPersonasResponse,
  type AdminTasksResponse,
  type AdminWalletsResponse,
  type AuditLogsResponse,
  type CreateOrganizationInput,
  type DeploymentProfile,
  type OrganizationMember,
  type OrganizationRole,
  type OrganizationSummary,
  type UpdateDeploymentProfileInput,
} from '../api/queries/enterprise';

const ORG_ROLE_OPTIONS: OrganizationRole[] = [
  'org_admin',
  'billing_admin',
  'persona_operator',
  'marketplace_manager',
  'auditor',
  'viewer',
];

const DEFAULT_DEPLOYMENT_FORM: UpdateDeploymentProfileInput = {
  deploymentMode: 'shared_cluster',
  databaseIsolationMode: 'shared',
  kafkaNamespace: null,
  encryptionMode: 'platform_managed',
  kmsKeyRef: null,
  oidc: {
    enabled: false,
    issuerUrl: '',
    clientId: '',
    audience: '',
    scope: 'openid profile email',
    emailClaim: 'email',
    nameClaim: 'name',
  },
};

const DEFAULT_ORGANIZATION_FORM: CreateOrganizationInput = {
  name: '',
  slug: '',
  defaultWorkspaceName: 'Default Workspace',
  defaultWorkspaceSlug: '',
};

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function MetricTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, children, actions }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function InlineMessage({ tone, message }: { tone: 'success' | 'error'; message: string | null }) {
  if (!message) return null;
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${
      tone === 'success'
        ? 'border-success/30 bg-success/5 text-success'
        : 'border-warning/30 bg-warning/5 text-warning'
    }`}>
      {message}
    </p>
  );
}

function applyProfileToForm(profile: DeploymentProfile): UpdateDeploymentProfileInput {
  return {
    deploymentMode: profile.deploymentMode,
    databaseIsolationMode: profile.databaseIsolationMode,
    kafkaNamespace: profile.kafkaNamespace,
    encryptionMode: profile.encryptionMode,
    kmsKeyRef: profile.kmsKeyRef,
    oidc: {
      enabled: profile.oidc.enabled,
      issuerUrl: profile.oidc.issuerUrl,
      clientId: profile.oidc.clientId,
      audience: profile.oidc.audience,
      scope: profile.oidc.scope,
      emailClaim: profile.oidc.emailClaim,
      nameClaim: profile.oidc.nameClaim,
    },
  };
}

export function EnterpriseConsole() {
  useDocumentTitle('Enterprise Console');
  const { role, tenantId } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState('deployment');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [deploymentForm, setDeploymentForm] = useState<UpdateDeploymentProfileInput>(DEFAULT_DEPLOYMENT_FORM);
  const [deploymentSuccess, setDeploymentSuccess] = useState<string | null>(null);
  const [organizationSuccess, setOrganizationSuccess] = useState<string | null>(null);
  const [generatedScimToken, setGeneratedScimToken] = useState<string | null>(null);
  const [organizationForm, setOrganizationForm] = useState<CreateOrganizationInput>(DEFAULT_ORGANIZATION_FORM);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRoles, setMemberRoles] = useState<OrganizationRole[]>(['viewer']);
  const [personaPage, setPersonaPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const [walletPage, setWalletPage] = useState(1);
  const [governancePage, setGovernancePage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const organizations = useOrganizations(isAdmin);
  const organizationMembers = useOrganizationMembers(selectedOrganizationId, isAdmin);
  const createOrganization = useCreateOrganization();
  const upsertOrganizationMember = useUpsertOrganizationMember(selectedOrganizationId);

  const deploymentProfile = useAdminDeploymentProfile(isAdmin);
  const updateDeploymentProfile = useUpdateAdminDeploymentProfile();
  const generateScimToken = useGenerateScimToken();

  const adminPersonas = useAdminPersonas(personaPage, undefined, isAdmin);
  const adminTasks = useAdminTasks(taskPage, undefined, isAdmin);
  const adminWallets = useAdminWallets(walletPage, undefined, isAdmin);
  const adminGovernance = useAdminGovernance(governancePage, undefined, isAdmin);
  const auditLogs = useAuditLogs(auditPage, isAdmin);

  useEffect(() => {
    if (deploymentProfile.data) {
      setDeploymentForm(applyProfileToForm(deploymentProfile.data));
    }
  }, [deploymentProfile.data]);

  useEffect(() => {
    const firstOrganizationId = organizations.data?.[0]?.organizationId ?? null;
    if (!firstOrganizationId) {
      setSelectedOrganizationId(null);
      return;
    }
    if (!selectedOrganizationId || !organizations.data?.some((item) => item.organizationId === selectedOrganizationId)) {
      setSelectedOrganizationId(firstOrganizationId);
    }
  }, [organizations.data, selectedOrganizationId]);

  if (!isAdmin) {
    return <EmptyState variant="error" message="Enterprise Console requires an admin account." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Console"
        subtitle="Operate organizations, deployment profiles, control-plane views, and audit evidence from one place."
        actions={(
          <div className="flex flex-wrap gap-2">
            <a
              href="/worker/healthz"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface"
            >
              Worker Health
            </a>
            <a
              href="/prometheus/targets"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface"
            >
              Prometheus
            </a>
            <a
              href="/grafana/d/chrono-synth-overview/chrono-synth-enterprise-overview"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-light"
            >
              Grafana
            </a>
          </div>
        )}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Tenant" value={tenantId} hint="JWT-scoped tenant for all enterprise actions" />
        <MetricTile
          label="Organizations"
          value={organizations.data?.length ?? 0}
          hint={selectedOrganizationId ? `Active org: ${selectedOrganizationId}` : 'Create the first org to enable RBAC'}
        />
        <MetricTile
          label="Deployment Mode"
          value={deploymentProfile.data?.deploymentMode ?? 'loading'}
          hint={deploymentProfile.data?.kafkaNamespace ?? 'Shared Kafka topic namespace'}
        />
        <MetricTile
          label="Audit Events"
          value={auditLogs.data?.pagination.total ?? 0}
          hint="Recent business audit records for this tenant"
        />
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'deployment', label: 'Deployment Profile' },
          { id: 'organizations', label: 'Organizations & RBAC' },
          { id: 'control', label: 'Control Plane' },
          { id: 'audit', label: 'Audit Trail' },
        ]}
        renderPanel={(tabId) => {
          switch (tabId) {
            case 'deployment':
              return (
                <DeploymentPanel
                  profile={deploymentProfile.data}
                  loading={deploymentProfile.isLoading}
                  error={deploymentProfile.error?.message ?? null}
                  form={deploymentForm}
                  successMessage={deploymentSuccess}
                  generatedScimToken={generatedScimToken}
                  saving={updateDeploymentProfile.isPending}
                  scimGenerating={generateScimToken.isPending}
                  saveError={updateDeploymentProfile.error?.message ?? null}
                  scimError={generateScimToken.error?.message ?? null}
                  onChange={setDeploymentForm}
                  onSave={() => {
                    setDeploymentSuccess(null);
                    setGeneratedScimToken(null);
                    updateDeploymentProfile.mutate({
                      deploymentMode: deploymentForm.deploymentMode,
                      databaseIsolationMode: deploymentForm.databaseIsolationMode,
                      kafkaNamespace: toNullable(deploymentForm.kafkaNamespace ?? ''),
                      encryptionMode: deploymentForm.encryptionMode,
                      kmsKeyRef: toNullable(deploymentForm.kmsKeyRef ?? ''),
                      oidc: {
                        enabled: deploymentForm.oidc.enabled,
                        issuerUrl: deploymentForm.oidc.issuerUrl.trim(),
                        clientId: deploymentForm.oidc.clientId.trim(),
                        clientSecret: deploymentForm.oidc.clientSecret?.trim() || undefined,
                        audience: deploymentForm.oidc.audience.trim(),
                        scope: deploymentForm.oidc.scope.trim(),
                        emailClaim: deploymentForm.oidc.emailClaim.trim(),
                        nameClaim: deploymentForm.oidc.nameClaim.trim(),
                      },
                    }, {
                      onSuccess: () => {
                        setDeploymentSuccess('Deployment profile saved.');
                      },
                    });
                  }}
                  onGenerateScim={() => {
                    setGeneratedScimToken(null);
                    generateScimToken.mutate(undefined, {
                      onSuccess: (data) => {
                        setGeneratedScimToken(data.token);
                      },
                    });
                  }}
                />
              );
            case 'organizations':
              return (
                <OrganizationsPanel
                  organizations={organizations.data ?? []}
                  organizationsLoading={organizations.isLoading}
                  organizationsError={organizations.error?.message ?? null}
                  selectedOrganizationId={selectedOrganizationId}
                  organizationForm={organizationForm}
                  memberEmail={memberEmail}
                  memberRoles={memberRoles}
                  members={organizationMembers.data ?? []}
                  membersLoading={organizationMembers.isLoading}
                  membersError={organizationMembers.error?.message ?? null}
                  successMessage={organizationSuccess}
                  createPending={createOrganization.isPending}
                  memberPending={upsertOrganizationMember.isPending}
                  createError={createOrganization.error?.message ?? null}
                  memberError={upsertOrganizationMember.error?.message ?? null}
                  onSelectOrganization={setSelectedOrganizationId}
                  onChangeOrganizationForm={setOrganizationForm}
                  onMemberEmailChange={setMemberEmail}
                  onMemberRolesChange={setMemberRoles}
                  onCreateOrganization={() => {
                    setOrganizationSuccess(null);
                    createOrganization.mutate({
                      name: organizationForm.name.trim(),
                      slug: organizationForm.slug?.trim() || undefined,
                      defaultWorkspaceName: organizationForm.defaultWorkspaceName?.trim() || 'Default Workspace',
                      defaultWorkspaceSlug: organizationForm.defaultWorkspaceSlug?.trim() || undefined,
                    }, {
                      onSuccess: (data) => {
                        setOrganizationSuccess(`Organization ${data.organization.name} created.`);
                        setSelectedOrganizationId(data.organization.organizationId);
                        setOrganizationForm(DEFAULT_ORGANIZATION_FORM);
                      },
                    });
                  }}
                  onAddMember={() => {
                    if (!selectedOrganizationId) return;
                    setOrganizationSuccess(null);
                    upsertOrganizationMember.mutate({
                      email: memberEmail.trim(),
                      roles: memberRoles,
                    }, {
                      onSuccess: () => {
                        setOrganizationSuccess('Organization member bindings updated.');
                        setMemberEmail('');
                        setMemberRoles(['viewer']);
                      },
                    });
                  }}
                />
              );
            case 'control':
              return (
                <ControlPlanePanel
                  personas={adminPersonas.data}
                  tasks={adminTasks.data}
                  wallets={adminWallets.data}
                  governance={adminGovernance.data}
                  loading={adminPersonas.isLoading || adminTasks.isLoading || adminWallets.isLoading || adminGovernance.isLoading}
                  errors={[
                    adminPersonas.error?.message,
                    adminTasks.error?.message,
                    adminWallets.error?.message,
                    adminGovernance.error?.message,
                  ].filter((item): item is string => Boolean(item))}
                  personaPage={personaPage}
                  taskPage={taskPage}
                  walletPage={walletPage}
                  governancePage={governancePage}
                  onPersonaPageChange={setPersonaPage}
                  onTaskPageChange={setTaskPage}
                  onWalletPageChange={setWalletPage}
                  onGovernancePageChange={setGovernancePage}
                />
              );
            case 'audit':
              return (
                <AuditPanel
                  audit={auditLogs.data}
                  loading={auditLogs.isLoading}
                  error={auditLogs.error?.message ?? null}
                  page={auditPage}
                  onPageChange={setAuditPage}
                />
              );
            default:
              return null;
          }
        }}
      />
    </div>
  );
}

function DeploymentPanel({
  profile,
  loading,
  error,
  form,
  successMessage,
  generatedScimToken,
  saving,
  scimGenerating,
  saveError,
  scimError,
  onChange,
  onSave,
  onGenerateScim,
}: {
  profile: DeploymentProfile | undefined;
  loading: boolean;
  error: string | null;
  form: UpdateDeploymentProfileInput;
  successMessage: string | null;
  generatedScimToken: string | null;
  saving: boolean;
  scimGenerating: boolean;
  saveError: string | null;
  scimError: string | null;
  onChange: (form: UpdateDeploymentProfileInput) => void;
  onSave: () => void;
  onGenerateScim: () => void;
}) {
  if (loading) return <Skeleton variant="table" />;
  if (error) return <EmptyState variant="error" message={`Failed to load deployment profile: ${error}`} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Current Posture" subtitle="Dedicated deployment, encryption, and enterprise identity posture for this tenant.">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Deployment" value={profile?.deploymentMode ?? '—'} hint={`DB isolation: ${profile?.databaseIsolationMode ?? '—'}`} />
          <MetricTile label="Kafka Namespace" value={profile?.kafkaNamespace ?? 'shared'} hint="Runtime routing target for observability topics" />
          <MetricTile label="Encryption" value={profile?.encryptionMode ?? '—'} hint={profile?.kmsKeyRef ?? 'Platform-managed keyring'} />
          <MetricTile label="SSO / SCIM" value={`${profile?.oidc.enabled ? 'OIDC on' : 'OIDC off'} / ${profile?.scimTokenConfigured ? 'SCIM ready' : 'No SCIM token'}`} hint={`Updated ${formatDateTime(profile?.updatedAt)}`} />
        </div>
      </SectionCard>

      <SectionCard
        title="Deployment Profile"
        subtitle="Persist the tenant deployment profile consumed by OIDC, SCIM, encryption, and Kafka namespace routing."
        actions={(
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      >
        <div className="space-y-3">
          <InlineMessage tone="success" message={successMessage} />
          <InlineMessage tone="error" message={saveError} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-text-secondary">
            Deployment Mode
            <select
              value={form.deploymentMode}
              onChange={(event) => onChange({ ...form, deploymentMode: event.target.value as UpdateDeploymentProfileInput['deploymentMode'] })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <option value="shared_cluster">shared_cluster</option>
              <option value="dedicated_db">dedicated_db</option>
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            Database Isolation
            <select
              value={form.databaseIsolationMode}
              onChange={(event) => onChange({ ...form, databaseIsolationMode: event.target.value as UpdateDeploymentProfileInput['databaseIsolationMode'] })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <option value="shared">shared</option>
              <option value="dedicated">dedicated</option>
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            Kafka Namespace
            <input
              value={form.kafkaNamespace ?? ''}
              onChange={(event) => onChange({ ...form, kafkaNamespace: event.target.value })}
              placeholder="tenant-enterprise"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm text-text-secondary">
            Encryption Mode
            <select
              value={form.encryptionMode}
              onChange={(event) => onChange({ ...form, encryptionMode: event.target.value as UpdateDeploymentProfileInput['encryptionMode'] })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <option value="platform_managed">platform_managed</option>
              <option value="tenant_dedicated">tenant_dedicated</option>
            </select>
          </label>
          <label className="text-sm text-text-secondary md:col-span-2">
            KMS Key Reference
            <input
              value={form.kmsKeyRef ?? ''}
              onChange={(event) => onChange({ ...form, kmsKeyRef: event.target.value })}
              placeholder="tenant_enterprise"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
            <input
              type="checkbox"
              checked={form.oidc.enabled}
              onChange={(event) => onChange({
                ...form,
                oidc: {
                  ...form.oidc,
                  enabled: event.target.checked,
                },
              })}
            />
            Enable Tenant OIDC
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-text-secondary">
              Issuer URL
              <input
                value={form.oidc.issuerUrl}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, issuerUrl: event.target.value } })}
                placeholder="https://idp.example.test"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Client ID
              <input
                value={form.oidc.clientId}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, clientId: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Client Secret
              <input
                type="password"
                value={form.oidc.clientSecret ?? ''}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, clientSecret: event.target.value } })}
                placeholder="Leave blank to keep the current encrypted secret"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Audience
              <input
                value={form.oidc.audience}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, audience: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Scope
              <input
                value={form.oidc.scope}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, scope: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Email Claim
              <input
                value={form.oidc.emailClaim}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, emailClaim: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              Name Claim
              <input
                value={form.oidc.nameClaim}
                onChange={(event) => onChange({ ...form, oidc: { ...form.oidc, nameClaim: event.target.value } })}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="SCIM Provisioning"
        subtitle="Generate a new SCIM bearer token for IdP-driven enterprise user provisioning."
        actions={(
          <button
            type="button"
            onClick={onGenerateScim}
            disabled={scimGenerating}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface disabled:opacity-50"
          >
            {scimGenerating ? 'Generating...' : 'Generate Token'}
          </button>
        )}
      >
        <InlineMessage tone="error" message={scimError} />
        {generatedScimToken ? (
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary">One-time token value</p>
            <code className="mt-2 block overflow-x-auto whitespace-pre-wrap break-all text-sm text-text-primary">
              {generatedScimToken}
            </code>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Generate a fresh token when you are ready to wire your IdP. Existing tokens are never re-displayed.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function OrganizationsPanel({
  organizations,
  organizationsLoading,
  organizationsError,
  selectedOrganizationId,
  organizationForm,
  memberEmail,
  memberRoles,
  members,
  membersLoading,
  membersError,
  successMessage,
  createPending,
  memberPending,
  createError,
  memberError,
  onSelectOrganization,
  onChangeOrganizationForm,
  onMemberEmailChange,
  onMemberRolesChange,
  onCreateOrganization,
  onAddMember,
}: {
  organizations: OrganizationSummary[];
  organizationsLoading: boolean;
  organizationsError: string | null;
  selectedOrganizationId: string | null;
  organizationForm: CreateOrganizationInput;
  memberEmail: string;
  memberRoles: OrganizationRole[];
  members: OrganizationMember[];
  membersLoading: boolean;
  membersError: string | null;
  successMessage: string | null;
  createPending: boolean;
  memberPending: boolean;
  createError: string | null;
  memberError: string | null;
  onSelectOrganization: (organizationId: string) => void;
  onChangeOrganizationForm: (form: CreateOrganizationInput) => void;
  onMemberEmailChange: (value: string) => void;
  onMemberRolesChange: (value: OrganizationRole[]) => void;
  onCreateOrganization: () => void;
  onAddMember: () => void;
}) {
  const organizationColumns: Column<OrganizationSummary>[] = [
    { id: 'name', header: 'Organization', cell: (row) => row.name },
    { id: 'slug', header: 'Slug', cell: (row) => row.slug },
    { id: 'workspace', header: 'Default Workspace', cell: (row) => row.defaultWorkspace?.name ?? '—' },
    { id: 'createdAt', header: 'Created', cell: (row) => formatDateTime(row.createdAt) },
  ];
  const memberColumns: Column<OrganizationMember>[] = [
    { id: 'email', header: 'Email', cell: (row) => row.email },
    { id: 'roles', header: 'Roles', cell: (row) => row.roles.join(', ') },
    { id: 'status', header: 'Status', cell: (row) => row.status },
    { id: 'joinedAt', header: 'Joined', cell: (row) => formatDateTime(row.joinedAt) },
  ];

  return (
    <div className="space-y-6">
      <InlineMessage tone="success" message={successMessage} />

      <SectionCard title="Organizations" subtitle="Create organizations and grant enterprise workspace roles for the current tenant.">
        {organizationsLoading ? (
          <Skeleton variant="table" />
        ) : organizationsError ? (
          <EmptyState variant="error" message={`Failed to load organizations: ${organizationsError}`} />
        ) : (
          <DataTable
            rows={organizations}
            columns={organizationColumns}
            getRowId={(row) => row.organizationId}
            emptyState={<EmptyState message="No organizations yet." />}
            rowActions={(row) => (
              <button
                type="button"
                onClick={() => onSelectOrganization(row.organizationId)}
                className={`rounded-lg px-3 py-1 text-xs font-medium ${
                  row.organizationId === selectedOrganizationId
                    ? 'bg-primary text-white'
                    : 'border border-border text-text-secondary hover:bg-surface'
                }`}
              >
                {row.organizationId === selectedOrganizationId ? 'Selected' : 'View Members'}
              </button>
            )}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Create Organization"
        subtitle="Bootstrap an organization with its default workspace and the current admin as org_admin."
        actions={(
          <button
            type="button"
            onClick={onCreateOrganization}
            disabled={createPending || !organizationForm.name.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
          >
            {createPending ? 'Creating...' : 'Create Organization'}
          </button>
        )}
      >
        <InlineMessage tone="error" message={createError} />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-text-secondary">
            Organization Name
            <input
              value={organizationForm.name}
              onChange={(event) => onChangeOrganizationForm({ ...organizationForm, name: event.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm text-text-secondary">
            Slug
            <input
              value={organizationForm.slug ?? ''}
              onChange={(event) => onChangeOrganizationForm({ ...organizationForm, slug: event.target.value })}
              placeholder="acme-platform"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm text-text-secondary">
            Default Workspace Name
            <input
              value={organizationForm.defaultWorkspaceName ?? ''}
              onChange={(event) => onChangeOrganizationForm({ ...organizationForm, defaultWorkspaceName: event.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="text-sm text-text-secondary">
            Default Workspace Slug
            <input
              value={organizationForm.defaultWorkspaceSlug ?? ''}
              onChange={(event) => onChangeOrganizationForm({ ...organizationForm, defaultWorkspaceSlug: event.target.value })}
              placeholder="default"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title="Memberships & Role Bindings"
        subtitle={selectedOrganizationId ? `Manage members for ${selectedOrganizationId}.` : 'Select an organization first.'}
        actions={selectedOrganizationId ? (
          <button
            type="button"
            onClick={onAddMember}
            disabled={memberPending || !memberEmail.trim()}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface disabled:opacity-50"
          >
            {memberPending ? 'Updating...' : 'Add / Update Member'}
          </button>
        ) : null}
      >
        <InlineMessage tone="error" message={memberError} />
        {selectedOrganizationId ? (
          <>
            <div className="mb-4 grid gap-4 md:grid-cols-[2fr_3fr]">
              <label className="text-sm text-text-secondary">
                User Email
                <input
                  value={memberEmail}
                  onChange={(event) => onMemberEmailChange(event.target.value)}
                  placeholder="member@example.com"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                />
              </label>
              <div className="text-sm text-text-secondary">
                Roles
                <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {ORG_ROLE_OPTIONS.map((role) => {
                    const checked = memberRoles.includes(role);
                    return (
                      <label key={role} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            onMemberRolesChange(
                              checked
                                ? memberRoles.filter((item) => item !== role)
                                : [...memberRoles, role],
                            );
                          }}
                        />
                        {role}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {membersLoading ? (
              <Skeleton variant="table" />
            ) : membersError ? (
              <EmptyState variant="error" message={`Failed to load members: ${membersError}`} />
            ) : (
              <DataTable
                rows={members}
                columns={memberColumns}
                getRowId={(row) => row.membershipId}
                emptyState={<EmptyState message="No members assigned yet." />}
              />
            )}
          </>
        ) : (
          <EmptyState message="Create or select an organization to manage memberships." />
        )}
      </SectionCard>
    </div>
  );
}

function ControlPlanePanel({
  personas,
  tasks,
  wallets,
  governance,
  loading,
  errors,
  personaPage,
  taskPage,
  walletPage,
  governancePage,
  onPersonaPageChange,
  onTaskPageChange,
  onWalletPageChange,
  onGovernancePageChange,
}: {
  personas: AdminPersonasResponse | undefined;
  tasks: AdminTasksResponse | undefined;
  wallets: AdminWalletsResponse | undefined;
  governance: AdminGovernanceResponse | undefined;
  loading: boolean;
  errors: string[];
  personaPage: number;
  taskPage: number;
  walletPage: number;
  governancePage: number;
  onPersonaPageChange: (page: number) => void;
  onTaskPageChange: (page: number) => void;
  onWalletPageChange: (page: number) => void;
  onGovernancePageChange: (page: number) => void;
}) {
  if (loading) return <Skeleton variant="table" />;
  if (errors.length > 0) return <EmptyState variant="error" message={errors.join('\n')} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Personas" subtitle="Current persona fleet, ownership, and wallet posture.">
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <MetricTile label="Total" value={personas?.summary.total ?? 0} />
            <MetricTile label="Active" value={personas?.summary.active ?? 0} />
            <MetricTile label="Restricted" value={personas?.summary.restricted ?? 0} />
            <MetricTile label="Deceased" value={personas?.summary.deceased ?? 0} />
          </div>
          <DataTable
            rows={personas?.data ?? []}
            columns={[
              { id: 'displayName', header: 'Persona', cell: (row) => row.displayName },
              { id: 'status', header: 'Status', cell: (row) => row.status },
              { id: 'ownerEmail', header: 'Owner', cell: (row) => row.ownerEmail ?? row.ownerUserId },
              { id: 'walletBalance', header: 'Wallet', cell: (row) => row.walletBalance ?? '—' },
            ]}
            getRowId={(row) => row.personaId}
            pagination={personas ? {
              page: personaPage,
              pageSize: personas.pagination.pageSize,
              total: personas.pagination.total,
              onChange: onPersonaPageChange,
            } : undefined}
            emptyState={<EmptyState message="No personas found." />}
          />
        </SectionCard>

        <SectionCard title="Tasks" subtitle="Marketplace backlog and completion posture.">
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <MetricTile label="Total" value={tasks?.summary.total ?? 0} />
            <MetricTile label="Open" value={tasks?.summary.open ?? 0} />
            <MetricTile label="Accepted" value={tasks?.summary.accepted ?? 0} />
            <MetricTile label="Completed" value={tasks?.summary.completed ?? 0} />
          </div>
          <DataTable
            rows={tasks?.data ?? []}
            columns={[
              { id: 'title', header: 'Task', cell: (row) => row.title },
              { id: 'status', header: 'Status', cell: (row) => row.status },
              { id: 'category', header: 'Category', cell: (row) => row.category },
              { id: 'reward', header: 'Reward', cell: (row) => row.reward },
            ]}
            getRowId={(row) => row.taskId}
            pagination={tasks ? {
              page: taskPage,
              pageSize: tasks.pagination.pageSize,
              total: tasks.pagination.total,
              onChange: onTaskPageChange,
            } : undefined}
            emptyState={<EmptyState message="No tasks found." />}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Wallets" subtitle="Persona wallet exposure and settlement freshness.">
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <MetricTile label="Wallets" value={wallets?.summary.total ?? 0} />
            <MetricTile label="Active" value={wallets?.summary.active ?? 0} />
            <MetricTile label="Total Balance" value={wallets?.summary.totalBalance ?? 0} />
            <MetricTile label="Token Reserve" value={wallets?.summary.totalTokenBalance ?? 0} />
          </div>
          <DataTable
            rows={wallets?.data ?? []}
            columns={[
              { id: 'displayName', header: 'Persona', cell: (row) => row.displayName ?? row.personaId },
              { id: 'balance', header: 'Balance', cell: (row) => `${row.balance} ${row.currency}` },
              { id: 'tokenBalance', header: 'Reserve', cell: (row) => row.tokenBalance },
              { id: 'lastSettledAt', header: 'Last Settled', cell: (row) => formatDateTime(row.lastSettledAt) },
            ]}
            getRowId={(row) => row.walletId}
            pagination={wallets ? {
              page: walletPage,
              pageSize: wallets.pagination.pageSize,
              total: wallets.pagination.total,
              onChange: onWalletPageChange,
            } : undefined}
            emptyState={<EmptyState message="No wallets found." />}
          />
        </SectionCard>

        <SectionCard title="Governance" subtitle="Open cases, appeals, and recent moderation actions.">
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <MetricTile label="Cases" value={governance?.summary.total ?? 0} />
            <MetricTile label="Open" value={governance?.summary.open ?? 0} />
            <MetricTile label="Action Applied" value={governance?.summary.actionApplied ?? 0} />
            <MetricTile label="Appealed" value={governance?.summary.appealed ?? 0} />
          </div>
          <DataTable
            rows={governance?.data ?? []}
            columns={[
              { id: 'displayName', header: 'Persona', cell: (row) => row.displayName ?? row.personaId },
              { id: 'triggerType', header: 'Trigger', cell: (row) => row.triggerType },
              { id: 'severity', header: 'Severity', cell: (row) => row.severity },
              { id: 'status', header: 'Status', cell: (row) => row.status },
            ]}
            getRowId={(row) => row.caseId}
            pagination={governance ? {
              page: governancePage,
              pageSize: governance.pagination.pageSize,
              total: governance.pagination.total,
              onChange: onGovernancePageChange,
            } : undefined}
            emptyState={<EmptyState message="No governance cases found." />}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function AuditPanel({
  audit,
  loading,
  error,
  page,
  onPageChange,
}: {
  audit: AuditLogsResponse | undefined;
  loading: boolean;
  error: string | null;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (loading) return <Skeleton variant="table" />;
  if (error) return <EmptyState variant="error" message={`Failed to load audit log: ${error}`} />;

  return (
    <div className="space-y-6">
      <SectionCard title="Business Audit Trail" subtitle="Recent sensitive actions captured by the platform audit logger.">
        <DataTable
          rows={audit?.data ?? []}
          columns={[
            { id: 'actionType', header: 'Action', cell: (row) => row.actionType },
            { id: 'targetType', header: 'Target Type', cell: (row) => row.targetType ?? '—' },
            { id: 'actorId', header: 'Actor', cell: (row) => row.actorId ?? row.userEmail ?? row.userId ?? 'system' },
            { id: 'createdAt', header: 'Time', cell: (row) => formatDateTime(new Date(row.createdAt).toISOString()) },
          ]}
          getRowId={(row) => row.id}
          pagination={audit ? {
            page,
            pageSize: audit.pagination.pageSize,
            total: audit.pagination.total,
            onChange: onPageChange,
          } : undefined}
          emptyState={<EmptyState message="No audit rows found." />}
          rowActions={(row) => (
            <details className="max-w-[24rem] text-left">
              <summary className="cursor-pointer text-xs text-primary">Payload</summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-surface p-3 text-[11px] text-text-secondary">
                {formatJson(row.payload ?? {})}
              </pre>
            </details>
          )}
        />
      </SectionCard>
    </div>
  );
}
