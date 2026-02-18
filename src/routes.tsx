import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Skeleton } from './components/ui/Skeleton';
import { AuthGuard } from './components/layout/AuthGuard';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const SimulationWizard = lazy(() => import('./pages/SimulationWizard').then(m => ({ default: m.SimulationWizard })));
const PathComparison = lazy(() => import('./pages/PathComparison').then(m => ({ default: m.PathComparison })));
const BranchExplorer = lazy(() => import('./pages/BranchExplorer').then(m => ({ default: m.BranchExplorer })));
const StressTest = lazy(() => import('./pages/StressTest').then(m => ({ default: m.StressTest })));
const Milestones = lazy(() => import('./pages/Milestones').then(m => ({ default: m.Milestones })));
const ValuesManager = lazy(() => import('./pages/ValuesManager').then(m => ({ default: m.ValuesManager })));
const SystemStatus = lazy(() => import('./pages/SystemStatus').then(m => ({ default: m.SystemStatus })));
const Billing = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SSOCallback = lazy(() => import('./pages/SSOCallback').then(m => ({ default: m.SSOCallback })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Skeleton variant="chart" />}>{children}</Suspense>;
}

function Protected({ children }: { children: React.ReactNode }) {
  return <AuthGuard><LazyPage>{children}</LazyPage></AuthGuard>;
}

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LazyPage><Login /></LazyPage> },
  { path: '/register', element: <LazyPage><Register /></LazyPage> },
  { path: '/onboarding', element: <Protected><Onboarding /></Protected> },
  { path: '/dashboard', element: <Protected><Dashboard /></Protected> },
  { path: '/simulations/new', element: <Protected><SimulationWizard /></Protected> },
  { path: '/simulations/:id', element: <Navigate to="paths" replace /> },
  { path: '/simulations/:id/paths', element: <Protected><PathComparison /></Protected> },
  { path: '/simulations/:id/branches', element: <Protected><BranchExplorer /></Protected> },
  { path: '/simulations/:id/stress', element: <Protected><StressTest /></Protected> },
  { path: '/simulations/:id/milestones', element: <Protected><Milestones /></Protected> },
  { path: '/values', element: <Protected><ValuesManager /></Protected> },
  { path: '/system', element: <Protected><SystemStatus /></Protected> },
  { path: '/billing', element: <Protected><Billing /></Protected> },
  { path: '/settings', element: <Protected><Settings /></Protected> },
  { path: '/sso/callback', element: <LazyPage><SSOCallback /></LazyPage> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];
