import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { CategoryType } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { PenTool, Wind, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CategoryOption {
  id: 'kosmetikstift' | 'duefte';
  label: string;
  subLabel: string;
  description: string;
  icon: React.ReactNode;
  imageAlt: string;
}

export const CategorySelection: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory, setConfiguratorConfig } = useAppContext();
  const [selected, setSelected] = useState<CategoryType>(null);

  const categories: CategoryOption[] = [
    {
      id: 'kosmetikstift',
      label: 'Kosmetikstift',
      subLabel: 'LIP & EYE PRECISION',
      description: 'Edle Lippenstifte, Kajalstifte, Concealer-Pens und Eyeliner. Konfigurieren Sie Gehäusematerialien, Applikatoren und Texturen.',
      icon: <PenTool className="w-8 h-8 text-madison-gold" />,
      imageAlt: 'Sleek luxury eyeliner and lip liner pens'
    },
    {
      id: 'duefte',
      label: 'Düfte & Flakons',
      subLabel: 'HAUTE PARFUMERIE',
      description: 'Exklusive Parfümflakons, Sprühflaschen und edle Glas- oder Aluminiumverpackungen. Vollständige Kontrolle über Veredelung und Zerstäuber.',
      icon: <Wind className="w-8 h-8 text-madison-gold" />,
      imageAlt: 'Luxury perfume bottle with gold details'
    }
  ];

  const handleNext = () => {
    if (selected) {
      setSelectedCategory(selected);
      // Initialize configuration state with default minimum quantity of 10,000 as per logic requirements, 
      // but keeping compatibility with initial context
      setConfiguratorConfig({ menge: 10000 });
      navigate('/konfigurator');
    }
  };

  return (
    <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-open text-[10px] tracking-[0.3em] text-madison-gold uppercase font-bold mb-3 block">
            STEP 01 — KATEGORIEAUSWAHL
          </span>
          <h1 className="font-zilla text-3xl md:text-5xl font-bold tracking-tight text-madison-dark mb-4">
            Was möchten Sie verpacken?
          </h1>
          <div className="h-[1px] w-24 bg-madison-gold/40 my-4 mx-auto" />
          <p className="text-sm md:text-base text-madison-muted max-w-xl mx-auto leading-relaxed">
            Wählen Sie eine Produktkategorie aus, um mit der individuellen B2B-Konfiguration und Veredelungsauswahl zu beginnen.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {categories.map((cat) => {
            const isSelected = selected === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`group relative text-left p-8 md:p-10 rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[430px] ${
                  isSelected
                    ? 'bg-white border-madison-gold shadow-xl ring-1 ring-madison-gold/30'
                    : 'bg-white border-gray-100 hover:border-madison-gold/50 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Visual Accent Layer */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-madison-gold/5 to-transparent rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />

                <div>
                  {/* Icon & Sublabel Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 bg-madison-alabaster rounded-xl border border-gray-100 group-hover:border-madison-gold/30 transition-all duration-500">
                      {cat.icon}
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1.5 text-madison-gold text-xs font-bold tracking-wider uppercase bg-madison-gold/10 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ausgewählt</span>
                      </span>
                    )}
                  </div>

                  {/* Text Details */}
                  <span className="block font-open text-[9px] tracking-[0.25em] text-madison-gold uppercase font-bold mb-3">
                    {cat.subLabel}
                  </span>
                  <h3 className="font-zilla text-3xl font-bold tracking-wide text-madison-dark mb-5 group-hover:text-madison-gold transition-colors duration-300">
                    {cat.label}
                  </h3>
                  <p className="text-sm text-madison-muted leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                {/* Card Footer Call to Action */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-100/70 pt-8">
                  <span className="text-xs font-bold tracking-wider uppercase text-madison-muted group-hover:text-madison-dark transition-colors duration-300">
                    Konfiguration öffnen
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-madison-gold border-madison-gold text-white' 
                      : 'bg-transparent border-gray-200 text-madison-muted group-hover:border-madison-dark group-hover:text-madison-dark'
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`w-full max-w-md flex items-center justify-center gap-3 font-zilla text-base font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-500 border group ${
              selected
                ? 'bg-madison-dark border-madison-dark text-white hover:bg-madison-gold hover:border-madison-gold cursor-pointer'
                : 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Weiter zur Konfiguration</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
