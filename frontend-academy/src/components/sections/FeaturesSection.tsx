'use client';

import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface Feature {
  icon: string; // Icon name from lucide-react
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  backgroundColor?: string;
  columns?: 2 | 3 | 4;
}

export default function FeaturesSection({
  title = 'مميزاتنا',
  subtitle,
  features,
  backgroundColor = 'bg-white',
  columns = 3,
}: FeaturesSectionProps) {
  const getIcon = (iconName: string): LucideIcon => {
    // @ts-ignore
    return Icons[iconName] || Icons.Star;
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={`py-16 md:py-24 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {subtitle && (
              <p className="text-sm font-semibold mb-2" style={{ color: `rgb(var(--color-primary))` }}>
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className={`grid ${gridCols[columns]} gap-8`}>
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon);

            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl transition-all hover:shadow-lg hover:scale-105"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                  }}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
