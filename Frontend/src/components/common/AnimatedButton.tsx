import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
