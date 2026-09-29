'use client';

import { useRef, useState } from 'react';
import type { Topic } from '@/types/topic';
import { groupTopicsForPicker, type TopicPickerGroup } from '@/lib/group-topics-for-picker';
import { STAFF_ADD_FIELD } from '@/lib/staff-add-form-values';
import { Check, ChevronDown, X } from 'lucide-react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

const staffTopicInputClassName
  = 'w-full min-h-11 rounded-md border border-border bg-background px-2 pr-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const staffTopicButtonClassName
  = 'absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const topicOptionClassName
  = 'flex min-h-11 cursor-default items-center gap-2 pr-2 text-sm text-foreground data-focus:bg-surface';

const parentOptionClassName = `${topicOptionClassName} pl-2 font-medium`;

const childOptionClassName = `${topicOptionClassName} pl-8`;

const topicOptionsClassName
  = 'z-50 max-h-60 w-[var(--input-width)] overflow-auto rounded-md border border-border bg-surface-elevated py-1 shadow-sm';

type StaffTopicComboboxProps = {
  topics: Topic[];
  disabled: boolean;
  invalid: boolean;
};

function topicNameForId(topics: Topic[], id: string): string {
  return topics.find(topic => topic.id === id)?.name ?? id;
}

function TopicOption({ topic, nested }: { topic: Topic; nested: boolean }) {
  return (
    <ComboboxOption
      value={topic.id}
      className={nested ? childOptionClassName : parentOptionClassName}
    >
      {({ selected }) => (
        <>
          <Check
            className={`size-4 shrink-0 ${selected ? '' : 'invisible'}`}
            aria-hidden
            strokeWidth={1.75}
          />
          {topic.name}
        </>
      )}
    </ComboboxOption>
  );
}

function TopicPickerGroupOptions({ group }: { group: TopicPickerGroup }) {
  if (!group.parent) {
    return group.children.map(topic => (
      <TopicOption key={topic.id} topic={topic} nested={false} />
    ));
  }

  const parent = group.parent;
  return (
    <div role="group" aria-label={parent.name} className="border-t border-border first:border-t-0">
      <TopicOption topic={parent} nested={false} />
      {group.children.map(topic => (
        <TopicOption key={`${parent.id}:${topic.id}`} topic={topic} nested />
      ))}
    </div>
  );
}

/**
 * Multi-select topic search. Hidden `topicIds` inputs repeat the field name so
 * form parsing stays on `readStringList`, which does not read `topicIds[0]`.
 */
export function StaffTopicCombobox({ topics, disabled, invalid }: StaffTopicComboboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const topicGroups = groupTopicsForPicker(topics, query);

  function clearQuery() {
    setQuery('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeTopic(id: string) {
    setSelectedIds(current => current.filter(selectedId => selectedId !== id));
  }

  return (
    <Combobox
      as="div"
      immediate
      multiple
      value={selectedIds}
      onChange={(ids: string[]) => {
        setSelectedIds(ids);
        clearQuery();
      }}
      onClose={clearQuery}
      disabled={disabled}
      invalid={invalid}
    >
      <label htmlFor="topicIds" className="font-medium text-foreground">Topics (required)</label>
      {selectedIds.map(id => (
        <input key={id} type="hidden" name={STAFF_ADD_FIELD.topicIds} value={id} />
      ))}
      {selectedIds.length > 0
        ? (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Selected topics">
              {selectedIds.map((id) => {
                const name = topicNameForId(topics, id);
                return (
                  <li key={id} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface pl-3 text-sm text-foreground">
                    <span>{name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={() => removeTopic(id)}
                    >
                      <X className="size-4" aria-hidden strokeWidth={1.75} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        : null}
      <div className="relative mt-2">
        <ComboboxInput
          ref={inputRef}
          id="topicIds"
          className={staffTopicInputClassName}
          aria-invalid={invalid ? true : undefined}
          autoComplete="off"
          displayValue={() => ''}
          onChange={event => setQuery(event.target.value)}
        />
        <ComboboxButton className={staffTopicButtonClassName}>
          {({ open }) => (
            <>
              <ChevronDown
                className={`size-4 transition-transform duration-150 ease-in-out motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                aria-hidden
                strokeWidth={1.75}
              />
              <span className="sr-only">Topics</span>
            </>
          )}
        </ComboboxButton>
      </div>
      <ComboboxOptions
        modal={false}
        anchor={{ to: 'bottom start', gap: 4 }}
        aria-label="Topics"
        className={topicOptionsClassName}
      >
        {topicGroups.length === 0
          ? <div role="status" className="px-2 py-2 text-muted">No matching topics</div>
          : topicGroups.map(group => (
              <TopicPickerGroupOptions key={group.parent?.id ?? 'ungrouped'} group={group} />
            ))}
      </ComboboxOptions>
    </Combobox>
  );
}
