import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requestTime } from '../../../request-time';
import { findProject } from '../../../../data/projects';
import { ProjectView } from './view';

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: findProject(id)?.name ?? 'Project' };
}

/**
 * Server Component: resolves the project (or renders not-found) and hands its id plus the request
 * time (timestamp anchor, so SSR and hydration agree) to the client template.
 */
export default async function ProjectRoute({ params }: Params) {
  const { id } = await params;
  if (!findProject(id)) notFound();
  const now = await requestTime();
  return <ProjectView id={id} now={now} />;
}
