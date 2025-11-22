'use client';

import { Star, Quote } from 'lucide-react';

export interface Testimonial {
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  text: string;
}

export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  backgroundColor?: string;
}

export default function TestimonialsSection({
  title = 'آراء طلابنا',
  subtitle,
  testimonials,
  backgroundColor = 'bg-white',
}: TestimonialsSectionProps) {
  return (
    <section className={`py-16 md:py-24 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 relative transition-all hover:shadow-xl"
            >
              {/* Quote Icon */}
              <div
                className="absolute top-6 left-6 opacity-10"
              >
                <Quote className="h-12 w-12" style={{ color: `rgb(var(--color-primary))` }} />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 relative z-10">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                    }}
                  >
                    {testimonial.name[0]}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
