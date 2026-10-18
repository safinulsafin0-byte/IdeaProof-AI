import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-sm px-4.5 py-2.5 gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#0F172A] text-white hover:bg-[#1E293B] active:bg-[#020617] border border-transparent shadow-xs focus:ring-[#0F172A]/30",
    secondary:
      "bg-white text-[#18181B] hover:bg-[#F8F8F6] active:bg-[#F1F1ED] border border-[#E5E5E0] shadow-2xs focus:ring-[#64748B]/20",
    subtle:
      "bg-[#F4F4F0] text-[#18181B] hover:bg-[#EBEBE6] border border-transparent focus:ring-[#64748B]/20",
    ghost:
      "bg-transparent text-[#475569] hover:bg-[#F1F1ED] hover:text-[#0F172A] border border-transparent focus:ring-[#64748B]/20",
    danger:
      "bg-white text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FECACA] focus:ring-[#DC2626]/20",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}

