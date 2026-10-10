// Loaded as a synchronous classic script at each observable fixture boundary.
{
  const phase = document.currentScript.dataset.phase;
  if (phase === 'observe') {
    window.themeProbe = { violations: [] };
    document.addEventListener('securitypolicyviolation', (event) => {
      window.themeProbe.violations.push(`${event.effectiveDirective}:${event.blockedURI}`);
    });
  } else {
    const snapshot = {
      classes: document.documentElement.className,
      colorScheme: document.documentElement.style.colorScheme,
    };
    window.themeProbe[phase] = phase === 'head' ? {
      ...snapshot,
      bodyPresent: document.body !== null,
      painted: performance.getEntriesByType('paint').length > 0,
    } : snapshot;
  }
}
