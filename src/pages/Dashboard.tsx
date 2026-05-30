import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { 
  Shield, 
  Sparkles, 
  Globe, 
  Compass, 
  ClipboardList, 
  Package, 
  Clock, 
  X, 
  Download, 
  FileText, 
  Check, 
  RefreshCw,
  Info
} from 'lucide-react';
import { BlueprintScanner } from '../components/BlueprintScanner';

interface Product {
  id: number;
  name: string;
  material: string;
  moq: string;
  category: string;
  categoryId: 'kosmetikstift' | 'duefte';
  imageFallback: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const productsRef = useRef<HTMLDivElement>(null);
  const { savedProjects, setSelectedCategory, setConfiguratorConfig } = useAppContext();
  
  const [trackingProject, setTrackingProject] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const products: Product[] = [
    {
      id: 1,
      name: 'Kosmetikstift Classic',
      material: 'Kunststoff',
      moq: '10.000 Stück',
      category: 'Kosmetikstift',
      categoryId: 'kosmetikstift',
      imageFallback: 'Feiner Kunststoffstift mit Präzisionsmine'
    },
    {
      id: 2,
      name: 'Kosmetikstift Natur',
      material: 'Holz',
      moq: '10.000 Stück',
      category: 'Kosmetikstift',
      categoryId: 'kosmetikstift',
      imageFallback: 'Edler Holzstift aus nachhaltiger Forstwirtschaft'
    },
    {
      id: 3,
      name: 'Parfüm Flakon Breit',
      material: 'Glas',
      moq: '10.000 Stück',
      category: 'Düfte',
      categoryId: 'duefte',
      imageFallback: 'Breiter Flakon aus Kristallglas mit dickem Boden'
    },
    {
      id: 4,
      name: 'Parfüm Flakon Hoch',
      material: 'Glas',
      moq: '10.000 Stück',
      category: 'Düfte',
      categoryId: 'duefte',
      imageFallback: 'Eleganter hoher Flakon für Premium-Düfte'
    }
  ];

  const stats = [
    { value: '1.200+', label: 'Produkte im Katalog', icon: Sparkles },
    { value: '80+', label: 'Geprüfte Premium-Lieferanten', icon: Shield },
    { value: '15', label: 'Länder weltweit', icon: Globe }
  ];

  const handleProductSelect = (categoryId: 'kosmetikstift' | 'duefte') => {
    setSelectedCategory(categoryId);
    setConfiguratorConfig({ menge: 10000 });
    navigate('/profil');
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-madison-alabaster flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16120b] border border-madison-gold/30 text-white rounded-xl py-3.5 px-5 shadow-2xl flex items-center gap-3 animate-slide-up max-w-md">
          <div className="w-2 h-2 rounded-full bg-madison-gold animate-ping"/>
          <Info className="w-4 h-4 text-madison-gold shrink-0"/>
          <span className="text-xs font-semibold tracking-wide text-gray-200">{toast}</span>
        </div>
      )}

      {/* Hero Section with Luxury Dark Theme */}
      <section className="bg-madison-dark text-white py-28 px-6 relative overflow-hidden">
        {/* Subtle gold glow overlay */}
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-gradient-to-l from-madison-gold/10 to-transparent blur-[80px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-madison-gold text-xs font-bold tracking-[0.3em] uppercase mb-4">
            B2B Kosmetikverpackungen & Full-Service
          </p>
          <h1 className="text-4xl sm:text-6xl font-zilla font-light tracking-tight mb-6 leading-tight max-w-3xl text-white">
            Finden. Konfigurieren. <br />
            <span className="gold-gradient-text font-medium">Beschaffen.</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mb-10 max-w-xl leading-relaxed font-open">
            Der exklusive Full-Service-Weg zu Ihren hochwertigen Kosmetikverpackungen.
            Entwickeln Sie einzigartige Designs und maßgeschneiderte Konzepte mit Madison.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToProducts}
              className="bg-madison-gold text-white px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-madison-dark transition-all duration-300 shadow-md"
            >
              Katalog durchsuchen
            </button>
            <button
              onClick={() => navigate('/profil')}
              className="border border-white/20 text-white px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-madison-dark transition-all duration-300"
            >
              Konfiguration starten
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 px-6 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center py-6 px-4 flex flex-col items-center">
                <Icon className="w-6 h-6 text-madison-gold mb-3" />
                <div className="text-3xl font-zilla font-bold text-madison-charcoal mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-madison-muted font-semibold tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* B2B Project Library (Saved Projects & Live Tracking) */}
      <section className="py-20 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-madison-gold" />
                <span className="text-madison-gold text-[10px] font-bold tracking-[0.3em] uppercase">
                  Madison B2B Archiv & Logistik
                </span>
              </div>
              <h2 className="text-3xl font-zilla font-semibold tracking-wide text-madison-charcoal">
                Ihre Madison-Projektbibliothek
              </h2>
              <p className="text-xs text-madison-muted font-medium tracking-wide mt-1 font-open">
                Verwalten Sie Ihre gespeicherten Entwürfe und verfolgen Sie den Live-Status laufender Musterbauten & Lieferketten.
              </p>
            </div>
            <span className="text-xs text-madison-muted font-bold tracking-widest uppercase">
              {savedProjects.length} Baugruppen registriert
            </span>
          </div>

          {savedProjects.length === 0 ? (
            <div className="text-center py-16 bg-madison-alabaster rounded-2xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-madison-charcoal mb-1">Keine aktiven Projekte gefunden</h3>
              <p className="text-xs text-madison-muted max-w-sm mx-auto mb-6">
                Sie haben noch keine Konfigurationen gespeichert. Nutzen Sie den 3D-Konfigurator, um Entwürfe zu erstellen.
              </p>
              <button
                onClick={() => navigate('/kategorie')}
                className="bg-madison-dark text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-madison-gold transition-all duration-300 shadow-sm"
              >
                Konfigurator starten
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedProjects.map((project) => {
                const isDuft = project.category === 'duefte';
                const volume = project.config.flaschenvolumen || '50ml';
                const cap = project.config.kappe || 'ohne';
                const finish = project.config.flaschenveredelung || 'ohne';
                const qty = project.config.menge ? project.config.menge.toLocaleString('de-DE') : '10.000';
                
                // Status styles
                let statusBg = 'bg-gray-500/5 text-gray-400 border-gray-500/10';
                if (project.status === 'Musterbau läuft') statusBg = 'bg-amber-500/5 text-madison-gold border-madison-gold/15';
                if (project.status === 'Zollabwicklung läuft') statusBg = 'bg-indigo-500/5 text-indigo-400 border-indigo-500/15';
                if (project.status === 'Euro-Paletten im Transit') statusBg = 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15';

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-150 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Subtle status top edge border */}
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${
                      project.status === 'Entwurf' ? 'from-gray-300 to-gray-400' :
                      project.status === 'Musterbau läuft' ? 'from-amber-400 to-[#A47E3C]' :
                      project.status === 'Zollabwicklung läuft' ? 'from-indigo-400 to-purple-500' :
                      'from-emerald-400 to-teal-500'
                    }`} />

                    <div>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-madison-gold bg-madison-gold/5 px-2.5 py-1 rounded border border-madison-gold/15">
                          {isDuft ? 'Düfte & Flakons' : 'Kosmetikstift'}
                        </span>
                        
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded border ${statusBg}`}>
                          {project.status}
                        </span>
                      </div>

                      <h3 className="font-zilla font-bold text-lg text-madison-charcoal mb-4 group-hover:text-madison-gold transition-colors duration-300">
                        {project.name}
                      </h3>

                      {/* Specs snippet */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] font-open text-madison-muted border-t border-b border-gray-100 py-3.5 mb-5">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Spezifikation</span>
                          <span className="font-semibold text-madison-charcoal">{isDuft ? `${volume} • Shape: ${project.config.flaschenform || 'rund'}` : 'Applikator'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Menge (MOQ)</span>
                          <span className="font-semibold text-madison-charcoal">{qty} Stk.</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Verschluss / Veredelung</span>
                          <span className="font-semibold text-madison-charcoal">{cap === 'holz' ? 'Eschenholz' : cap.toUpperCase()} / {finish.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Geändert am</span>
                          <span className="font-semibold text-madison-charcoal font-mono">{new Date(project.lastModified).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>

                      {/* Progress Bar (if not draft) */}
                      {project.status !== 'Entwurf' && (
                        <div className="mb-6">
                          <div className="flex justify-between items-center text-[10px] font-bold text-madison-charcoal mb-1.5 uppercase tracking-wide">
                            <span>Projekt-Fortschritt</span>
                            <span className="font-mono">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-madison-gold h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#A47E3C]"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(project.category);
                          setConfiguratorConfig(project.config);
                          navigate('/profil'); // Navigation triggers profile standard loader first
                        }}
                        className="bg-madison-dark text-white py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase hover:bg-madison-gold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Compass className="w-3.5 h-3.5" /> In 3D öffnen
                      </button>
                      
                      {project.status !== 'Entwurf' ? (
                        <button
                          onClick={() => setTrackingProject(project)}
                          className="border border-madison-dark/15 text-madison-dark hover:bg-madison-dark/5 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-madison-gold" /> Status verfolgen
                        </button>
                      ) : (
                        <button
                          disabled
                          className="border border-gray-150 text-gray-400 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase cursor-not-allowed flex items-center justify-center gap-1.5 bg-gray-50"
                        >
                          Nur Entwurf
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Premium Supply Chain Tracking Modal */}
      {trackingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-madison-dark/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-[#0c0e12] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-8 text-left animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-madison-gold animate-pulse" />
                  <span className="text-madison-gold text-[10px] font-bold tracking-[0.3em] uppercase">
                    Madison Global Logistik-Terminal
                  </span>
                </div>
                <h3 className="text-xl font-zilla font-light text-white">
                  Lieferketten-Verlauf: {trackingProject.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 font-open font-semibold uppercase tracking-wider">
                  Projekt-ID: {trackingProject.id} • Status: <span className="text-madison-gold">{trackingProject.status} ({trackingProject.progress}% bereit)</span>
                </p>
              </div>
              <button
                onClick={() => setTrackingProject(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Content */}
            <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-8 mb-6">
              {/* Luxury Vertical Stepper */}
              <div className="relative pl-8 flex flex-col gap-8 border-l border-white/10 ml-3 py-1.5">
                
                {/* Step 1: Design & Approval */}
                <div className="relative text-left">
                  {/* Step bullet */}
                  <div className="absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-2 border-green-500 bg-green-500/10 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-open">
                      1. Konfiguration & Freigabe <span className="text-[8px] font-mono text-green-400 bg-green-500/5 border border-green-500/10 px-1 py-0.5 rounded font-normal">Erfolgreich</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-open">
                      Die CAD-Konstruktion der Baugruppe (Flasche: {trackingProject.config.flaschenvolumen || '100ml'} {trackingProject.config.flaschenform || 'antelope'}, Verschluss: {trackingProject.config.kappe || 'ABS'}) wurde durch das Madison Vision-Audit und den B2B-Einkauf freigegeben.
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment & Procurement */}
                <div className="relative text-left">
                  {/* Bullet */}
                  <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                    trackingProject.progress >= 40 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/15 bg-white/5'
                  }`}>
                    {trackingProject.progress >= 40 ? (
                      <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"/>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-open ${trackingProject.progress >= 40 ? 'text-white' : 'text-gray-500'}`}>
                      2. B2B-Zahlung & Rohstoffbeschaffung 
                      {trackingProject.progress >= 40 && (
                        <span className="text-[8px] font-mono text-green-400 bg-green-500/5 border border-green-500/10 px-1 py-0.5 rounded font-normal">Erfolgreich</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-open">
                      B2B-Anzahlung registriert. Rohmaterialien (Zamak für Kappe, Kristallglas für Flakon) wurden bei unseren Partnern reserviert und an das Madison-Spritzgusslabor übergeben.
                    </p>
                  </div>
                </div>

                {/* Step 3: Prototyping & Lab Testing */}
                <div className="relative text-left">
                  {/* Bullet */}
                  <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                    trackingProject.progress >= 70 
                      ? 'border-green-500 bg-green-500/10' 
                      : (trackingProject.progress >= 60 
                        ? 'border-madison-gold bg-madison-gold/10' 
                        : 'border-white/15 bg-white/5')
                  }`}>
                    {trackingProject.progress >= 70 ? (
                      <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                    ) : (trackingProject.progress >= 60 ? (
                      <RefreshCw className="w-2.5 h-2.5 text-madison-gold animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"/>
                    ))}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-open ${trackingProject.progress >= 60 ? 'text-white' : 'text-gray-500'}`}>
                      3. Musterbau & Labortests 
                      {trackingProject.progress >= 70 ? (
                        <span className="text-[8px] font-mono text-green-400 bg-green-500/5 border border-green-500/10 px-1 py-0.5 rounded font-normal">Erfolgreich</span>
                      ) : (trackingProject.progress >= 60 && (
                        <span className="text-[8px] font-mono text-madison-gold bg-madison-gold/5 border border-madison-gold/10 px-1 py-0.5 rounded font-normal animate-pulse">In Bearbeitung</span>
                      ))}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-open">
                      Erste haptische Prototypen (Musterbau) im Madison-Labor. Führen von Passungsanalysen (Drehmomentprüfung, Sprühnebelbild-Audit) und Vakuumlecktests durch.
                    </p>
                  </div>
                </div>

                {/* Step 4: Customs & Export Clearance */}
                <div className="relative text-left">
                  {/* Bullet */}
                  <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                    trackingProject.progress >= 90 
                      ? 'border-green-500 bg-green-500/10' 
                      : (trackingProject.progress >= 80 
                        ? 'border-madison-gold bg-madison-gold/10' 
                        : 'border-white/15 bg-white/5')
                  }`}>
                    {trackingProject.progress >= 90 ? (
                      <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                    ) : (trackingProject.progress >= 80 ? (
                      <RefreshCw className="w-2.5 h-2.5 text-madison-gold animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"/>
                    ))}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-open ${trackingProject.progress >= 80 ? 'text-white' : 'text-gray-500'}`}>
                      4. Zoll- & Logistikfreigabe 
                      {trackingProject.progress >= 90 ? (
                        <span className="text-[8px] font-mono text-green-400 bg-green-500/5 border border-green-500/10 px-1 py-0.5 rounded font-normal">Erfolgreich</span>
                      ) : (trackingProject.progress >= 80 && (
                        <span className="text-[8px] font-mono text-madison-gold bg-madison-gold/5 border border-madison-gold/10 px-1 py-0.5 rounded font-normal animate-pulse">In Bearbeitung</span>
                      ))}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-open">
                      Erstellung des Sicherheitsdatenblatts (MSDS). Zollanmeldung an die zuständige Grenzstelle abgefertigt. Verpackung auf standardisierten Euro-Paletten abgeschlossen.
                    </p>
                  </div>
                </div>

                {/* Step 5: Shipping & Delivery */}
                <div className="relative text-left">
                  {/* Bullet */}
                  <div className={`absolute -left-[41px] top-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                    trackingProject.progress === 100 
                      ? 'border-green-500 bg-green-500/10' 
                      : (trackingProject.progress >= 90 
                        ? 'border-madison-gold bg-madison-gold/10' 
                        : 'border-white/15 bg-white/5')
                  }`}>
                    {trackingProject.progress === 100 ? (
                      <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                    ) : (trackingProject.progress >= 90 ? (
                      <RefreshCw className="w-2.5 h-2.5 text-madison-gold animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"/>
                    ))}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-open ${trackingProject.progress >= 90 ? 'text-white' : 'text-gray-500'}`}>
                      5. Auslieferung (Palettentransport) 
                      {trackingProject.progress === 100 ? (
                        <span className="text-[8px] font-mono text-green-400 bg-green-500/5 border border-green-500/10 px-1 py-0.5 rounded font-normal">Geliefert</span>
                      ) : (trackingProject.progress >= 90 && (
                        <span className="text-[8px] font-mono text-madison-gold bg-madison-gold/5 border border-madison-gold/10 px-1 py-0.5 rounded font-normal animate-pulse">Im Transit</span>
                      ))}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed font-open">
                      Übergabe an globalen Carrier. Der Transport der Euro-Paletten erfolgt gemäß Incoterms DAP an Ihr Hauptwarenlager. Voraussichtliche Ankunft: In 3 Werktagen.
                    </p>
                  </div>
                </div>

              </div>

              {/* B2B Document Download Center */}
              <div className="border-t border-white/5 pt-5 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                  Dokumenten-Center (Zoll & Finanzen)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setToast(`✓ B2B-Proforma-Rechnung 'PROFORMA-MAD-${trackingProject.id}.pdf' erfolgreich generiert und heruntergeladen.`);
                      setTimeout(() => setToast(null), 5000);
                    }}
                    className="p-3 bg-white/[0.03] border border-white/5 hover:border-madison-gold/30 hover:bg-white/[0.06] rounded-xl flex items-center justify-between group transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <FileText className="w-4 h-4 text-madison-gold" />
                      <div>
                        <span className="text-[10px] font-bold text-white block">Proforma-Rechnung</span>
                        <span className="text-[8px] text-gray-500 block font-mono">Rechnung & Steuer • PDF</span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-madison-gold transition-colors duration-200" />
                  </button>

                  <button
                    onClick={() => {
                      setToast(`✓ B2B-Konformitätszertifikat 'CERT-COMP-FEA.pdf' erfolgreich generiert und heruntergeladen.`);
                      setTimeout(() => setToast(null), 5000);
                    }}
                    className="p-3 bg-white/[0.03] border border-white/5 hover:border-madison-gold/30 hover:bg-white/[0.06] rounded-xl flex items-center justify-between group transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <Shield className="w-4 h-4 text-madison-gold" />
                      <div>
                        <span className="text-[10px] font-bold text-white block">Konformitätserklärung</span>
                        <span className="text-[8px] text-gray-500 block font-mono">FEA-Standard-Prüfung • PDF</span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-madison-gold transition-colors duration-200" />
                  </button>

                  <button
                    onClick={() => {
                      setToast(`✓ Zoll-Ausfuhrbegleitdokument 'CUSTOMS-CLEAR-EU.pdf' heruntergeladen.`);
                      setTimeout(() => setToast(null), 5000);
                    }}
                    className="p-3 bg-white/[0.03] border border-white/5 hover:border-madison-gold/30 hover:bg-white/[0.06] rounded-xl flex items-center justify-between group transition-all duration-300"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <FileText className="w-4 h-4 text-madison-gold" />
                      <div>
                        <span className="text-[10px] font-bold text-white block">Zoll-Ausfuhrbegleitdokument</span>
                        <span className="text-[8px] text-gray-500 block font-mono">Zoll & Exportfreigabe • PDF</span>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-madison-gold transition-colors duration-200" />
                  </button>

                  {trackingProject.config.kappe === 'holz' && (
                    <button
                      onClick={() => {
                        setToast(`✓ Holz-Ursprungszertifikat 'FSC-WOOD-CERTIFICATE.pdf' heruntergeladen.`);
                        setTimeout(() => setToast(null), 5000);
                      }}
                      className="p-3 bg-white/[0.03] border border-white/5 hover:border-madison-gold/30 hover:bg-white/[0.06] rounded-xl flex items-center justify-between group transition-all duration-300"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText className="w-4 h-4 text-madison-gold" />
                        <div>
                          <span className="text-[10px] font-bold text-white block">FSC-Holzzertifikat</span>
                          <span className="text-[8px] text-gray-500 block font-mono">Öko-Zertifizierung • PDF</span>
                        </div>
                      </div>
                      <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-madison-gold transition-colors duration-200" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/5 pt-5 flex justify-end">
              <button
                onClick={() => setTrackingProject(null)}
                className="bg-madison-gold hover:bg-white hover:text-madison-dark text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 shadow-sm"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI CAD & Skizzen-Passungs-Prüfer Section */}
      <section className="py-20 px-6 bg-[#0c0e12] border-t border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <BlueprintScanner />
        </div>
      </section>

      {/* Catalog / Products Section */}
      <section ref={productsRef} className="py-20 px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-3xl font-zilla font-semibold tracking-wide text-madison-charcoal mb-2">
                Ausgewählte Verpackungen
              </h2>
              <p className="text-xs text-madison-muted font-medium tracking-wide">
                Exklusive Linien bereit zur Individualisierung
              </p>
            </div>
            <span className="text-xs text-madison-muted font-bold tracking-widest uppercase">
              {products.length} Modelle
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Visual placeholder box with gallery text */}
                <div className="bg-madison-alabaster h-52 flex items-center justify-center p-6 border-b border-gray-50 relative overflow-hidden">
                  <span className="text-madison-muted/30 absolute font-zilla font-black text-6xl tracking-widest select-none uppercase">
                    MADISON
                  </span>
                  <div className="text-center z-10">
                    <Compass className="w-7 h-7 text-madison-gold/40 mx-auto mb-2 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="text-madison-muted text-[10px] font-bold tracking-[0.2em] uppercase">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-zilla font-bold text-lg text-madison-charcoal mb-2 group-hover:text-madison-gold transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Spec labels */}
                  <div className="flex gap-2.5 mb-6">
                    <span className="text-[10px] font-semibold tracking-wide text-madison-muted bg-madison-alabaster px-2.5 py-1 rounded-md border border-gray-100">
                      {product.material}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wide text-madison-gold bg-madison-gold/5 px-2.5 py-1 rounded-md border border-madison-gold/15">
                      MOQ: {product.moq}
                    </span>
                  </div>

                  <button
                    onClick={() => handleProductSelect(product.categoryId)}
                    className="w-full bg-madison-dark text-white py-3.5 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-madison-gold transition-all duration-300 mt-auto shadow-sm"
                  >
                    Konfigurieren
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
