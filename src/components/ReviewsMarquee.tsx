/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Marquee } from './ui/marquee';
import { cn } from '../lib/utils';
import { Star } from 'lucide-react';

export interface ReviewItem {
  name: string;
  username: string;
  body: string;
  img: string;
  role?: string;
}

const reviews: ReviewItem[] = [
  {
    name: 'Rajesh Sharma',
    username: '@rajesh_sharma',
    body: 'Ruomora stopped quotes from slipping away. The 1-click WhatsApp reminder helped us close 4 major contracts in week one.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'HVAC Contractor, Delhi',
  },
  {
    name: 'Sarah Jenkins',
    username: '@sarahj_designs',
    body: 'Zero CRM bloat. Just the exact follow-up dates I need every morning. Our response rate on design proposals doubled.',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'Interior Designer, Sydney',
  },
  {
    name: 'Aarav Patel',
    username: '@aaravpatel_co',
    body: 'The repeat follow-up prompt is gold. Quotes used to get abandoned after one follow-up—now every quotation has an active next step.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'Solar Installer, Ahmedabad',
  },
  {
    name: 'Marcus Dubois',
    username: '@marcus_cater',
    body: 'Simple, fast, and timezone-reliable. Opening WhatsApp directly with the quotation details saves my team 30 minutes daily.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    role: 'Event Caterer, Lyon',
  },
  {
    name: 'Pooja Iyer',
    username: '@pooja_consulting',
    body: 'The color-coded dashboard gives total clarity on who needs attention today. I never lose track of pending deals anymore.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    role: 'Architectural Consultant, Bengaluru',
  },
  {
    name: 'David Vance',
    username: '@vance_fabrication',
    body: 'Cleanest quotation tool we have used. No complex fields, just customer name, amount, follow-up date, and instant results.',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    role: 'Custom Metal Fabricator, Austin',
  },
  {
    name: 'Ananya Verma',
    username: '@ananya_events',
    body: 'My conversion rate went from 28% to 54% in 3 weeks. Following up on the exact day makes clients feel prioritized.',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Wedding Planner, Jaipur',
  },
  {
    name: 'Liam O’Connor',
    username: '@liam_plumbing',
    body: 'Being able to tap once and send a WhatsApp quotation follow-up directly from my phone on-site has won us so many jobs.',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    role: 'Commercial Plumbing, Dublin',
  },
];

const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

const ReviewCard: React.FC<ReviewItem> = ({
  img,
  name,
  username,
  body,
  role,
}) => {
  return (
    <figure
      className={cn(
        'relative h-full w-80 cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-200',
        'border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md hover:border-indigo-300 hover:bg-white',
        'backdrop-blur-xs'
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img
          className="rounded-full object-cover border border-slate-200 shrink-0"
          width="42"
          height="42"
          alt={name}
          src={img}
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <figcaption className="text-sm font-bold text-slate-900 truncate">
            {name}
          </figcaption>
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs text-slate-500 truncate">{username}</p>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          {role && <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">{role}</p>}
        </div>
      </div>
      <blockquote className="mt-3 text-xs leading-relaxed text-slate-600">
        "{body}"
      </blockquote>
    </figure>
  );
};

export const ReviewsMarquee: React.FC = () => {
  return (
    <section
      id="reviews"
      className="py-20 bg-slate-50/70 border-t border-slate-200/80 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          Loved by Contractors, Agencies & Freelancers
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          See how business owners across India, the US, Australia, and Europe turn pending quotes into closed revenue.
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        {/* Row 1 - Marquee */}
        <Marquee pauseOnHover className="[--duration:30s] mb-4">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        {/* Row 2 - Reverse Marquee */}
        <Marquee reverse pauseOnHover className="[--duration:32s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        {/* Left & Right Gradient Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
      </div>
    </section>
  );
};
