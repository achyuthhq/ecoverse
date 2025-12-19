"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StickyScrollItem {
  title: string;
  description: string;
  content?: React.ReactNode;
}

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: StickyScrollItem[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    // Use internal scroll container so this section is self-contained
    container: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = ["#020617", "#020617", "#020617"];

  const linearGradients = [
    "linear-gradient(to bottom right, #22c55e, #16a34a)",
    "linear-gradient(to bottom right, #22c55e, #10b981)",
    "linear-gradient(to bottom right, #22c55e, #4ade80)",
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0]
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[26rem] justify-center space-x-10 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl"
      ref={ref}
    >
      <div className="relative flex items-start px-2 sm:px-4">
        <div className="max-w-xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-16">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-base sm:text-lg font-semibold text-emerald-100"
              >
                {item.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="mt-4 max-w-sm text-xs sm:text-sm text-emerald-50/80"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-24" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-8 hidden h-56 w-72 overflow-hidden rounded-2xl bg-white/10 shadow-xl lg:block",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};




