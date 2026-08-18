/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  className = '',
  alt = 'Avatar',
  referrerPolicy = 'no-referrer',
  ...props
}) => {
  return (
    <img
      className={`aspect-square h-full w-full rounded-full object-cover ${className}`}
      alt={alt}
      referrerPolicy={referrerPolicy}
      {...props}
    />
  );
};

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 text-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
