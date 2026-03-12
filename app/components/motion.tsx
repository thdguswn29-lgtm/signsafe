"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

type MotionWrapProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function MotionReveal({ children, className, delay = 0, y = 16 }: MotionWrapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

type MotionCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionCard({ children, className, delay = 0 }: MotionCardProps) {
  return (
    <MotionReveal delay={delay} className={className}>
      <motion.div
        whileHover={{ y: -3, boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)" }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.4 }}
      >
        {children}
      </motion.div>
    </MotionReveal>
  );
}

type MotionButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export function MotionButton({
  children,
  className,
  onClick,
  disabled,
  type = "button",
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedNumber({
  value,
  className,
  duration = 0.8,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [motionValue, value, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
