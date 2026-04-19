import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const SparkleText = ({ text, className }: { text: string, className?: string }) => {
  const [sparkles, setSparkles] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles((prev) => [...prev, Date.now()].slice(-10));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {sparkles.map((id) => (
        <Sparkle key={id} />
      ))}
    </div>
  );
};

const Sparkle = () => {
  const controls = useAnimation();
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomScale = Math.random() * 0.5 + 0.5;

  useEffect(() => {
    controls.start({
      opacity: [0, 1, 0],
      scale: [0, randomScale, 0],
      x: [`${randomX}%`, `${randomX + (Math.random() - 0.5) * 10}%`],
      y: [`${randomY}%`, `${randomY + (Math.random() - 0.5) * 10}%`],
      transition: { duration: 2, ease: "easeOut" }
    });
  }, [controls]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={controls}
      className="absolute pointer-events-none z-0"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-4 h-4 text-gold fill-current drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]"
      >
        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
      </svg>
    </motion.div>
  );
};

export default SparkleText;
