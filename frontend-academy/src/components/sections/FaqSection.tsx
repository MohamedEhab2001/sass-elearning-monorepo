'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
  backgroundColor?: string;
}

export default function FaqSection({
  title = 'الأسئلة الشائعة',
  subtitle,
  faqs,
  backgroundColor = 'bg-gray-50',
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-16 md:py-24 ${backgroundColor}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
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

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-lg pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-6 w-6 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  style={{ color: `rgb(var(--color-primary))` }}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
