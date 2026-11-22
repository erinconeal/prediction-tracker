import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as usePredictionsModule from '@/hooks/usePredictions';
import * as useUpdatePredictionModule from '@/hooks/useUpdatePrediction';
import { buildPrediction } from '@/test/factories/prediction';

import { StaffResolveView } from './StaffResolveView';

vi.mock('@/hooks/useUpdatePrediction');
vi.mock('@/hooks/usePredictions');

const useUpdatePrediction = vi.mocked(useUpdatePredictionModule.useUpdatePrediction);
const usePredictions = vi.mocked(usePredictionsModule.usePredictions);

describe('StaffResolveView', () => {
  beforeEach(() => {
    useUpdatePrediction.mockReset();
    usePredictions.mockReset();

    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          // Far-future deadline → judge returns deadline_not_passed
          target_date: '2099-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow: null,
      update: vi.fn().mockResolvedValue(null),
    });
  });

  test('given mark invalid with an empty staff password, should focus the field and not call update', async () => {
    const update = vi.fn().mockResolvedValue(null);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow: null,
      update,
    });

    render(<StaffResolveView />);

    const waiting = screen.getByRole('region', { name: 'Waiting' });
    fireEvent.click(within(waiting).getByRole('button', { name: 'Mark invalid' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Staff password (required)')).toHaveFocus();
    });

    expect(screen.getByText('Staff password is required')).toBeVisible();
    expect(update).not.toHaveBeenCalled();
  });

  test('given mark invalid with a staff password, should call update and refetch predictions', async () => {
    const updatedRow = buildPrediction({
      id: 'waiting-1',
      outcome: 'invalid',
      target_date: '2099-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    const refetch = vi.fn();
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          // Far-future deadline → judge returns deadline_not_passed
          target_date: '2099-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch,
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Waiting' })).getByRole('button', { name: 'Mark invalid' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('waiting-1', 'invalid', {
        staffSecret: 'super-secret',
        resolutionUrl: null,
      });
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText('Prediction resolved')).toHaveFocus();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss success message' }));
    expect(screen.getByLabelText('Staff password (required)')).toHaveFocus();
    expect(screen.queryByText('Prediction resolved')).not.toBeInTheDocument();
  });

  test('given ready to score with a staff password, should call update and refetch predictions', async () => {
    const updatedRow = buildPrediction({
      id: 'waiting-1',
      outcome: 'correct',
      target_date: '2025-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    const refetch = vi.fn();
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2025-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch,
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.change(screen.getByLabelText('Resolution URL'), { target: { value: 'https://www.google.com' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ready' })).getByRole('button', { name: 'Mark correct' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('waiting-1', 'correct', {
        staffSecret: 'super-secret',
        resolutionUrl: 'https://www.google.com',
      });
      expect(refetch).toHaveBeenCalled();
    });
  });

  test('given mark invalid with a resolution URL that is not an http or https link, should focus the field and not call update', async () => {
    const updatedRow = buildPrediction({
      id: 'waiting-1',
      outcome: 'correct',
      target_date: '2025-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    const refetch = vi.fn();
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2025-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch,
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ready' })).getByRole('button', { name: 'Mark correct' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Resolution URL')).toHaveFocus();
    });

    expect(screen.getByLabelText('Resolution URL')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Resolution URL must be an http or https link')).toBeVisible();
    expect(update).not.toHaveBeenCalled();
  });

  test('given predictions are loading, should announce the loading status and hide the queue', () => {
    usePredictions.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);

    expect(screen.getByRole('status', { name: 'Loading predictions' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Ready' })).not.toBeInTheDocument();
    expect(screen.queryByText('Nothing to resolve')).not.toBeInTheDocument();
  });

  test('given the api call returns an error, should announce the error and hide the queue', () => {
    const refetch = vi.fn();
    usePredictions.mockReturnValue({
      data: [],
      loading: false,
      error: 'Could not load predictions',
      refetch,
    });

    render(<StaffResolveView />);
    const listAlert = screen.getAllByRole('alert').find(alert => alert.textContent.includes('Could not load predictions'));
    expect(listAlert).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  test('given no open predictions, should announce that there is nothing to resolve', () => {
    usePredictions.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);
    expect(screen.getByText('Nothing to resolve')).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Ready' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  test('given the update fails, should announce that error', () => {
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: 'Staff secret rejected',
      updatedRow: null,
      update: vi.fn(),
    });

    render(<StaffResolveView />);

    const alert = screen.getAllByRole('alert').find(alert => alert.textContent.includes('Staff secret rejected'));
    expect(alert).toBeVisible();
  });

  test('given a row still waiting on its deadline, should offer invalid only', () => {
    render(<StaffResolveView />);

    const waiting = screen.getByRole('region', { name: 'Waiting' });
    expect(within(waiting).getByRole('button', { name: 'Mark invalid' })).toBeVisible();
    expect(within(waiting).queryByRole('button', { name: 'Mark correct' })).not.toBeInTheDocument();
    expect(within(waiting).queryByRole('button', { name: 'Mark incorrect' })).not.toBeInTheDocument();
    expect(within(waiting).queryByRole('button', { name: 'Mark unresolved' })).not.toBeInTheDocument();
  });

  test('given a row with no deadline, should offer invalid only in Ready', () => {
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'missing-deadline-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: null,
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);

    const ready = screen.getByRole('region', { name: 'Ready' });
    expect(within(ready).getByRole('button', { name: 'Mark invalid' })).toBeVisible();
    expect(within(ready).queryByRole('button', { name: 'Mark correct' })).not.toBeInTheDocument();
    expect(within(ready).queryByRole('button', { name: 'Mark incorrect' })).not.toBeInTheDocument();
    expect(within(ready).queryByRole('button', { name: 'Mark unresolved' })).not.toBeInTheDocument();
  });

  test('given mark unresolved on a scored row, should call update without a resolution URL', async () => {
    const updatedRow = buildPrediction({
      id: 'ready-1',
      outcome: 'unresolved',
      target_date: '2025-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'ready-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2025-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ready' })).getByRole('button', { name: 'Mark unresolved' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('ready-1', 'unresolved', {
        staffSecret: 'super-secret',
        resolutionUrl: null,
      });
    });
  });

  test('given mark invalid on a scored row, should call update without a resolution URL', async () => {
    const updatedRow = buildPrediction({
      id: 'ready-1',
      outcome: 'invalid',
      target_date: '2025-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'ready-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2025-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ready' })).getByRole('button', { name: 'Mark invalid' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('ready-1', 'invalid', {
        staffSecret: 'super-secret',
        resolutionUrl: null,
      });
    });
  });

  test('given mark incorrect on a scored row, should send the resolution URL', async () => {
    const updatedRow = buildPrediction({
      id: 'waiting-1',
      outcome: 'incorrect',
      target_date: '2025-12-31T00:00:00.000Z',
    });
    const update = vi.fn().mockResolvedValue(updatedRow);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    const refetch = vi.fn();
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2025-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch,
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.change(screen.getByLabelText('Resolution URL'), { target: { value: 'https://www.google.com' } });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ready' })).getByRole('button', { name: 'Mark incorrect' }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith('waiting-1', 'incorrect', {
        staffSecret: 'super-secret',
        resolutionUrl: 'https://www.google.com',
      });
    });
  });

  test('given a second resolve after success, should clear the previous success message', async () => {
    const updatedRow = buildPrediction({
      id: 'waiting-1',
      outcome: 'invalid',
      target_date: '2099-12-31T00:00:00.000Z',
    });
    const update = vi.fn()
      .mockResolvedValueOnce(updatedRow)
      .mockResolvedValueOnce(null);
    useUpdatePrediction.mockReturnValue({
      loading: false,
      error: null,
      updatedRow,
      update,
    });
    usePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'waiting-1',
          text: 'Rates stay high',
          outcome: 'still_open',
          target_date: '2099-12-31T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StaffResolveView />);
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    const markInvalidButton = within(screen.getByRole('region', { name: 'Waiting' })).getByRole('button', { name: 'Mark invalid' });
    fireEvent.click(markInvalidButton);

    await waitFor(() => {
      expect(screen.getByText('Prediction resolved')).toBeVisible();
    });

    fireEvent.click(markInvalidButton);
    await waitFor(() => {
      expect(screen.queryByText('Prediction resolved')).not.toBeInTheDocument();
    });
  });

  test('given the queue loads, should request the open predictions with a limit of 100', () => {
    render(<StaffResolveView />);
    expect(usePredictions).toHaveBeenCalledWith({
      status: 'still_open', limit: 100 });
  });
});
