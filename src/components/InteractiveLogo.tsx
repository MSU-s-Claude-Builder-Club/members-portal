import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * The hero's demo-register element: a small bordered "window" whose only
 * content is live rendered proof — the floating Claude logo. Chrome is
 * hatched, hairlined, and mono; the color inside is the evidence.
 */
const InteractiveLogo = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Wobbly floating animation with randomized values
  const floatingVariants = {
    floating: {
      y: [0, -10, -6, -12, -8, 0],
      x: [0, 3, -2, 4, -3, 0],
      rotate: [0, 1.5, -1, 2, -1.5, 0],
    },
  };

  const handleClick = () => {
    navigate("/auth#login");
  };

  return (
    <div className="flex justify-center">
      <motion.div
        className="group relative w-[240px] cursor-pointer border border-border bg-page transition-colors duration-200 hover:border-primary motion-reduce:transition-none md:w-[280px]"
        onClick={handleClick}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        {/* Window chrome */}
        <div className="hatch flex h-[30px] items-center gap-1.5 border-b border-border px-3 transition-colors duration-200 group-hover:border-primary motion-reduce:transition-none">
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            claude-logo.png
          </span>
        </div>

        {/* The demo: live rendered proof */}
        <div className="flex items-center justify-center px-8 py-10">
          <motion.div
            className="h-28 w-28 md:h-36 md:w-36"
            variants={floatingVariants}
            animate={shouldReduceMotion ? undefined : "floating"}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src="/claude-logo.png"
              alt="Claude Logo"
              className="h-full w-full object-contain"
            />
          </motion.div>
        </div>

        {/* Status line — visible by default, floods orange on hover */}
        <div className="border-t border-border px-3 py-2 text-center transition-colors duration-200 group-hover:border-primary group-hover:bg-primary motion-reduce:transition-none">
          <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground motion-reduce:transition-none">
            Click to login
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveLogo;
