/* ============================================================================
   Gntik UI · modal-dialogs.jsx — modales (grupo "Overlays").
   Scrim + panel centrado, contenido en el preview (overlay absoluto, no fixed).
   Tres patrones: confirmación destructiva, modal con formulario (deploy) y
   aviso simple de éxito. Cierre por scrim, ✕ o Esc; entrada/salida animadas.
   Dominio musematic (agentes, Fleet, regiones, policies). Todo desde tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-5 sm:p-6">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── hook: monta + anima entrada/salida ──────────────────────────────────── */
function useReveal(open, ms = 200) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let raf1, raf2, t;
    if (open) {
      setMounted(true);
      raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(true)); });
    } else {
      setShown(false);
      t = setTimeout(() => setMounted(false), ms);
    }
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t); };
  }, [open]);
  return [mounted, shown];
}

/* ── shell del modal: scrim + panel centrado, contenido (absolute) ───────── */
const SIZE = { sm: 'max-w-[380px]', md: 'max-w-[460px]', lg: 'max-w-[560px]' };
function Modal({ open, onClose, size = 'md', children, labelledBy }) {
  const [mounted, shown] = useReveal(open);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center p-5 sm:p-8">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/75 backdrop-blur-[3px] transition-opacity duration-200 " + (shown ? 'opacity-100' : 'opacity-0')} />
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
        className={"relative mt-6 w-full rounded-xl border border-border bg-popover shadow-lg transition-all duration-200 " + SIZE[size] + ' ' +
          (shown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.97]')}>
        {children}
      </div>
    </div>
  );
}

/* ── primitivas locales (campos + botones, alineadas con la kit) ─────────── */
const fieldCls = "block w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";
const Input = (p) => <input {...p} className={fieldCls + " h-9 " + (p.className || '')} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={fieldCls + " h-9 appearance-none pr-9 cursor-pointer"}>{children}</select>
    <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-[11.5px] leading-4 text-muted-foreground" style={{ textWrap: 'pretty' }}>{hint}</span>}
  </label>
);
const BTN = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'border border-border bg-card text-foreground hover:bg-secondary/60',
  ghost: 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
};
const Btn = ({ variant = 'secondary', className = '', children, ...p }) => (
  <button {...p} className={"inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50 " + BTN[variant] + ' ' + className}>{children}</button>
);
const Trigger = ({ children, onClick, hint }) => (
  <div className="absolute inset-0 grid place-content-center gap-3 text-center">
    <div><Btn variant="secondary" onClick={onClick}>{children}</Btn></div>
    {hint && <p className="h-4 text-[12px] text-muted-foreground">{hint}</p>}
  </div>
);
const IconClose = ({ onClick }) => (
  <button onClick={onClick} aria-label="Cerrar"
    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
    <Icon name="x" size={16} stroke={2.2} />
  </button>
);

/* ── 1 · CONFIRMACIÓN DESTRUCTIVA ─────────────────────────────────────────── */
function ConfirmModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const remove = () => { setOpen(false); setEco('Agente eliminado'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-destructive">{eco}</span> : 'Abre el diálogo de borrado'}>
        <Icon name="trash" size={15} />Eliminar agente
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="confirm-t">
        <div className="p-5">
          <div className="flex gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/12 text-destructive"><Icon name="alert" size={20} stroke={2} /></span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 id="confirm-t" className="text-[15px] font-semibold tracking-tight text-foreground">Eliminar «billing-copilot»</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
                Se desconectará del Fleet y se borrarán sus logs y métricas. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn variant="destructive" onClick={remove}><Icon name="trash" size={15} />Eliminar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── 2 · MODAL CON FORMULARIO (deploy) ───────────────────────────────────── */
function FormModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const [name, setName] = useState('support-triage');
  const submit = (e) => { e.preventDefault(); setOpen(false); setEco('Desplegando ' + name + '…'); setTimeout(() => setEco(''), 2400); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-primary">{eco}</span> : 'Abre el formulario de deploy'}>
        <Icon name="bot" size={16} />Deploy de agente
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="md" labelledBy="form-t">
        <form onSubmit={submit}>
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h3 id="form-t" className="text-[15px] font-semibold tracking-tight text-foreground">Desplegar agente</h3>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">Configura y publica una nueva réplica en el Fleet.</p>
            </div>
            <IconClose onClick={() => setOpen(false)} />
          </div>
          <div className="grid grid-cols-2 gap-4 px-5 py-5">
            <div className="col-span-2"><Field label="Nombre del agente"><Input value={name} onChange={e => setName(e.target.value)} placeholder="mi-agente" /></Field></div>
            <Field label="Región"><Select defaultValue="eu-west-1"><option>eu-west-1</option><option>us-east-1</option><option>ap-south-1</option><option>eu-central-1</option></Select></Field>
            <Field label="Runtime"><Select defaultValue="sonnet-4.5"><option>sonnet-4.5</option><option>haiku-4</option><option>opus-4</option></Select></Field>
            <Field label="Límite de coste / run" hint="Se pausa al superarlo.">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12.5px] text-muted-foreground">$</span>
                <Input defaultValue="0.40" className="pl-7 font-mono" />
              </div>
            </Field>
            <Field label="Policy"><Select defaultValue="pii-redaction"><option>pii-redaction</option><option>default</option><option>sin policy</option></Select></Field>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Icon name="info" size={13} />Activo de inmediato</span>
            <div className="flex gap-2.5">
              <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Btn>
              <Btn variant="primary" type="submit"><Icon name="bolt" size={15} />Desplegar</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── 3 · AVISO SIMPLE (éxito, una sola CTA) ──────────────────────────────── */
function NoticeModal() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint="Abre el aviso de confirmación">
        <Icon name="check" size={16} />Mostrar aviso
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="notice-t">
        <div className="p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><Icon name="check" size={24} stroke={2.2} /></span>
          <h3 id="notice-t" className="mt-4 text-[16px] font-semibold tracking-tight text-foreground">Fleet sincronizado</h3>
          <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            Los 24 agentes están sirviendo la versión <span className="font-mono text-foreground/90">sonnet-4.5</span>. No hay reinicios pendientes.
          </p>
          <Btn variant="primary" className="mt-5 w-full" onClick={() => setOpen(false)}>Entendido</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── 4 · AVISO CENTRADO CON DOS ACCIONES ─────────────────────────────────── */
function NoticeDualModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const apply = () => { setOpen(false); setEco('Rollback aplicado'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-primary">{eco}</span> : 'Abre el aviso con dos opciones'}>
        <Icon name="bolt" size={15} />Rollback del Fleet
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="dual-t">
        <div className="p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><Icon name="bolt" size={22} stroke={2.2} /></span>
          <h3 id="dual-t" className="mt-4 text-[16px] font-semibold tracking-tight text-foreground">Aplicar rollback</h3>
          <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            Los 24 agentes volverán a la versión <span className="font-mono text-foreground/90">sonnet-4.4</span>. El despliegue actual quedará en pausa.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 px-6 pb-6">
          <Btn variant="secondary" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={apply}>Aplicar</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── 5 · CONFIRMACIÓN CON BARRA DE PIE ───────────────────────────────────── */
function ConfirmBarModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const off = () => { setOpen(false); setEco('Región desactivada'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-destructive">{eco}</span> : 'Abre la confirmación con pie de acciones'}>
        <Icon name="alert" size={15} />Desactivar región
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="md" labelledBy="bar-t">
        <div className="p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"><Icon name="alert" size={20} stroke={2} /></span>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <h3 id="bar-t" className="text-[15px] font-semibold tracking-tight text-foreground">Desactivar «eu-west-1»</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
                Los 9 agentes de esta región dejarán de servir y el tráfico se reenrutará a <span className="font-mono text-foreground/90">eu-central-1</span>. Puedes reactivarla más tarde.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2.5 border-t border-border bg-secondary/40 px-5 py-4 sm:px-6">
          <Btn variant="destructive" onClick={off}>Desactivar</Btn>
          <Btn variant="secondary" onClick={() => setOpen(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SHELL = `// Modal — scrim + panel centrado, cierre por scrim / ✕ / Esc, entrada animada
function Modal({ open, onClose, size = "md", children }) {
  const [mounted, shown] = useReveal(open);          // monta + anima dentro/fuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-8">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/75 backdrop-blur-[3px] transition-opacity duration-200 " +
          (shown ? "opacity-100" : "opacity-0")} />
      <div role="dialog" aria-modal="true"
        className={"relative mt-6 w-full max-w-[460px] rounded-xl border border-border bg-popover shadow-lg " +
          "transition-all duration-200 " +
          (shown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.97]")}>
        {children}
      </div>
    </div>
  );
}`;

const CODE_CONFIRM = `// Confirmación destructiva — icono en destructive, acción de peligro a la derecha
<Modal open={open} onClose={close} size="sm">
  <div className="p-5">
    <div className="flex gap-3.5">
      <span className="grid size-10 place-items-center rounded-lg bg-destructive/12 text-destructive"><AlertIcon /></span>
      <div className="flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold text-foreground">Eliminar «billing-copilot»</h3>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
          Se desconectará del Fleet y se borrarán sus logs. Esta acción no se puede deshacer.
        </p>
      </div>
    </div>
    <div className="mt-5 flex justify-end gap-2.5">
      <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary/60">Cancelar</button>
      <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</button>
    </div>
  </div>
</Modal>`;

const CODE_DUAL = `// Aviso centrado con dos acciones — icono primario, botones en rejilla 50/50
<Modal open={open} onClose={close} size="sm">
  <div className="p-6 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><BoltIcon /></span>
    <h3 className="mt-4 text-[16px] font-semibold text-foreground">Aplicar rollback</h3>
    <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
      Los 24 agentes volverán a la versión sonnet-4.4. El despliegue actual quedará en pausa.
    </p>
  </div>
  <div className="grid grid-cols-2 gap-2.5 px-6 pb-6">
    <button className="h-9 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60">Cancelar</button>
    <button className="h-9 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">Aplicar</button>
  </div>
</Modal>`;

const CODE_BAR = `// Confirmación con barra de pie — icono a la izquierda, footer teñido row-reverse
<Modal open={open} onClose={close} size="md">
  <div className="p-6">
    <div className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"><AlertIcon /></span>
      <div className="flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold text-foreground">Desactivar «eu-west-1»</h3>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
          Los 9 agentes dejarán de servir y el tráfico se reenrutará a eu-central-1.
        </p>
      </div>
    </div>
  </div>
  <div className="flex flex-row-reverse gap-2.5 border-t border-border bg-secondary/40 px-6 py-4">
    <button className="h-9 px-3.5 rounded-lg bg-destructive text-[13px] font-semibold text-destructive-foreground hover:bg-destructive/90">Desactivar</button>
    <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60">Cancelar</button>
  </div>
</Modal>`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function ModalDialogsSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Modal dialogs" status="done"
        intro="El diálogo que detiene todo y pide una decisión: scrim que atenúa el fondo, panel centrado de marca y foco contenido. Un solo shell Modal cubre los tres patrones — confirmación destructiva, formulario (deploy) y aviso de éxito — y se cierra al pulsar fuera, con la ✕ o con Esc. Entrada y salida animadas. En el catálogo el overlay es absoluto (vive dentro del preview); en producción usarías fixed inset-0." />

      <Variant title="Confirmación destructiva"
        desc="Para acciones irreversibles: icono en tono destructive, una frase con la consecuencia, y la acción de peligro a la derecha tras un Cancelar neutro. Confirma y verás el eco bajo el disparador."
        code={CODE_CONFIRM}>
        <ConfirmModal />
      </Variant>

      <Variant title="Modal con formulario"
        desc="El caso de “crear / editar” sin salir de la página: cabecera con título y ✕, cuerpo en rejilla de campos (input, selects, prefijo $) y pie con la acción primaria. Enter o el botón despliegan y cierran."
        code={CODE_SHELL}>
        <FormModal />
      </Variant>

      <Variant title="Aviso de éxito"
        desc="Versión mínima y centrada para confirmar un resultado: icono primario, título, una línea de detalle y una única CTA a ancho completo.">
        <NoticeModal />
      </Variant>

      <Variant title="Aviso con dos acciones"
        desc="Decisión centrada cuando hacen falta dos salidas equivalentes: icono primario, título, detalle y botones a 50/50. La acción primaria queda a la derecha."
        code={CODE_DUAL}>
        <NoticeDualModal />
      </Variant>

      <Variant title="Confirmación con barra de pie"
        desc="El patrón de panel con pie: contenido con icono a la izquierda y una barra de acciones teñida al fondo en orden inverso (acción de peligro primero). Útil cuando el cuerpo crece."
        code={CODE_BAR}>
        <ConfirmBarModal />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['modal-dialogs'] = ModalDialogsSection;
})();
