import { Link } from 'react-router-dom';
import PageCTA from '../components/PageCTA';
import SEO from '../components/SEO';

export default function CaseStudies() {
  return (
    <div className="overflow-x-hidden bg-white">
      <SEO
        title="Case Studies"
        description="Real projects, real results. See how Rastogi Codeworks helps businesses ship and scale with software development and digital solutions."
        path="/case-studies"
      />
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary-950 mb-6">
            Case Studies
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real projects, real results. See how we help businesses ship and scale.
          </p>
        </div>
      </section>
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-slate-600 leading-relaxed mb-8">
          Detailed case studies are coming soon. In the meantime, explore our selected work on the homepage.
        </p>
        <Link to="/" className="text-primary-600 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </section>
      <PageCTA badge="Your project" title="Want similar results?" subtitle="Tell us about your goals and we'll outline how we can help." />
    </div>
  );
}
