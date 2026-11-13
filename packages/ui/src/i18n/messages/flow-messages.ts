export const flowEn = {
  'flow.canvas': 'Flow canvas',
  'flow.undo': 'Undo',
  'flow.redo': 'Redo',
  'flow.undid': 'Undid {action}',
  'flow.redid': 'Redid {action}',
  'flow.action.add': 'add node',
  'flow.action.delete': 'delete node',
  'flow.action.move': 'move node',
  'flow.action.connect': 'connect nodes',
  'flow.action.update': 'edit node',
} as const;

export const flowEs = {
  'flow.canvas': 'Lienzo de flujo',
  'flow.undo': 'Deshacer',
  'flow.redo': 'Rehacer',
  'flow.undid': 'Se deshizo: {action}',
  'flow.redid': 'Se rehízo: {action}',
  'flow.action.add': 'añadir nodo',
  'flow.action.delete': 'eliminar nodo',
  'flow.action.move': 'mover nodo',
  'flow.action.connect': 'conectar nodos',
  'flow.action.update': 'editar nodo',
} satisfies Record<keyof typeof flowEn, string>;
