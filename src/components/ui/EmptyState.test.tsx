import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders message text', () => {
    render(<EmptyState message="无数据" />);
    expect(screen.getByText('无数据')).toBeInTheDocument();
  });

  it('uses status role by default', () => {
    render(<EmptyState message="空" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses alert role for error variant', () => {
    render(<EmptyState variant="error" message="加载失败: timeout" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies warning color to error variant text', () => {
    render(<EmptyState variant="error" message="错误" />);
    const text = screen.getByText('错误');
    expect(text.className).toContain('text-warning');
  });

  it('applies secondary color to empty variant text', () => {
    render(<EmptyState message="空" />);
    const text = screen.getByText('空');
    expect(text.className).toContain('text-text-secondary');
  });

  it('renders action slot when provided', () => {
    render(<EmptyState message="无数据" action={<button>重试</button>} />);
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });

  it('does not render action container when no action', () => {
    const { container } = render(<EmptyState message="空" />);
    expect(container.querySelectorAll('.mt-4')).toHaveLength(0);
  });
});
