// The catalog sections were written as classic scripts that read their
// dependencies from `window` (see CLAUDE.md). Expose the same globals before
// any section module evaluates; ES module imports run in declaration order.
import React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as Recharts from 'recharts';
import * as ReactFlow from '@xyflow/react';

Object.assign(window, {
  React,
  ReactDOM: { ...ReactDOM, ...ReactDOMClient },
  Recharts,
  ReactFlow,
  SECTIONS: window.SECTIONS || {},
});
