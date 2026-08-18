/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useId,
  useRef,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HighlightContextType {
  activeValue: string | null;
  setActiveValue: (val: string | null) => void;
  hoveredValue: string | null;
  setHoveredValue: (val: string | null) => void;
  layoutId: string;
  className?: string;
  mode: 'children' | 'parent';
  hover: boolean;
}

const HighlightContext = createContext<HighlightContextType | null>(null);

export interface HighlightProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  className?: string;
  containerClassName?: string;
  mode?: 'children' | 'parent';
  exitDelay?: number;
  hover?: boolean;
  layoutId?: string;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
  className = 'rounded-full bg-indigo-50 inset-0',
  containerClassName = '',
  mode = 'children',
  exitDelay = 200,
  hover = true,
  layoutId: customLayoutId,
}) => {
  const generatedId = useId();
  const layoutId = customLayoutId || `highlight-${generatedId}`;
  
  const [internalValue, setInternalValue] = useState<string | null>(
    value !== undefined ? value : defaultValue || null
  );
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleSetActive = (val: string | null) => {
    if (val !== null) {
      if (value === undefined) {
        setInternalValue(val);
      }
      onValueChange?.(val);
    }
  };

  const handleSetHovered = (val: string | null) => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (val === null && exitDelay > 0) {
      exitTimeoutRef.current = setTimeout(() => {
        setHoveredValue(null);
      }, exitDelay);
    } else {
      setHoveredValue(val);
    }
  };

  const activeValue = internalValue;
  const currentHighlight = hoveredValue !== null && hover ? hoveredValue : activeValue;

  return (
    <HighlightContext.Provider
      value={{
        activeValue: currentHighlight,
        setActiveValue: handleSetActive,
        hoveredValue,
        setHoveredValue: handleSetHovered,
        layoutId,
        className,
        mode,
        hover,
      }}
    >
      <div className={`relative ${containerClassName}`}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          const childValue =
            (child.props as any)['data-value'] ||
            (child.props as any).value ||
            (child.props as any).id;

          if (!childValue) return child;

          const isActive = currentHighlight === childValue;
          const isSelected = activeValue === childValue;

          return React.cloneElement(child as React.ReactElement<any>, {
            'data-active': isSelected,
            'data-highlighted': isActive,
            className: `${(child.props as any).className || ''} relative z-10`,
            onMouseEnter: (e: React.MouseEvent) => {
              (child.props as any).onMouseEnter?.(e);
              if (hover) {
                handleSetHovered(childValue);
              }
            },
            onMouseLeave: (e: React.MouseEvent) => {
              (child.props as any).onMouseLeave?.(e);
              if (hover) {
                handleSetHovered(null);
              }
            },
            onClick: (e: React.MouseEvent) => {
              (child.props as any).onClick?.(e);
              handleSetActive(childValue);
            },
            children: (
              <>
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className={`absolute -z-10 pointer-events-none ${className}`}
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                      mass: 0.8,
                    }}
                  />
                )}
                {(child.props as any).children}
              </>
            ),
          });
        })}
      </div>
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a Highlight provider');
  }
  return context;
};
