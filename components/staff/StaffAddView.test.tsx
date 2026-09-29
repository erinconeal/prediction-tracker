// Side-effect mock imports first — see test/README.md#mock-import-order
import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import {
  resetTopicCatalogMockForTests,
  topicCatalogMockValue,
} from '@/test/mocks/use-topic-catalog';
import { StaffAddView } from './StaffAddView';
import * as useCreatePredictionModule from '@/hooks/useCreatePrediction';

vi.mock('@/hooks/useCreatePrediction');

const useCreatePrediction = vi.mocked(useCreatePredictionModule.useCreatePrediction);

function idleCreate(
  overrides: Partial<ReturnType<typeof useCreatePrediction>> = {},
): ReturnType<typeof useCreatePrediction> {
  return {
    create: vi.fn().mockResolvedValue(null),
    loading: false,
    error: null,
    prediction: null,
    ...overrides,
  };
}

function fillRequiredFieldsExceptTopics() {
  fireEvent.change(screen.getByLabelText('Source name (required)'), { target: { value: 'Jane Pundit' } });
  fireEvent.change(screen.getByLabelText('Prediction text (required)'), { target: { value: 'Markets will rally' } });
  fireEvent.change(screen.getByLabelText('Date said (required)'), { target: { value: '2026-01-01' } });
  fireEvent.change(screen.getByLabelText('Deadline (required)'), { target: { value: '2026-12-31' } });
  fireEvent.change(screen.getByLabelText('Evidence URL (required)'), { target: { value: 'https://example.com/quote' } });
  fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'secret' } });
}

async function fillValidForm() {
  fillRequiredFieldsExceptTopics();
  fireEvent.focus(screen.getByRole('combobox', { name: 'Topics (required)' }));
  const politics = await screen.findByRole('group', { name: 'Politics' });
  fireEvent.mouseDown(within(politics).getByRole('option', { name: 'AI regulation 2026' }));
}

describe('StaffAddView', () => {
  beforeEach(() => {
    useCreatePrediction.mockReset();
    useCreatePrediction.mockReturnValue(idleCreate());
    resetTopicCatalogMockForTests();
  });

  test('given idle, should keep primed empty status and alert regions.', () => {
    render(<StaffAddView />);

    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  test('given client validation errors, should focus the first invalid control and not put field copy in the alert.', async () => {
    const create = vi.fn().mockResolvedValue(null);
    useCreatePrediction.mockReturnValue(idleCreate({ create }));

    render(<StaffAddView />);

    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Source name (required)')).toHaveFocus();
    });
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText('Source name is required')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  test('given only later client errors, should focus the first remaining invalid control.', async () => {
    render(<StaffAddView />);

    fireEvent.change(screen.getByLabelText('Source name (required)'), { target: { value: 'Jane Pundit' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Prediction text (required)')).toHaveFocus();
    });
  });

  test('given a topic catalog load error, should show that error and not ask to select a topic.', () => {
    const create = vi.fn().mockResolvedValue(null);
    useCreatePrediction.mockReturnValue(idleCreate({ create }));
    topicCatalogMockValue.error = 'Failed to load topics';
    topicCatalogMockValue.topics = [];

    render(<StaffAddView />);
    fillRequiredFieldsExceptTopics();
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    expect(screen.getByText('Failed to load topics')).toBeVisible();
    expect(screen.queryByText('Select at least one topic')).not.toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test('given a topic catalog load error and a complete form, should focus retry when submitted.', async () => {
    const create = vi.fn().mockResolvedValue(null);
    useCreatePrediction.mockReturnValue(idleCreate({ create }));
    topicCatalogMockValue.error = 'Failed to load topics';
    topicCatalogMockValue.topics = [];

    render(<StaffAddView />);
    fillRequiredFieldsExceptTopics();
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus();
    });
    expect(create).not.toHaveBeenCalled();
  });

  test('given a topic catalog load error, should retry the catalog from the topics field.', () => {
    topicCatalogMockValue.error = 'Failed to load topics';
    topicCatalogMockValue.topics = [];

    render(<StaffAddView />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(topicCatalogMockValue.refetch).toHaveBeenCalledTimes(1);
  });

  test('given an API error, should announce it as an alert above the form.', () => {
    useCreatePrediction.mockReturnValue(idleCreate({ error: 'Staff secret rejected' }));

    render(<StaffAddView />);

    expect(screen.getByRole('alert')).toHaveTextContent('Staff secret rejected');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  test('given a successful create, should announce status outside the view link without moving focus into the form.', async () => {
    const created = buildPrediction({ id: 'pred-42' });
    const create = vi.fn().mockResolvedValue(created);
    useCreatePrediction.mockReturnValue(idleCreate({
      create,
      prediction: created,
    }));

    render(<StaffAddView />);
    await fillValidForm();
    fireEvent.change(screen.getByLabelText('Deadline (required)'), { target: { value: '2026-12-31' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        {
          source: 'Jane Pundit',
          text: 'Markets will rally',
          created_at: '2026-01-01',
          target_date: '2026-12-31',
          evidenceUrl: 'https://example.com/quote',
          topicIds: ['topic-ai-regulation-2026'],
        },
        { staffSecret: 'secret' },
      );
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('New prediction created successfully!');
    expect(within(status).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View prediction' })).toHaveAttribute('href', '/predictions/pred-42');
    expect(screen.getByRole('button', { name: 'Dismiss success message' })).toBeInTheDocument();
    expect(screen.getByLabelText('Source name (required)')).toHaveValue('Jane Pundit');
    expect(screen.getByLabelText('Staff password (required)')).toHaveValue('secret');
    expect(screen.getByLabelText('Prediction text (required)')).toHaveValue('');
    expect(screen.getByLabelText('Date said (required)')).toHaveValue('');
    expect(screen.getByLabelText('Deadline (required)')).toHaveValue('');
    expect(screen.getByLabelText('Evidence URL (required)')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Remove AI regulation 2026' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Prediction text (required)')).not.toHaveFocus();
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveFocus();
    });
  });

  test('given a dismissed success message, should move focus to the source name field.', async () => {
    const created = buildPrediction({ id: 'pred-42' });
    const create = vi.fn().mockResolvedValue(created);
    useCreatePrediction.mockReturnValue(idleCreate({ create }));

    render(<StaffAddView />);
    await fillValidForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveFocus();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss success message' }));

    expect(screen.queryByRole('button', { name: 'Dismiss success message' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Source name (required)')).toHaveFocus();
  });

  test('given create returns nothing, should keep the filled fields and not announce success.', async () => {
    const create = vi.fn().mockResolvedValue(null);
    useCreatePrediction.mockReturnValue(idleCreate({ create }));

    render(<StaffAddView />);
    await fillValidForm();
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    await waitFor(() => {
      expect(create).toHaveBeenCalled();
    });

    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('link', { name: 'View prediction' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Prediction text (required)')).toHaveValue('Markets will rally');
    expect(screen.getByLabelText('Evidence URL (required)')).toHaveValue('https://example.com/quote');
    expect(screen.getByRole('button', { name: 'Remove AI regulation 2026' })).toBeInTheDocument();
  });
});
