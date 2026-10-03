/* ============================================================================
   Gntik UI · sign-in.jsx — auth ("Forms" group).
   Brand split: hero panel (bg-chrome, primary accents) + form with two
   modes (Sign in · Create account) + SSO with Google, Facebook and GitHub.
   In the dark theme (default) the panel reproduces the app's dark brand.
   Neutral fixtures. Tokens, no hardcoded colors except the brand logos.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, Wordmark, ScaleFrame, useState } = window;

/* ── Provider logos · monochrome (inherit currentColor), viewBox 24 ──── */
const PROVIDERS = {
  google: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  github: 'M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.8c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z',
};
const ProviderIcon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block', flex: '0 0 auto' }} aria-hidden="true">
    <path d={PROVIDERS[name]} />
  </svg>
);

/* ── Eye / eye-off to reveal the password ────────────────────────────────── */
const EyeIcon = ({ off }) => {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true">
      {off
        ? <><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.6 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.1 9.1 0 0 0 5.4-1.61" {...p} /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" {...p} /></>
        : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p} /><circle cx="12" cy="12" r="2.5" {...p} /></>}
    </svg>
  );
};

/* ── Input field with icon ────────────────────────────────────────────────── */
function Field({ label, icon, type = 'text', placeholder, value, onChange, trailing }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-foreground mb-1.5">{label}</span>
      <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-lg border border-border bg-card shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
        <Icon name={icon} size={16} className="text-muted-foreground" />
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
        {trailing}
      </div>
    </label>
  );
}

/* ── The full split ───────────────────────────────────────────────────────── */
function AuthSplit() {
  const [mode, setMode] = useState('signin');          // 'signin' | 'register'
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [vals, setVals] = useState({ name: '', email: '', pw: '' });
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setVals(v => ({ ...v, [k]: e.target.value }));

  const isReg = mode === 'register';
  const canSubmit = isReg ? agree : true;
  const submit = () => {
    if (!canSubmit) return;
    setDone(true); setTimeout(() => setDone(false), 1700);
  };
  const swap = (m) => { setMode(m); setDone(false); };

  const pwToggle = (
    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
      className={"grid place-items-center -mr-1 h-7 w-7 rounded-md transition-colors " + (show ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
      <EyeIcon off={!show} />
    </button>
  );

  return (
    <div className="h-[720px] flex overflow-hidden rounded-xl border border-border bg-background font-sans text-foreground">

      {/* ── BRAND PANEL (left) ── */}
      <aside className="relative hidden md:flex w-[46%] shrink-0 flex-col justify-between bg-chrome border-r border-border/60 p-12 overflow-hidden">
        <Wordmark s={30} fs={21} />

        <div className="max-w-[420px]">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-5">Control plane · services</p>
          <h2 className="font-sans font-bold leading-[1.08] text-foreground" style={{ fontSize: 'clamp(30px,2.6vw,42px)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
            Trust the workflow,<br /><span className="text-primary">not the tab chaos.</span>
          </h2>
          <div className="flex flex-col gap-3.5 mt-9">
            {['Deployments, runs and costs on a single plane', "Policies your services can't bypass", 'Immutable audit, exportable to SIEM'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="grid place-items-center size-[23px] rounded-[7px] bg-primary/14 text-primary shrink-0"><Icon name="check" size={14} stroke={2.6} /></span>
                <span className="text-[14.5px] text-muted-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-primary" style={{ boxShadow: '0 0 0 3px hsl(var(--primary)/.18)' }} />
          <span className="font-mono text-[11.5px] text-muted-foreground">MFA · recovery codes · audited access</span>
        </div>
      </aside>

      {/* ── FORM (right) ── */}
      <main className="flex-1 min-w-0 flex items-center justify-center p-7 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[392px]">

          {/* tenant chip */}
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-border">
            <span className="grid place-items-center size-10 rounded-[9px] border border-border bg-card font-bold text-[13px] text-primary shrink-0">AC</span>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold text-foreground">Acme Corp</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Enterprise workspace</div>
            </div>
          </div>

          {/* segmented Sign in / Create account */}
          <div className="flex p-1 rounded-lg bg-secondary/60 border border-border mb-7">
            {[['signin', 'Sign in'], ['register', 'Create account']].map(([m, l]) => (
              <button key={m} type="button" onClick={() => swap(m)}
                className={"flex-1 h-8 rounded-md text-[13px] font-semibold transition-colors " + (mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{l}</button>
            ))}
          </div>

          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-2.5">{isReg ? 'Get started' : 'Secure access'}</p>
          <h3 className="text-[27px] font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.025em' }}>{isReg ? 'Create your account' : 'Sign in to your workspace'}</h3>
          <p className="text-[14px] leading-relaxed text-muted-foreground mt-2 mb-6">{isReg ? 'Spin up a workspace and bring your services under one control plane.' : 'Use your workspace credentials to continue into the control surface.'}</p>

          <div className="flex flex-col gap-4">
            {isReg && <Field label="Full name" icon="user" placeholder="Alex Morgan" value={vals.name} onChange={set('name')} />}
            <Field label={isReg ? 'Work email' : 'Email'} icon="mail" type="email" placeholder="name@company.com" value={vals.email} onChange={set('email')} />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-foreground">Password</span>
                {!isReg && <a href="#" onClick={e => e.preventDefault()} className="text-[12.5px] font-medium text-primary hover:underline">Forgot password?</a>}
              </div>
              <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-lg border border-border bg-card shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
                <Icon name="lock" size={16} className="text-muted-foreground" />
                <input type={show ? 'text' : 'password'} placeholder="••••••••••••" value={vals.pw} onChange={set('pw')}
                  className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
                {pwToggle}
              </div>
            </div>

            {isReg && (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <button type="button" role="checkbox" aria-checked={agree} onClick={() => setAgree(a => !a)}
                  className={"mt-px grid place-items-center size-[18px] rounded-[5px] border transition-colors shrink-0 " + (agree ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border hover:border-primary/50')}>
                  {agree && <Icon name="check" size={12} stroke={3} />}
                </button>
                <span className="text-[12.5px] leading-snug text-muted-foreground">I agree to the <a href="#" onClick={e => e.preventDefault()} className="text-primary font-medium">Terms</a> and <a href="#" onClick={e => e.preventDefault()} className="text-primary font-medium">Privacy Policy</a>.</span>
              </label>
            )}
          </div>

          <button type="button" onClick={submit} aria-disabled={!canSubmit}
            className={"mt-6 flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-primary text-primary-foreground text-[14.5px] font-semibold shadow-sm transition-colors hover:bg-primary/90 " + (!canSubmit ? 'opacity-50 cursor-not-allowed' : '')}>
            {done ? <><Icon name="check" size={17} stroke={2.6} />{isReg ? 'Account created' : 'Signed in'}</> : (isReg ? 'Create account' : 'Sign in')}
          </button>

          {/* SSO */}
          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">Or continue with</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[['google', 'Google'], ['facebook', 'Facebook'], ['github', 'GitHub']].map(([id, label]) => (
              <button key={id} type="button" aria-label={'Continue with ' + label}
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary/60">
                <ProviderIcon name={id} size={18} />
                <span className="text-[13px] font-medium hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-[13px] text-muted-foreground mt-7">
            {isReg
              ? <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); swap('signin'); }} className="text-primary font-medium hover:underline">Sign in</a></>
              : <>New here? <a href="#" onClick={e => { e.preventDefault(); swap('register'); }} className="text-primary font-medium hover:underline">Create account</a></>}
          </p>
        </div>
      </main>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_LAYOUT = `// AuthLayout.tsx — brand split + form (gntik-ui)
// Icons via lucide-react · classes = tokens from tokens/brand.css → reskins with the theme.
// The panel uses bg-chrome (green-black in dark) to reproduce the app's dark brand.
export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Brand panel — md+ only, like the sidebar */}
      <aside className="relative hidden md:flex w-[46%] shrink-0 flex-col justify-between
                        bg-chrome border-r border-border/60 p-12">
        <Wordmark />
        <div className="max-w-[420px]">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-5">Control plane · services</p>
          <h2 className="text-[42px] font-bold leading-[1.08] tracking-tight">
            Trust the workflow,<br/><span className="text-primary">not the tab chaos.</span>
          </h2>
          <ul className="mt-9 space-y-3.5">
            {features.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid place-items-center size-[23px] rounded-[7px] bg-primary/14 text-primary">
                  <Check className="size-3.5" strokeWidth={2.6} />
                </span>
                <span className="text-[14.5px] text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-muted-foreground">
          <span className="size-2 rounded-full bg-primary ring-[3px] ring-primary/20" />
          MFA · recovery codes · audited access
        </div>
      </aside>

      {/* Form */}
      <main className="flex-1 grid place-items-center p-10">
        <div className="w-full max-w-[392px]">{children}</div>
      </main>
    </div>
  );
}`;

const CODE_OAUTH = `// OAuthRow.tsx — Google · Facebook · GitHub (monochrome, inherit currentColor)
// Label visible on lg+, icon-only on narrow screens.
import { Google, Facebook, Github } from "@/components/brand-icons";

const PROVIDERS = [
  { id: "google",   label: "Google",   Icon: Google },
  { id: "facebook", label: "Facebook", Icon: Facebook },
  { id: "github",   label: "GitHub",   Icon: Github },
];

export function OAuthRow({ onPick }) {
  return (
    <>
      <div className="flex items-center gap-3 my-6">
        <span className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Or continue with
        </span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {PROVIDERS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onPick(id)} aria-label={\`Continue with \${label}\`}
            className="flex items-center justify-center gap-2 h-11 rounded-lg border border-border
                       bg-card text-foreground transition-colors hover:bg-secondary/60">
            <Icon className="size-[18px]" />
            <span className="text-[13px] font-medium hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}`;

/* ── section ─────────────────────────────────────────────────────────────── */
function SignInSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Sign-in & sign-up" status="done"
        intro="The access screen: brand panel on the left (hero, checklist and security seal) and, on the right, the form with two modes — sign in and create account — plus SSO with Google, Facebook and GitHub. It's interactive: switch modes in the segmented control, type in the fields, reveal the password with the eye and tick the terms to enable sign-up. The panel uses bg-chrome, so in the dark theme (default) it reproduces the app's dark brand and reskins with everything else." />

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6 overflow-hidden">
        <ScaleFrame width={1120}><AuthSplit /></ScaleFrame>
      </div>

      <CodeBlock code={CODE_LAYOUT} lang="tsx" />
      <CodeBlock code={CODE_OAUTH} lang="tsx" />
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['sign-in'] = SignInSection;
})();
