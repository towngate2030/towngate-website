type Props = { title: string; subtitle?: string };

export function SectionTitle({ title, subtitle }: Props) {
  return (
    <div className="mb-10 max-w-2xl">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-1 w-10 rounded-full bg-brand-orange" />
        <span className="h-1 w-6 rounded-full bg-brand-orange/60" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg text-brand-navy/70">{subtitle}</p>
      ) : null}
    </div>
  );
}
