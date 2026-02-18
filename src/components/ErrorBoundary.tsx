import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8" role="alert">
          <h2 className="text-lg font-bold text-warning">页面渲染出错</h2>
          <p className="max-w-md text-center text-sm text-text-secondary">
            {this.state.error.message || '未知错误'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              重试
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/dashboard'; }}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
