'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  tenantSlug: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryButtonText = 'ابدأ الآن',
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage,
  backgroundColor,
  textColor = 'white',
  tenantSlug,
  primaryColor,
  secondaryColor,
}: HeroSectionProps) {
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
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
      className="relative py-20 md:py-32"
      style={bgStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {subtitle && (
            <p className={`text-sm md:text-base font-semibold mb-4 ${textColorClass} opacity-90`}>
              {subtitle}
            </p>
          )}

          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${textColorClass}`}
          >
            {title}
          </h1>

          {description && (
            <p className={`text-lg md:text-xl mb-10 ${textColorClass} opacity-90 leading-relaxed`}>
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryButtonLink && (
              <Link
                href={primaryButtonLink.startsWith('/') ? `/a/${tenantSlug}${primaryButtonLink}` : primaryButtonLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
                style={{
                  background: primaryColor && secondaryColor
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                    : `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                {primaryButtonText}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}

            {secondaryButtonLink && secondaryButtonText && (
              <Link
                href={secondaryButtonLink.startsWith('/') ? `/a/${tenantSlug}${secondaryButtonLink}` : secondaryButtonLink}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                  textColor === 'dark'
                    ? 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-gray-900'
                }`}
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
