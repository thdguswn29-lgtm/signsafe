export function RiskScoreRing({ score }: { score: number }) {
  const safety = Math.max(0, 100 - score);
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (safety / 100) * circumference;

  return (
    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={safety >= 70 ? "#22c55e" : safety >= 40 ? "#eab308" : "#ef4444"}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - strokeDash}
      />
    </svg>
  );
}
