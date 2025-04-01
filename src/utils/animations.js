// Shared animation variants for consistent animations across components
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1,
      duration: 0.5
    }
  }
};

// Page transition variants
export const pageTransition = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Stagger container for list items
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Hover animations for interactive elements
export const hoverScale = {
  scale: 1.05,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
};

// Button animations
export const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  disabled: {
    opacity: 0.6,
    scale: 1,
    transition: {
      duration: 0.2
    }
  }
};

// Card hover effect
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Shimmer effect for loading states
export const shimmer = {
  hidden: {
    x: "-100%",
    opacity: 0
  },
  visible: {
    x: "100%",
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

// Notification badge animation
export const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Modal animations
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Scroll reveal animation
export const scrollReveal = {
  hidden: {
    opacity: 0,
    y: 30,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.6
    }
  }
};

// Loading spinner animation
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Text reveal animation
export const textReveal = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Menu slide animation
export const menuSlide = {
  closed: {
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

// Parallax scroll effect
export const parallaxScroll = (yOffset) => ({
  y: yOffset,
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 30
  }
});

// Ripple effect animation
export const ripple = {
  start: (custom) => ({
    scale: [1, 2],
    opacity: [0.5, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
      times: [0, 1],
      ...custom
    }
  })
}; 