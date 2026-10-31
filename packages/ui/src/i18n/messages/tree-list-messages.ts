/** TreeList live-preview messages. File names remain repository fixture data. */
export const treeListEn = {
  'treeList.examples.files': 'Repository files',
  'treeList.examples.navigation': 'Documentation navigation',
  'treeList.examples.filesOnly': 'Files only',
  'treeList.examples.filterHint': 'Filter loaded files',
  'treeList.examples.searchNavigation': 'Filter navigation',
  'treeList.examples.hint':
    'Matching folders keep their whole subtree. Only loaded nodes are searched; debounce the filter for large trees.',
  'treeList.examples.documentation': 'Documentation',
  'treeList.examples.gettingStarted': 'Getting started',
  'treeList.examples.components': 'Components',
  'treeList.examples.unavailable': 'Unavailable guide',
  'treeList.examples.configuration': 'Configuration',
} as const;

export const treeListEs = {
  'treeList.examples.files': 'Archivos del repositorio',
  'treeList.examples.navigation': 'Navegación de documentación',
  'treeList.examples.filesOnly': 'Solo archivos',
  'treeList.examples.filterHint': 'Filtrar archivos cargados',
  'treeList.examples.searchNavigation': 'Filtrar navegación',
  'treeList.examples.hint':
    'Las carpetas coincidentes conservan todo su subárbol. Solo se buscan nodos cargados; retrasa el filtro en árboles grandes.',
  'treeList.examples.documentation': 'Documentación',
  'treeList.examples.gettingStarted': 'Primeros pasos',
  'treeList.examples.components': 'Componentes',
  'treeList.examples.unavailable': 'Guía no disponible',
  'treeList.examples.configuration': 'Configuración',
} satisfies Record<keyof typeof treeListEn, string>;
