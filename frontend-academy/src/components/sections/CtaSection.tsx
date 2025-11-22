'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface CtaSectionProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  tenantSlug: string;
}

export default function CtaSection({
  title,
  description,
  buttonText = 'ابدأ الآن',
  buttonLink,
  backgroundImage,
  backgroundColor,
  textColor = 'white',
  tenantSlug,
}: CtaSectionProps) {
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : backgroundColor
    ? { backgroundColor }
    : {
        background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
      };

  const textColorClass = textColor === 'dark' ? 'text-gray-900' : 'text-white';

  return (
    <section
      className="py-16 md:py-20"
      style={bgStyle}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${textColorClass}`}>
            {title}
          </h2>

          {description && (
            <p className={`text-lg md:text-xl mb-8 ${textColorClass} opacity-90 max-w-3xl mx-auto`}>
              {description}
            </p>
          )}

          {buttonLink && (
            <Link
              href={buttonLink.startsWith('/') ? `/a/${tenantSlug}${buttonLink}` : buttonLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-xl hover:scale-105 bg-white text-gray-900"
            >
              {buttonText}
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
