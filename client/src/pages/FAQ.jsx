import { Link } from 'react-router-dom';
import PageCTA from '../components/PageCTA';

const faqs = [
  {
    q: 'What services do you offer?',
    a: 'We offer organization setup, software & app development, infrastructure & cloud, security & compliance, automation & AI, IT support & maintenance, and consulting & strategy.',
  },
  {
    q: 'How do I get started?',
    a: 'Reach out via our Contact page or email. We\'ll schedule a call to understand your goals and outline next steps.',
  },
  {
    q: 'Do you work with startups?',
    a: 'Yes. We work with startups, SMBs, and enterprises across industries and geographies.',
  },
  {
    q: 'What is your typical timeline?',
    a: 'Timelines depend on scope. We provide a clear project plan and milestones after our initial discussion.',
  },
];

export default function FAQ() {
  return (
    <div className="overflow-x-hidden bg-white">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary-950 mb-6">
            FAQ
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Frequently asked questions about working with Rastogi Codeworks.
          </p>
        </div>
      </section>
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="space-y-8">
          {faqs.map(({ q, a }, i) => (
            <li key={i} className="border-b border-primary-100 pb-8 last:border-0">
              <h2 className="text-lg font-semibold text-primary-950 mb-2">{q}</h2>
              <p className="text-slate-600 leading-relaxed">{a}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Link to="/contact" className="text-primary-600 font-semibold hover:underline">
            Still have questions? Contact us →
          </Link>
        </div>
      </section>
      <PageCTA badge="Get started" title="Ready to move forward?" subtitle="Tell us about your project and we'll take it from there." />
    </div>
  );
}
