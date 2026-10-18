import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "demo" | "verified" | "accent" | "warning";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-tight transition-colors";

  const variantStyles = {
    default: "bg-[#F1F1ED] text-[#475569] border border-[#E5E5E0]",
    outline: "bg-transparent text-[#64748B] border border-[#E5E5E0]",
    demo: "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
    verified: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]",
    accent: "bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]",
    warning: "bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

