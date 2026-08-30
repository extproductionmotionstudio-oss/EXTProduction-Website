import './globals.css';
import SmoothScroll from '../components/SmoothScroll';
import CustomCursor from '../components/CustomCursor';

const siteUrl = 'https://extproduction.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EXTProduction | High-Converting Motion Films for SaaS, AI & Fintech',
    template: '%s | EXTProduction',
  },
  description:
    'EXTProduction is a leading motion design studio for ambitious SaaS, AI, and fintech companies. From product demos to launch films, keynotes, and explainers, we turn ideas into visual experiences built to capture attention and drive conversions.',
  keywords: [
    'EXTProduction',
    'extproduction.com',
    'motion design studio',
    'SaaS product video',
    'fintech motion graphics',
    'AI product demo',
    '3D product animation',
    'product launch video',
    'keynote video production',
    'explainer video agency',
    'B2B tech motion design',
    'animated product ads',
    'high-converting motion films',
    'motion graphics studio',
    'tech commercial video production',
    'startup video production'
  ],
  authors: [{ name: 'EXTProduction', url: siteUrl }],
  creator: 'EXTProduction',
  publisher: 'EXTProduction',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'EXTProduction | High-Converting Motion Films for SaaS, AI & Fintech',
    description:
      'Leading motion design studio crafting high-converting product demos, launch videos, 3D animations, and brand films for high-growth tech companies.',
    url: siteUrl,
    siteName: 'EXTProduction',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'EXTProduction Motion Design Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXTProduction | High-Converting Motion Films for SaaS, AI & Fintech',
    description:
      'Leading motion design studio crafting high-converting product demos, launch videos, 3D animations, and brand films for high-growth tech companies.',
    images: ['/logo.jpg'],
    creator: '@extproduction',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'EXTProduction',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`,
        caption: 'EXTProduction Logo',
      },
      description:
        'Leading motion design studio working with startups, SaaS, AI, and fintech companies to produce high-converting motion films, 3D product demos, launch videos, and ads.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'EXTProduction',
      description: 'High-Converting Motion Films for SaaS, AI & Fintech',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#service`,
      name: 'EXTProduction',
      image: `${siteUrl}/logo.jpg`,
      url: siteUrl,
      priceRange: '$$$$',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'Worldwide',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Worldwide',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Motion Design & Video Production Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'SaaS Product Demo Videos',
              description: 'Clear, engaging product demos that showcase your software features and convert users.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Product Launch & Keynote Films',
              description: 'Cinematic, high-energy launch films crafted to build hype and drive conversions.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '3D Motion Design & Animation',
              description: 'Photorealistic 3D device mockups, dynamic camera moves, and sleek visual effects.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Fintech & AI Explainer Videos',
              description: 'Simplifying complex financial and AI workflows into compelling visual stories.',
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body>
        <CustomCursor />
        {/* Background Elements */}
        <div className="gradient-bg">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
