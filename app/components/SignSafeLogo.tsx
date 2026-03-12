type SignSafeLogoProps = {
  className?: string
  iconOnly?: boolean
}

export default function SignSafeLogo({
  className = "",
  iconOnly = false,
}: SignSafeLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 3L18.5 5.5V11.2C18.5 15.4 15.9 19.1 12 20.5C8.1 19.1 5.5 15.4 5.5 11.2V5.5L12 3Z"
            fill="white"
            fillOpacity="0.14"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 12.1L11.1 14L14.9 10.2"
            stroke="white"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className="text-[28px] font-semibold tracking-tight text-slate-950">
            SignSafe
          </span>
        </div>
      )}
    </div>
  )
}