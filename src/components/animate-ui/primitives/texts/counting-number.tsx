/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, motion, animate } from 'motion/react';

export interface CountingNumberProps {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  delay?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountingNumber: React.FC<CountingNumberProps> = ({
  number,
  fromNumber = 0,
  padStart = false,
  decimalSeparator = '.',
  decimalPlaces = 0,
  delay = 0,
  duration = 1.6,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const count = useMotionValue(fromNumber);
  const ref = useRef<HTMLSpanElement>(null);

  const formatted = useTransform(count, (latest) => {
    const fixed = latest.toFixed(decimalPlaces);
    let [integerPart, decimalPart] = fixed.split('.');
    
    if (padStart && integerPart.length < 2) {
      integerPart = integerPart.padStart(2, '0');
    }

    const value = decimalPlaces > 0 && decimalPart
      ? `${integerPart}${decimalSeparator}${decimalPart}`
      : integerPart;

    return `${prefix}${value}${suffix}`;
  });

  useEffect(() => {
    const delayInSeconds = delay > 10 ? delay / 1000 : delay;
    const controls = animate(count, number, {
      duration,
      delay: delayInSeconds,
      ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out
    });

    return () => controls.stop();
  }, [number, fromNumber, delay, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {formatted}
    </motion.span>
  );
};
