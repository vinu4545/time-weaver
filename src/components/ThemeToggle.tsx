import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.svg
            key="moon"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="hsl(38, 85%, 55%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="hsl(38, 85%, 55%, 0.2)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.circle cx="12" cy="12" r="5" stroke="hsl(30, 80%, 35%)" strokeWidth="2" fill="hsl(38, 85%, 55%, 0.3)"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 12 + Math.cos(rad) * 8;
              const y1 = 12 + Math.sin(rad) * 8;
              const x2 = 12 + Math.cos(rad) * 10;
              const y2 = 12 + Math.sin(rad) * 10;
              return (
                <motion.line
                  key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(30, 80%, 35%)" strokeWidth="2" strokeLinecap="round"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
