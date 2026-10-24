import { useI18n } from '@gntik-ai/ui';
import proxySource from '../../../example-next/proxy.ts?raw';
import layoutSource from '../../../example-next/app/layout.tsx?raw';
import providersSource from '../../../example-next/app/providers.tsx?raw';

function StrictCSPSection() {
  const { t } = useI18n();
  const { SectionHead, CodeBlock } = window;
  return (
    <div className="space-y-6 text-foreground">
      <SectionHead title={t('csp.title')} intro={t('csp.guideIntro')} status="done" />
      <p>{t('csp.nonceWarning')}</p>
      <h2 className="text-xl font-semibold">{t('csp.nextTitle')}</h2>
      <p>{t('csp.nextGuide')}</p>
      <p>{t('csp.rendererGuide')}</p>
      <CodeBlock lang="ts" code={proxySource} />
      <CodeBlock lang="tsx" code={layoutSource} />
      <CodeBlock lang="tsx" code={providersSource} />
      <CodeBlock lang="sh" code="pnpm --filter @gntik-ai/example-next test:csp" />
      <p>{t('csp.themeGuide')}</p>
      <CodeBlock
        lang="tsx"
        code={`import { themeScript } from '@gntik-ai/ui/theme-script';
// Server Component: nonce comes from headers(), not a constant.
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript() }} />;`}
      />
      <h2 className="text-xl font-semibold">{t('csp.viteTitle')}</h2>
      <p>{t('csp.viteGuide')}</p>
      <CodeBlock
        lang="ts"
        code={`// vite.config.ts: replace this marker in HTML for every response.
export default { html: { cspNonce: '__RESPONSE_NONCE__' } };
// Client entry: Vite emits a csp-nonce meta element with the replaced value.
const nonce = document.querySelector('meta[property="csp-nonce"]')?.nonce;
root.render(<CSPProvider nonce={nonce}><App /></CSPProvider>);`}
      />
      <p>{t('csp.staticGuide')}</p>
      <CodeBlock
        lang="html"
        code={`<!-- Copy node_modules/@gntik-ai/ui/dist/theme-bootstrap.js to public/. -->
<script src="/theme-bootstrap.js"></script>`}
      />
      <CodeBlock lang="tsx" code={`<CSPProvider disableStyleElements><App /></CSPProvider>`} />
      <CodeBlock
        lang="text"
        code={`default-src 'self'; script-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; object-src 'none'; base-uri 'none'`}
      />
      <h2 className="text-xl font-semibold">{t('csp.printTitle')}</h2>
      <p>{t('csp.printGuide')}</p>
      <CodeBlock lang="css" code="@page { size: A4; margin: 20mm; }" />
      <p>{t('csp.attributeGuide')}</p>
      <h2 className="text-xl font-semibold">{t('csp.useTitle')}</h2>
      <CodeBlock
        lang="tsx"
        code={`import { useCSP } from '@gntik-ai/ui';
function PageRule() {
  const { nonce, disableStyleElements } = useCSP();
  return disableStyleElements ? null : <style nonce={nonce}>{'@page { size: A4; margin: 20mm; }'}</style>;
}`}
      />
    </div>
  );
}

window.SECTIONS['strict-csp'] = StrictCSPSection;
