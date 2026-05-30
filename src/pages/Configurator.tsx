import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { ArrowRight, ArrowLeft, Check, AlertCircle, ShoppingBag, Eye, Maximize2, Minimize2, Layers, Scale, Truck, Info, Play, Pause } from 'lucide-react';
import { ThreeDVisualizer } from '../components/ThreeDVisualizer';
import { SubproductPreviewModal } from '../components/SubproductPreviewModal';

interface Option {
  value: string;
  label: string;
}

interface Step {
  key: string;
  label: string;
  type: 'radio' | 'text' | 'number' | 'multiselect';
  placeholder?: string;
  min?: number;
  step?: number;
  hint?: string;
  dependsOn?: string;
  dependsOnValue?: string;
  options?: Option[];
  optionsByParent?: Record<string, Option[]>;
  disabledByParent?: {
    parentKey: string;
    disabledValues: Record<string, string[]>;
  };
}

export const COMPONENT_SPECS: Record<string, Record<string, { neckFinish: string; label: string; desc?: string }>> = {
  flaschenvolumen: {
    '100ml': { neckFinish: 'FEA 17', label: '100 ml (Grand Flacon)', desc: 'Mündung Ø 17.0mm' },
    '75ml': { neckFinish: 'FEA 17', label: '75 ml (Maison Size)', desc: 'Mündung Ø 17.0mm' },
    '50ml': { neckFinish: 'FEA 15', label: '50 ml (Signature Size)', desc: 'Mündung Ø 15.0mm' },
    '30ml': { neckFinish: 'FEA 15', label: '30 ml (Voyage Size)', desc: 'Mündung Ø 15.0mm' },
    '5ml': { neckFinish: 'FEA 13', label: '5 ml (Echantillon Petite)', desc: 'Mündung Ø 13.0mm' }
  },
  pumpe: {
    crimpless: { neckFinish: 'FEA 15, FEA 17', label: 'Unsichtbar Crimpless', desc: 'Kragen für FEA 15 / FEA 17' },
    crimp: { neckFinish: 'FEA 15, FEA 17', label: 'Sicher Crimp', desc: 'Kragen für FEA 15 / FEA 17' },
    screw: { neckFinish: 'FEA 15, FEA 17', label: 'Schraubgewinde (Nachfüllbar)', desc: 'Gewinde für FEA 15 / FEA 17' },
    schnapp: { neckFinish: 'FEA 13, FEA 15', label: 'Schnappverschluss', desc: 'Schaft für FEA 13 / FEA 15' }
  },
  kappe: {
    pp: { neckFinish: 'FEA 13, FEA 15', label: 'Eco PP Kappe', desc: 'Schnittstelle FEA 13 / FEA 15' },
    abs: { neckFinish: 'FEA 15, FEA 17', label: 'Klassische ABS Kappe', desc: 'Schnittstelle FEA 15 / FEA 17' },
    surlyn: { neckFinish: 'FEA 15, FEA 17', label: 'Kristallklare Surlyn Kappe', desc: 'Schnittstelle FEA 15 / FEA 17' },
    zamak: { neckFinish: 'FEA 17', label: 'Schwere Zamak-Metallkappe', desc: 'Schnittstelle FEA 17' },
    aluminium: { neckFinish: 'FEA 15, FEA 17', label: 'Goldene Aluminiumkappe', desc: 'Schnittstelle FEA 15 / FEA 17' },
    holz: { neckFinish: 'FEA 17', label: 'Massives Eschenholz', desc: 'Schnittstelle FEA 17' }
  }
};

const checkTechnicalCompatibility = (
  stepKey: string,
  optionValue: string,
  currentConfig: Record<string, any>
): { compatible: boolean; reason?: string; requiredFinish?: string } => {
  // If the step key is flaschenvolumen, it is ALWAYS compatible with itself!
  if (stepKey === 'flaschenvolumen') return { compatible: true };

  if (!COMPONENT_SPECS[stepKey]) return { compatible: true };

  const selectedVolume = currentConfig.flaschenvolumen || '50ml';
  const bottleSpec = COMPONENT_SPECS.flaschenvolumen[selectedVolume];
  if (!bottleSpec) return { compatible: true };

  const targetSpec = COMPONENT_SPECS[stepKey][optionValue];
  if (!targetSpec) return { compatible: true };

  const isCompatible = targetSpec.neckFinish.includes(bottleSpec.neckFinish);

  if (!isCompatible) {
    return {
      compatible: false,
      reason: `FEA-Konflikt: Mündung ${bottleSpec.neckFinish} vs ${targetSpec.neckFinish}`,
      requiredFinish: targetSpec.neckFinish
    };
  }

  return { compatible: true };
};

interface CategoryConfig {
  label: string;
  steps: Step[];
}

const CONFIG_DATA: Record<string, CategoryConfig> = {
  kosmetikstift: {
    label: 'Kosmetikstift',
    steps: [
      {
        key: 'materialart',
        label: 'Materialart',
        type: 'radio',
        options: [
          { value: 'kunststoff', label: 'Premium Kunststoff' },
          { value: 'holz', label: 'Echtes Zedernholz' }
        ]
      },
      {
        key: 'endkappe',
        label: 'Endkappe / Applikator',
        type: 'radio',
        dependsOn: 'materialart',
        optionsByParent: {
          kunststoff: [
            { value: 'buerste', label: 'Feine Bürste' },
            { value: 'pinsel', label: 'Präziser Pinsel' },
            { value: 'roller', label: 'Metall Roller-Ball' }
          ],
          holz: [
            { value: 'metall', label: 'Vergoldete Metallkappe' },
            { value: 'ohne', label: 'Ohne Endkappe (Puristisch)' }
          ]
        }
      },
      {
        key: 'textur',
        label: 'Formel & Textur',
        type: 'radio',
        dependsOn: 'materialart',
        optionsByParent: {
          kunststoff: [
            { value: 'MGT', label: 'Matte Gel Technology (MGT)' },
            { value: 'MAA', label: 'Moisture Active Aqua (MAA)' },
            { value: 'MGL', label: 'Metallic Glow Liquid (MGL)' }
          ],
          holz: [
            { value: 'ABC', label: 'Artisan Blend Classic (ABC)' },
            { value: 'DEW', label: 'Deep Emollient Wax (DEW)' }
          ]
        }
      },
      {
        key: 'menge',
        label: 'Menge (Stück)',
        type: 'number',
        min: 10000,
        step: 500
      }
    ]
  },
  duefte: {
    label: 'Düfte & Flakons',
    steps: [
      {
        key: 'duft',
        label: 'Exklusiver Duftname',
        type: 'text',
        placeholder: 'z.B. L\'Or de Madison, Nuit Soyeuse...'
      },
      {
        key: 'flaschenvolumen',
        label: 'Flaschenvolumen',
        type: 'radio',
        options: [
          { value: '100ml', label: '100 ml (Grand Flacon)' },
          { value: '75ml', label: '75 ml (Maison Size)' },
          { value: '50ml', label: '50 ml (Signature Size)' },
          { value: '30ml', label: '30 ml (Voyage Size)' },
          { value: '5ml', label: '5 ml (Echantillon Petite)' }
        ]
      },
      {
        key: 'flaschenform',
        label: 'Flaschenform',
        type: 'radio',
        options: [
          { value: 'eckig', label: 'Schnittig Eckig (Classic)' },
          { value: 'rund', label: 'Sanft Rund (Céleste)' },
          { value: 'oval', label: 'Elegant Oval (Elixir)' },
          { value: 'antelope', label: 'Violet Antelope (Skizzen-Rekonstruktion)' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '100ml': ['eckig'],
            '50ml': ['oval'],
            '30ml': ['eckig'],
            '5ml': ['eckig', 'oval', 'antelope']
          }
        }
      },
      {
        key: 'flaschenmaterial',
        label: 'Material Flasche',
        type: 'radio',
        options: [
          { value: 'glas', label: 'Kristallglas' },
          { value: 'pet', label: 'Recyceltes PET (Eco-Luxury)' },
          { value: 'alu', label: 'Bürstbares Aluminium' },
          { value: 'petg', label: 'Kristallklares PETG' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '100ml': ['alu', 'petg'],
            '75ml': ['petg'],
            '30ml': ['glas'],
            '5ml': ['glas', 'alu']
          }
        }
      },
      {
        key: 'flaschenfarbe',
        label: 'Farbe & Veredelung Flasche',
        type: 'radio',
        options: [
          { value: 'klar', label: 'Hochtransparent Klar' },
          { value: 'lackiert', label: 'Edel Matt Lackiert' },
          { value: 'metallisiert', label: 'Gold Metallisiert' },
          { value: 'bespruht', label: 'Verlauf Besprüht' },
          { value: 'sandstrahlen', label: 'Mattiert (Sandgestrahlt)' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '100ml': ['sandstrahlen'],
            '75ml': ['metallisiert'],
            '30ml': ['lackiert', 'metallisiert'],
            '5ml': ['metallisiert', 'sandstrahlen']
          }
        }
      },
      {
        key: 'mattierungsgrad',
        label: 'Satinierungsgrad (Frosted Glass)',
        type: 'number',
        min: 0,
        step: 1,
        dependsOn: 'flaschenfarbe',
        dependsOnValue: 'sandstrahlen',
        hint: 'Stufenloser Satinierungsgrad für Kristallglas'
      },
      {
        key: 'flaschenveredelung',
        label: 'Beschriftungsart Flasche',
        type: 'radio',
        options: [
          { value: 'siebdruck', label: 'Edler Siebdruck' },
          { value: 'heissfolie', label: 'Goldene Heißfolienprägung' },
          { value: 'label', label: 'Strukturiertes Papierlabel' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '5ml': ['siebdruck', 'heissfolie'],
            '30ml': ['heissfolie']
          }
        }
      },
      {
        key: 'folienfarbe',
        label: 'Heißfolien-Farbe (Foil Color)',
        type: 'radio',
        dependsOn: 'flaschenveredelung',
        dependsOnValue: 'heissfolie',
        options: [
          { value: 'gold', label: 'Imperial Gold' },
          { value: 'silber', label: 'Sterling Silber' },
          { value: 'rose', label: 'Rose Gold Metallic' }
        ]
      },
      {
        key: 'siebdruckfarbe',
        label: 'Siebdruck-Farbe (Screen Printing Color)',
        type: 'radio',
        dependsOn: 'flaschenveredelung',
        dependsOnValue: 'siebdruck',
        options: [
          { value: 'schwarz', label: 'Satin-Schwarz' },
          { value: 'weiss', label: 'Schneeweiss' },
          { value: 'gold', label: 'Zamak-Gold' }
        ]
      },
      {
        key: 'pumpe',
        label: 'Zerstäuber & Pumpe',
        type: 'radio',
        options: [
          { value: 'crimpless', label: 'Unsichtbar Crimpless' },
          { value: 'crimp', label: 'Sicher Crimp' },
          { value: 'screw', label: 'Schraubgewinde (Nachfüllbar)' },
          { value: 'schnapp', label: 'Schnappverschluss' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '100ml': ['schnapp'],
            '50ml': ['crimp'],
            '30ml': ['crimpless'],
            '5ml': ['crimp', 'screw']
          }
        }
      },
      {
        key: 'gehaeusematerial',
        label: 'Material Pumpengehäuse',
        type: 'radio',
        options: [
          { value: 'pp', label: 'Pflanzliches PP' },
          { value: 'aluminium', label: 'Gebürstetes Aluminium' },
          { value: 'abs', label: 'Premium ABS' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '75ml': ['pp'],
            '30ml': ['aluminium'],
            '5ml': ['abs']
          }
        }
      },
      {
        key: 'ueberwurfring',
        label: 'Zierring (Überwurf)',
        type: 'radio',
        options: [
          { value: 'aluminium', label: 'Glänzendes Gold-Aluminium' },
          { value: 'abs', label: 'Stabiler ABS-Ring' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '5ml': ['abs']
          }
        }
      },
      {
        key: 'kappe',
        label: 'Verschlusskappe',
        type: 'radio',
        options: [
          { value: 'pp', label: 'Eco PP Kappe' },
          { value: 'abs', label: 'Klassische ABS Kappe' },
          { value: 'surlyn', label: 'Kristallklare Surlyn Kappe' },
          { value: 'zamak', label: 'Schwere Zamak-Metallkappe' },
          { value: 'aluminium', label: 'Goldene Aluminiumkappe' },
          { value: 'holz', label: 'Massives Eschenholz' }
        ],
        disabledByParent: {
          parentKey: 'flaschenvolumen',
          disabledValues: {
            '100ml': ['pp', 'abs'],
            '75ml': ['surlyn'],
            '30ml': ['zamak', 'holz'],
            '5ml': ['pp', 'surlyn', 'zamak', 'holz']
          }
        }
      },
      {
        key: 'kappen_finish',
        label: 'Kappen-Finish',
        type: 'radio',
        dependsOn: 'kappe',
        options: [
          { value: 'poliert', label: 'Mirror Polish (Spiegelpoliert)' },
          { value: 'gebuerstet', label: 'Brushed Silk (Matt gebürstet)' }
        ]
      },
      {
        key: 'faltschachtel',
        label: 'Exklusive Faltschachtel',
        type: 'radio',
        options: [
          { value: 'ja', label: 'Ja, inklusive Luxuskartonage' },
          { value: 'nein', label: 'Nein, nur der Flakon' }
        ]
      },
      {
        key: 'verpackungsmaterial',
        label: 'Material der Schachtel',
        type: 'radio',
        dependsOn: 'faltschachtel',
        dependsOnValue: 'ja',
        options: [
          { value: 'karton', label: 'Premium Naturkarton' },
          { value: 'papier', label: 'Japanisches Seidenpapier auf Karton' },
          { value: 'rigidboard', label: 'Rigid-Box (Stabiles Hardcover)' }
        ]
      },
      {
        key: 'dekoration',
        label: 'Veredelung der Schachtel',
        type: 'multiselect',
        dependsOn: 'faltschachtel',
        dependsOnValue: 'ja',
        hint: 'Mehrfachauswahl möglich',
        options: [
          { value: 'mattgloss', label: 'Matt- & Glanzlackierung' },
          { value: 'spotuv', label: 'Spot-UV-Lack' },
          { value: 'tampondruck', label: 'Präziser Tampondruck' },
          { value: 'heissfolie', label: 'Goldene Heißfolie' },
          { value: 'emboss', label: 'Edle Blindprägung (Emboss/Deboss)' }
        ]
      },
      {
        key: 'menge',
        label: 'Menge (Stück)',
        type: 'number',
        min: 10000,
        step: 500
      }
    ]
  }
};
const renderOptionThumbnail = (stepKey: string, value: string, isSelected: boolean) => {
  const selectedBorder = isSelected ? 'border-madison-gold/45 bg-white/5' : 'border-gray-150 bg-gray-50/50';
  
  // Outer container
  const containerClass = `w-full h-24 flex items-center justify-center rounded-lg border overflow-hidden mb-3.5 transition-all duration-300 relative ${selectedBorder}`;

  // Helper for rendering various options
  switch (stepKey) {
    case 'flaschenvolumen': {
      // SVGs representing bottle sizes
      let height = 'h-16';
      let width = 'w-10';
      let title = '50ml';
      if (value === '100ml') { height = 'h-20'; width = 'w-14'; title = '100ml'; }
      else if (value === '75ml') { height = 'h-18'; width = 'w-12'; title = '75ml'; }
      else if (value === '30ml') { height = 'h-14'; width = 'w-8'; title = '30ml'; }
      else if (value === '5ml') { height = 'h-9'; width = 'w-5'; title = '5ml'; }

      return (
        <div className={containerClass}>
          <div className="flex flex-col items-center justify-end h-full pb-2">
            {/* The bottle shape */}
            <div className={`${width} ${height} rounded-md border-2 ${isSelected ? 'border-madison-gold bg-madison-gold/15' : 'border-madison-dark/40 bg-white'} relative flex flex-col items-center shadow-inner transition-all duration-300`}>
              {/* Bottle Neck */}
              <div className={`w-3 h-2 -mt-2 border-t-2 border-x-2 ${isSelected ? 'border-madison-gold bg-madison-gold/20' : 'border-madison-dark/40 bg-gray-50'} rounded-t-sm absolute top-0`} />
              {/* Liquid indicator */}
              <div className={`w-full h-1/2 rounded-b-sm ${isSelected ? 'bg-madison-gold/25' : 'bg-amber-500/10'} mt-auto`} />
              {/* Dimension Text */}
              <span className={`text-[8px] font-bold font-mono tracking-tight absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'text-white' : 'text-madison-muted'}`}>{title}</span>
            </div>
          </div>
        </div>
      );
    }

    case 'flaschenform': {
      let dPath = "";
      if (value === 'eckig') {
        dPath = "M 8,4 L 32,4 L 32,36 L 8,36 Z";
      } else if (value === 'rund') {
        dPath = "M 10,4 Q 20,2 30,4 L 30,36 Q 20,38 10,36 Z";
      } else if (value === 'oval') {
        dPath = "M 12,4 Q 20,1.5 28,4 L 30,36 Q 20,38.5 10,36 Z";
      } else if (value === 'antelope') {
        // Spline curves
        dPath = "M 15,4 Q 20,3 25,4 Q 29,15 28,24 Q 25,37 20,37 Q 15,37 12,24 Q 11,15 15,4 Z";
      }
      return (
        <div className={containerClass}>
          <svg className="w-10 h-10 transition-transform duration-300 hover:scale-110" viewBox="0 0 40 40" fill="none">
            <path
              d={dPath}
              stroke={isSelected ? '#d4af37' : '#222222'}
              strokeWidth="2"
              fill={isSelected ? 'rgba(212, 175, 55, 0.15)' : 'none'}
              strokeLinejoin="round"
            />
            {/* Draw neck thread */}
            <path d="M 16,1 L 24,1 M 17,2.5 L 23,2.5" stroke={isSelected ? '#d4af37' : '#222222'} strokeWidth="1.5" />
          </svg>
        </div>
      );
    }

    case 'flaschenmaterial': {
      let bgStyle = 'bg-white';
      let extraIcon = null;
      if (value === 'glas') {
        bgStyle = 'bg-gradient-to-tr from-sky-100 to-white';
      } else if (value === 'pet') {
        bgStyle = 'bg-gradient-to-tr from-emerald-50 to-teal-50';
        extraIcon = <span className="absolute bottom-1 right-1.5 text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">ECO PCR</span>;
      } else if (value === 'alu') {
        bgStyle = 'bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 border-dashed';
      } else if (value === 'petg') {
        bgStyle = 'bg-gradient-to-tr from-sky-50 to-indigo-50/20';
        extraIcon = <span className="absolute bottom-1 right-1.5 text-[8px] font-bold text-sky-600 bg-sky-100 px-1 rounded">PETG</span>;
      }
      return (
        <div className={containerClass}>
          <div className={`w-16 h-12 rounded-lg border-2 ${isSelected ? 'border-madison-gold' : 'border-gray-250'} ${bgStyle} relative shadow-sm overflow-hidden flex items-center justify-center transition-all duration-300`}>
            {value === 'glas' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-pulse" />}
            {value === 'alu' && <div className="w-full h-full opacity-10 bg-repeat" style={{ backgroundImage: 'linear-gradient(90deg, #000 50%, transparent 50%)', backgroundSize: '4px 100%' }} />}
            <span className="text-[9px] font-bold font-mono tracking-widest text-madison-dark uppercase opacity-75">{value}</span>
            {extraIcon}
          </div>
        </div>
      );
    }

    case 'flaschenfarbe': {
      let bgStyle = 'bg-white';
      if (value === 'klar') bgStyle = 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      else if (value === 'lackiert') bgStyle = 'bg-gradient-to-br from-gray-800 to-gray-950';
      else if (value === 'metallisiert') bgStyle = 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600';
      else if (value === 'bespruht') bgStyle = 'bg-gradient-to-b from-amber-600 via-amber-500 to-white';
      else if (value === 'sandstrahlen') bgStyle = 'bg-gradient-to-br from-slate-100 to-slate-200/50 backdrop-blur-sm';
      return (
        <div className={containerClass}>
          <div className={`w-16 h-12 rounded-lg border-2 ${isSelected ? 'border-madison-gold shadow-md' : 'border-gray-200'} ${bgStyle} relative overflow-hidden transition-all duration-300`}>
            {value === 'sandstrahlen' && <div className="absolute inset-0 bg-white/35 opacity-70" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '3px 3px' }} />}
            {value === 'metallisiert' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12" />}
          </div>
        </div>
      );
    }

    case 'kappe': {
      let bgStyle = 'bg-gray-100';
      let overlay = null;
      if (value === 'pp') {
        bgStyle = 'bg-gray-200';
      } else if (value === 'abs') {
        bgStyle = 'bg-[#111111]';
      } else if (value === 'surlyn') {
        bgStyle = 'bg-sky-50/30 border border-sky-100';
        overlay = <div className="w-4 h-6 bg-gradient-to-b from-yellow-500 to-amber-600 rounded-sm absolute" />;
      } else if (value === 'zamak') {
        bgStyle = 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700';
      } else if (value === 'aluminium') {
        bgStyle = 'bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500';
      } else if (value === 'holz') {
        bgStyle = 'bg-[#8B5A2B]';
        overlay = (
          <div className="absolute inset-0 flex flex-col justify-between opacity-30">
            <div className="h-0.5 w-full bg-yellow-900" />
            <div className="h-0.5 w-full bg-yellow-900" />
            <div className="h-0.5 w-full bg-yellow-900" />
          </div>
        );
      }
      return (
        <div className={containerClass}>
          <div className={`w-12 h-10 rounded-md border ${isSelected ? 'border-madison-gold' : 'border-gray-300'} ${bgStyle} relative flex items-center justify-center overflow-hidden shadow-inner transition-all duration-300`}>
            {overlay}
          </div>
        </div>
      );
    }

    case 'pumpe': {
      let overlay = null;
      if (value === 'crimpless') {
        overlay = <div className="w-10 h-3 border-2 border-dashed border-madison-gold/40 rounded-sm absolute bottom-0 bg-transparent" />;
      } else if (value === 'crimp') {
        overlay = <div className="w-10 h-4 bg-gray-300 border-2 border-gray-400 rounded-sm absolute bottom-0" />;
      } else if (value === 'screw') {
        overlay = (
          <div className="w-10 h-4 bg-gray-300 border border-gray-400 rounded-sm absolute bottom-0 flex flex-col justify-center gap-0.5">
            <div className="h-0.5 w-full bg-gray-500" />
            <div className="h-0.5 w-full bg-gray-500" />
          </div>
        );
      } else if (value === 'schnapp') {
        overlay = <div className="w-9 h-3.5 bg-gray-800 rounded-sm absolute bottom-0" />;
      }
      return (
        <div className={containerClass}>
          <div className="w-12 h-12 relative flex items-center justify-center">
            {/* Actuator Head */}
            <div className="w-5 h-6 bg-gray-200 border-2 border-gray-300 rounded-t-md absolute bottom-3.5 flex items-center justify-center">
              {/* Nozzle */}
              <div className="w-2 h-1 bg-madison-gold rounded-full absolute top-1 right-[-1px]" />
            </div>
            {overlay}
          </div>
        </div>
      );
    }

    case 'flaschenveredelung': {
      let preview = null;
      if (value === 'siebdruck') {
        preview = <span className="font-serif text-[18px] font-bold text-gray-800 tracking-wider">A<sub>b</sub></span>;
      } else if (value === 'heissfolie') {
        preview = <span className="font-mono text-[16px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 drop-shadow-sm">GOLD</span>;
      } else if (value === 'label') {
        preview = <div className="w-14 h-8 bg-amber-50/70 border border-amber-200/50 shadow-sm rounded-sm flex items-center justify-center text-[7px] text-amber-900 font-bold font-mono">LABEL</div>;
      }
      return (
        <div className={containerClass}>
          <div className={`w-16 h-10 rounded-md border flex items-center justify-center ${isSelected ? 'border-madison-gold' : 'border-gray-250'} bg-white transition-all duration-300`}>
            {preview}
          </div>
        </div>
      );
    }

    case 'verpackungsmaterial': {
      let bgStyle = 'bg-white';
      if (value === 'karton') bgStyle = 'bg-[#d2b48c]'; // kraft paper
      else if (value === 'papier') bgStyle = 'bg-slate-50 border border-slate-100'; // textured paper
      else if (value === 'rigidboard') bgStyle = 'bg-[#1c1e24]'; // rigid dark board
      return (
        <div className={containerClass}>
          <div className={`w-16 h-10 rounded-md border flex items-center justify-center overflow-hidden font-bold text-[8px] font-mono ${isSelected ? 'border-madison-gold text-white' : 'border-gray-200 text-madison-muted'} ${bgStyle} transition-all duration-300`}>
            {value.toUpperCase()}
          </div>
        </div>
      );
    }

    case 'folienfarbe':
    case 'siebdruckfarbe': {
      let colorClass = 'bg-white';
      if (value === 'gold') colorClass = 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600';
      else if (value === 'silber') colorClass = 'bg-gradient-to-br from-slate-200 to-slate-400';
      else if (value === 'rose') colorClass = 'bg-gradient-to-br from-pink-300 via-rose-400 to-rose-600';
      else if (value === 'schwarz') colorClass = 'bg-black';
      else if (value === 'weiss') colorClass = 'bg-white border border-gray-300';
      return (
        <div className={containerClass}>
          <div className={`w-8 h-8 rounded-full ${colorClass} ${isSelected ? 'ring-2 ring-madison-gold ring-offset-2' : ''} shadow-inner transition-all duration-300`} />
        </div>
      );
    }

    case 'kappen_finish': {
      let bgStyle = 'bg-white';
      if (value === 'poliert') bgStyle = 'bg-gradient-to-r from-amber-300 via-white to-amber-500';
      else if (value === 'gebuerstet') bgStyle = 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 border-dashed';
      return (
        <div className={containerClass}>
          <div className={`w-16 h-10 rounded-md border flex items-center justify-center ${isSelected ? 'border-madison-gold text-white' : 'border-gray-250 text-madison-muted'} ${bgStyle} transition-all duration-300`}>
            <span className="text-[7px] font-bold uppercase tracking-widest">{value}</span>
          </div>
        </div>
      );
    }

    case 'faltschachtel': {
      return (
        <div className={containerClass}>
          <div className={`w-14 h-12 border-2 ${isSelected ? 'border-madison-gold bg-madison-gold/10' : 'border-gray-300 bg-white'} rounded-md flex flex-col items-center justify-center gap-1 transition-all duration-300`}>
            {value === 'ja' ? (
              <>
                <div className="w-8 h-5 bg-madison-gold/25 border border-madison-gold/40 rounded-sm flex items-center justify-center text-[7px] font-bold">BOX</div>
                <div className="text-[8px] font-extrabold text-madison-gold">✓ JA</div>
              </>
            ) : (
              <div className="text-[8px] font-extrabold text-gray-400">NEIN</div>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

export const Configurator: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCategory, configuratorConfig, setConfiguratorConfig, saveProject } = useAppContext();
  const [highlightedStep, setHighlightedStep] = React.useState<string | null>(null);
  const [layoutMode, setLayoutMode] = React.useState<'classic' | 'progressive'>('progressive');
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);
  const [isExploded, setIsExploded] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<{ categoryKey: string; optionValue: string; optionLabel: string } | null>(null);
  const [visualMode, setVisualMode] = React.useState<'photo' | '3d'>('3d');
  const [autoRotate, setAutoRotate] = React.useState(true);
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [toast, setToast] = React.useState<string | null>(null);

  const categoryKey = selectedCategory === 'kosmetikstift' ? 'kosmetikstift' : 'duefte';
  const currentCategory = CONFIG_DATA[categoryKey];

  const handlePreviewSelect = (catKey: string, optVal: string) => {
    const step = currentCategory?.steps.find((s) => s.key === catKey);
    if (step && step.type === 'multiselect') {
      handleMultiselectToggle(catKey, optVal);
    } else {
      handleValueChange(catKey, optVal);
    }
  };

  // Check step visibility based on dependencies
  const isStepVisible = (step: Step) => {
    if (!step.dependsOn) return true;
    if (step.dependsOnValue) {
      return configuratorConfig[step.dependsOn] === step.dependsOnValue;
    }
    return !!configuratorConfig[step.dependsOn];
  };

  // Adjust active step index bounds if steps change dynamically
  React.useEffect(() => {
    if (!currentCategory) return;
    const visibleStepsCount = currentCategory.steps.filter(isStepVisible).length;
    if (activeStepIndex >= visibleStepsCount) {
      setActiveStepIndex(Math.max(0, visibleStepsCount - 1));
    }
  }, [configuratorConfig, selectedCategory, currentCategory, activeStepIndex]);

  const handlePartClick = React.useCallback((partKey: string) => {
    if (!currentCategory) return;
    setHighlightedStep(partKey);
    
    if (layoutMode === 'classic') {
      const element = document.getElementById(`step-card-${partKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      const visibleSteps = currentCategory.steps.filter(isStepVisible);
      const stepIndex = visibleSteps.findIndex((s) => s.key === partKey);
      if (stepIndex !== -1) {
        setActiveStepIndex(stepIndex);
      }
    }
    
    setTimeout(() => {
      setHighlightedStep((current) => (current === partKey ? null : current));
    }, 1500);
  }, [layoutMode, currentCategory, configuratorConfig]);

  if (!selectedCategory || !currentCategory) {
    return (
      <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <AlertCircle className="w-16 h-16 text-madison-gold mx-auto mb-6" />
          <h2 className="font-zilla text-2xl font-bold mb-4">Keine Kategorie ausgewählt</h2>
          <p className="text-sm text-madison-muted mb-8 max-w-md mx-auto">
            Bitte wählen Sie zuerst eine Produktkategorie aus dem B2B-Katalog oder der Schnellauswahl.
          </p>
          <button
            onClick={() => navigate('/kategorie')}
            className="bg-madison-dark hover:bg-madison-gold text-white font-zilla text-sm font-semibold py-3 px-8 rounded-lg tracking-wider uppercase transition-all duration-300"
          >
            Zur Kategorieauswahl
          </button>
        </div>
      </div>
    );
  }

  const visualizerContainerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!visualizerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      visualizerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update logic to match exact dependencies from source
  const handleValueChange = (key: string, value: any) => {
    const updatedConfig = { ...configuratorConfig, [key]: value };
    
    // Clear dependencies if target field changes
    currentCategory.steps.forEach((step) => {
      if (step.dependsOn === key) {
        delete updatedConfig[step.key];
      }
      if (step.disabledByParent?.parentKey === key) {
        const disabledVals = step.disabledByParent.disabledValues[value] || [];
        if (disabledVals.includes(updatedConfig[step.key])) {
          delete updatedConfig[step.key];
        }
      }
    });

    // Auto-adaptation: If changing the bottle volume, adjust child options (cap and pump) to compatible options
    if (key === 'flaschenvolumen') {
      const newVolume = value;
      const bottleSpec = COMPONENT_SPECS.flaschenvolumen[newVolume];
      if (bottleSpec) {
        const newFinish = bottleSpec.neckFinish;
        
        // Auto-adapt Cap (kappe)
        const currentKappe = updatedConfig.kappe;
        if (currentKappe) {
          const capSpec = COMPONENT_SPECS.kappe[currentKappe];
          if (capSpec && !capSpec.neckFinish.includes(newFinish)) {
            // Find first compatible cap option
            const firstCompatibleCap = Object.keys(COMPONENT_SPECS.kappe).find(k => 
              COMPONENT_SPECS.kappe[k].neckFinish.includes(newFinish)
            );
            if (firstCompatibleCap) {
              updatedConfig.kappe = firstCompatibleCap;
            } else {
              delete updatedConfig.kappe;
            }
          }
        }
        
        // Auto-adapt Pump (pumpe)
        const currentPumpe = updatedConfig.pumpe;
        if (currentPumpe) {
          const pumpSpec = COMPONENT_SPECS.pumpe[currentPumpe];
          if (pumpSpec && !pumpSpec.neckFinish.includes(newFinish)) {
            // Find first compatible pump option
            const firstCompatiblePump = Object.keys(COMPONENT_SPECS.pumpe).find(p => 
              COMPONENT_SPECS.pumpe[p].neckFinish.includes(newFinish)
            );
            if (firstCompatiblePump) {
              updatedConfig.pumpe = firstCompatiblePump;
            } else {
              delete updatedConfig.pumpe;
            }
          }
        }
      }
    }

    setConfiguratorConfig(updatedConfig);
  };

  const handleMultiselectToggle = (key: string, val: string) => {
    const currentList = Array.isArray(configuratorConfig[key]) ? configuratorConfig[key] : [];
    const updatedList = currentList.includes(val)
      ? currentList.filter((item: string) => item !== val)
      : [...currentList, val];
    setConfiguratorConfig({ ...configuratorConfig, [key]: updatedList });
  };

  // Step visibility is helper declared at top

  // Get list of disabled options for a given step based on selected parent values and technical specs
  const getDisabledOptions = (step: Step) => {
    const disabledList: string[] = [];
    
    // 1. Existing parent key disabling (volumina restriction etc)
    if (step.disabledByParent) {
      const parentVal = configuratorConfig[step.disabledByParent.parentKey];
      if (parentVal) {
        const parentDisabled = step.disabledByParent.disabledValues[parentVal] || [];
        disabledList.push(...parentDisabled);
      }
    }

    // 2. Technical neck-finish compatibility checking
    const options = step.optionsByParent
      ? step.optionsByParent[configuratorConfig[step.dependsOn || '']] || []
      : step.options || [];

    options.forEach((opt) => {
      const comp = checkTechnicalCompatibility(step.key, opt.value, configuratorConfig);
      if (!comp.compatible) {
        disabledList.push(opt.value);
      }
    });

    return disabledList;
  };

  // Check which steps are missing
  const getMissingSteps = () => {
    return currentCategory.steps.filter((step) => {
      if (!isStepVisible(step)) return false;
      if (step.type === 'number') {
        const val = configuratorConfig[step.key];
        return val === undefined || val === null || val < (step.min || 10000);
      }
      if (step.type === 'multiselect' || step.type === 'text') {
        return false; // Multiselect and text input (like custom scent name) are optional
      }
      return !configuratorConfig[step.key];
    });
  };

  // Check if ALL visible options are correctly configured
  const isConfigurationComplete = getMissingSteps().length === 0;

  const getOptionLabel = (step: Step, val: any) => {
    if (step.optionsByParent) {
      const parentVal = configuratorConfig[step.dependsOn || ''];
      const parentOptions = step.optionsByParent[parentVal] || [];
      return parentOptions.find((opt) => opt.value === val)?.label || val;
    }
    const optionsList = step.options || [];
    return optionsList.find((opt) => opt.value === val)?.label || val;
  };

  const getSelectedOptionLabel = (stepKey: string) => {
    const step = currentCategory?.steps.find((s) => s.key === stepKey);
    if (!step) return '';
    const val = configuratorConfig[stepKey];
    if (val === undefined || val === '') return '';
    return getOptionLabel(step, val);
  };

  const getPerfumeLivePreviewSrc = () => {
    const shape = configuratorConfig.flaschenform;
    const color = configuratorConfig.flaschenfarbe;
    const cap = configuratorConfig.kappe;

    // 1. Shape-specific premium photorealistic preview images take highest priority
    if (shape === 'antelope') {
      return '/perfume_antelope.png';
    }
    if (shape === 'eckig') {
      return '/perfume_eckig.png';
    }
    if (shape === 'rund') {
      return '/perfume_rund.png';
    }

    // 2. Bottle color finishes take primary precedence for default shape (oval)
    if (color === 'lackiert') {
      return '/perfume_black.png';
    }
    if (color === 'sandstrahlen') {
      return '/perfume_frosted.png';
    }
    if (color === 'metallisiert') {
      return '/perfume_zamak_klar.png';
    }
    if (color === 'bespruht') {
      return '/perfume_frosted.png';
    }

    // 3. Cap materials take secondary precedence if bottle is clear/default
    if (cap === 'zamak' || cap === 'aluminium') {
      return '/perfume_zamak_klar.png';
    }
    if (cap === 'abs' || cap === 'pp') {
      return '/perfume_black.png';
    }
    
    // Default clear bottle with wood cap (oval)
    return '/perfume_live_preview.png';
  };

  const getLabelOverlayStyle = () => {
    const shape = configuratorConfig.flaschenform;
    
    // Default position for classic oval shape (perfume_live_preview.png and color variants)
    let left = '45.2%';
    let bottom = '29.5%';
    let width = 'w-[105px] md:w-[125px]';
    let height = 'h-[50px] md:h-[60px]';
    let borderRadius = 'rounded-[2px]';
    
    if (shape === 'antelope') {
      left = '50%';
      bottom = '22%';
      width = 'w-[95px] md:w-[110px]';
      height = 'h-[45px] md:h-[55px]';
      borderRadius = 'rounded-full'; // elegant round label matches curvy body!
    } else if (shape === 'eckig') {
      left = '50.3%';
      bottom = '28%';
      width = 'w-[115px] md:w-[130px]';
      height = 'h-[55px] md:h-[65px]';
      borderRadius = 'rounded-none'; // sharp rectangular label!
    } else if (shape === 'rund') {
      left = '49.8%';
      bottom = '22.5%';
      width = 'w-[100px] md:w-[115px]';
      height = 'h-[48px] md:h-[58px]';
      borderRadius = 'rounded-md'; // smooth rounded corner label!
    }
    
    return { left, bottom, width, height, borderRadius };
  };

  const renderLogisticsSpecs = () => {
    if (categoryKey !== 'duefte') return null;

    const volume = configuratorConfig.flaschenvolumen || '50ml';
    const capSelection = configuratorConfig.kappe || 'pp';
    const quantity = configuratorConfig.menge || 10000;

    // Technical specifications & finishes
    const bottleFinish = COMPONENT_SPECS.flaschenvolumen[volume]?.neckFinish || 'N/A';
    
    const pumpVal = configuratorConfig.pumpe;
    const pumpFinishSpec = pumpVal ? COMPONENT_SPECS.pumpe[pumpVal] : null;
    const isPumpCompatible = pumpFinishSpec ? pumpFinishSpec.neckFinish.includes(bottleFinish) : true;
    
    const capVal = configuratorConfig.kappe;
    const capFinishSpec = capVal ? COMPONENT_SPECS.kappe[capVal] : null;
    const isCapCompatible = capFinishSpec ? capFinishSpec.neckFinish.includes(bottleFinish) : true;

    // Weights matrix (in grams)
    let bottleWeight = 190;
    if (volume === '100ml') bottleWeight = 320;
    else if (volume === '75ml') bottleWeight = 260;
    else if (volume === '30ml') bottleWeight = 130;
    else if (volume === '5ml') bottleWeight = 35;

    let capWeight = 16; // ABS/PP
    if (capSelection === 'holz') capWeight = 12;
    else if (capSelection === 'zamak') capWeight = 40;
    else if (capSelection === 'surlyn') capWeight = 22;
    else if (capSelection === 'aluminium') capWeight = 18;
    else if (capSelection === 'ohne') capWeight = 0;

    const pumpWeight = 4.5; // Constant
    
    let finishingWeight = 0;
    if (configuratorConfig.flaschenveredelung === 'heissfolie') finishingWeight += 0.15;
    else if (configuratorConfig.flaschenveredelung === 'siebdruck') finishingWeight += 0.08;
    
    if (configuratorConfig.flaschenfarbe === 'sandstrahlen') {
      const matt = configuratorConfig.mattierungsgrad || 0;
      finishingWeight -= (matt / 100) * 0.4;
    }
    
    const singleWeight = bottleWeight + capWeight + pumpWeight + finishingWeight;
    const totalProductWeightKg = (singleWeight * quantity) / 1000;

    // Packaging logistics
    const unitsPerBox = 100;
    const totalBoxes = Math.ceil(quantity / unitsPerBox);
    const boxesPerPalette = 40;
    const totalPalettes = Math.ceil(totalBoxes / boxesPerPalette);
    
    const paletteTareWeight = totalPalettes * 25;
    const packagingWeightKg = (totalBoxes * 0.8) + paletteTareWeight;
    const totalShipmentWeightKg = totalProductWeightKg + packagingWeightKg;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
          <Scale className="w-5 h-5 text-madison-gold" />
          <h3 className="font-zilla text-sm font-bold text-madison-dark uppercase tracking-widest">
            Logistik & Technische Spezifikationen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Single Item Specs */}
          <div className="bg-madison-alabaster/40 p-4 rounded-xl border border-gray-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-madison-muted font-bold block mb-1">Einzelgewicht</span>
              <span className="text-xl sm:text-2xl font-zilla text-madison-dark font-light">
                {singleWeight.toFixed(1)} <span className="text-sm font-sans font-medium text-madison-muted">g</span>
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100/60 text-[11px] text-madison-muted space-y-1">
              <div className="flex justify-between">
                <span>Flasche ({volume}):</span>
                <span className="font-bold text-madison-dark">{bottleWeight}g</span>
              </div>
              <div className="flex justify-between">
                <span>Kappe ({capSelection === 'pp' ? 'ABS/PP' : capSelection}):</span>
                <span className="font-bold text-madison-dark">{capWeight}g</span>
              </div>
              <div className="flex justify-between">
                <span>Sprühpumpe + Kragen:</span>
                <span className="font-bold text-madison-dark">{pumpWeight}g</span>
              </div>
            </div>
          </div>

          {/* Card 2: B2B Order Cargo */}
          <div className="bg-madison-alabaster/40 p-4 rounded-xl border border-gray-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-madison-muted font-bold block mb-1">Netto-Warengewicht</span>
              <span className="text-xl sm:text-2xl font-zilla text-madison-dark font-light">
                {totalProductWeightKg.toLocaleString('de-DE')} <span className="text-sm font-sans font-medium text-madison-muted">kg</span>
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100/60 text-[11px] text-madison-muted space-y-1">
              <div className="flex justify-between">
                <span>Bestellmenge:</span>
                <span className="font-bold text-madison-dark">{quantity.toLocaleString('de-DE')} Stk.</span>
              </div>
              <div className="flex justify-between">
                <span>Kartons (à 100 Stk):</span>
                <span className="font-bold text-madison-dark">{totalBoxes} Kartons</span>
              </div>
            </div>
          </div>

          {/* Card 3: Logistics Shipment */}
          <div className="bg-madison-dark text-white p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Frachtgewicht (Brutto)</span>
                <Truck className="w-3.5 h-3.5 text-madison-gold" />
              </div>
              <span className="text-xl sm:text-2xl font-zilla text-madison-gold font-light">
                {(totalShipmentWeightKg / 1000).toFixed(3)} <span className="text-sm font-sans font-medium text-gray-300">t</span>
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Euro-Paletten:</span>
                <span className="font-bold text-white">{totalPalettes} Palette(n)</span>
              </div>
              <div className="flex justify-between">
                <span>Verpackungsgewicht:</span>
                <span className="font-bold text-white">{packagingWeightKg.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Baugruppen-Kupplungs-Inspektor */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-madison-gold animate-pulse" />
            <h4 className="text-[10px] uppercase tracking-widest text-madison-dark font-bold">
              Baugruppen-Kupplungs-Inspektor (FEA Passungen)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Flakon-Mündung */}
            <div className="p-3 bg-madison-alabaster/40 rounded-lg border border-gray-100/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-madison-muted block">1. Flakon-Mündung</span>
                <span className="text-xs font-bold text-madison-dark font-mono mt-0.5 block">{bottleFinish} Standard</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
            </div>

            {/* Zerstäuber-Passung */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              !pumpVal 
                ? 'bg-gray-50 border-gray-100 text-gray-400' 
                : isPumpCompatible 
                ? 'bg-madison-alabaster/40 border-gray-100/60 text-madison-dark' 
                : 'bg-red-50/30 border-red-100 text-red-700 font-semibold'
            }`}>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-madison-muted block">2. Zerstäuber-Kragen</span>
                <span className="text-xs font-bold font-mono mt-0.5 block">
                  {pumpVal ? (pumpFinishSpec ? `${pumpFinishSpec.neckFinish}` : 'FEA 15/17') : 'Ausstehend'}
                </span>
              </div>
              {pumpVal ? (
                isPumpCompatible ? (
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                    ✕
                  </div>
                )
              ) : (
                <span className="text-[9px] italic text-madison-muted">Ausstehend</span>
              )}
            </div>

            {/* Kappe-Passung */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              !capVal 
                ? 'bg-gray-50 border-gray-100 text-gray-400' 
                : isCapCompatible 
                ? 'bg-madison-alabaster/40 border-gray-100/60 text-madison-dark' 
                : 'bg-red-50/30 border-red-100 text-red-700 font-semibold'
            }`}>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-madison-muted block">3. Verschluss-Passung</span>
                <span className="text-xs font-bold font-mono mt-0.5 block">
                  {capVal ? (capFinishSpec ? `${capFinishSpec.neckFinish}` : 'FEA 15/17') : 'Ausstehend'}
                </span>
              </div>
              {capVal ? (
                isCapCompatible ? (
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                    ✕
                  </div>
                )
              ) : (
                <span className="text-[9px] italic text-madison-muted">Ausstehend</span>
              )}
            </div>
          </div>
          {(!isPumpCompatible || !isCapCompatible) && (
            <div className="mt-3 p-3 bg-red-50/40 border border-red-100/60 rounded-lg text-[10px] text-red-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Kupplungsfehler:</strong> Die gewählte Baugruppe weist inkompatible mechanische Schnittstellen auf. Passen Sie das Flaschenvolumen oder die Verschluss-Komponenten an, um Montagekonflikte bei der Abfüllung zu verhindern.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">
        {/* Navigation back and branding info */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/kategorie')}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-madison-muted hover:text-madison-dark transition-all duration-300 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Zurück zur Auswahl</span>
          </button>
          <div className="flex items-center gap-1.5 bg-madison-gold/10 px-3 py-1.5 rounded-full border border-madison-gold/15">
            <span className="w-2 h-2 rounded-full bg-madison-gold animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-madison-gold uppercase">Madison Atelier Online</span>
          </div>
        </div>

        {/* Header & Mode Switch */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-bold text-madison-gold uppercase block mb-3">
              B2B CONFIGURATION STUDIO
            </span>
            <h1 className="font-zilla text-3xl md:text-5xl font-bold tracking-tight mb-2">
              {currentCategory.label} konfigurieren
            </h1>
            <p className="text-sm text-madison-muted max-w-xl">
              Passen Sie alle Gehäusespezifikationen, Materialien, Veredelungsstufen und Liefermengen exakt an Ihr Markenkonzept an.
            </p>
          </div>

          {/* Premium Layout Mode Switcher */}
          <div className="flex bg-gray-50 border border-gray-150 p-1 rounded-xl shadow-inner self-start md:self-end">
            <button
              onClick={() => setLayoutMode('progressive')}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                layoutMode === 'progressive'
                  ? 'bg-madison-dark text-white shadow-sm font-bold'
                  : 'text-madison-muted hover:text-madison-dark'
              }`}
            >
              <span>Atelier Focus</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-normal uppercase scale-90 ${
                layoutMode === 'progressive' ? 'bg-madison-gold text-white animate-pulse' : 'bg-gray-200 text-madison-muted'
              }`}>
                Immersiv
              </span>
            </button>
            <button
              onClick={() => setLayoutMode('classic')}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                layoutMode === 'classic'
                  ? 'bg-madison-dark text-white shadow-sm font-bold'
                  : 'text-madison-muted hover:text-madison-dark'
              }`}
            >
              <span>Atelier Classic</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-madison-muted font-bold tracking-normal uppercase scale-90">
                Liste
              </span>
            </button>
          </div>
        </div>

        {/* Main Interface */}
        {layoutMode === 'classic' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Configurator Form (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {currentCategory.steps.map((step, idx) => {
                if (!isStepVisible(step)) return null;

                const options = step.optionsByParent
                  ? step.optionsByParent[configuratorConfig[step.dependsOn || '']] || []
                  : step.options || [];

                const disabledOptions = getDisabledOptions(step);

                return (
                  <div
                    id={`step-card-${step.key}`}
                    key={step.key}
                    className={`bg-white rounded-2xl border p-6 md:p-8 shadow-sm transition-all duration-500 ${
                      highlightedStep === step.key
                        ? 'ring-2 ring-madison-gold border-transparent scale-[1.01] shadow-lg shadow-madison-gold/5 bg-madison-gold/[0.02]'
                        : 'border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-madison-dark text-white font-zilla text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="font-zilla text-base font-bold text-madison-charcoal tracking-wide">
                          {step.label}
                        </h3>
                        {step.hint && (
                          <span className="text-xs text-madison-muted font-normal normal-case">
                            ({step.hint})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Render based on step type */}
                    {step.type === 'text' && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={step.placeholder || ''}
                          value={configuratorConfig[step.key] || ''}
                          onChange={(e) => handleValueChange(step.key, e.target.value)}
                          className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200"
                        />
                      </div>
                    )}

                    {step.type === 'radio' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt) => {
                          const isDisabled = disabledOptions.includes(opt.value);
                          const isSelected = configuratorConfig[step.key] === opt.value;
                          
                          // Technical check
                          const comp = checkTechnicalCompatibility(step.key, opt.value, configuratorConfig);
                          const tooltipText = isDisabled
                            ? (!comp.compatible 
                              ? `Technischer Konflikt: ${comp.reason}` 
                              : 'Für das ausgewählte Flaschenvolumen nicht verfügbar.')
                            : undefined;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => handleValueChange(step.key, opt.value)}
                              title={tooltipText}
                              className={`p-4 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                isDisabled
                                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-madison-dark border-madison-dark text-white shadow-md'
                                  : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/50 hover:text-madison-dark'
                              }`}
                            >
                              {renderOptionThumbnail(step.key, opt.value, isSelected)}
                              <div className="flex items-center justify-between w-full">
                                <span className={isDisabled ? 'line-through' : ''}>{opt.label}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewItem({ categoryKey: step.key, optionValue: opt.value, optionLabel: opt.label });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        setPreviewItem({ categoryKey: step.key, optionValue: opt.value, optionLabel: opt.label });
                                      }
                                    }}
                                    className={`p-1 rounded-full transition duration-200 cursor-pointer ${
                                      isSelected 
                                        ? 'text-madison-gold hover:bg-white/10 hover:text-white' 
                                        : 'text-madison-gold hover:bg-black/5 hover:text-madison-dark'
                                    }`}
                                    title="Vorschau & Technische Daten"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </span>
                                  {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-madison-gold flex items-center justify-center text-white">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              {!comp.compatible && (
                                <span className="text-[9px] text-red-500 font-medium normal-case mt-1.5 flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                  {comp.reason}
                                </span>
                              )}
                              {comp.compatible && COMPONENT_SPECS[step.key]?.[opt.value] && (
                                <span className={`text-[9px] font-medium normal-case mt-1.5 ${isSelected ? 'text-gray-400' : 'text-madison-gold'}`}>
                                  Mündung: {COMPONENT_SPECS[step.key][opt.value].neckFinish}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step.type === 'multiselect' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt) => {
                          const values = Array.isArray(configuratorConfig[step.key])
                            ? configuratorConfig[step.key]
                            : [];
                          const isSelected = values.includes(opt.value);

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleMultiselectToggle(step.key, opt.value)}
                              className={`p-4 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-madison-gold border-madison-gold text-white shadow-md'
                                  : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/50 hover:text-madison-dark'
                              }`}
                            >
                              {renderOptionThumbnail(step.key, opt.value, isSelected)}
                              <div className="flex items-center justify-between w-full">
                                <span>{opt.label}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewItem({ categoryKey: step.key, optionValue: opt.value, optionLabel: opt.label });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        setPreviewItem({ categoryKey: step.key, optionValue: opt.value, optionLabel: opt.label });
                                      }
                                    }}
                                    className={`p-1 rounded-full transition duration-200 cursor-pointer ${
                                      isSelected 
                                        ? 'text-white hover:bg-white/10' 
                                        : 'text-madison-gold hover:bg-black/5 hover:text-madison-dark'
                                    }`}
                                    title="Vorschau & Technische Daten"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </span>
                                  {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-madison-gold">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {step.type === 'number' && (
                      step.key === 'mattierungsgrad' ? (
                        <div className="space-y-3 w-full max-w-md">
                          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-madison-charcoal">
                            <span>Satinierungsgrad</span>
                            <span className="font-mono text-madison-gold text-sm font-bold">
                              {configuratorConfig.mattierungsgrad !== undefined ? configuratorConfig.mattierungsgrad : 0}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={configuratorConfig.mattierungsgrad !== undefined ? configuratorConfig.mattierungsgrad : 0}
                            onChange={(e) => handleValueChange('mattierungsgrad', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-madison-gold focus:outline-none"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold tracking-wider">
                            <span>0% (GLASKLAR)</span>
                            <span>100% (FROSTED)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="relative w-44">
                            <input
                              type="number"
                              min={step.min}
                              step={step.step}
                              value={configuratorConfig[step.key] || step.min}
                              onChange={(e) =>
                                handleValueChange(
                                  step.key,
                                  Math.max(step.min || 10000, parseInt(e.target.value) || (step.min || 10000))
                                )
                              }
                              className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200 font-mono font-semibold"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-madison-muted">
                              Stk.
                            </span>
                          </div>
                          <div className="text-xs text-madison-muted">
                            Mindestbestellmenge (MOQ):{' '}
                            <strong className="text-madison-dark">
                              {(step.min || 10000).toLocaleString('de-DE')} Stück
                            </strong>{' '}
                            in 500er-Schritten.
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}

              {/* Configurator Action Submit */}
              <div className="space-y-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isConfigurationComplete) {
                      navigate('/anfrage');
                    }
                  }}
                  disabled={!isConfigurationComplete}
                  className={`w-full flex items-center justify-center gap-3 font-zilla text-base font-bold py-4.5 px-8 rounded-xl shadow-md border transition-all duration-500 group ${
                    isConfigurationComplete
                      ? 'bg-madison-gold hover:bg-madison-dark text-white border-madison-gold hover:border-madison-dark cursor-pointer hover:shadow-lg'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Individuelle Anfrage erstellen</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSaveDialogOpen(true)}
                  className="w-full py-4 rounded-xl text-xs font-bold tracking-widest uppercase border border-madison-gold text-madison-gold hover:bg-madison-gold hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Als B2B-Entwurf sichern</span>
                </button>

                {!isConfigurationComplete && (
                  <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-100/70 text-xs text-amber-800 flex items-start gap-3.5 shadow-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <div>
                      <span className="font-zilla text-sm font-bold block mb-1 text-amber-900">
                        Konfiguration noch unvollständig
                      </span>
                      <p className="mb-2 text-amber-700">
                        Für ein exklusives Madison Cosmetics B2B-Angebot fehlen noch folgende Auswahlen:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-3 list-disc font-semibold text-amber-800">
                        {getMissingSteps().map((step) => (
                          <li key={step.key}>{step.label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Luxury Showcase & Live Summary (5 Columns) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              
              {/* Live Config Visualizer */}
              <div 
                ref={visualizerContainerRef}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${
                  isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0 w-screen h-screen bg-white' : ''
                }`}
              >
                <div className="p-3 sm:p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-2 bg-madison-dark text-white">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-madison-gold" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Echtzeit-Vorschau</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    {/* Sleek Segmented Switch */}
                    <div className="flex bg-white/10 p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => setVisualMode('photo')}
                        className={`text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer uppercase ${
                          visualMode === 'photo' 
                            ? 'bg-madison-gold text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisualMode('3d')}
                        className={`text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer uppercase ${
                          visualMode === '3d' 
                            ? 'bg-madison-gold text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        3D-Modell
                      </button>
                    </div>

                    {visualMode === '3d' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAutoRotate(!autoRotate)}
                          className={`flex items-center gap-1.5 text-xs transition px-2 sm:px-3 py-1.5 rounded-lg border cursor-pointer ${
                            !autoRotate
                              ? 'bg-madison-gold text-white border-madison-gold hover:bg-madison-gold/90'
                              : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white'
                          }`}
                          title={autoRotate ? 'Animation anhalten' : 'Animation abspielen'}
                        >
                          {autoRotate ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-madison-gold" />
                          )}
                          <span className="hidden sm:inline">{autoRotate ? 'Anhalten' : 'Drehen'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsExploded(!isExploded)}
                          className={`flex items-center gap-1.5 text-xs transition px-2 sm:px-3 py-1.5 rounded-lg border cursor-pointer ${
                            isExploded 
                              ? 'bg-madison-gold text-white border-madison-gold hover:bg-madison-gold/90' 
                              : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 animate-pulse" />
                          <span className="hidden sm:inline">{isExploded ? 'Baugruppe montiert' : 'Explosionsansicht'}</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-madison-gold" />
                          <span className="hidden sm:inline">Vollbild beenden</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-madison-gold" />
                          <span className="hidden sm:inline">Vollbildmodus</span>
                        </>
                      )}
                    </button>
                    <span className="hidden md:inline text-[9px] font-bold tracking-widest text-madison-gold bg-white/10 px-2 py-1 rounded">
                      Madison Studio
                    </span>
                  </div>
                </div>

                {/* High-End Visual Mockup Rendering based on Selection */}
                <div className={`bg-gradient-to-b from-madison-alabaster to-white flex items-center justify-center relative overflow-hidden select-none border-b border-gray-100 flex-grow ${
                  isFullscreen ? 'h-full w-full' : 'h-[280px] sm:h-[420px]'
                }`}>
                  {visualMode === 'photo' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-[#FCFAF6]">
                      <img 
                        key={categoryKey === 'duefte' ? getPerfumeLivePreviewSrc() : '/pen_live_preview.png'}
                        src={categoryKey === 'duefte' ? getPerfumeLivePreviewSrc() : '/pen_live_preview.png'} 
                        alt="Madison Live Preview" 
                        className="w-full h-full object-cover select-none pointer-events-none animate-fade-in"
                      />
                      
                      {/* Premium Corner Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                        <span className="text-[9px] font-bold tracking-widest text-madison-gold bg-white/90 backdrop-blur-md border border-madison-gold/20 px-2.5 py-1 rounded-full uppercase shadow-sm">
                          Studio Live-Preview
                        </span>
                        {getSelectedOptionLabel(categoryKey === 'duefte' ? 'flakon' : 'farbe') && (
                          <span className="text-[9px] font-bold tracking-widest text-madison-dark bg-white/70 backdrop-blur-md border border-gray-200 px-2.5 py-1 rounded-full uppercase shadow-sm">
                            {getSelectedOptionLabel(categoryKey === 'duefte' ? 'flakon' : 'farbe')}
                          </span>
                        )}
                        {getSelectedOptionLabel(categoryKey === 'duefte' ? 'kappe' : 'material') && (
                          <span className="text-[9px] font-bold tracking-widest text-madison-dark bg-white/70 backdrop-blur-md border border-gray-200 px-2.5 py-1 rounded-full uppercase shadow-sm">
                            {getSelectedOptionLabel(categoryKey === 'duefte' ? 'kappe' : 'material')}
                          </span>
                        )}
                      </div>

                      {/* Premium Custom Fragrance Label Overlay on Bottle */}
                      {categoryKey === 'duefte' && (() => {
                        const { left, bottom, width, height, borderRadius } = getLabelOverlayStyle();
                        return (
                          <div 
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none z-10 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-madison-gold/30 bg-[#fcfbf9]/95 backdrop-blur-[2px] ${width} ${height} ${borderRadius}`}
                            style={{ left, bottom }}
                          >
                            <span className="font-zilla text-[9px] md:text-[11px] font-semibold text-madison-dark tracking-[0.18em] uppercase text-center max-w-[90%] truncate leading-tight">
                              {configuratorConfig.duft || 'MAISON LUXE'}
                            </span>
                            <span className="text-[5px] md:text-[6px] font-bold text-madison-gold tracking-[0.2em] uppercase mt-1 opacity-90">
                              EAU DE PARFUM
                            </span>
                            <span className="text-[4px] md:text-[5px] font-medium text-gray-400 tracking-[0.1em] mt-0.5 uppercase">
                              {configuratorConfig.flaschenvolumen || '50ml'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <ThreeDVisualizer category={categoryKey} config={configuratorConfig} onPartClick={handlePartClick} exploded={isExploded} autoRotate={autoRotate} />
                  )}
                </div>
              </div>

              {/* Live Config Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h3 className="font-zilla text-xs font-bold text-madison-muted uppercase tracking-widest mb-6">
                  Zusammenfassung der Konfiguration
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs py-2 border-b border-gray-50">
                    <span className="font-semibold text-madison-muted">Kategorie</span>
                    <span className="font-bold text-madison-dark uppercase">{currentCategory.label}</span>
                  </div>

                  {currentCategory.steps.map((step) => {
                    if (!isStepVisible(step)) return null;
                    const val = configuratorConfig[step.key];
                    if (val === undefined || val === '') return null;

                    let displayValue = '';
                    if (step.type === 'number') {
                      displayValue = `${val.toLocaleString('de-DE')} Stück`;
                    } else if (step.type === 'multiselect') {
                      const arrayVal = Array.isArray(val) ? val : [];
                      if (arrayVal.length === 0) return null;
                      displayValue = arrayVal
                        .map((v) => step.options?.find((opt) => opt.value === v)?.label || v)
                        .join(', ');
                    } else {
                      displayValue = getOptionLabel(step, val);
                    }

                    return (
                      <div
                        key={step.key}
                        className="flex justify-between text-xs py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="font-semibold text-madison-muted">{step.label}</span>
                        <span className="font-bold text-madison-dark text-right max-w-[60%] leading-tight">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spezifikationen & B2B Logistik-Dashboard */}
              {renderLogisticsSpecs()}

            </div>
          </div>
        ) : (
          /* Atelier Focus: Guided Progressive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Massive Left 3D View (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div
                ref={visualizerContainerRef}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col relative transition-all duration-300 w-full ${
                  isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0 w-screen h-screen bg-white' : 'h-[340px] sm:h-[500px] lg:h-[620px]'
                }`}
              >
                <div className="p-3 sm:p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-2 bg-madison-dark text-white">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-madison-gold" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Atelier Focus Stage</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    {/* Sleek Segmented Switch */}
                    <div className="flex bg-white/10 p-0.5 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => setVisualMode('photo')}
                        className={`text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer uppercase ${
                          visualMode === 'photo' 
                            ? 'bg-madison-gold text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisualMode('3d')}
                        className={`text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer uppercase ${
                          visualMode === '3d' 
                            ? 'bg-madison-gold text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        3D-Modell
                      </button>
                    </div>

                    {visualMode === '3d' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAutoRotate(!autoRotate)}
                          className={`flex items-center gap-1.5 text-xs transition px-2 sm:px-3 py-1.5 rounded-lg border cursor-pointer ${
                            !autoRotate
                              ? 'bg-madison-gold text-white border-madison-gold hover:bg-madison-gold/90'
                              : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white'
                          }`}
                          title={autoRotate ? 'Animation anhalten' : 'Animation abspielen'}
                        >
                          {autoRotate ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-madison-gold" />
                          )}
                          <span className="hidden sm:inline">{autoRotate ? 'Anhalten' : 'Drehen'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsExploded(!isExploded)}
                          className={`flex items-center gap-1.5 text-xs transition px-2 sm:px-3 py-1.5 rounded-lg border cursor-pointer ${
                            isExploded 
                              ? 'bg-madison-gold text-white border-madison-gold hover:bg-madison-gold/90' 
                              : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 animate-pulse" />
                          <span className="hidden sm:inline">{isExploded ? 'Baugruppe montiert' : 'Explosionsansicht'}</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-madison-gold" />
                          <span className="hidden sm:inline">Vollbild beenden</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-madison-gold" />
                          <span className="hidden sm:inline">Vollbildmodus</span>
                        </>
                      )}
                    </button>
                    <span className="hidden md:inline text-[9px] font-bold tracking-widest text-madison-gold bg-white/10 px-2 py-1 rounded">
                      Madison Studio
                    </span>
                  </div>
                </div>

                {/* High-End Visual Mockup Rendering based on Selection */}
                <div className="bg-gradient-to-b from-madison-alabaster to-white flex items-center justify-center relative overflow-hidden select-none flex-grow h-full">
                  {visualMode === 'photo' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-[#FCFAF6]">
                      <img 
                        key={categoryKey === 'duefte' ? getPerfumeLivePreviewSrc() : '/pen_live_preview.png'}
                        src={categoryKey === 'duefte' ? getPerfumeLivePreviewSrc() : '/pen_live_preview.png'} 
                        alt="Madison Live Preview" 
                        className="w-full h-full object-cover select-none pointer-events-none animate-fade-in"
                      />
                      
                      {/* Premium Corner Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                        <span className="text-[9px] font-bold tracking-widest text-madison-gold bg-white/90 backdrop-blur-md border border-madison-gold/20 px-2.5 py-1 rounded-full uppercase shadow-sm">
                          Studio Live-Preview
                        </span>
                        {getSelectedOptionLabel(categoryKey === 'duefte' ? 'flakon' : 'farbe') && (
                          <span className="text-[9px] font-bold tracking-widest text-madison-dark bg-white/70 backdrop-blur-md border border-gray-200 px-2.5 py-1 rounded-full uppercase shadow-sm">
                            {getSelectedOptionLabel(categoryKey === 'duefte' ? 'flakon' : 'farbe')}
                          </span>
                        )}
                        {getSelectedOptionLabel(categoryKey === 'duefte' ? 'kappe' : 'material') && (
                          <span className="text-[9px] font-bold tracking-widest text-madison-dark bg-white/70 backdrop-blur-md border border-gray-200 px-2.5 py-1 rounded-full uppercase shadow-sm">
                            {getSelectedOptionLabel(categoryKey === 'duefte' ? 'kappe' : 'material')}
                          </span>
                        )}
                      </div>

                      {/* Premium Custom Fragrance Label Overlay on Bottle */}
                      {categoryKey === 'duefte' && (() => {
                        const { left, bottom, width, height, borderRadius } = getLabelOverlayStyle();
                        return (
                          <div 
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none z-10 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-madison-gold/30 bg-[#fcfbf9]/95 backdrop-blur-[2px] ${width} ${height} ${borderRadius}`}
                            style={{ left, bottom }}
                          >
                            <span className="font-zilla text-[9px] md:text-[11px] font-semibold text-madison-dark tracking-[0.18em] uppercase text-center max-w-[90%] truncate leading-tight">
                              {configuratorConfig.duft || 'MAISON LUXE'}
                            </span>
                            <span className="text-[5px] md:text-[6px] font-bold text-madison-gold tracking-[0.2em] uppercase mt-1 opacity-90">
                              EAU DE PARFUM
                            </span>
                            <span className="text-[4px] md:text-[5px] font-medium text-gray-400 tracking-[0.1em] mt-0.5 uppercase">
                              {configuratorConfig.flaschenvolumen || '50ml'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <ThreeDVisualizer category={categoryKey} config={configuratorConfig} onPartClick={handlePartClick} exploded={isExploded} autoRotate={autoRotate} />
                  )}
                </div>
              </div>

              {/* Spezifikationen & B2B Logistik-Dashboard */}
              {!isFullscreen && renderLogisticsSpecs()}
            </div>

            {/* Guided Step Sidebar (4 Columns) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-md p-4 sm:p-6 md:p-8 flex flex-col justify-between min-h-[400px] lg:h-[620px] overflow-hidden">
              {(() => {
                const visibleSteps = currentCategory.steps.filter(isStepVisible);
                const currentStep = visibleSteps[activeStepIndex];

                if (!currentStep) {
                  return (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-madison-gold mx-auto mb-4" />
                      <h4 className="font-zilla text-lg font-bold">Fehler beim Laden</h4>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col h-full justify-between gap-6">
                    {/* Step Header */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] tracking-[0.2em] font-bold text-madison-gold uppercase">
                          Schritt {activeStepIndex + 1} von {visibleSteps.length}
                        </span>
                        <span className="text-[10px] tracking-normal font-mono font-bold text-madison-muted bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                          {Math.round(((activeStepIndex + 1) / visibleSteps.length) * 100)}%
                        </span>
                      </div>

                      {/* Progress Dots/Lines */}
                      <div className="flex gap-1.5 mb-6">
                        {visibleSteps.map((s, idx) => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setActiveStepIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 flex-grow cursor-pointer ${
                              idx === activeStepIndex
                                ? 'bg-madison-gold shadow-sm shadow-madison-gold/20'
                                : idx < activeStepIndex
                                ? 'bg-madison-dark'
                                : 'bg-gray-100'
                            }`}
                            title={s.label}
                          />
                        ))}
                      </div>

                      <h3 className="font-zilla text-xl font-bold text-madison-charcoal leading-tight mb-2">
                        {currentStep.label}
                      </h3>
                      {currentStep.hint && (
                        <p className="text-xs text-madison-muted italic">
                          {currentStep.hint}
                        </p>
                      )}
                    </div>

                    {/* Step Options Body - Scrollable */}
                    <div className="flex-grow overflow-y-auto pr-1 max-h-[300px] lg:max-h-[360px] animate-fadeIn py-2">
                      {/* Render inputs based on type */}
                      {currentStep.type === 'text' && (
                        <div className="relative pt-1">
                          <input
                            type="text"
                            placeholder={currentStep.placeholder || ''}
                            value={configuratorConfig[currentStep.key] || ''}
                            onChange={(e) => handleValueChange(currentStep.key, e.target.value)}
                            className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200"
                          />
                        </div>
                      )}

                      {currentStep.type === 'radio' && (
                        <div className="space-y-2.5 pt-1">
                          {(currentStep.optionsByParent
                            ? currentStep.optionsByParent[configuratorConfig[currentStep.dependsOn || '']] || []
                            : currentStep.options || []
                          ).map((opt) => {
                            const disabledOptions = getDisabledOptions(currentStep);
                            const isDisabled = disabledOptions.includes(opt.value);
                            const isSelected = configuratorConfig[currentStep.key] === opt.value;

                            // Technical check
                            const comp = checkTechnicalCompatibility(currentStep.key, opt.value, configuratorConfig);
                            const tooltipText = isDisabled
                              ? (!comp.compatible 
                                ? `Technischer Konflikt: ${comp.reason}` 
                                : 'Für das ausgewählte Flaschenvolumen nicht verfügbar.')
                              : undefined;

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => handleValueChange(currentStep.key, opt.value)}
                                title={tooltipText}
                                className={`w-full p-4 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                  isDisabled
                                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-madison-dark border-madison-dark text-white shadow-md'
                                    : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/50 hover:text-madison-dark'
                                }`}
                              >
                                {renderOptionThumbnail(currentStep.key, opt.value, isSelected)}
                                <div className="flex items-center justify-between w-full">
                                  <span className={isDisabled ? 'line-through' : ''}>{opt.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewItem({ categoryKey: currentStep.key, optionValue: opt.value, optionLabel: opt.label });
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.stopPropagation();
                                          setPreviewItem({ categoryKey: currentStep.key, optionValue: opt.value, optionLabel: opt.label });
                                        }
                                      }}
                                      className={`p-1 rounded-full transition duration-200 cursor-pointer ${
                                        isSelected 
                                          ? 'text-madison-gold hover:bg-white/10 hover:text-white' 
                                          : 'text-madison-gold hover:bg-black/5 hover:text-madison-dark'
                                      }`}
                                      title="Vorschau & Technische Daten"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </span>
                                    {isSelected && (
                                      <div className="w-4 h-4 rounded-full bg-madison-gold flex items-center justify-center text-white">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {!comp.compatible && (
                                  <span className="text-[9px] text-red-500 font-medium normal-case mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                    {comp.reason}
                                  </span>
                                )}
                                {comp.compatible && COMPONENT_SPECS[currentStep.key]?.[opt.value] && (
                                  <span className={`text-[9px] font-medium normal-case mt-1.5 ${isSelected ? 'text-gray-400' : 'text-madison-gold'}`}>
                                    Mündung: {COMPONENT_SPECS[currentStep.key][opt.value].neckFinish}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentStep.type === 'multiselect' && (
                        <div className="space-y-2.5 pt-1">
                          {(currentStep.options || []).map((opt) => {
                            const values = Array.isArray(configuratorConfig[currentStep.key])
                              ? configuratorConfig[currentStep.key]
                              : [];
                            const isSelected = values.includes(opt.value);

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleMultiselectToggle(currentStep.key, opt.value)}
                                className={`w-full p-4 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-madison-gold border-madison-gold text-white shadow-md'
                                    : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/50 hover:text-madison-dark'
                                }`}
                              >
                                {renderOptionThumbnail(currentStep.key, opt.value, isSelected)}
                                <div className="flex items-center justify-between w-full">
                                  <span>{opt.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewItem({ categoryKey: currentStep.key, optionValue: opt.value, optionLabel: opt.label });
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.stopPropagation();
                                          setPreviewItem({ categoryKey: currentStep.key, optionValue: opt.value, optionLabel: opt.label });
                                        }
                                      }}
                                      className={`p-1 rounded-full transition duration-200 cursor-pointer ${
                                        isSelected 
                                          ? 'text-white hover:bg-white/10' 
                                          : 'text-madison-gold hover:bg-black/5 hover:text-madison-dark'
                                      }`}
                                      title="Vorschau & Technische Daten"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </span>
                                    {isSelected && (
                                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-madison-gold">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentStep.type === 'number' && (
                        currentStep.key === 'mattierungsgrad' ? (
                          <div className="space-y-3 w-full max-w-md pt-1">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-madison-charcoal">
                              <span>Satinierungsgrad</span>
                              <span className="font-mono text-madison-gold text-sm font-bold">
                                {configuratorConfig.mattierungsgrad !== undefined ? configuratorConfig.mattierungsgrad : 0}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={configuratorConfig.mattierungsgrad !== undefined ? configuratorConfig.mattierungsgrad : 0}
                              onChange={(e) => handleValueChange('mattierungsgrad', parseInt(e.target.value))}
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-madison-gold focus:outline-none"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold tracking-wider">
                              <span>0% (GLASKLAR)</span>
                              <span>100% (FROSTED)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 pt-1">
                            <div className="relative w-full">
                              <input
                                type="number"
                                min={currentStep.min}
                                step={currentStep.step}
                                value={configuratorConfig[currentStep.key] || currentStep.min}
                                onChange={(e) =>
                                  handleValueChange(
                                    currentStep.key,
                                    Math.max(currentStep.min || 10000, parseInt(e.target.value) || (currentStep.min || 10000))
                                  )
                                }
                                className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200 font-mono font-semibold"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-madison-muted">
                                Stk.
                              </span>
                            </div>
                            <div className="text-xs text-madison-muted">
                              Mindestbestellmenge (MOQ):{' '}
                              <strong className="text-madison-dark">
                                {(currentStep.min || 10000).toLocaleString('de-DE')} Stück
                              </strong>{' '}
                              in 500er-Schritten.
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Step Footer Navigation */}
                    <div className="border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          type="button"
                          disabled={activeStepIndex === 0}
                          onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                          className={`flex items-center justify-center p-3.5 rounded-xl border transition-all duration-300 ${
                            activeStepIndex === 0
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 text-madison-muted hover:border-madison-gold/50 hover:text-madison-dark hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>

                        {activeStepIndex < visibleSteps.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setActiveStepIndex((prev) => Math.min(visibleSteps.length - 1, prev + 1))}
                            className="flex-grow bg-madison-dark hover:bg-madison-gold text-white font-zilla text-xs font-semibold py-3.5 px-6 rounded-xl tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                          >
                            <span>Weiter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (isConfigurationComplete) {
                                navigate('/anfrage');
                              }
                            }}
                            disabled={!isConfigurationComplete}
                            className={`flex-grow font-zilla text-xs font-semibold py-3.5 px-6 rounded-xl tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                              isConfigurationComplete
                                ? 'bg-madison-gold hover:bg-madison-dark text-white shadow-md cursor-pointer hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Anfrage erstellen</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSaveDialogOpen(true)}
                        className="w-full mt-2 text-center py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase border border-madison-gold/45 text-madison-muted hover:border-madison-gold hover:text-madison-dark hover:bg-madison-gold/5 transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Als B2B-Entwurf sichern
                      </button>

                      {activeStepIndex === visibleSteps.length - 1 && !isConfigurationComplete && (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60 text-[10px] text-amber-800 flex items-start gap-2 shadow-sm animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                          <div>
                            <span className="font-zilla text-xs font-bold block mb-0.5 text-amber-900">
                              Konfiguration unvollständig
                            </span>
                            <p className="text-amber-700">
                              Bitte gehen Sie zurück und füllen Sie alle fehlenden Pflichtfelder aus.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <SubproductPreviewModal
        isOpen={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        categoryKey={previewItem?.categoryKey || ''}
        optionValue={previewItem?.optionValue || ''}
        optionLabel={previewItem?.optionLabel || ''}
        onSelect={handlePreviewSelect}
        currentConfig={configuratorConfig}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16120b] border border-madison-gold/30 text-white rounded-xl py-3.5 px-5 shadow-2xl flex items-center gap-3 animate-slide-up max-w-md">
          <div className="w-2 h-2 rounded-full bg-madison-gold animate-ping"/>
          <Info className="w-4 h-4 text-madison-gold shrink-0"/>
          <span className="text-xs font-semibold tracking-wide text-gray-200">{toast}</span>
        </div>
      )}

      {/* Save Draft Dialog */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-madison-dark/85 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-[#0c0e12] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 text-left animate-scale-up">
            <h3 className="text-lg font-zilla font-semibold text-white mb-2">Als B2B-Entwurf sichern</h3>
            <p className="text-xs text-gray-400 mb-4 font-open">
              Geben Sie einen eindeutigen Namen für diesen Verpackungsentwurf an, um ihn später in Ihrer B2B-Projektbibliothek zu laden.
            </p>
            <input
              type="text"
              placeholder="z. B. Winterkollektion 2026 - Gold Elixir"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold mb-5 font-semibold"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  setProjectName('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition duration-200"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!projectName.trim()}
                onClick={() => {
                  if (projectName.trim()) {
                    saveProject(projectName.trim(), categoryKey, configuratorConfig, 'Entwurf', 20);
                    setIsSaveDialogOpen(false);
                    const savedName = projectName.trim();
                    setProjectName('');
                    setToast(`✓ Projekt '${savedName}' erfolgreich im B2B-Archiv gesichert.`);
                    setTimeout(() => setToast(null), 5000);
                  }
                }}
                className="bg-madison-gold hover:bg-white hover:text-madison-dark text-white disabled:opacity-40 disabled:hover:bg-madison-gold disabled:hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                Entwurf Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
