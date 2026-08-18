/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';

export interface TypingTextProps {
  text?: string;
  children?: ReactNode;
  delay?: number;
  holdDelay?: number;
  duration?: number;
  loop?: boolean;
  className?: string;
  as?: React.ElementType;
}

export interface TypingTextCursorProps {
  className?: string;
}

export const TypingTextCursor: React.FC<TypingTextCursorProps> = ({ className = '' }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={`inline-block align-middle bg-indigo-600 ${className || 'h-[1em] w-[3px] rounded-full ml-1'}`}
      aria-hidden="true"
    />
  );
};

export const TypingText: React.FC<TypingTextProps> = ({
  text = '',
  children,
  delay = 50,
  holdDelay = 2000,
  loop = false,
  className = '',
  as: Component = 'span',
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedLength < text.length) {
        timeout = setTimeout(() => {
          setDisplayedLength((prev) => prev + 1);
        }, delay);
      } else if (loop) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, holdDelay);
      }
    } else {
      if (displayedLength > 0) {
        timeout = setTimeout(() => {
          setDisplayedLength((prev) => prev - 1);
        }, delay / 2);
      } else {
        setIsDeleting(false);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedLength, isDeleting, text, delay, holdDelay, loop]);

  // Support segmented rendering with "Follow-Up" highlighted if present in text
  const renderTypedContent = () => {
    if (!text) return null;

    const fullText = text;
    const currentSubstr = fullText.slice(0, displayedLength);

    const highlightTarget = 'Follow-Up';
    const highlightIndex = fullText.indexOf(highlightTarget);

    if (highlightIndex === -1) {
      return <span>{currentSubstr}</span>;
    }

    const part1End = highlightIndex;
    const part2End = highlightIndex + highlightTarget.length;

    const part1 = currentSubstr.slice(0, part1End);
    const part2 = displayedLength > part1End ? currentSubstr.slice(part1End, part2End) : '';
    const part3 = displayedLength > part2End ? currentSubstr.slice(part2End) : '';

    return (
      <>
        {part1}
        {part2 && <span className="text-indigo-600">{part2}</span>}
        {part3}
      </>
    );
  };

  return (
    <Component className={className}>
      {renderTypedContent()}
      {children}
    </Component>
  );
};
