import { Carousel } from '../Carousel';

const tips = [
  'Pin the dashboards you open every morning to the sidebar.',
  'Press ⌘K anywhere to jump to a project, member or invoice.',
  'Deployments can be rolled back from their detail page in one click.',
];

export default function CarouselAutoplay() {
  return (
    <Carousel label="Tips" title="Tips" autoplay={6000} className="max-w-md">
      {tips.map((tip) => (
        <div key={tip} className="flex h-28 items-center rounded-xl border border-border bg-secondary/40 px-5 text-[13.5px] leading-6 text-foreground">
          {tip}
        </div>
      ))}
    </Carousel>
  );
}
