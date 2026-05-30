import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { FormSection } from '../components/FormSection';
import { 
  Check, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Send,
  ClipboardCheck,
  Globe,
  Clock,
  PackageOpen
} from 'lucide-react';

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP'];
const DELIVERY_TIMES = ['20 Wochen', '4 Wochen', '6 Wochen', '8 Wochen', '12 Wochen', '16 Wochen'];

// Helper to generate custom Madison Reference Number
const generateReferenceNumber = () => {
  let ref = 'MC-2026-';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 5; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
};

// Replicate options helper label extractor
const CONFIGURATOR_LABELS: Record<string, Record<string, string>> = {
  materialart: { kunststoff: 'Premium Kunststoff', holz: 'Echtes Zedernholz' },
  endkappe: {
    buerste: 'Feine Bürste',
    pinsel: 'Präziser Pinsel',
    roller: 'Metall Roller-Ball',
    metall: 'Vergoldete Metallkappe',
    ohne: 'Ohne Endkappe (Puristisch)'
  },
  textur: {
    MGT: 'Matte Gel Technology (MGT)',
    MAA: 'Moisture Active Aqua (MAA)',
    MGL: 'Metallic Glow Liquid (MGL)',
    ABC: 'Artisan Blend Classic (ABC)',
    DEW: 'Deep Emollient Wax (DEW)'
  },
  flaschenvolumen: {
    '100ml': '100 ml (Grand Flacon)',
    '75ml': '75 ml (Maison Size)',
    '50ml': '50 ml (Signature Size)',
    '30ml': '30 ml (Voyage Size)',
    '5ml': '5 ml (Echantillon Petite)'
  },
  flaschenform: {
    eckig: 'Schnittig Eckig (Classic)',
    rund: 'Sanft Rund (Céleste)',
    oval: 'Elegant Oval (Elixir)'
  },
  flaschenmaterial: {
    glas: 'Kristallglas',
    pet: 'Recyceltes PET (Eco-Luxury)',
    alu: 'Bürstbares Aluminium',
    petg: 'Kristallklares PETG'
  },
  flaschenfarbe: {
    klar: 'Hochtransparent Klar',
    lackiert: 'Edel Matt Lackiert',
    metallisiert: 'Gold Metallisiert',
    bespruht: 'Verlauf Besprüht',
    sandstrahlen: 'Mattiert (Sandgestrahlt)'
  },
  flaschenveredelung: {
    siebdruck: 'Edler Siebdruck',
    heissfolie: 'Goldene Heißfolienprägung',
    label: 'Strukturiertes Papierlabel'
  },
  pumpe: {
    crimpless: 'Unsichtbar Crimpless',
    crimp: 'Sicher Crimp',
    screw: 'Schraubgewinde (Nachfüllbar)',
    schnapp: 'Schnappverschluss'
  },
  gehaeusematerial: {
    pp: 'PP',
    aluminium: 'Gebürstetes Aluminium',
    abs: 'Premium ABS'
  },
  ueberwurfring: {
    aluminium: 'Glänzendes Gold-Aluminium',
    abs: 'Stabiler ABS-Ring'
  },
  kappe: {
    pp: 'Eco PP Kappe',
    abs: 'Klassische ABS Kappe',
    surlyn: 'Kristallklare Surlyn Kappe',
    zamak: 'Schwere Zamak-Metallkappe',
    aluminium: 'Goldene Aluminiumkappe',
    holz: 'Massives Eschenholz'
  },
  faltschachtel: {
    ja: 'Ja, inklusive Luxuskartonage',
    nein: 'Nein, nur der Flakon'
  },
  verpackungsmaterial: {
    karton: 'Premium Naturkarton',
    papier: 'Seidenpapier auf Karton',
    rigidboard: 'Rigid-Box'
  },
  dekoration: {
    mattgloss: 'Matt- & Glanzlackierung',
    spotuv: 'Spot-UV-Lack',
    tampondruck: 'Präziser Tampondruck',
    heissfolie: 'Goldene Heißfolie',
    emboss: 'Edle Blindprägung'
  }
};

export const Inquiry: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCategory, configuratorConfig } = useAppContext();

  // Route back if category is lost
  const categoryLabel = selectedCategory === 'kosmetikstift' ? 'Kosmetikstift' : 'Düfte & Flakons';

  // State mapping exactly the netlify variables logic
  const [delivery, setDelivery] = useState({
    incoterms: '',
    freihaus: false,
    zielhafen: '',
    lieferzeit: '20 Wochen'
  });

  const [inquiryType, setInquiryType] = useState<'angebot' | 'muster' | ''>('');
  
  const [sampleDetails, setSampleDetails] = useState({
    anzahl: 1,
    adresse: ''
  });

  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber] = useState(generateReferenceNumber);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDeliveryChange = (field: string, value: any) => {
    setDelivery((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'freihaus' && value === true) {
        updated.incoterms = ''; // Clear incoterms if freihaus is true
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSampleChange = (field: string, value: any) => {
    setSampleDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!delivery.freihaus && !delivery.incoterms) {
      newErrors.incoterms = 'Incoterms oder Freihaus muss gewählt werden';
    }
    if (!delivery.zielhafen.trim()) {
      newErrors.zielhafen = 'Zielhafen / Lieferadresse wird benötigt';
    }
    if (!inquiryType) {
      newErrors.inquiryType = 'Bitte wählen Sie die Art der Anfrage';
    }
    if (inquiryType === 'muster') {
      if (!sampleDetails.adresse.trim()) {
        newErrors.sampleAdresse = 'Lieferadresse für Muster wird benötigt';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to error
      const firstError = Object.keys(newErrors)[0];
      const el = document.getElementById(`err-${firstError}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Success transition
    setIsSuccess(true);
  };

  // Helper to extract nice labels for overview summary
  const getRenderedConfigValue = (key: string, val: any) => {
    if (val === undefined || val === '') return null;
    if (key === 'menge') {
      return `${val.toLocaleString('de-DE')} Stück`;
    }
    if (key === 'dekoration') {
      const arr = Array.isArray(val) ? val : [];
      return arr.map((item) => CONFIGURATOR_LABELS[key]?.[item] || item).join(', ');
    }
    return CONFIGURATOR_LABELS[key]?.[val] || val;
  };

  const getStepConfigDetails = () => {
    if (!configuratorConfig) return [];
    return Object.entries(configuratorConfig)
      .map(([key, val]) => {
        // Find configuration label in schema
        const niceLabel = {
          duft: 'Exklusiver Duft',
          materialart: 'Materialart',
          endkappe: 'Endkappe / Applikator',
          textur: 'Formel & Textur',
          menge: 'Bestellmenge',
          flaschenvolumen: 'Flaschenvolumen',
          flaschenform: 'Flaschenform',
          flaschenmaterial: 'Material Flasche',
          flaschenfarbe: 'Farbe Flasche',
          flaschenveredelung: 'Beschriftungsart',
          pumpe: 'Zerstäuber & Pumpe',
          gehaeusematerial: 'Material Gehäuse',
          ueberwurfring: 'Zierring',
          kappe: 'Verschlusskappe',
          faltschachtel: 'Faltschachtel',
          verpackungsmaterial: 'Material Schachtel',
          dekoration: 'Veredelung Schachtel'
        }[key] || key;

        const renderedVal = getRenderedConfigValue(key, val);
        return { key, label: niceLabel, val: renderedVal };
      })
      .filter((item) => item.val !== null && item.val !== undefined && item.val !== '');
  };

  const activeSubmitLabel = 
    inquiryType === 'muster' 
      ? 'Musteranfrage an Absender übermitteln' 
      : inquiryType === 'angebot'
      ? 'Angebotsanfrage an Absender übermitteln'
      : 'Anfrage absenden';

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          {/* Animated Success Ring */}
          <div className="w-20 h-20 bg-green-50 rounded-full border border-green-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ClipboardCheck className="w-10 h-10 text-green-600" />
          </div>
          
          <span className="font-open text-[10px] tracking-[0.35em] text-green-600 uppercase font-bold block mb-2">
            ANFRAGE ERFOLGREICH ÜBERMITTELT
          </span>
          <h2 className="font-zilla text-3xl font-bold text-madison-dark mb-4">
            Vielen Dank für Ihr Vertrauen.
          </h2>
          <div className="h-[1px] w-20 bg-madison-gold/40 my-4 mx-auto" />
          <p className="text-sm text-madison-muted leading-relaxed mb-10 max-w-md mx-auto">
            Ihre {inquiryType === 'muster' ? 'Musteranfrage' : 'Angebotsanfrage'} für {categoryLabel} wurde erfolgreich übermittelt.
            Unser B2B-Team wird Ihre Daten prüfen und sich innerhalb von 48 Stunden mit Ihnen in Verbindung setzen.
          </p>

          {/* Reference ID Showcase */}
          <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 mb-10 inline-block shadow-sm">
            <p className="text-[10px] font-bold text-madison-muted tracking-wider uppercase mb-1">
              Referenznummer
            </p>
            <p className="font-mono font-bold text-madison-gold text-2xl tracking-wider select-all">
              {referenceNumber}
            </p>
          </div>

          <br />
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-madison-dark hover:bg-madison-gold text-white font-zilla text-base font-bold py-4 px-8 rounded-xl shadow-lg border border-madison-dark transition-all duration-300"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/konfigurator')}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-madison-muted hover:text-madison-dark mb-6 group transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition" />
            <span>Zurück zum Konfigurator</span>
          </button>
          <span className="font-open text-[10px] tracking-[0.3em] text-madison-gold uppercase font-bold mb-3 block">
            STEP 03 — ABSCHLUSS &amp; VERSAND
          </span>
          <h1 className="font-zilla text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Anfrage senden
          </h1>
          <p className="text-sm text-madison-muted max-w-xl">
            Vervollständigen Sie die Liefer- und Konditionsparameter, um Ihre personalisierte B2B-Anfrage abzusenden.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Konfigurationsübersicht */}
          <FormSection nr="1" title="Konfigurationsübersicht">
            <div className="bg-madison-alabaster rounded-xl p-6 border border-gray-100/50 space-y-3.5">
              <div className="flex justify-between items-center text-xs py-1 border-b border-gray-200/50">
                <span className="font-semibold text-madison-muted">Produktkategorie</span>
                <span className="font-bold text-madison-dark uppercase">{categoryLabel}</span>
              </div>
              {getStepConfigDetails().map((item) => (
                <div key={item.key} className="flex justify-between items-start text-xs py-1 border-b border-gray-200/50 last:border-0">
                  <span className="font-semibold text-madison-muted">{item.label}</span>
                  <span className="font-bold text-madison-dark text-right max-w-[65%] leading-tight">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Section 2: Lieferbedingungen */}
          <FormSection nr="2" title="Lieferbedingungen">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Incoterms */}
              <div id="err-incoterms">
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Incoterms
                </label>
                <select
                  value={delivery.incoterms}
                  onChange={(e) => handleDeliveryChange('incoterms', e.target.value)}
                  disabled={delivery.freihaus}
                  className={`w-full border ${
                    errors.incoterms ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200 cursor-pointer ${
                    delivery.freihaus ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''
                  }`}
                >
                  <option value="">Bitte wählen...</option>
                  {INCOTERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                {errors.incoterms && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.incoterms}</p>
                )}
              </div>

              {/* Lieferzeit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Gewünschte Lieferzeit
                </label>
                <select
                  value={delivery.lieferzeit}
                  onChange={(e) => handleDeliveryChange('lieferzeit', e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200 cursor-pointer"
                >
                  {DELIVERY_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zielhafen */}
              <div className="sm:col-span-2" id="err-zielhafen">
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Zielhafen / Lieferadresse <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="text"
                  value={delivery.zielhafen}
                  onChange={(e) => handleDeliveryChange('zielhafen', e.target.value)}
                  placeholder="z.B. Hamburg Port, Deutschland oder Firmenhauptsitz"
                  className={`w-full border ${
                    errors.zielhafen ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.zielhafen && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.zielhafen}</p>
                )}
              </div>

              {/* Freihaus Checkbox Custom Styled for B2B */}
              <div className="sm:col-span-2 pt-2">
                <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  delivery.freihaus 
                    ? 'border-madison-gold bg-madison-gold/5' 
                    : 'border-gray-200 bg-white hover:border-madison-gold/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={delivery.freihaus}
                    onChange={(e) => handleDeliveryChange('freihaus', e.target.checked)}
                    className="w-5 h-5 accent-madison-gold mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-bold text-madison-dark uppercase tracking-wider">
                      Freihaus (DDP-ähnlich)
                    </p>
                    <p className="text-xs text-madison-muted mt-1 leading-relaxed">
                      Alle Logistik-, Zoll- und Transportkosten bis zur Lieferadresse werden direkt vom Lieferanten einkalkuliert. Die Angabe der Incoterms entfällt.
                    </p>
                  </div>
                </label>
              </div>

            </div>
          </FormSection>

          {/* Section 3: Art der Anfrage */}
          <FormSection nr="3" title="Art der Anfrage">
            <div id="err-inquiryType">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    value: 'angebot',
                    label: 'Angebotsanfrage',
                    desc: 'Detaillierter Preis- & Budgetentwurf für eine B2B-Großserienproduktion.',
                    icon: <Globe className="w-5 h-5" />
                  },
                  {
                    value: 'muster',
                    label: 'Musteranfrage',
                    desc: 'Erhalten Sie physikalische Qualitäts- und Haptikmuster vor der finalen Bestellung.',
                    icon: <PackageOpen className="w-5 h-5" />
                  }
                ].map((opt) => {
                  const isSelected = inquiryType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setInquiryType(opt.value as any);
                        if (errors.inquiryType) {
                          setErrors((prev) => ({ ...prev, inquiryType: '' }));
                        }
                      }}
                      className={`p-5 rounded-xl border text-left transition-all duration-300 relative flex flex-col justify-between h-40 ${
                        isSelected
                          ? 'bg-white border-madison-gold shadow-md ring-1 ring-madison-gold/25'
                          : 'bg-white border-gray-200 hover:border-madison-gold/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg border ${
                        isSelected ? 'bg-madison-gold/10 border-madison-gold/20 text-madison-gold' : 'bg-gray-50 border-gray-100 text-madison-muted'
                      }`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-madison-dark mb-1">
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-madison-muted leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-madison-gold flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.inquiryType && (
                <p className="mt-1 text-xs text-red-500 font-medium mb-4">{errors.inquiryType}</p>
              )}
            </div>

            {/* Muster specific Fields */}
            {inquiryType === 'muster' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100 space-y-0">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                    Anzahl der gewünschten Muster (Max. 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={sampleDetails.anzahl}
                    onChange={(e) =>
                      handleSampleChange('anzahl', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold font-mono font-semibold"
                  />
                </div>
                <div id="err-sampleAdresse">
                  <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                    Lieferadresse für Muster <span className="text-madison-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={sampleDetails.adresse}
                    onChange={(e) => handleSampleChange('adresse', e.target.value)}
                    placeholder="Straße, PLZ, Ort, Land"
                    className={`w-full border ${
                      errors.sampleAdresse ? 'border-red-400' : 'border-gray-200'
                    } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold`}
                  />
                  {errors.sampleAdresse && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.sampleAdresse}</p>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          {/* Section 4: Zusätzliche Anforderungen & Upload */}
          <FormSection nr="4" title="Zusätzliche Anforderungen">
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                Besondere Markenanforderungen, Beschichtungen oder Farbspezifikationen
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="z.B. genaue Pantone-Farbnummern, spezifische Druckveredelungen, Materialanforderungen..."
                className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                Spezifikationsdokumente hochladen (z.B. Druckdaten, CAD-Modelle)
              </label>
              <label
                htmlFor="spec-upload"
                className="border border-dashed border-gray-300 hover:border-madison-gold bg-white rounded-xl p-8 text-center cursor-pointer block transition-all duration-300 group"
              >
                {fileName ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-6 h-6 text-madison-gold" />
                    <span className="text-sm font-bold text-madison-dark tracking-wide truncate max-w-xs">
                      {fileName}
                    </span>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-8 h-8 text-madison-muted group-hover:text-madison-gold mx-auto mb-3 transition-colors duration-300" />
                    <p className="text-xs font-semibold text-madison-charcoal uppercase tracking-wider">
                      PDF, CAD, PNG oder JPG hierher ziehen
                    </p>
                    <p className="text-[10px] text-madison-gold font-bold uppercase tracking-widest mt-1">
                      oder klicken zum Durchsuchen
                    </p>
                  </div>
                )}
              </label>
              <input
                id="spec-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.zip,.cad"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </FormSection>

          {/* Luxury Final Review and Submit Block */}
          <section className="bg-madison-dark text-white rounded-2xl p-8 shadow-xl border border-madison-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-madison-gold/15 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-[0.2em] text-madison-gold">
              <Clock className="w-4 h-4" />
              <span>Madison B2B Zusammenfassung</span>
            </div>

            <div className="bg-white/5 rounded-xl p-6 space-y-3.5 mb-8 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60 font-semibold">Konfiguration</span>
                <span className="text-white font-bold uppercase">{categoryLabel}</span>
              </div>
              {configuratorConfig?.menge && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-white/60 font-semibold">Sollmenge</span>
                  <span className="text-white font-bold">{configuratorConfig.menge.toLocaleString('de-DE')} Stk.</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60 font-semibold">Versandart</span>
                <span className="text-white font-bold">{delivery.freihaus ? 'Freihaus (DDP)' : `Incoterms: ${delivery.incoterms || '—'}`}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60 font-semibold">Zielhafen / Adresse</span>
                <span className="text-white font-bold truncate max-w-[60%]">{delivery.zielhafen || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60 font-semibold">Lieferzeit</span>
                <span className="text-white font-bold">{delivery.lieferzeit}</span>
              </div>
              {inquiryType && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-white/60 font-semibold">Typ der Anfrage</span>
                  <span className="text-madison-gold font-bold uppercase">
                    {inquiryType === 'muster' ? `Musteranfrage (${sampleDetails.anzahl} Stk.)` : 'Angebotsanfrage'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-madison-gold hover:bg-white text-white hover:text-madison-dark font-zilla text-base font-bold py-4.5 px-8 rounded-xl shadow-lg border border-madison-gold hover:border-white transition-all duration-500 group"
            >
              <Send className="w-4 h-4" />
              <span>{activeSubmitLabel}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </section>

        </form>
      </div>
    </div>
  );
};
