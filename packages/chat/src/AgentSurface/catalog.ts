import type { ComponentType, ReactNode } from 'react';
import {
  SurfaceAlert,
  SurfaceBadge,
  SurfaceButton,
  SurfaceCard,
  SurfaceCheckbox,
  SurfaceHeading,
  SurfaceInput,
  SurfaceSelect,
  SurfaceStack,
  SurfaceText,
} from './catalog-components';
import { isRecord } from './model';

/** Trusted host code: render explicit properties; never spread the agent's input. */
export interface AgentCatalogRenderProps {
  props: Readonly<Record<string, unknown>>;
  children?: ReactNode;
  onValueChange: (value: unknown) => void;
  onAction: () => void;
}
export interface AgentCatalogEntry {
  component: ComponentType<AgentCatalogRenderProps>;
  /** Return a fresh object of known properties, or null when invalid. */
  validate: (props: Readonly<Record<string, unknown>>) => Record<string, unknown> | null;
}
export type AgentCatalog = Readonly<Record<string, AgentCatalogEntry>>;
export function defineAgentCatalog(entries: AgentCatalog): AgentCatalog {
  return Object.freeze(
    Object.fromEntries(Object.entries(entries).map(([name, entry]) => [name, Object.freeze({ ...entry })])),
  );
}

type Rule = (value: unknown) => boolean;
const string: Rule = (value) => typeof value === 'string';
const label: Rule = (value) => typeof value === 'string' && value.trim().length > 0;
const optional =
  (rule: Rule): Rule =>
  (value) =>
    value === undefined || rule(value);
const boolean: Rule = (value) => typeof value === 'boolean';
function fields(rules: Record<string, Rule>): AgentCatalogEntry['validate'] {
  return (input) => {
    const output: Record<string, unknown> = {};
    for (const [key, rule] of Object.entries(rules)) {
      if (!rule(input[key])) return null;
      if (input[key] !== undefined) output[key] = input[key];
    }
    return output;
  };
}
const options: Rule = (value) =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every((item) => isRecord(item) && label(item.value) && label(item.label)) &&
  new Set(value.map((item: unknown) => (isRecord(item) ? item.value : null))).size === value.length;

/** Small text/form catalog. Password, payment and file controls are deliberately absent. */
export const defaultAgentCatalog = defineAgentCatalog({
  Text: { component: SurfaceText, validate: fields({ text: string, href: optional(string) }) },
  Heading: {
    component: SurfaceHeading,
    validate: fields({
      text: label,
      level: optional((v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 6),
    }),
  },
  Card: { component: SurfaceCard, validate: fields({}) },
  Stack: {
    component: SurfaceStack,
    validate: fields({
      direction: optional((v) => v === 'row' || v === 'column'),
      gap: optional((v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 12),
    }),
  },
  Button: { component: SurfaceButton, validate: fields({ label, disabled: optional(boolean) }) },
  Input: {
    component: SurfaceInput,
    validate: fields({
      label,
      value: optional(string),
      disabled: optional(boolean),
      type: optional((v) => v === 'text'),
    }),
  },
  Select: {
    component: SurfaceSelect,
    validate: (input) => {
      const result = fields({
        label,
        value: optional((v) => v === null || typeof v === 'string'),
        options,
        disabled: optional(boolean),
      })(input);
      if (!result || !Array.isArray(result.options)) return null;
      return {
        ...result,
        options: result.options.filter(isRecord).map((item) => ({ value: item.value, label: item.label })),
      };
    },
  },
  Checkbox: {
    component: SurfaceCheckbox,
    validate: fields({ label, checked: optional(boolean), disabled: optional(boolean) }),
  },
  Alert: { component: SurfaceAlert, validate: fields({ title: label, text: optional(string) }) },
  Badge: { component: SurfaceBadge, validate: fields({ text: label }) },
});
