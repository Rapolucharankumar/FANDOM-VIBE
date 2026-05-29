import { clsx } from "clsx";

type TagProps = {
  children: React.ReactNode;
  tone?: "violet" | "pink" | "cyan" | "peach" | "frost";
  selected?: boolean;
  onClick?: () => void;
};

const toneClasses = {
  violet: "border-violet/30 bg-violet/15 text-lavender",
  pink: "border-neon/30 bg-neon/15 text-pink-100",
  cyan: "border-cyan/30 bg-cyan/15 text-cyan-100",
  peach: "border-peach/30 bg-peach/15 text-orange-100",
  frost: "border-white/15 bg-white/10 text-white/80"
};

export function Tag({ children, tone = "frost", selected, onClick }: TagProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={clsx(
        "focus-ring inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold transition",
        toneClasses[tone],
        selected && "border-white/50 bg-white/20 text-white shadow-cyan",
        onClick && "hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15"
      )}
    >
      {children}
    </Component>
  );
}
