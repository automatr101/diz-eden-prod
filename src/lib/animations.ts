export const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: easeOut }
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.6 }
  },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: easeOut }
  },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: easeOut }
  },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

export const viewportOnce = { once: true, margin: "-100px" as const };
