type ResumableSession = {
  id: number;
  finishedAt: string | null;
  kataIds?: number[] | null;
};

export function resumableSessionPath(session: ResumableSession | null): string | null {
  if (!session || session.finishedAt) return null;
  if (!session.kataIds?.length) return null;
  return `/session/${session.id}`;
}
