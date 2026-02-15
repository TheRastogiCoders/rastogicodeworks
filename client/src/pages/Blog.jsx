import { Link } from 'react-router-dom';
import PageCTA from '../components/PageCTA';
import SEO from '../components/SEO';

export default function Blog() {
  return (
    <div className="overflow-x-hidden bg-white">
      <SEO
        title="Blog"
        description="Insights on software development, technology trends, and building products that scale. Rastogi Codeworks blog - coming soon."
        path="/blog"
      />
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary-950 mb-6">
            Blog
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Insights on software development, technology trends, and building products that scale.
          </p>
        </div>
      </section>
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-slate-600 leading-relaxed mb-8">
          Our blog is coming soon. We'll share articles on custom software development, best practices, and industry updates.
        </p>
        <Link to="/" className="text-primary-600 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </section>
      <PageCTA badge="Stay updated" title="Ready to build something?" subtitle="Get in touch for a conversation about your project." />
    </div>
  );
}
