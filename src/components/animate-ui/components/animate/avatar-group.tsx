/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`inline-flex items-center -space-x-3.5 ${className}`}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <AvatarGroupItemWrapper index={index}>
            {child}
          </AvatarGroupItemWrapper>
        );
      })}
    </div>
  );
};

const AvatarGroupItemWrapper: React.FC<{
  children: React.ReactElement;
  index: number;
}> = ({ children, index }) => {
  const [isActive, setIsActive] = useState(false);

  // Extract tooltip child if present
  let tooltipContent: React.ReactNode = null;
  const filteredChildren = React.Children.map(
    (children.props as any)?.children,
    (c) => {
      if (React.isValidElement(c) && (c.type as any) === AvatarGroupTooltip) {
        tooltipContent = (c.props as any).children;
        return null;
      }
      return c;
    }
  );

  return (
    <motion.div
      className="relative cursor-pointer select-none focus:outline-hidden"
      tabIndex={0}
      style={{ zIndex: isActive ? 40 : 10 + index }}
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      onClick={() => setIsActive((prev) => !prev)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      whileHover={{ scale: 1.18, y: -4 }}
      whileTap={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
    >
      {React.cloneElement(children, {
        children: filteredChildren,
      })}

      <AnimatePresence>
        {isActive && tooltipContent && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-lg pointer-events-none z-50"
          >
            {tooltipContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export interface AvatarGroupTooltipProps {
  children: React.ReactNode;
}

export const AvatarGroupTooltip: React.FC<AvatarGroupTooltipProps> = ({ children }) => {
  return <>{children}</>;
};
