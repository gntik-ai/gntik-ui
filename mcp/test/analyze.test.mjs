import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzePage } from '../dist/analyze.js';

const LEGACY = `
<div class="container">
  <nav class="navbar navbar-expand-lg"><a class="navbar-brand" href="#">1forall</a></nav>
  <div class="sidebar"><ul class="nav flex-column"><li>Inicio</li></ul></div>
  <h1>Voces</h1>
  <button class="btn btn-primary" style="background:#0d6efd">Nueva voz</button>
  <table class="table table-striped">
    <thead><tr><th>Nombre</th><th>Proveedor</th></tr></thead>
    <tbody><tr><td>es-ES-Elvira</td><td>Azure</td></tr></tbody>
  </table>
  <div class="modal fade" id="confirmModal"><div class="modal-dialog">...</div></div>
  <span class="badge bg-success">activa</span>
  <div class="spinner-border"></div>
  <ul class="pagination"><li class="page-item">1</li></ul>
</div>`;

test('sugiere componentes del catálogo para una página Bootstrap', () => {
  const a = analyzePage(LEGACY);
  const ids = new Set(a.suggestions.map((s) => s.id));
  for (const expected of ['buttons', 'tables', 'modal-dialogs', 'badges', 'spinners', 'pagination', 'navbars', 'page-headings', 'app-shell']) {
    assert.ok(ids.has(expected), `falta sugerencia: ${expected} (hay: ${[...ids].join(', ')})`);
  }
  assert.ok(a.frameworks.some((f) => f.name === 'Bootstrap'), 'detecta Bootstrap');
  assert.ok(a.styleErrors.length >= 1, 'reporta el color hardcodeado');
});

test('página vacía no revienta', () => {
  const a = analyzePage('');
  assert.deepEqual(a.frameworks, []);
});
