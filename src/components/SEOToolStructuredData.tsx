import React from 'react';

interface Tool {
  _id: string;
  name: string;
  tagline?: string;
  summary?: string;
  url: string;
  category: string;
  tags: string[];
  screenshot?: string;
  rating?: number;
  featured?: boolean;
}

interface SEOToolStructuredDataProps {
  tool: Tool;
}

export const SEOToolStructuredData: React.FC<SEOToolStructuredDataProps> = ({ tool }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.tagline || tool.summary || `${tool.name} - AI Tool`,
    "url": tool.url,
    "applicationCategory": tool.category,
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "ratingCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "screenshot": tool.screenshot ? {
      "@type": "ImageObject",
      "url": tool.screenshot,
      "name": `${tool.name} Screenshot`,
      "description": `Screenshot of ${tool.name} - ${tool.tagline || 'AI Tool'}`,
      "contentUrl": tool.screenshot,
      "thumbnailUrl": tool.screenshot,
      "encodingFormat": "image/png",
      "width": "1200",
      "height": "630"
    } : undefined,
    "keywords": tool.tags.join(", "),
    "publisher": {
      "@type": "Organization",
      "name": "TrendiTools",
      "url": "https://trenditools.com"
    }
  };

  // Remove undefined properties
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

  const pageTitle = `${tool.name} - ${tool.tagline || 'AI Tool'} | TrendiTools`;
  const pageDescription = tool.summary || tool.tagline || `Discover ${tool.name}, an innovative AI tool in the ${tool.category} category. View screenshots, features, and more on TrendiTools.`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={`${tool.name}, ${tool.tags.join(', ')}, AI tools, ${tool.category}`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {tool.screenshot && (
        <>
          <meta property="og:image" content={tool.screenshot} />
          <meta property="og:image:alt" content={`${tool.name} - ${tool.tagline || 'Screenshot'}`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      {tool.screenshot && (
        <>
          <meta property="twitter:image" content={tool.screenshot} />
          <meta property="twitter:image:alt" content={`${tool.name} - ${tool.tagline || 'Screenshot'}`} />
        </>
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(cleanStructuredData, null, 2)}
      </script>
    </>
  );
};

export default SEOToolStructuredData;