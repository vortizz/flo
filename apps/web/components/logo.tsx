interface FloLogoProps {
  size?: number
}

export function FloLogo({ size = 36 }: FloLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background rounded square */}
      <rect width="36" height="36" rx="10" fill="#0d9e7e" />

      {/* Pulse/wave line */}
      <path
        d="M6 18 L10 18 L13 11 L16 25 L19 14 L22 20 L25 20 L30 20"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
