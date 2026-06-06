import '@/test/mocks/use-topic-catalog';
import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';
import { PredictionDetailHeader } from './PredictionDetailHeader';

const defaultProps = {
  text: 'Rates will fall this year',
  outcome: 'still_open' as const,
  createdAt: '2024-01-15T00:00:00.000Z',
  targetDate: null,
  finishedAt: null,
  topicIds: [] as string[],
};

describe('PredictionDetailHeader', () => {
  test('given a long title, should truncate the breadcrumb current page label', () => {
    const longText = 'A'.repeat(60);

    render(<PredictionDetailHeader {...defaultProps} text={longText} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(
      within(nav).getByRole('listitem', { current: 'page' }),
    ).toHaveTextContent(`${'A'.repeat(48)}…`);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longText);
  });

  test('given submitted and finished dates, should expose machine-readable time elements', () => {
    render(
      <PredictionDetailHeader
        {...defaultProps}
        targetDate="2026-12-01T00:00:00.000Z"
        finishedAt="2024-07-15T00:00:00.000Z"
      />,
    );

    const metrics = screen.getByLabelText('Prediction dates');
    const submittedTime = within(metrics).getByText('Jan 15, 2024');
    expect(submittedTime.tagName).toBe('TIME');
    expect(submittedTime).toHaveAttribute('datetime', '2024-01-15T00:00:00.000Z');

    const finishedTime = within(metrics).getByText('Jul 15, 2024');
    expect(finishedTime.tagName).toBe('TIME');
    expect(finishedTime).toHaveAttribute('datetime', '2024-07-15T00:00:00.000Z');

    const targetTime = within(metrics).getByText('Dec 2026');
    expect(targetTime.tagName).toBe('TIME');
    expect(targetTime).toHaveAttribute('datetime', '2026-12-01T00:00:00.000Z');
  });

  test('given a ref, should attach it to the page heading for route focus', () => {
    const ref = createRef<HTMLHeadingElement>();

    render(<PredictionDetailHeader {...defaultProps} ref={ref} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(ref.current).toBe(heading);
    expect(heading).toHaveAttribute('id', 'prediction-page-heading');
    expect(heading).toHaveAttribute('tabindex', '-1');
  });
});
