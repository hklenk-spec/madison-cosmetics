import React from 'react';

interface FormSectionProps {
  nr: string;
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ nr, title, children }) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 mb-8 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-50">
        {/* Step Number in luxury Serif style */}
        <span className="w-9 h-9 rounded-full bg-madison-dark text-white text-sm flex items-center justify-center font-zilla font-bold flex-shrink-0 shadow-sm border border-madison-gold/20">
          {nr}
        </span>
        {/* Step Title in serif font */}
        <h2 className="text-xl font-zilla font-semibold tracking-wide text-madison-charcoal">
          {title}
        </h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
};
