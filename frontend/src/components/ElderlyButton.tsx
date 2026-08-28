import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "mood";

interface ElderlyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-elder-primary text-elder-primary-ink border-elder-ink/20 hover:brightness-110",
  secondary:
    "bg-elder-surface text-elder-ink border-elder-ink/40 hover:bg-white",
  ghost: "bg-transparent text-elder-ink border-transparent hover:bg-black/5",
  mood: "bg-elder-surface text-elder-ink border-elder-ink/30 text-4xl leading-none min-h-24",
};

export function ElderlyButton({
  variant = "primary",
  icon,
  className = "",
  children,
  type = "button",
  ...props
}: ElderlyButtonProps) {
  return (
    <button
      type={type}
      className={`flex min-h-touch w-full items-center justify-center gap-3 rounded-2xl border-2 px-6 py-4 text-2xl font-semibold shadow-sm disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
