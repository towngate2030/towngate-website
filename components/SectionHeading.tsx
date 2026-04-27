type Props = {
  title: string;
  subtitle?: string;
  align?: "start" | "center";
};

export function SectionHeading({ title, subtitle, align = "start" }: Props) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start";

  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignClass}`}>
      <div className="flex items-center gap-3">
        <span className="h-0.5 w-10 shrink-0 rounded-full bg-brand-orange" aria-hidden />
        <span className="h-0.5 w-6 shrink-0 rounded-full bg-brand-orange/60" aria-hidden />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base text-brand-navy/70 md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
