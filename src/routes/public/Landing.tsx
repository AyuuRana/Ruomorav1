/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Users,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useApp } from '../../lib/AppContext';
import {
  TypingText,
  TypingTextCursor,
} from '../../components/animate-ui/primitives/texts/typing';
import { CountingNumber } from '../../components/animate-ui/primitives/texts/counting-number';
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '../../components/animate-ui/components/animate/avatar-group';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { ReviewsMarquee } from '../../components/ReviewsMarquee';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const handleTryDemo = () => {
    login('demo@ruomora.app', 'Alex Morgan');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-50/60 blur-3xl -z-10 rounded-full pointer-events-none"></div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto mb-6 min-h-[2.4em] sm:min-h-[2.2em]">
            <TypingText
              delay={40}
              holdDelay={3500}
              loop={false}
              text="Never Forget a Quote Follow-Up Again."
            >
              <TypingTextCursor className="h-[0.9em] w-1 sm:w-1.5 rounded-full ml-1 bg-indigo-600 inline-block align-baseline" />
            </TypingText>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-8">
            The focused tracker for freelancers and small service businesses. Record quotes, track follow-up dates, and message leads on WhatsApp in seconds.
          </p>

          {/* Social Proof & Active User Activity */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <AvatarGroup>
              <Avatar className="size-9 border-2 border-white shadow-xs">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Sarah Jenkins" />
                <AvatarGroupTooltip>Sarah Jenkins</AvatarGroupTooltip>
              </Avatar>
              <Avatar className="size-9 border-2 border-white shadow-xs">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="Alex Morgan" />
                <AvatarGroupTooltip>Alex Morgan</AvatarGroupTooltip>
              </Avatar>
              <Avatar className="size-9 border-2 border-white shadow-xs">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" alt="Priya Sharma" />
                <AvatarGroupTooltip>Priya Sharma</AvatarGroupTooltip>
              </Avatar>
              <Avatar className="size-9 border-2 border-white shadow-xs">
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces" alt="David Chen" />
                <AvatarGroupTooltip>David Chen</AvatarGroupTooltip>
              </Avatar>
            </AvatarGroup>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-800 inline-flex items-center gap-0.5">
                <CountingNumber
                  number={100}
                  fromNumber={0}
                  duration={1.8}
                  delay={0.2}
                />
                <span>+ active users</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Freelancers & Agencies tracking quotes right now</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/signup"
              id="hero-btn-start-free"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              id="hero-btn-demo"
              type="button"
              onClick={handleTryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-base transition-colors cursor-pointer"
            >
              <span>Explore Live Demo</span>
            </button>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="py-20 bg-slate-50/70 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-4 mb-4">
                Quotations Don't Get Rejected. They Get Forgotten.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                You spend hours preparing a detailed estimate. The client doesn’t reply right away. Then you get busy delivering work for current clients, and the quote sits forgotten.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Quotes Get Buried</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Estimates sent via email or WhatsApp get lost in client chat feeds and cluttered spreadsheets without dedicated follow-up reminders.
                </p>
              </div>

              <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Follow-Up Friction</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Composing follow-up texts and finding client numbers takes mental effort, leading to delay until the deal is already cold.
                </p>
              </div>

              <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">The Single Touch Trap</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Most deals close on the 2nd or 3rd touch. Following up once and forgetting to schedule the next date silently kills revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section (Geometric Balance 3-Step Grid) */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-4 mb-4">
                How Ruomora Keeps Deals Alive
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Zero bloat. No complex CRM setup. Just a fast loop that answers one question: <strong className="text-slate-900">What do I need to follow up with today?</strong>
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 font-bold text-base">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Add Quote</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Quickly input customer details, quote amount, quote date, and your initial follow-up date in under 30 seconds.
                </p>
              </div>

              <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 font-bold text-base">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">See Who Needs Attention</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your daily dashboard automatically highlights quotes due today and flags overdue opportunities with urgent color cues.
                </p>
              </div>

              <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 font-bold text-base">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Follow Up</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Click to open WhatsApp with a pre-filled message. Log the touch, set the next follow-up date, and close the deal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-slate-50/60 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-4 mb-4">
                Everything You Need to Win More Quotes
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Focused features engineered specifically around closing service quotes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">1-Click WhatsApp Follow-Up</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pre-filled templates referencing client name, amount, and quotation date with your business sign-off.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Repeat Follow-Up Loop</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Prompting for next follow-up dates ensures quotes never silently drop off until marked Won or Lost.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Timezone-Safe Reminders</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Evaluated in your local browser day to eliminate midnight boundary slips.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Clear 4-Stage Pipeline</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Waiting → Followed Up → Won / Lost. Distinct visibility between touched leads and closed revenue.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Instant Mobile-First Design</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Optimized for one-handed operation on mobile phones while on the go between client calls.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Zero CRM Bloat</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    No complex setups, endless forms, or unneeded enterprise features. Ready in under 1 minute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Customer Reviews Section */}
        <ReviewsMarquee />
      </main>

      <Footer />
    </div>
  );
};
