import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function CoinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {[6, 12, 18].map((y) => (
        <g key={y}>
          <circle cx="9" cy={y} r="1" fill="currentColor" />
          <circle cx="15" cy={y} r="1" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export function UnlinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m18.8 13.2 1.7-1.7a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="m5.2 10.8-1.7 1.7a5 5 0 0 0 7 7l1.7-1.7" />
      <path d="M8 2v3M2 8h3M16 22v-3M22 16h-3" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}
