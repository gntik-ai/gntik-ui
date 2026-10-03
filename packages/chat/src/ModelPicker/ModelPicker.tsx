import { Badge, Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectTrigger, cn } from '@gntik-ai/ui';
import { Sparkles } from 'lucide-react';
import type { Ref } from 'react';
import { useChatI18n, type ChatMessageKey } from '../utils/i18n';
import { modelPickerStyles as s } from './modelPicker.variants';

export type ModelCapability = 'vision' | 'tools' | 'reasoning' | 'files' | 'web' | 'audio';

export interface ChatModel {
  /** Value reported by `onValueChange`. */
  id: string;
  name: string;
  /** Group heading, e.g. the provider or the deployment. Models are grouped in first-seen order. */
  provider: string;
  description?: string;
  capabilities?: ModelCapability[];
  /** Context window in tokens; shown as "128K context". */
  contextWindow?: number;
  disabled?: boolean;
  /** Why it is disabled ("Needs an upgraded plan"); shown under the name. */
  disabledReason?: string;
}

export interface ModelPickerProps {
  models: ChatModel[];
  /** Selected model id (controlled). */
  value: string | null;
  onValueChange: (id: string) => void;
  /** Small borderless trigger with only the model name, for the composer toolbar. */
  compact?: boolean;
  /** Accessible name of the trigger. Default "Model". */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Hide the provider next to the name in the full trigger. */
  hideProvider?: boolean;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

const CAPABILITY_KEY: Record<ModelCapability, ChatMessageKey> = {
  vision: 'chat.capabilityVision',
  tools: 'chat.capabilityTools',
  reasoning: 'chat.capabilityReasoning',
  files: 'chat.capabilityFiles',
  web: 'chat.capabilityWeb',
  audio: 'chat.capabilityAudio',
};

/** Models grouped by provider, keeping first-seen order. */
export function groupModels(models: ChatModel[]) {
  const groups = new Map<string, ChatModel[]>();
  for (const m of models) {
    const list = groups.get(m.provider);
    if (list) list.push(m);
    else groups.set(m.provider, [m]);
  }
  return [...groups.entries()].map(([provider, items]) => ({ provider, items }));
}

/**
 * Model / provider select for a chat: options grouped by provider with capability badges
 * (vision, tools, context size…) and disabled models that say why. `compact` renders a small
 * borderless trigger for the composer toolbar. Built on Select (Base UI).
 */
export function ModelPicker({
  models,
  value,
  onValueChange,
  compact = false,
  label,
  placeholder,
  disabled,
  hideProvider = false,
  className,
  ref,
}: ModelPickerProps) {
  const { tc, formatNumber } = useChatI18n();
  const byId = new Map(models.map((m) => [m.id, m]));
  const items = models.map((m) => ({ value: m.id, label: m.name }));

  return (
    <Select<string>
      items={items}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
    >
      <SelectTrigger
        ref={ref}
        size="sm"
        aria-label={label ?? tc('chat.model')}
        placeholder={placeholder ?? tc('chat.selectModel')}
        className={cn(compact ? s.compactTrigger : s.trigger, className)}
      >
        {(id: string | null) => {
          const m = id === null ? undefined : byId.get(id);
          if (!m) return placeholder ?? tc('chat.selectModel');
          return (
            <span className={s.triggerValue}>
              <Sparkles size={13} aria-hidden className={s.triggerIcon} />
              <span className={s.triggerName}>{m.name}</span>
              {!compact && !hideProvider && <span className={s.triggerProvider}>· {m.provider}</span>}
            </span>
          );
        }}
      </SelectTrigger>
      <SelectContent className={s.popup} align={compact ? 'end' : 'start'}>
        {groupModels(models).map((g) => (
          <SelectGroup key={g.provider}>
            <SelectGroupLabel>{g.provider}</SelectGroupLabel>
            {g.items.map((m) => (
              <SelectItem key={m.id} value={m.id} disabled={m.disabled} label={m.name} className={s.item}>
                <span className={s.itemBody}>
                  <span className={s.itemName}>{m.name}</span>
                  {m.description && <span className={s.itemDescription}>{m.description}</span>}
                  {(m.capabilities?.length || m.contextWindow) && (
                    <span className={s.badges}>
                      {m.capabilities?.map((c) => (
                        <Badge key={c} size="sm" tone="neutral">
                          {tc(CAPABILITY_KEY[c])}
                        </Badge>
                      ))}
                      {m.contextWindow !== undefined && (
                        <Badge size="sm" tone="neutral" variant="outline">
                          {tc('chat.contextWindow', { size: formatNumber(m.contextWindow, { notation: 'compact', maximumFractionDigits: 1 }) })}
                        </Badge>
                      )}
                    </span>
                  )}
                  {m.disabled && <span className={s.reason}>{m.disabledReason ?? tc('chat.unavailable')}</span>}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
