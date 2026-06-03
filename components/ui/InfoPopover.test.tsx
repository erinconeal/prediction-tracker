import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { InfoPopover } from './InfoPopover';

describe('InfoPopover', () => {
  test('given closed, should expose collapsed state on the trigger', () => {
    render(
      <InfoPopover label="About example">
        Hint text
      </InfoPopover>,
    );

    const trigger = screen.getByRole('button', { name: 'About example' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
  });

  test('given open, clicking outside should close the panel', () => {
    render(
      <InfoPopover label="About example">
        Hint text
      </InfoPopover>,
    );

    const trigger = screen.getByRole('button', { name: 'About example' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hint text')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
  });

  test('given open, pressing Escape should close the panel', () => {
    render(
      <InfoPopover label="About example">
        Hint text
      </InfoPopover>,
    );

    const trigger = screen.getByRole('button', { name: 'About example' });
    fireEvent.click(trigger);
    expect(screen.getByText('Hint text')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
  });
});
