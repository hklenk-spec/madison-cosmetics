import React from 'react';
import { X, Check, ShieldCheck, Leaf, Package, AlertCircle } from 'lucide-react';
import { SubproductThreeDView } from './SubproductThreeDView';
import { COMPONENT_SPECS } from '../pages/Configurator';

interface SubproductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryKey: string;
  optionValue: string;
  optionLabel: string;
  onSelect: (categoryKey: string, optionValue: string) => void;
  currentConfig: Record<string, any>;
}

interface SpecItem {
  label: string;
  value: string;
  icon?: any;
}

interface ComponentDetail {
  description: string;
  badge: string;
  badgeType: 'luxury' | 'eco' | 'standard' | 'tech';
  specs: SpecItem[];
  benefits: string[];
}

// Complete rich catalog of B2B marketing & industrial specifications
const COMPONENT_DETAILS: Record<string, Record<string, ComponentDetail>> = {
  flaschenvolumen: {
    '100ml': {
      description: 'Der exklusive Grand Flacon für Flaggschiff-Düfte. Besticht durch ein massives Auftreten im Regal und eine extrem dickwandige Bodenglas-Konstruktion, die das Licht funkelnd bricht. Erfordert den FEA 17 Mündungsstandard für großvolumige Kappen.',
      badge: 'B2B TOPSELLER (LUXUS)',
      badgeType: 'luxury',
      specs: [
        { label: 'Nennvolumen', value: '100 ml (Kopfraum 10ml)' },
        { label: 'Mündungsnorm', value: 'FEA 17 (Ø 17.0mm)' },
        { label: 'Nenn-Eigengewicht', value: '320 g' },
        { label: 'Glas-Qualität', value: 'Kristallklares Weißglas (Kategorie 1)' },
        { label: 'Bodenstärke', value: '18.2 mm' }
      ],
      benefits: ['Enorme Wertanmutung durch hohes Gewicht', 'Perfekt für limitierte Sondereditionen', 'Maximale Veredelungsfläche'],
    },
    '75ml': {
      description: 'Die Maison-Mittelgröße. Vereint ein anspruchsvolles Volumen mit hervorragender Haptik. Perfekt ausbalanciert für den gehobenen Retail-Verkauf.',
      badge: 'MAISON SIZE',
      badgeType: 'luxury',
      specs: [
        { label: 'Nennvolumen', value: '75 ml' },
        { label: 'Mündungsnorm', value: 'FEA 17 (Ø 17.0mm)' },
        { label: 'Nenn-Eigengewicht', value: '255 g' },
        { label: 'Bodenstärke', value: '15.0 mm' }
      ],
      benefits: ['Optimale Proportionen', 'Großzügiges Volumen bei kompakter Breite', 'FEA 17 Kompatibilität'],
    },
    '50ml': {
      description: 'Die weltweite Standardgröße für Premium-Düfte. Optimaler Formfaktor für edle Präsentationsschachteln und das perfekte tägliche Handgefühl.',
      badge: 'GLOBAL STANDARD',
      badgeType: 'standard',
      specs: [
        { label: 'Nennvolumen', value: '50 ml' },
        { label: 'Mündungsnorm', value: 'FEA 15 (Ø 15.0mm)' },
        { label: 'Nenn-Eigengewicht', value: '185 g' },
        { label: 'Glas-Qualität', value: 'Kalk-Natron-Weißglas' }
      ],
      benefits: ['Weltweiter B2B Bestseller-Standard', 'Einfache Logistik (passt in Standard-Trays)', 'FEA 15 Universalgewinde'],
    },
    '30ml': {
      description: 'Der Voyage Flacon. Kompakt, leicht und ideal für Reisesets oder Entdecker-Kollektionen. Zeichnet sich durch geringe Transportgewichte aus.',
      badge: 'VOYAGE SIZE',
      badgeType: 'standard',
      specs: [
        { label: 'Nennvolumen', value: '30 ml' },
        { label: 'Mündungsnorm', value: 'FEA 15 (Ø 15.0mm)' },
        { label: 'Nenn-Eigengewicht', value: '115 g' },
        { label: 'Transporthöhe', value: '76.5 mm' }
      ],
      benefits: ['Reisetauglich (Airline compliant)', 'Geringe CO2-Frachtbilanz', 'Beliebt für Unisex-Linien'],
    },
    '5ml': {
      description: 'Die detailreiche Miniatur für exklusive Proben-Mailings und Marketing-Entdecker-Kits. Erlaubt B2B-Kunden einen extrem kostengünstigen Musterversand.',
      badge: 'ECHANTILLON / SAMPLE',
      badgeType: 'eco',
      specs: [
        { label: 'Nennvolumen', value: '5 ml' },
        { label: 'Mündungsnorm', value: 'FEA 13 (Ø 13.0mm)' },
        { label: 'Nenn-Eigengewicht', value: '18 g' },
        { label: 'Glas-Typ', value: 'Borosilikat-Röhrenglas' }
      ],
      benefits: ['Minimale Portogebühren beim Musterversand', '100% aromaerhaltend trotz Miniaturgröße', 'FEA 13 Schnappverschluss-kompatibel'],
    }
  },
  flaschenform: {
    antelope: {
      description: 'Die organisch-geschwungene CAD-Meisterleistung basierend auf der skizzierten Madison-Schnittzeichnung. Mit einem voluminösen Schwerpunkt bei 35% der Höhe und sanft einfallender Schulter.',
      badge: 'SPLINE ART RECONSTRUCTION',
      badgeType: 'tech',
      specs: [
        { label: 'Design-Typ', value: 'Spline-Vektorbogen (Zylinder verformt)' },
        { label: 'Bodenkrümmung', value: 'Konvex abgerundet' },
        { label: 'Geometrie-Toleranz', value: 'CAD-kontinuierlich C1' },
        { label: 'Schulterneigung', value: '12° abgeflacht' }
      ],
      benefits: ['Einzigartiges Lichtbrechungsspektrum', 'Luxuriöses Anfassgefühl durch Krümmungen', 'Exklusives Madison Patent'],
    },
    eckig: {
      description: 'Die markante, kantige Formgebung für maskuline oder minimalistische Architektur-Konzepte. Bietet makellos plane Oberflächen für großflächige Bedruckung.',
      badge: 'CLASSIC FACET',
      badgeType: 'standard',
      specs: [
        { label: 'Design-Typ', value: 'Rechteckig Facettiert' },
        { label: 'Kantenradius', value: '< 1.0 mm (Scharfkantig)' },
        { label: 'Etikettenfläche', value: 'Maximiert (4-seitig plan)' }
      ],
      benefits: ['Optimale Auslastung von Umkartons (Packdichte)', 'Klarer architektonischer Stand', 'Perfekt für Heißfolienprägung'],
    },
    rund: {
      description: 'Die harmonische, voll-symmetrische Zylinder-Silhouette. Ein zeitloses Unisex-Design, das sich seidig in das Handgelenk schmiegt.',
      badge: 'CELESTE SYMMETRY',
      badgeType: 'standard',
      specs: [
        { label: 'Design-Typ', value: 'Vollzylinder' },
        { label: 'Wandstärken-Varianz', value: '< 0.2 mm' },
        { label: 'Haptik-Bewertung', value: 'Sehr weich (Symmetrisch)' }
      ],
      benefits: ['Einfachste automatische Etikettierung', 'Ausgezeichnete mechanische Stabilität', 'Universell passend für jede Zielgruppe'],
    },
    oval: {
      description: 'Der elegante Elixir-Bogen. Bietet eine breite Präsentationsfläche im Regal bei schlankem Tiefenprofil.',
      badge: 'ELIXIR ELLIPSE',
      badgeType: 'luxury',
      specs: [
        { label: 'Design-Typ', value: 'Ellyptischer Zylinder' },
        { label: 'Tiefenverhältnis', value: '0.55 (Schmal)' },
        { label: 'Regalpräsenz', value: '+30% optische Breite' }
      ],
      benefits: ['Ergonomisches Greifverhalten', 'Sehr flache Label-Vorderseite', 'Kompakte Tiefe spart Platz im Regal'],
    }
  },
  kappe: {
    zamak: {
      description: 'Die absolute Luxusklasse unter den Verschlüssen. Aus massivem Zink-Aluminium-Druckguss (Zamak) hergestellt, vermittelt diese Kappe sofort beim Aufsetzen eine beeindruckende Kühle und Schwere. Mit Kunststoffeinsatz für das satte akustische B2B-Rastklickgeräusch.',
      badge: 'ULTRA LUXURY WEIGHT',
      badgeType: 'luxury',
      specs: [
        { label: 'Nenn-Material', value: 'Zamak-Druckguss (GD-ZnAl4Cu1)' },
        { label: 'Eigengewicht', value: '42.5 g (Superschwer)' },
        { label: 'Schnittstellennorm', value: 'FEA 17 Standard' },
        { label: 'Oberfläche', value: 'Hochglanz-Metallbeschichtet' }
      ],
      benefits: ['Extrem kühle Metallhaptik beim Erstkontakt', 'Sattes Klickgefühl (Rastung)', 'Vermittelt B2B-Käufern absolute Wertigkeit'],
    },
    holz: {
      description: 'Organische Premium-Haptik aus massivem Eschenholz. Jedes Stück ist ein naturgewachsenes Unikat mit markanter Maserung. Ausgestattet mit einem lebensmittelechten PP-Inliner zum Schutz vor Duftdiffusion.',
      badge: '100% NATURAL WOOD',
      badgeType: 'eco',
      specs: [
        { label: 'Holzart', value: 'Echtes Eschenholz (Fraxinus)' },
        { label: 'Zertifizierung', value: '100% FSC-zertifiziert (Nachhaltig)' },
        { label: 'Inliner', value: 'Recycelbares PP (Geruchsneutral)' },
        { label: 'Restfeuchtigkeit', value: '< 8% (Verzugssicher)' }
      ],
      benefits: ['Individuelle Maserung macht jeden Flakon zum Unikat', 'FSC-Umweltzertifikate steigern Markenwert', 'Biologisch abbaubarer Grundkörper'],
    },
    surlyn: {
      description: 'Kristallklares High-Tech-Polymer mit der optischen Dichte und Lichtbrechung von massivem Glas. Absolut bruchsicher und chemisch resistent gegen Alkohol und Duftöle. Macht die Pumpe darunter geheimnisvoll sichtbar.',
      badge: 'CRYSTAL TRANSPARENT',
      badgeType: 'luxury',
      specs: [
        { label: 'Material', value: 'Surlyn-Ionomer (DuPont Premium)' },
        { label: 'Brechungsindex', value: '1.80 (Nah an Kristallglas)' },
        { label: 'Bruchfestigkeit', value: '100% Splitterfrei' },
        { label: 'Gewicht', value: '16.0 g' }
      ],
      benefits: ['Ästhetik einer schweren Glaskappe bei totaler Bruchsicherheit', 'Spannungsrissbeständig gegen Duftstoffe', 'Elegante optische Schwebewirkung'],
    },
    abs: {
      description: 'Die hochglanzpolierte ABS-Kappe zeichnet sich durch eine doppelwandige, kratzfeste Konstruktion aus. Sie hat ein hervorragendes Spaltmaßverhalten und eignet sich perfekt für B2B-Volumenprojekte.',
      badge: 'B2B SELLER STANDARD',
      badgeType: 'standard',
      specs: [
        { label: 'Material', value: 'ABS-Copolymer (Zweischalig)' },
        { label: 'Oberflächenglanz', value: 'Klavierlack-Optik' },
        { label: 'Gewicht', value: '11.2 g' },
        { label: 'Toleranzbereich', value: '0.02 mm (Hochpräzise)' }
      ],
      benefits: ['Keine sichtbaren Angussstellen', 'Sehr robust gegen Kratzer & Stürze', 'Kosteneffizient im hohen B2B-Volumen'],
    },
    aluminium: {
      description: 'Extrem leichte Verschlusskappe aus eloxiertem Aluminium in Madison-Mattgold. Kombiniert edle gebürstete Metallästhetik mit minimalen Versandgewichten.',
      badge: 'BRUSHED ALUMETAL',
      badgeType: 'standard',
      specs: [
        { label: 'Material', value: 'Eloxiertes Aluminium (AlMg1)' },
        { label: 'Textur', value: 'Gebürstet / Seidenmatt' },
        { label: 'Gewicht', value: '7.5 g (Leichtbau)' }
      ],
      benefits: ['Elegantes Madison-Gold Bürstfinish', 'Minimiert das Bruttogewicht der Euro-Paletten', 'Vollständig kreislauffähiges Aluminium'],
    },
    pp: {
      description: 'Unsere konsequent ökologische Kappe aus Post-Consumer-Recycling-Kunststoff (PCR-PP). Hat eine reduzierte CO2-Bilanz und schließt die Kreislaufkette.',
      badge: 'PCR SUSTAINABLE POLYMER',
      badgeType: 'eco',
      specs: [
        { label: 'Material', value: '100% PCR-Polypropylen' },
        { label: 'CO2-Reduktion', value: '-65% im Vergleich zu Neu-PP' },
        { label: 'Recycling-Status', value: '100% Wertstoff-rückführbar' },
        { label: 'Gewicht', value: '5.2 g' }
      ],
      benefits: ['Minimaler CO2-Fußabdruck pro Einheit', 'Erfüllt strengste B2B-Umweltauflagen', 'Leichtestes Bauteil im Katalog'],
    }
  },
  pumpe: {
    crimpless: {
      description: 'Die unsichtbare Crimpless-Kupplung. Durch einen innenliegenden Kompressionskragen entfällt der unschöne metallische Quetschrand über dem Flaschenhals komplett. Der Zerstäuber wirkt wie aus dem Glas gewachsen.',
      badge: 'INVISIBLE HIGH-TECH CRIMPLESS',
      badgeType: 'tech',
      specs: [
        { label: 'Montagetyp', value: 'Unsichtbares Crimp-Kompressionsverfahren' },
        { label: 'Sprühvolumen', value: '0.08 ml pro Betätigung (Ultra-Fein)' },
        { label: 'Kompatibilität', value: 'FEA 15 / FEA 17 Flaschen' }
      ],
      benefits: ['Absolut nahtlose Ästhetik ohne sichtbare Dichtringe', 'Sehr feiner, homogener Sprühnebel', 'Erfordert Madison-Crimpmaschinen-Standard'],
    },
    crimp: {
      description: 'Der bewährte industrielle Crimp-Zerstäuber. Bietet maximale Sicherheit gegen Produktdiffusion und hermetische Aromadichtigkeit über Jahrzehnte.',
      badge: 'HERMETIC INDUSTRIAL CRIMP',
      badgeType: 'standard',
      specs: [
        { label: 'Montagetyp', value: 'Verpresster Aluminiumkragen' },
        { label: 'Auslaufschutz', value: '100% Vakuumgeprüft (bis 0.6 bar)' },
        { label: 'Gewicht', value: '4.5 g' }
      ],
      benefits: ['Absolut auslaufsicher beim Luftfracht-Transport', 'Dauerhafter Erhalt feinster Kopfnoten', 'Höchster industrieller Zuverlässigkeits-Standard'],
    },
    screw: {
      description: 'Nachhaltiges Schraubgewinde für moderne Refill-Konzepte. Der Zerstäuber lässt sich vom Endkunden leicht abschrauben, um den Flakon aus einer B2B-Nachfüllflasche wiederzubefüllen.',
      badge: 'REFILLABLE GREEN THREAD',
      badgeType: 'eco',
      specs: [
        { label: 'Montagetyp', value: 'Schraubgewinde (Screw-off)' },
        { label: 'Wiederverwendbarkeit', value: '> 100 Schraubzyklen' },
        { label: 'Dichtungsart', value: 'PTFE Aromasperre' }
      ],
      benefits: ['Ermöglicht nachfüllbare Circular-Economy Kosmetikkonzepte', 'Einfaches sortenreines Recycling bei der Entsorgung', 'Verringert Glasmüll beim Endverbraucher'],
    },
    schnapp: {
      description: 'Leichter Schnappverschluss-Zerstäuber, der per einfachem Fingerdruck aufgesetzt werden kann. Ideal für Probenfläschchen und Testboxen.',
      badge: 'CLICK SNAP-ON',
      badgeType: 'standard',
      specs: [
        { label: 'Montagetyp', value: 'Steck-Schnapp-Verbindung' },
        { label: 'Betätigungskraft', value: '< 15 N (Leichte Montage)' },
        { label: 'Schaftmaterial', value: 'PP Copolymer' }
      ],
      benefits: ['Schnelle Montage ohne Werkzeuge', 'Hervorragend geeignet für 5ml Muster-Vials', 'Gewichtsoptimiert'],
    }
  },
  flaschenfarbe: {
    klar: {
      description: 'Absolut farbloses Kristallglas mit exzellenter Transparenz. Zeigt die Eigenfarbe des Duftes unverfälscht und glasklar.',
      badge: 'CRYSTAL CLEAR',
      badgeType: 'standard',
      specs: [
        { label: 'Transmissionsgrad', value: '92% (Kategorie A)' },
        { label: 'UV-Schutz', value: 'Standard (Optional UV-Blocker)' },
        { label: 'Material', value: 'Weißglas rein' }
      ],
      benefits: ['Unverfälschte Duftfarben-Präsentanz', 'Sehr edle Lichtreflexionen', 'Universell für jede Marke'],
    },
    schwarz: {
      description: 'Opakes, hochglanz-tiefschwarzes Glas. Bietet 100%igen Lichtschutz für empfindliche Duftöle und eine mystisch-luxuriöse Präsenz.',
      badge: 'BLACK OPAC OBSIDIAN',
      badgeType: 'luxury',
      specs: [
        { label: 'Lichttransmission', value: '0.0% (Voll-Opak)' },
        { label: 'UV-Schutz', value: '100% Schutz (UV-A, UV-B, Infrarot)' },
        { label: 'Design', value: 'Tiefschwarzer Glas-Schmelz' }
      ],
      benefits: ['Maximaler Schutz vor Duftalterung (Lichtschutz)', 'Extrem maskuline, luxuriöse Markenwirkung', 'Sehr hochwertiger Klavierlackeffekt'],
    },
    amber: {
      description: 'Warmes, bernsteinfarbenes Apotheker-Weißglas. Verleiht Produkten ein edles Retro-Design und schützt Duftöle vor schädlicher Strahlung.',
      badge: 'VINTAGE AMBER GLOW',
      badgeType: 'eco',
      specs: [
        { label: 'Lichttransmission', value: '45% (Bernstein-Ton)' },
        { label: 'UV-Schutz', value: 'Sehr hoch (> 85% Absorption)' },
        { label: 'Recyclinganteil', value: '> 45% Altglasanteil' }
      ],
      benefits: ['Warmes, beruhigendes Apotheken- & Naturgefühl', 'Hervorragender natürlicher Lichtschutz', 'Sehr hoher Recycelt-Glas-Anteil möglich'],
    },
    violett: {
      description: 'Exklusiv schimmerndes Violettglas, das im Licht mystisch changiert. Bietet spektral-selektiven Lichtschutz für High-End-Nischendüfte.',
      badge: 'MYSTIC ROYAL VIOLET',
      badgeType: 'luxury',
      specs: [
        { label: 'Farb-Effekt', value: 'Violett-Transluzent' },
        { label: 'Spektralfilter', value: 'Durchlässig nur für UV-A und Violett' },
        { label: 'Lichtbrechung', value: 'Hoher Luxus-Gleichstrom' }
      ],
      benefits: ['Sehr hohe Alleinstellung im Kosmetikregal', 'Herausragender bioenergetischer Konservierungsschutz', 'Exquisites, changierendes Farbenspiel'],
    }
  }
};

export const SubproductPreviewModal: React.FC<SubproductPreviewModalProps> = ({
  isOpen,
  onClose,
  categoryKey,
  optionValue,
  optionLabel,
  onSelect,
  currentConfig
}) => {
  if (!isOpen) return null;

  // Retrieve matching detailed specifications or build fallbacks
  const detail: ComponentDetail = COMPONENT_DETAILS[categoryKey]?.[optionValue] || {
    description: `Hochwertige Komponente '${optionLabel}' aus dem Madison Cosmetics B2B-Katalog. Gefertigt nach strengen pharmazeutischen Standards zur Gewährleistung bester Spaltmaße und maximaler Haltbarkeit.`,
    badge: 'MADISON INDIVIDUAL',
    badgeType: 'standard',
    specs: [
      { label: 'Komponente', value: optionLabel },
      { label: 'Typenschlüssel', value: optionValue.toUpperCase() },
      { label: 'Qualitätsprüfung', value: '100% Kamera-Endkontrolle' }
    ],
    benefits: ['Industrieller Madison-Standard', 'Hervorragende Haptik & Dichtigkeit', 'Voll B2B-zertifiziert']
  };

  // Determine standard technical neck finish standard
  const bottleVolume = currentConfig.flaschenvolumen || '50ml';
  const bottleFinish = COMPONENT_SPECS.flaschenvolumen[bottleVolume]?.neckFinish || 'FEA 15';

  let isCompatible = true;
  let clashReason = '';

  // Check compatibility dynamically inside the modal spec block
  if (categoryKey === 'kappe' || categoryKey === 'pumpe') {
    const spec = COMPONENT_SPECS[categoryKey]?.[optionValue];
    if (spec) {
      isCompatible = spec.neckFinish.includes(bottleFinish);
      if (!isCompatible) {
        clashReason = `Erfordert ${spec.neckFinish}, der Flakon hat jedoch ${bottleFinish}.`;
      }
    }
  }

  const handleSelectOption = () => {
    onSelect(categoryKey, optionValue);
    onClose();
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'luxury':
        return 'bg-madison-gold/10 text-madison-gold border border-madison-gold/25';
      case 'eco':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'tech':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dark backdrop blur */}
      <div
        className="absolute inset-0 bg-[#07080a]/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Luxury Modal Body */}
      <div className="relative bg-white border border-gray-150 rounded-3xl w-full max-w-4xl max-h-[90vh] lg:max-h-[80vh] flex flex-col md:flex-row shadow-2xl overflow-hidden animate-zoom-in z-10 text-madison-dark">

        {/* Close Button overlay */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/5 text-gray-500 hover:bg-black/10 hover:text-madison-dark transition duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Isolated 3D View Canvas */}
        <div className="w-full md:w-[45%] bg-[#FCFAF6] flex flex-col items-center justify-center relative p-6 border-b md:border-b-0 md:border-r border-gray-100 min-h-[300px] md:min-h-auto">
          {/* Subtle blueprint scale grids in backdrop */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: 'center'
            }}
          />

          <div className="absolute top-6 left-6 text-left select-none">
            <span className="text-[9px] font-bold text-madison-gold tracking-[0.2em] uppercase block">Atelier Preview Studio</span>
            <span className="text-[10px] text-madison-muted font-open">Einzelteil-Vorschau</span>
          </div>

          <div className="w-full h-full flex-grow flex items-center justify-center">
            <SubproductThreeDView categoryKey={categoryKey} optionValue={optionValue} />
          </div>

          {/* User Guide text */}
          <div className="absolute bottom-6 text-center select-none bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-150 shadow-sm">
            <span className="text-[9px] text-madison-dark font-bold uppercase tracking-wider">
              🖱️ Ziehen zum Drehen • Zoom per Mausrad
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Specification Sheet & Descriptions */}
        <div className="w-full md:w-[55%] p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">

          <div className="flex flex-col gap-5 text-left">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${getBadgeClass(detail.badgeType)}`}>
                {detail.badge}
              </span>

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                Kat: {categoryKey.replace('flaschen', '')}
              </span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-zilla font-light tracking-wide text-madison-dark">
                {optionLabel}
              </h3>
              <p className="text-[10px] text-madison-muted font-mono mt-0.5"> Madison B2B Ref: MC-{optionValue.toUpperCase()}-{categoryKey.toUpperCase().slice(0, 3)}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed font-open font-light border-b border-gray-100 pb-5">
              {detail.description}
            </p>

            {/* Compatibility Warning in Modal */}
            {(categoryKey === 'kappe' || categoryKey === 'pumpe') && (
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${isCompatible
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                <div className="mt-0.5">
                  {isCompatible ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">
                    Physischer Mündungs-Check
                  </div>
                  <div className="text-[11px] mt-0.5 font-open font-light">
                    {isCompatible
                      ? `Kompatibel: Dieses Zubehör passt nahtlos auf die gewählte Flaschenmündung (${bottleFinish}).`
                      : `Inkompatibel: ${clashReason}`
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Technical Spec Sheet Table */}
            <div>
              <div className="text-[10px] font-bold text-madison-gold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Technische Daten (B2B-Schnittstelle)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {detail.specs.map((spec, i) => (
                  <div key={i} className="p-3 bg-[#FCFAF6] border border-gray-100 rounded-xl flex flex-col justify-center shadow-sm">
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">{spec.label}</span>
                    <span className="text-xs font-bold text-madison-dark mt-0.5 font-mono">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Benefits */}
            <div>
              <div className="text-[10px] font-bold text-madison-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Qualitätsmerkmale
              </div>
              <ul className="space-y-1.5">
                {detail.benefits.map((benefit, i) => (
                  <li key={i} className="text-[10px] text-gray-600 font-open flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-madison-gold shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-6 mt-6">
            <button
              onClick={onClose}
              className="w-1/3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer"
            >
              Schließen
            </button>

            {isCompatible ? (
              <button
                onClick={handleSelectOption}
                className="w-2/3 bg-madison-gold hover:bg-madison-dark text-white py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Diese Komponente wählen
              </button>
            ) : (
              <button
                disabled
                className="w-2/3 bg-gray-100 border border-gray-200 text-gray-400 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                Inkompatibler Standard
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
