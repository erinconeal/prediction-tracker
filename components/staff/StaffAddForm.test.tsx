import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { parseStaffAddFormValues } from '@/lib/staff-add-form-values';
import {
  curatedAiTopic,
  curatedHousingTopic,
  curatedMidtermTopic,
  parentFinanceTopic,
  parentPoliticsTopic,
  parentTechTopic,
} from '@/test/factories/topic';
import { StaffAddForm, type StaffAddFormProps } from './StaffAddForm';

function renderForm(overrides: Partial<StaffAddFormProps> = {}) {
  return render(
    <StaffAddForm
      topics={[]}
      topicsLoading={false}
      topicsError={null}
      onRetryTopics={() => {}}
      loading={false}
      fieldErrors={{}}
      submitForm={() => {}}
      topicsKey={0}
      {...overrides}
    />,
  );
}

async function selectTopic(name: string) {
  fireEvent.focus(screen.getByRole('combobox', { name: 'Topics (required)' }));
  const [option] = await screen.findAllByRole('option', { name });
  if (!option) throw new Error(`missing topic option: ${name}`);
  fireEvent.mouseDown(option);
}

describe('StaffAddForm', () => {
  test('given default props, should expose every field via getByLabelText (and the topics combobox).', () => {
    renderForm();

    expect(screen.getByLabelText('Source name (required)')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Prediction text (required)' })).toBeInstanceOf(HTMLTextAreaElement);
    expect(screen.getByLabelText('Date said (required)')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline (required)')).toBeInTheDocument();
    expect(screen.getByLabelText('Evidence URL (required)')).toBeInTheDocument();
    const topics = screen.getByRole('combobox', { name: 'Topics (required)' });
    expect(topics).toHaveAttribute('id', 'topicIds');
    expect(topics).toHaveAttribute('aria-describedby');
    expect(screen.getByLabelText('Topics (required)')).toBe(topics);
    expect(screen.getByLabelText('Staff password (required)')).toBeInTheDocument();
  });

  test('given loading, should disable the submit button.', () => {
    renderForm({ loading: true });
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });

  test('given error, should show visible text tied to the field, not color-only.', () => {
    renderForm({ fieldErrors: { source: 'Source name is required' } });
    const source = screen.getByLabelText('Source name (required)');

    expect(screen.getByText('Source name is required')).toBeVisible();
    expect(source).toHaveAttribute('aria-invalid', 'true');
    expect(source).toHaveAccessibleDescription('Source name is required');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('given a deadline error, should show visible text tied to the field, not color-only.', () => {
    renderForm({ fieldErrors: { target_date: 'Deadline is required' } });
    const deadline = screen.getByLabelText('Deadline (required)');

    expect(screen.getByText('Deadline is required')).toBeVisible();
    expect(deadline).toHaveAttribute('aria-invalid', 'true');
    expect(deadline).toHaveAccessibleDescription(/Deadline is required/);
    expect(deadline).toHaveAccessibleDescription(/after the date said/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('given a topics error, should show visible text tied to the combobox.', () => {
    renderForm({ fieldErrors: { topicIds: 'Select at least one topic' } });
    const topics = screen.getByRole('combobox', { name: 'Topics (required)' });

    expect(screen.getByText('Select at least one topic')).toBeVisible();
    expect(topics).toHaveAttribute('aria-invalid', 'true');
    expect(topics).toHaveAccessibleDescription(/Select at least one topic/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('given topics are loading, should disable the combobox and describe the wait.', () => {
    renderForm({
      topicsLoading: true,
      fieldErrors: { topicIds: 'Select at least one topic' },
    });
    const topics = screen.getByRole('combobox', { name: 'Topics (required)' });

    expect(topics).toBeDisabled();
    expect(topics).toHaveAccessibleDescription('Loading topics');
    expect(screen.queryByText('Select at least one topic')).not.toBeInTheDocument();
  });

  test('given a topic catalog load error, should show that error, disable the picker, and retry.', () => {
    const onRetryTopics = vi.fn();
    renderForm({
      topicsError: 'Failed to load topics',
      onRetryTopics,
      fieldErrors: { topicIds: 'Select at least one topic' },
    });
    const topics = screen.getByRole('combobox', { name: 'Topics (required)' });

    expect(screen.getByText('Failed to load topics')).toBeVisible();
    expect(screen.queryByText('Select at least one topic')).not.toBeInTheDocument();
    expect(topics).toBeDisabled();
    expect(topics).toHaveAccessibleDescription('Failed to load topics');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetryTopics).toHaveBeenCalledTimes(1);
  });

  test('given a native submit, should post rather than put the staff password in the query string.', () => {
    renderForm();
    expect(screen.getByRole('form', { name: 'Add a prediction' })).toHaveAttribute('method', 'post');
  });

  test('given the add-prediction form, should not present source name and staff secret as a browser login.', () => {
    renderForm();
    const form = screen.getByRole('form', { name: 'Add a prediction' });
    const source = screen.getByLabelText('Source name (required)');
    const staffSecret = screen.getByLabelText('Staff password (required)');

    expect(form).toHaveAttribute('autocomplete', 'off');
    expect(source).toHaveAttribute('autocomplete', 'off');
    expect(staffSecret).toHaveAttribute('autocomplete', 'new-password');
    expect(staffSecret).not.toHaveAttribute('id', 'password');
  });

  test('given a filled staff password, should omit that secret from native form serialization.', () => {
    renderForm();
    const form = screen.getByRole('form', { name: 'Add a prediction' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('expected a form element');
    }
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });

    expect(new FormData(form).get('staffSecret')).toBeNull();
  });

  test('given a client-handled submit with a filled staff password, should still include the secret in the submitted form values.', () => {
    const submitForm = vi.fn();
    renderForm({ submitForm });
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    expect(submitForm).toHaveBeenCalledTimes(1);
    const formData = submitForm.mock.calls[0][0] as FormData;
    expect(formData.get('staffSecret')).toBe('super-secret');
  });

  test('given the topics field, should open the topic list from the dropdown button.', async () => {
    renderForm({ topics: [curatedAiTopic] });
    const showTopics = screen.getByRole('button', { name: 'Topics' });

    expect(showTopics).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(showTopics);

    expect(await screen.findByRole('option', { name: 'AI regulation 2026' })).toBeVisible();
    expect(showTopics).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Topics' })).toBeVisible();
  });

  test('given parent and child topics, should group each child under its parents.', async () => {
    renderForm({
      topics: [
        curatedMidtermTopic,
        parentTechTopic,
        curatedAiTopic,
        parentPoliticsTopic,
        curatedHousingTopic,
        parentFinanceTopic,
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Topics' }));

    const [finance, politics, tech] = await screen.findAllByRole('group');
    expect(finance).toHaveAccessibleName('Finance');
    expect(politics).toHaveAccessibleName('Politics');
    expect(tech).toHaveAccessibleName('Tech');

    expect(within(politics!).getAllByRole('option').map(option => option.textContent)).toEqual([
      'Politics',
      'AI regulation 2026',
      'Midterm elections 2026',
    ]);
    expect(within(tech!).getByRole('option', { name: 'AI regulation 2026' })).toBeVisible();
    expect(within(tech!).queryByRole('option', { name: 'Midterm elections 2026' })).not.toBeInTheDocument();
    expect(within(finance!).getByRole('option', { name: 'Housing market 2026' })).toBeVisible();
  });

  test('given a child name query, should keep that child under its parent.', async () => {
    renderForm({
      topics: [curatedMidtermTopic, curatedAiTopic, parentPoliticsTopic, parentTechTopic],
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Topics (required)' }), { target: { value: 'midterm' } });

    const politics = await screen.findByRole('group', { name: 'Politics' });
    expect(within(politics).getByRole('option', { name: 'Politics' })).toBeVisible();
    expect(within(politics).getByRole('option', { name: 'Midterm elections 2026' })).toBeVisible();
    expect(within(politics).queryByRole('option', { name: 'AI regulation 2026' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Tech' })).not.toBeInTheDocument();
  });

  test('given a parent name query, should keep that parent and every child under it.', async () => {
    renderForm({
      topics: [
        curatedMidtermTopic,
        curatedAiTopic,
        parentPoliticsTopic,
        parentTechTopic,
        curatedHousingTopic,
        parentFinanceTopic,
      ],
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Topics (required)' }), { target: { value: 'politics' } });

    const politics = await screen.findByRole('group', { name: 'Politics' });
    expect(within(politics).getByRole('option', { name: 'AI regulation 2026' })).toBeVisible();
    expect(within(politics).getByRole('option', { name: 'Midterm elections 2026' })).toBeVisible();
    expect(screen.queryByRole('group', { name: 'Tech' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Finance' })).not.toBeInTheDocument();
  });

  test('given a topic listed under two parents, should select that topic once.', async () => {
    renderForm({ topics: [curatedAiTopic, parentPoliticsTopic, parentTechTopic] });

    await selectTopic('AI regulation 2026');

    expect(screen.getAllByRole('button', { name: 'Remove AI regulation 2026' })).toHaveLength(1);
  });

  test('given a query, should show only matching topics.', async () => {
    renderForm({ topics: [curatedAiTopic, curatedHousingTopic] });

    fireEvent.change(screen.getByRole('combobox', { name: 'Topics (required)' }), { target: { value: 'housing' } });

    expect(await screen.findByRole('option', { name: 'Housing market 2026' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Topics' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'AI regulation 2026' })).not.toBeInTheDocument();
  });

  test('given filled fields, should submit FormData that parseStaffAddFormValues accepts.', async () => {
    const submitForm = vi.fn();
    renderForm({ topics: [curatedAiTopic], submitForm });

    fireEvent.change(screen.getByLabelText('Source name (required)'), { target: { value: 'Jane Pundit' } });
    fireEvent.change(screen.getByLabelText('Prediction text (required)'), {
      target: { value: 'Markets will rally.\nInflation will ease by year end.' },
    });
    fireEvent.change(screen.getByLabelText('Date said (required)'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('Deadline (required)'), { target: { value: '2026-12-31' } });
    fireEvent.change(screen.getByLabelText('Evidence URL (required)'), { target: { value: 'https://example.com/quote' } });
    fireEvent.change(screen.getByLabelText('Staff password (required)'), { target: { value: 'super-secret' } });
    await selectTopic('AI regulation 2026');
    expect(screen.getByRole('button', { name: 'Remove AI regulation 2026' })).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Add a prediction' }));

    expect(submitForm).toHaveBeenCalledTimes(1);
    const [formData, form] = submitForm.mock.calls[0] as [FormData, HTMLFormElement];
    expect(form).toBeInstanceOf(HTMLFormElement);
    expect(parseStaffAddFormValues(formData)).toEqual({
      ok: true,
      staffSecret: 'super-secret',
      input: {
        source: 'Jane Pundit',
        text: 'Markets will rally.\nInflation will ease by year end.',
        created_at: '2026-01-01',
        target_date: '2026-12-31',
        evidenceUrl: 'https://example.com/quote',
        topicIds: [curatedAiTopic.id],
      },
    });
  });
});
