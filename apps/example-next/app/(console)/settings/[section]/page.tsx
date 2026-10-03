import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requestTime } from '../../../request-time';
import { SETTINGS_SECTIONS, isSettingsSection } from '../../../../data/settings';
import { SettingsSectionView } from './view';

interface Params {
  params: Promise<{ section: string }>;
}

/** Only the known sections; anything else is a 404. */
export const dynamicParams = false;
export function generateStaticParams() {
  return SETTINGS_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section } = await params;
  return { title: `Settings · ${section}` };
}

/** The remaining settings sections (profile and members have their own segments). */
export default async function SettingsSectionRoute({ params }: Params) {
  const { section } = await params;
  if (!isSettingsSection(section)) notFound();
  const now = await requestTime();
  return <SettingsSectionView section={section} now={now} />;
}
