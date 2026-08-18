/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', linkToHome = true }) => {
  const textSizeClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl'
      : 'text-xl';

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <span 
        className={`${textSizeClass} font-bold tracking-tight text-slate-900`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Ruomora
      </span>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" id="nav-brand-logo" className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
