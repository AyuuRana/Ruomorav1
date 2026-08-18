/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { buildWhatsAppLink, buildFollowUpMessage } from '../lib/whatsapp';
import { isValidPhone } from '../lib/validation';

interface WhatsAppButtonProps {
  customerName: string;
  phone: string;
  amount: number;
  quoteDate: string;
  businessName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'subtle';
  className?: string;
  showInlineWarning?: boolean;
  onBeforeOpen?: () => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  customerName,
  phone,
  amount,
  quoteDate,
  businessName,
  size = 'md',
  variant = 'primary',
  className = '',
  showInlineWarning = false,
  onBeforeOpen,
}) => {
  const [showInvalidTip, setShowInvalidTip] = useState(false);
  const isPhoneValid = isValidPhone(phone);

  const handleClick = (e: React.MouseEvent) => {
    if (!isPhoneValid) {
      e.preventDefault();
      setShowInvalidTip(true);
      setTimeout(() => setShowInvalidTip(false), 3500);
      return;
    }

    if (onBeforeOpen) {
      onBeforeOpen();
    }

    const message = buildFollowUpMessage(customerName, amount, quoteDate, businessName);
    const link = buildWhatsAppLink(phone, message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm font-semibold',
    outline:
      'border border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white font-semibold',
    subtle:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium',
  };

  return (
    <div className="relative inline-flex flex-col items-start gap-1">
      <button
        id={`btn-whatsapp-${phone.replace(/\D/g, '') || 'action'}`}
        type="button"
        onClick={handleClick}
        disabled={!isPhoneValid}
        aria-label={`Open WhatsApp to follow up with ${customerName}`}
        className={`inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <MessageCircle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>Open WhatsApp</span>
        <ExternalLink className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 opacity-70'} />
      </button>

      {!isPhoneValid && (showInlineWarning || showInvalidTip) && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Phone number is too short or invalid for WhatsApp.</span>
        </div>
      )}
    </div>
  );
};
