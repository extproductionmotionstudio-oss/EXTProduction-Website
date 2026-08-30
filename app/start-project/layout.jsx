export const metadata = {
  title: 'Book Your Project | EXTProduction Motion Design Studio',
  description: 'Submit your motion design, product demo, or 3D animation project to EXTProduction. Get a dedicated onboarding call, fast turnaround, and 2 rounds of revisions.',
  alternates: {
    canonical: 'https://extproduction.com/start-project',
  },
  openGraph: {
    title: 'Book Your Project | EXTProduction Motion Design Studio',
    description: 'Submit your motion design, product demo, or 3D animation project to EXTProduction. Fast turnaround and high-converting video production.',
    url: 'https://extproduction.com/start-project',
    siteName: 'EXTProduction',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Book Your Project with EXTProduction',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Project | EXTProduction Motion Design Studio',
    description: 'Submit your motion design, product demo, or 3D animation project to EXTProduction.',
    images: ['/logo.jpg'],
  },
};

export default function StartProjectLayout({ children }) {
  return children;
}
