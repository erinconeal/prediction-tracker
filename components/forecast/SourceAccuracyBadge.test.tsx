import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { ForecastDisplayMetric } from '@/lib/forecast-display-metric';
import { SourceAccuracyBadge } from './SourceAccuracyBadge';

describe('SourceAccuracyBadge', () => {
  test('given high accuracy, should show percent with up glyph', () => {
    render(<SourceAccuracyBadge metric={{ percent: 82, trend: 'up' }} />);

    expect(screen.getByText('82% ↑')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy 82 percent, strong track record/i),
    ).toBeInTheDocument();
  });

  test('given low accuracy, should show percent with down glyph', () => {
    render(<SourceAccuracyBadge metric={{ percent: 14, trend: 'down' }} />);

    expect(screen.getByText('14% ↓')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy 14 percent, weak track record/i),
    ).toBeInTheDocument();
  });

  test('given mid accuracy, should show percent with flat glyph', () => {
    render(<SourceAccuracyBadge metric={{ percent: 49, trend: 'flat' }} />);

    expect(screen.getByText('49% —')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy 49 percent, mixed track record/i),
    ).toBeInTheDocument();
  });

  test('given unavailable accuracy, should show em dash with neutral label', () => {
    const metric: ForecastDisplayMetric = { percent: null, trend: 'flat' };
    render(<SourceAccuracyBadge metric={metric} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy unavailable for this source/i),
    ).toBeInTheDocument();
  });

  test('is not interactive', () => {
    render(<SourceAccuracyBadge metric={{ percent: 50, trend: 'flat' }} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
