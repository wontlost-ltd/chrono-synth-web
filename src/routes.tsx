import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Skeleton } from './components/ui/Skeleton';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const SimulationWizard = lazy(() => import('./pages/SimulationWizard').then(m => ({ default: m.SimulationWizard })));
const PathComparison = lazy(() => import('./pages/PathComparison').then(m => ({ default: m.PathComparison })));
const BranchExplorer = lazy(() => import('./pages/BranchExplorer').then(m => ({ default: m.BranchExplorer })));
const StressTest = lazy(() => import('./pages/StressTest').then(m => ({ default: m.StressTest })));
const Milestones = lazy(() => import('./pages/Milestones').then(m => ({ default: m.Milestones })));
const ValuesManager = lazy(() => import('./pages/ValuesManager').then(m => ({ default: m.ValuesManager })));
const SystemStatus = lazy(() => import('./pages/SystemStatus').then(m => ({ default: m.SystemStatus })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Skeleton variant="chart" />}>{children}</Suspense>;
}

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <LazyPage><Dashboard /></LazyPage> },
  { path: '/simulations/new', element: <LazyPage><SimulationWizard /></LazyPage> },
  { path: '/simulations/:id', element: <Navigate to="paths" replace /> },
  { path: '/simulations/:id/paths', element: <LazyPage><PathComparison /></LazyPage> },
  { path: '/simulations/:id/branches', element: <LazyPage><BranchExplorer /></LazyPage> },
  { path: '/simulations/:id/stress', element: <LazyPage><StressTest /></LazyPage> },
  { path: '/simulations/:id/milestones', element: <LazyPage><Milestones /></LazyPage> },
  { path: '/values', element: <LazyPage><ValuesManager /></LazyPage> },
  { path: '/system', element: <LazyPage><SystemStatus /></LazyPage> },
];
