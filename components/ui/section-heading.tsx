type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
};

export function SectionHeading({ eyebrow, title, copy, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h2>
        {copy ? <p className="mt-3 text-sm leading-6 text-white/62 sm:text-base">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}
