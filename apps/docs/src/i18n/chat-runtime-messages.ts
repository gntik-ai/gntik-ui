/** Localized guide copy; message payloads and backend errors are supplied by the adapter. */
export const chatRuntimeMessages = {
  en: {
    title: 'Chat runtime',
    intro:
      'useChat is experimental. Compose the existing chat components around typed messages; use the echo example above without a backend.',
    backendTitle: 'Connect your backend',
    backend:
      'The adapter URL must be your product backend. Keep provider keys on the server, authenticate the caller and authorize conversation access there. Never put provider keys in browser headers. The backend proxy validates the request, calls the provider with its server-held credentials and forwards the SSE response; forward request cancellation to the upstream request.',
    adapters:
      'createHttpChatAdapter posts { messages, trigger } and reads JSON UI-message-stream v1 chunks. createOpenAICompatibleAdapter posts { role, content } text messages with stream: true and maps the first choice’s content and reasoning_content deltas. It does not upload attachments or map tool calls: use the HTTP protocol for those. Both check HTTP status and use readSSE. Optional headers and body are for your backend’s own contract.',
    protocolTitle: 'Chunk protocol',
    protocol:
      'Send one JSON chunk per SSE data block, separated by a blank line. [DONE] ends the transport. Text and reasoning merge by id, tools by toolCallId; sourceId is deduplicated. Unknown chunk types (including data-progress) are ignored. finish or end-of-stream completes a reply; error preserves partial content and calls onError once. Use start-step and finish-step for step boundaries.',
    mappingTitle: 'Render parts and status',
    mapping:
      'Render each turn with ChatMessage: text → Markdown, reasoning → ReasoningBlock, tool → ToolCallCard (toolName/input/output/errorText → name/args/result/error), source → CitationList, file → AttachmentList. A file chunk’s URL becomes ChatAttachment.previewUrl. Step parts mark boundaries and need no visible renderer. Keep your own attachment uploads and server persistence.',
    status:
      'ChatMessage has no status prop. Set streaming for pending or streaming (and pass the same value to Markdown); done, error and aborted are not streaming. Supply onRetry={() => regenerate(message.id)} for terminal assistant replies while no request is running. Render message.error with role="alert" if needed. Adapter errors are application data, not fixed kit copy.',
    controlTitle: 'Stop, retry and history',
    control:
      'Wire sendMessage to ChatComposer.onSubmit, isStreaming to streaming and stop to onStop. Stop aborts the adapter signal and optional stop callback, retaining partial parts and failing running tools; unmount aborts without further state updates. Busy sends and regeneration are ignored. regenerate(messageId?) drops that assistant reply and all later messages; by default it replaces the last assistant reply.',
    history:
      'Provide initialMessages, initialCursor and adapter.listMessages({ cursor, signal }) for older history. Return chronological messages and nextCursor; loadOlder() prepends a page, isLoadingOlder guards concurrent calls and hasOlder becomes false on null. setMessages accepts an array or updater. A changed id aborts and resets the conversation. flushIntervalMs defaults to 50; 0 commits each chunk. generateId, onFinish and onError support product integration.',
    templateTitle: 'Assistant template with an adapter',
    template:
      'AssistantChatPage accepts the same adapter; without one, its existing reply, tool and tickMs props build an abortable scripted demo.',
  },
  es: {
    title: 'Motor de chat',
    intro:
      'useChat es experimental. Compón los componentes de chat existentes con mensajes tipados; prueba el ejemplo de eco anterior sin un servidor.',
    backendTitle: 'Conecta tu servidor',
    backend:
      'La URL del adaptador debe apuntar al servidor de tu producto. Mantén las claves del proveedor en el servidor, autentica al solicitante y autoriza allí el acceso a la conversación. Nunca pongas claves del proveedor en cabeceras del navegador. El proxy valida la petición, llama al proveedor con sus credenciales del servidor y reenvía la respuesta SSE; propaga la cancelación al proveedor.',
    adapters:
      'createHttpChatAdapter envía { messages, trigger } y lee fragmentos JSON UI-message-stream v1. createOpenAICompatibleAdapter envía mensajes de texto { role, content } con stream: true y transforma content y reasoning_content de la primera alternativa. No sube adjuntos ni transforma llamadas a herramientas: usa el protocolo HTTP para ello. Ambos comprueban el estado HTTP y usan readSSE. Las cabeceras y el cuerpo opcionales son para el contrato de tu servidor.',
    protocolTitle: 'Protocolo de fragmentos',
    protocol:
      'Envía un fragmento JSON por bloque data de SSE, separados por una línea vacía. [DONE] termina el transporte. Texto y razonamiento se unen por id, las herramientas por toolCallId; sourceId evita fuentes duplicadas. Los tipos desconocidos (incluido data-progress) se ignoran. finish o el fin del flujo completan la respuesta; error conserva el contenido parcial y llama a onError una vez. Usa start-step y finish-step como límites de pasos.',
    mappingTitle: 'Representar partes y estado',
    mapping:
      'Representa cada turno con ChatMessage: text → Markdown, reasoning → ReasoningBlock, tool → ToolCallCard (toolName/input/output/errorText → name/args/result/error), source → CitationList, file → AttachmentList. La URL de un fragmento file se convierte en ChatAttachment.previewUrl. Las partes step marcan límites sin necesitar una representación visible. Gestiona las subidas y la persistencia en tu aplicación.',
    status:
      'ChatMessage no tiene prop status. Activa streaming para pending o streaming (y pasa el mismo valor a Markdown); done, error y aborted no están generando. Usa onRetry={() => regenerate(message.id)} en respuestas finales del asistente cuando no haya ninguna petición en curso. Si hace falta, muestra message.error con role="alert". Los errores del adaptador son datos de la aplicación, no textos fijos del kit.',
    controlTitle: 'Detener, reintentar e historial',
    control:
      'Conecta sendMessage a ChatComposer.onSubmit, isStreaming a streaming y stop a onStop. Stop cancela la señal del adaptador y su callback stop opcional, conserva partes parciales y marca herramientas en curso como fallidas; desmontar cancela sin más actualizaciones. Los envíos y regeneraciones durante una respuesta se ignoran. regenerate(messageId?) elimina esa respuesta y los mensajes posteriores; por defecto sustituye la última respuesta del asistente.',
    history:
      'Proporciona initialMessages, initialCursor y adapter.listMessages({ cursor, signal }) para el historial. Devuelve mensajes cronológicos y nextCursor; loadOlder() antepone una página, isLoadingOlder evita peticiones simultáneas y hasOlder pasa a false con null. setMessages acepta una lista o función. Cambiar id cancela y reinicia la conversación. flushIntervalMs vale 50 por defecto; 0 publica cada fragmento. generateId, onFinish y onError permiten integrar el producto.',
    templateTitle: 'Plantilla de asistente con adaptador',
    template:
      'AssistantChatPage acepta el mismo adaptador; sin él, sus props reply, tool y tickMs crean la demostración programada cancelable existente.',
  },
} as const;
