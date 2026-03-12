"use client";

import Link from "next/link";
import { useLanguage } from "../context/language-context";

type SignSafeLogoProps = {
  /** Wrap in link to home. Set false when already inside a link. */
  linkToHome?: boolean;
  /** Show subtitle "AI-Powered Protection" under the wordmark. Default true for full brand lockup. */
  showSubtitle?: boolean;
  /** Size: "sm" (header default), "md", "lg". */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: { box: "h-9 w-9", icon: "h-[18px] w-[18px]", wordmark: "text-xl" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", wordmark: "text-2xl" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6", wordmark: "text-3xl" },
};

/**
 * Custom SignSafe brand logo: rounded emerald square with shield outline + checkmark (inline SVG),
 * wordmark "SignSafe", and optional subtitle "AI-Powered Protection". Modern SaaS style.
 */
export function SignSafeLogo({
  linkToHome = true,
  showSubtitle = true,
  size = "sm",
  className = "",
}: SignSafeLogoProps) {
  const { t } = useLanguage();
  const s = sizeClasses[size];

  const icon = (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white ${s.box}`}
      aria-hidden
    >
      <svg
        className={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Shield outline */}
        <path d="M12 2.25L20 5.75v6.25c0 5-8 9.25-8 9.25S4 17 4 12V5.75l8-3.5z" />
        {/* Checkmark inside shield */}
        <path d="M8.25 12.2l3.2 3.2 5.1-6.4" />
      </svg>
    </div>
  );

  const wordmark = (
    <span className={`font-bold tracking-tight text-gray-900 ${s.wordmark}`}>{t("appName")}</span>
  );

  const subtitle = (
    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
      {t("badgeAIPowered")}
    </span>
  );

  const content = (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        {icon}
        {wordmark}
      </div>
      {showSubtitle && subtitle}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex flex-col gap-0.5">
        {content}
      </Link>
    );
  }
  return content;
}
