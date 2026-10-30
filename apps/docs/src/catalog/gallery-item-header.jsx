export function GalleryItemHeader({ item }) {
  const sectionName = { blocks: 'Blocks', layouts: 'Layouts', templates: 'Page templates' }[item.section];
  return (
    <div className="mb-8 max-w-3xl">
      <a href={`#${item.section}`} className="mb-6 inline-block text-[13px] text-primary-text underline focus-ring">
        Back to {sectionName}
      </a>
      <h1 tabIndex={-1} className="font-sans font-bold text-[2rem] leading-tight tracking-tight text-foreground">
        {item.name}
      </h1>
    </div>
  );
}
