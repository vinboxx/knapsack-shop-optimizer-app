import type { InputHTMLAttributes } from "react";

interface NumberFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  value: number | null;
  onChange: (value: number | null) => void;
}

/** Whole-number input. Non-digits are dropped as they are typed, so only positive integers (or empty) get through. */
export function NumberField({ value, onChange, className = "", ...props }: NumberFieldProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value ?? ""}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 9);
        onChange(digits === "" ? null : Number(digits));
      }}
      className={`min-w-0 bg-transparent font-mono text-code-num text-frost outline-none ${className}`}
    />
  );
}
