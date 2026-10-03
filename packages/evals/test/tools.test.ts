import { describe, expect, it } from 'vitest';
import { validatePage } from '../../mcp/src/validate.js';
import { TOOL_NAMES, runTool, toolDefinitions, validateInput } from '../src/tools.js';

const codeOf = (md: string) => /```tsx\n([\s\S]*?)\n```/.exec(md)?.[1] ?? '';

describe('tool definitions', () => {
  it('are strict JSON schemas with additionalProperties false', () => {
    const defs = toolDefinitions({ eagerInputStreaming: true });
    expect(defs.map((d) => d.name)).toEqual(TOOL_NAMES);
    expect(TOOL_NAMES).toEqual(['list_kit', 'get_component', 'get_block', 'get_template', 'scaffold_page', 'validate_page', 'submit_page']);
    for (const d of defs) {
      expect(d.strict).toBe(true);
      expect(d.eager_input_streaming).toBe(true);
      expect(d.description).toBeTruthy();
      const s = d.input_schema as { type: string; additionalProperties: boolean; required: string[]; properties: Record<string, unknown> };
      expect(s.type).toBe('object');
      expect(s.additionalProperties).toBe(false);
      for (const r of s.required) expect(Object.keys(s.properties)).toContain(r);
    }
    expect(toolDefinitions()[0]).not.toHaveProperty('eager_input_streaming');
  });

  it('validateInput rejects extra properties, wrong types and missing fields', () => {
    expect(validateInput('get_block', { id: 'kpi-row' })).toEqual([]);
    expect(validateInput('get_block', {})).toEqual(['missing required "id"']);
    expect(validateInput('get_block', { id: 1 })).toEqual(['"id" must be a string']);
    expect(validateInput('list_kit', { kind: 'widget' })[0]).toMatch(/must be one of/);
    expect(validateInput('list_kit', { colour: 'red' })).toEqual(['unexpected property "colour"']);
    expect(validateInput('scaffold_page', { blocks: ['a', 2] })).toEqual(['"blocks" must be an array of strings']);
    expect(validateInput('nope', {})).toEqual(['unknown tool "nope"']);
  });
});

describe('tools', () => {
  it('list_kit filters by kind and query', () => {
    const templates = runTool('list_kit', { kind: 'template' });
    expect(templates.isError).toBe(false);
    expect(templates.content).toMatch(/## templates \(40\)/);
    expect(templates.content).not.toMatch(/## blocks/);
    const members = runTool('list_kit', { query: 'members' });
    expect(members.content).toContain('`settings-members`');
    expect(members.content).toContain('`members-table`');
    expect(runTool('list_kit', { query: 'zzz-nothing' }).content).toMatch(/No kit items match/);
  });

  it('get_* return metadata, and an is_error hint for unknown ids', () => {
    const t = runTool('get_template', { id: 'settings-members' });
    expect(t.isError).toBe(false);
    expect(t.content).toMatch(/SettingsMembersPage/);
    expect(t.content).not.toMatch(/### packages\/templates\/src\/settings-members\/Page\.tsx/);
    expect(runTool('get_template', { id: 'settings-members', include_source: true }).content).toMatch(/### packages\/templates\/src\/settings-members\/Page\.tsx/);
    expect(runTool('get_component', { id: 'docs-layout' }).content).toMatch(/DocsLayout/);
    expect(runTool('get_block', { id: 'kpi-row' }).content).toMatch(/KpiRow/);
    const missing = runTool('get_component', { id: 'docs-page' });
    expect(missing.isError).toBe(true);
    expect(missing.content).toMatch(/Did you mean/);
    expect(runTool('get_block', { id: 'settings-members' }).isError).toBe(true);
  });

  it('scaffold_page output passes validate_page', () => {
    for (const input of [{ template: 'settings-members', route: '/settings/members' }, { blocks: ['page-header', 'kpi-row', 'data-table'], layout: 'console' }]) {
      const r = runTool('scaffold_page', input);
      expect(r.isError).toBe(false);
      const code = codeOf(r.content);
      expect(code).toMatch(/export default function/);
      expect(validatePage(code).ok).toBe(true);
      const v = JSON.parse(runTool('validate_page', { code }).content) as { ok: boolean; errors: number };
      expect(v).toMatchObject({ ok: true, errors: 0 });
    }
    expect(runTool('scaffold_page', {}).isError).toBe(true);
    expect(runTool('scaffold_page', { template: 'nope' }).isError).toBe(true);
  });

  it('validate_page reports brand errors', () => {
    const v = JSON.parse(runTool('validate_page', { code: '<div className="bg-red-500" />' }).content) as { ok: boolean; findings: Array<{ rule: string }> };
    expect(v.ok).toBe(false);
    expect(v.findings.map((f) => f.rule)).toContain('palette-class');
  });

  it('submit_page ends the episode; invalid input comes back as is_error', () => {
    const r = runTool('submit_page', { filename: 'A.tsx', code: 'export default function A() { return null; }' });
    expect(r.submitted).toEqual({ filename: 'A.tsx', code: 'export default function A() { return null; }' });
    expect(runTool('submit_page', { filename: 'A.tsx', code: '  ' }).isError).toBe(true);
    const bad = runTool('submit_page', { filename: 'A.tsx' });
    expect(bad.isError).toBe(true);
    expect(bad.content).toMatch(/missing required "code"/);
    expect(runTool('rm_rf', {}).isError).toBe(true);
  });
});
