import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable CTA section  -  same design on all pages, content via props.
 * Green gradient container, white text, white pill button.
 */
export default function PageCTA({ badge, title, subtitle, buttonText = 'Get in touch', to = '/contact' }) {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-20" style={{ animationDelay: '1s' }} />
          <div className="relative z-10">
            {badge && (
              <p className="text-sm font-semibold text-primary-200 uppercase tracking-widest mb-6">
                {badge}
              </p>
            )}
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-balance">
              {title}
            </h2>
            <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 text-pretty">
              {subtitle}
            </p>
            <Link
              to={to}
              className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-white text-primary-800 font-bold text-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              {buttonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
