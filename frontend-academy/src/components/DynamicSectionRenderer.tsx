'use client';

import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import CoursesSection from './sections/CoursesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FaqSection from './sections/FaqSection';
import CtaSection from './sections/CtaSection';

interface PageSection {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  visible: boolean;
}

interface DynamicSectionRendererProps {
  sections: PageSection[];
  tenantSlug: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function DynamicSectionRenderer({
  sections,
  tenantSlug,
  primaryColor,
  secondaryColor,
}: DynamicSectionRendererProps) {
  // Sort sections by order
  const sortedSections = [...sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: PageSection) => {
    const commonProps = {
      tenantSlug,
      primaryColor,
      secondaryColor,
    };

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={section.id}
            {...section.props}
            {...commonProps}
          />
        );

      case 'features':
        return (
          <FeaturesSection
            key={section.id}
            {...section.props}
          />
        );

      case 'courses':
        return (
          <CoursesSection
            key={section.id}
            {...section.props}
            {...commonProps}
          />
        );

      case 'testimonials':
        return (
          <TestimonialsSection
            key={section.id}
            {...section.props}
          />
        );

      case 'faq':
        return (
          <FaqSection
            key={section.id}
            {...section.props}
          />
        );

      case 'cta':
        return (
          <CtaSection
            key={section.id}
            {...section.props}
            {...commonProps}
          />
        );

      default:
        console.warn(`Unknown section type: ${section.type}`);
        return null;
    }
  };

  return (
    <div>
      {sortedSections.map((section) => renderSection(section))}
    </div>
  );
}
