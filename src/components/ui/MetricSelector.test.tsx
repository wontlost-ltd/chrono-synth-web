import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricSelector } from './MetricSelector';
import type { MetricKey } from '../../types';

describe('MetricSelector', () => {
  it('renders default options as toggle buttons', () => {
    render(<MetricSelector selected={[]} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: '指标选择' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '财富' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '健康指数' })).toBeInTheDocument();
  });

  it('marks selected items as pressed', () => {
    render(<MetricSelector selected={['wealth']} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '财富' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '健康指数' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange to add a metric', () => {
    const onChange = vi.fn();
    render(<MetricSelector selected={['wealth']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '健康指数' }));
    expect(onChange).toHaveBeenCalledWith(['wealth', 'healthIndex']);
  });

  it('calls onChange to remove a metric', () => {
    const onChange = vi.fn();
    render(<MetricSelector selected={['wealth', 'healthIndex']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '财富' }));
    expect(onChange).toHaveBeenCalledWith(['healthIndex']);
  });

  it('uses metricMeta labels when provided', () => {
    const meta = [
      { key: 'wealth' as MetricKey, label: 'Wealth', unit: '¥', range: [0, 1e8] as const },
    ];
    render(<MetricSelector selected={[]} onChange={() => {}} metricMeta={meta} />);
    expect(screen.getByRole('button', { name: 'Wealth' })).toBeInTheDocument();
  });
});
