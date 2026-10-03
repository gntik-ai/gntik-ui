import { ArrowLeft, ArrowRight, BookOpen, Rocket, Settings, Shield } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Link } from '../../../components/Link';
import { NavList, type NavGroup } from '../../../components/NavList';
import { Logo } from '../../../theme/Logo';
import { DocsLayout } from '../DocsLayout';

const NAV: NavGroup[] = [
  {
    label: 'Get started',
    items: [
      { label: 'Introduction', href: '#docs-intro', icon: BookOpen },
      { label: 'Deploy a project', href: '#docs-deploy', icon: Rocket, current: true },
    ],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Environments', href: '#docs-environments', icon: Settings },
      { label: 'Access control', href: '#docs-access', icon: Shield },
    ],
  },
];

const TOC = [
  { id: 'deploy-prerequisites', label: 'Prerequisites' },
  { id: 'deploy-configure', label: 'Configure the project' },
  { id: 'deploy-variables', label: 'Environment variables', level: 3 as const },
  { id: 'deploy-ship', label: 'Ship it' },
];

const PARAGRAPH = 'text-[14px] leading-7 text-muted-foreground';
const H2 = 'mt-10 mb-3 scroll-mt-6 text-[18px] font-semibold tracking-tight text-foreground';

export default function DocsLayoutGuide() {
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-border">
      <DocsLayout
        header={
          <>
            <Logo size={22} wordmark />
            <Badge tone="neutral" size="sm">Docs</Badge>
          </>
        }
        nav={<NavList label="Documentation" groups={NAV} />}
        toc={TOC}
        footer={
          <div className="flex items-center justify-between gap-4 text-[13px]">
            <Link href="#docs-intro" className="inline-flex items-center gap-1.5">
              <ArrowLeft size={14} aria-hidden /> Introduction
            </Link>
            <Link href="#docs-environments" className="inline-flex items-center gap-1.5">
              Environments <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        }
      >
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary-text uppercase">Get started</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em]">Deploy a project</h1>
        <p className={`mt-3 ${PARAGRAPH}`}>Go from a repository to a running deployment in a few minutes.</p>
        <h2 id="deploy-prerequisites" className={H2}>Prerequisites</h2>
        <p className={PARAGRAPH}>A workspace where you are an owner or a member with deploy rights, and a repository with a build script.</p>
        <h2 id="deploy-configure" className={H2}>Configure the project</h2>
        <p className={PARAGRAPH}>Pick the region closest to your users. Builds run in the same region, so caches stay warm between deployments.</p>
        <h3 id="deploy-variables" className="mt-6 mb-2 scroll-mt-6 text-[15px] font-semibold text-foreground">Environment variables</h3>
        <p className={PARAGRAPH}>Secrets are encrypted at rest and only exposed to the build and runtime of the environment they belong to.</p>
        <h2 id="deploy-ship" className={H2}>Ship it</h2>
        <p className={PARAGRAPH}>Push to the default branch. Each push creates a deployment with its own preview URL; promote it when the checks pass.</p>
      </DocsLayout>
    </div>
  );
}
