interface ProgressCardProps {
  label: string;
  value: number | null;
  note?: string;
}

export function ProgressCard({ label, value, note }: ProgressCardProps) {
  return (
    <article className="rounded-3xl border-2 border-elder-ink/15 bg-elder-surface p-5">
      <p className="text-xl text-elder-muted">{label}</p>
      <p className="text-5xl font-bold text-elder-ink">{value === null ? "—" : value}</p>
      {note ? <p className="mt-2 text-lg text-elder-muted">{note}</p> : null}
    </article>
  );
}
