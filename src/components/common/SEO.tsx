import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRANDING } from '../../config/env';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  isPrivate?: boolean;
  keywords?: string[];
  ogImage?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'ExaNova is a smart college examination and assessment platform for secure online examinations, MCQ and descriptive assessments, evaluation, and result management.',
  canonical,
  isPrivate = false,
  keywords = [
    'College Online Examination Portal',
    'Online Examination Management System',
    'College Assessment System',
    'MCQ Examination Software',
    'Descriptive Examination Management',
    'Online Student Examination Portal',
    'Faculty Examination Management System',
    'Digital Examination and Result Management',
    'ExaNova',
    'Techno Main Salt Lake',
  ],
  ogImage = '/logo.png',
}) => {
  const fullTitle = title
    ? `${title} | ${BRANDING.appName}`
    : `${BRANDING.appName} | ${BRANDING.fullName}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;

  // JSON-LD schema for Educational Organization (only authorized details)
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: BRANDING.organization,
    alternateName: BRANDING.appName,
    url: 'https://exanova.edu',
    email: BRANDING.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'EM-4/1, EM Block, Sector V',
      addressLocality: 'Bidhannagar, Kolkata',
      addressRegion: 'West Bengal',
      postalCode: '700091',
      addressCountry: 'India',
    },
    founder: {
      '@type': 'Person',
      name: BRANDING.developer,
      sameAs: BRANDING.github,
    },
    description: BRANDING.fullName,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="theme-color" content={BRANDING.colors.primary} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Robots Directive */}
      {isPrivate ? (
        <meta name="robots" content="noindex, nofollow, noarchive" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      {ogImage && <meta property="twitter:image" content={ogImage} />}

      {/* Structured Data (Public Pages only) */}
      {!isPrivate && (
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      )}
    </Helmet>
  );
};
