import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Cpu, 
  Layers,
  Info
} from 'lucide-react';

interface BlueprintData {
  id: number;
  name: string;
  category: 'Flasche' | 'Kappe';
  standardName: string;
  identifiedStandard: 'FEA 17' | 'FEA 15' | 'FEA 13' | 'Sondermaß (Inkompatibel)';
  dimensions: {
    height: string;
    width: string;
    neckDiameter: string;
    threadPitch: string;
    volumeEstimate?: string;
    weightEstimate?: string;
  };
  matingMatrix: {
    component: string;
    standard: string;
    compatible: boolean;
    reason: string;
  }[];
  logs: string[];
}

export const BlueprintScanner: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory, setConfiguratorConfig } = useAppContext();
    const [selectedId, setSelectedId] = useState<number | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Feature 4: Caliper & Scale Calibration States
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);
  const [handleAX, setHandleAX] = useState<number>(88);
  const [handleBX, setHandleBX] = useState<number>(112);
  const [draggingHandle, setDraggingHandle] = useState<'A' | 'B' | null>(null);
  const [calibrationFactor, setCalibrationFactor] = useState<number>(0.709);
  const [activeStandard, setActiveStandard] = useState<'FEA 17' | 'FEA 15' | 'FEA 13' | 'Sondermaß (Inkompatibel)' | ''>('');
  const [calibratedStandardOverride, setCalibratedStandardOverride] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Preloaded B2B blue-prints catalog
  const blueprints: BlueprintData[] = [
    {
      id: 1,
      name: 'Violet Antelope Flakon',
      category: 'Flasche',
      standardName: '100ml Premium Flakon',
      identifiedStandard: 'FEA 17',
      dimensions: {
        height: '89.84 mm',
        width: '95.30 mm',
        neckDiameter: '17.02 mm',
        threadPitch: '1.25 mm',
        volumeEstimate: '100 ml',
        weightEstimate: '320 g (Kristallglas)'
      },
      logs: [
        '[SYS] Initialisiere Madison AI-Vision-Engine v4.8...',
        '[SYS] Lade CAD-Vektordaten & Blueprint-Koordinaten...',
        '[SYS] Kalibriere Bemaßungsmaßstab (1 Pixel = 0.42 mm)',
        '[AI] Starte Kantenerkennung & Symmetrieanalyse...',
        '[AI] Körperkontur erfasst: Geschwungene Ellipse (Spline-Form)',
        '[AI] Berechne nominales Eigengewicht: 320.4g (basierend auf Wanddicke 6mm)',
        '[AI] Fokussiere Flaschenhals (Mündungsabschnitt)...',
        '[AI] Messe Außendurchmesser Gewinde: 17.02 mm (+/- 0.03 mm)',
        '[AI] Detektiere Gewindesteigung (Pitch): 1.25 mm',
        '[AI] Gleiche ab mit ISO Kosmetik-Standards...',
        '[MATCH] Gewindetyp als "FEA 17 Standard" identifiziert (Premium-Mündung)',
        '[SYS] Führe mechanischen Kollisions-Check mit Madison Standardteilen durch...',
        '[SUCCESS] Mündungstyp FEA 17 ist voll kompatibel. 4 mating parts gefunden.'
      ],
      matingMatrix: [] // computed dynamically
    },
    {
      id: 2,
      name: 'Standard Signature Flakon',
      category: 'Flasche',
      standardName: '50ml Zylinder Flakon',
      identifiedStandard: 'FEA 15',
      dimensions: {
        height: '76.50 mm',
        width: '45.00 mm',
        neckDiameter: '15.01 mm',
        threadPitch: '1.00 mm',
        volumeEstimate: '50 ml',
        weightEstimate: '185 g (Weißglas)'
      },
      logs: [
        '[SYS] Initialisiere Madison AI-Vision-Engine v4.8...',
        '[SYS] Lade CAD-Vektordaten & Blueprint-Koordinaten...',
        '[SYS] Kalibriere Bemaßungsmaßstab (1 Pixel = 0.35 mm)',
        '[AI] Starte Kantenerkennung & Symmetrieanalyse...',
        '[AI] Körperkontur erfasst: Zylindrischer Glaskörper',
        '[AI] Berechne nominales Eigengewicht: 185.0g (Bodenstärke 12mm)',
        '[AI] Fokussiere Flaschenhals (Mündungsabschnitt)...',
        '[AI] Messe Außendurchmesser Gewinde: 15.01 mm (+/- 0.02 mm)',
        '[AI] Detektiere Gewindesteigung (Pitch): 1.00 mm',
        '[AI] Gleiche ab mit ISO Kosmetik-Standards...',
        '[MATCH] Gewindetyp als "FEA 15 Standard" identifiziert (Signature-Mündung)',
        '[SYS] Führe mechanischen Kollisions-Check mit Madison Standardteilen durch...',
        '[SUCCESS] Mündungstyp FEA 15 ist voll kompatibel. 5 mating parts gefunden.'
      ],
      matingMatrix: [] // computed dynamically
    },
    {
      id: 3,
      name: 'Vial Echantillon',
      category: 'Flasche',
      standardName: '5ml Proben-Fläschchen',
      identifiedStandard: 'FEA 13',
      dimensions: {
        height: '42.00 mm',
        width: '14.50 mm',
        neckDiameter: '13.00 mm',
        threadPitch: '0.75 mm',
        volumeEstimate: '5 ml',
        weightEstimate: '18 g (Röhrenglas)'
      },
      logs: [
        '[SYS] Initialisiere Madison AI-Vision-Engine v4.8...',
        '[SYS] Lade CAD-Vektordaten & Blueprint-Koordinaten...',
        '[SYS] Kalibriere Bemaßungsmaßstab (1 Pixel = 0.12 mm)',
        '[AI] Starte Kantenerkennung & Symmetrieanalyse...',
        '[AI] Körperkontur erfasst: Miniatur-Röhrenglas',
        '[AI] Berechne nominales Eigengewicht: 18.2g',
        '[AI] Fokussiere Flaschenhals (Mündungsabschnitt)...',
        '[AI] Messe Außendurchmesser Gewinde: 13.00 mm (+/- 0.01 mm)',
        '[AI] Detektiere Gewindesteigung (Pitch): 0.75 mm',
        '[AI] Gleiche ab mit ISO Kosmetik-Standards...',
        '[MATCH] Gewindetyp als "FEA 13 Standard" identifiziert (Miniatur-Gewinde)',
        '[SYS] Führe mechanischen Kollisions-Check mit Madison Standardteilen durch...',
        '[SUCCESS] Mündungstyp FEA 13 ist kompatibel. 2 mating parts gefunden.'
      ],
      matingMatrix: [] // computed dynamically
    },
    {
      id: 4,
      name: 'Kappe Zamak Luxury',
      category: 'Kappe',
      standardName: 'Schwere Metallkappe',
      identifiedStandard: 'FEA 17',
      dimensions: {
        height: '28.00 mm',
        width: '32.00 mm',
        neckDiameter: '17.15 mm (Innen)',
        threadPitch: '1.25 mm',
        weightEstimate: '42 g (Zamak-Zinkguss)'
      },
      logs: [
        '[SYS] Initialisiere Madison AI-Vision-Engine v4.8...',
        '[SYS] Lade CAD-Vektordaten & Innenschnitt-Blueprint...',
        '[SYS] Kalibriere Bemaßungsmaßstab (1 Pixel = 0.20 mm)',
        '[AI] Starte Kantenerkennung am Kappen-Innenzylinder...',
        '[AI] Struktur erfasst: Zylindrische Passung mit Innengewinde',
        '[AI] Berechne nominales Eigengewicht: 42.0g (Massiver Zinkdruckguss)',
        '[AI] Fokussiere Kappenmund (Einführ-Durchmesser)...',
        '[AI] Messe Kappen-Innendurchmesser: 17.15 mm (+/- 0.02 mm)',
        '[AI] Detektiere Innengewinde-Steigung: 1.25 mm',
        '[AI] Gleiche ab mit ISO Kosmetik-Standards...',
        '[MATCH] Innenkupplung als "FEA 17 Passung" identifiziert',
        '[SYS] Führe mechanischen Kollisions-Check mit Madison Standardflakons durch...',
        '[SUCCESS] Verschlusskupplung FEA 17 identifiziert. Passt auf alle FEA 17 Flakons.'
      ],
      matingMatrix: [] // computed dynamically
    },
    {
      id: 5,
      name: 'Fremdkappe M14 Entwurf',
      category: 'Kappe',
      standardName: 'Inkompatible B2B-Kappe',
      identifiedStandard: 'Sondermaß (Inkompatibel)',
      dimensions: {
        height: '24.00 mm',
        width: '28.00 mm',
        neckDiameter: '14.20 mm (Innen)',
        threadPitch: '1.50 mm (Grob)',
        weightEstimate: '12 g (Kunststoff-Spritzguss)'
      },
      logs: [
        '[SYS] Initialisiere Madison AI-Vision-Engine v4.8...',
        '[SYS] Lade CAD-Vektordaten zur Fremdteile-Analyse...',
        '[SYS] Kalibriere Bemaßungsmaßstab (1 Pixel = 0.22 mm)',
        '[AI] Starte Kantenerkennung am Kappen-Innenzylinder...',
        '[AI] Struktur erfasst: Nicht-standardisierter Gewindegang',
        '[AI] Fokussiere Gewinde-Profil & Steigungssteile...',
        '[AI] Messe Kappen-Innendurchmesser: 14.20 mm (Abweichend!)',
        '[AI] Detektiere Innengewinde-Steigung: 1.50 mm (Sondersteigung M14)',
        '[AI] Gleiche ab mit ISO Kosmetik-Standards...',
        '[WARNING] Kein Treffer bei Standard FEA 13, FEA 15 oder FEA 17 Gewinden!',
        '[CRITICAL] Kollisions-Check fehlgeschlagen: Gewindesteigung blockiert mechanisch alle Madison Standard-Zerstäuber!',
        '[SYS] Führe mechanischen Kollisions-Check mit Madison Standardflakons durch...',
        '[ERROR] Kein passender Madison Flakon im System. Flaschenhals-Kollision unvermeidbar.'
      ],
      matingMatrix: [] // computed dynamically
    }
  ];

  // Auto-scroll terminal log container directly
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  // React-safe reactive scan simulator with automatic clearInterval on unmount or selection change
  useEffect(() => {
    if (selectedId === null || scanState !== 'scanning') return;

    const selected = blueprints.find(b => b.id === selectedId);
    if (!selected) return;

    let progress = 0;
    let logIndex = 0;
    setScanProgress(0);
    setDisplayedLogs([]);

    const interval = setInterval(() => {
      progress += 4;
      if (progress > 100) progress = 100;
      setScanProgress(progress);

      const targetLogsCount = Math.floor((progress / 100) * selected.logs.length);
      if (logIndex < targetLogsCount && logIndex < selected.logs.length) {
        const nextLog = selected.logs[logIndex];
        setDisplayedLogs(prev => [...prev, nextLog]);
        logIndex++;
      }

      if (progress === 100) {
        clearInterval(interval);
        const remaining = selected.logs.slice(logIndex);
        if (remaining.length > 0) {
          setDisplayedLogs(prev => [...prev, ...remaining]);
        }
        setScanState('complete');
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [selectedId, scanState]);

  // Global mouseUp / touchend handler to release dragging handles cleanly
  useEffect(() => {
    const handleGlobalRelease = () => {
      setDraggingHandle(null);
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, [draggingHandle]);

  // Real-time dimensions calculation based on draggable handles
  const measuredDistanceUnits = Math.abs(handleBX - handleAX);
  const measuredMm = (measuredDistanceUnits * calibrationFactor).toFixed(2);

  // Dynamic evaluation standard matching matrix based on millimeter bounds
  const evaluatedStandard = (() => {
    const mm = parseFloat(measuredMm);
    if (mm >= 12.8 && mm <= 13.2) return 'FEA 13';
    if (mm >= 14.8 && mm <= 15.2) return 'FEA 15';
    if (mm >= 16.8 && mm <= 17.2) return 'FEA 17';
    return 'Sondermaß (Inkompatibel)';
  })();

  // Caliper Drag Pointer Handler
  const handleSVGPointerMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!draggingHandle || !svgRef.current || !isCaliperActive) return;
    
    let clientX = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const rect = svgRef.current.getBoundingClientRect();
    let svgX = ((clientX - rect.left) / rect.width) * 200;
    
    // Clamp to blueprint boundaries
    svgX = Math.max(10, Math.min(190, svgX));
    
    if (draggingHandle === 'A') {
      setHandleAX(Math.min(svgX, handleBX - 5));
    } else if (draggingHandle === 'B') {
      setHandleBX(Math.max(svgX, handleAX + 5));
    }
  };

  // Computes the dynamic compliant mating compatibility matrix depending on target standard
  const computeDynamicMatingMatrix = (blueprintId: number, standard: string) => {
    const isCompatible = (req: string) => {
      if (!standard || typeof standard !== 'string' || standard === 'Sondermaß (Inkompatibel)' || standard === '') return false;
      if (req.includes('/')) {
        const parts = req.split('/'); // e.g. "FEA 15/17"
        return parts.some(p => standard.includes(p.trim()));
      }
      return standard.includes(req.trim());
    };

    if (blueprintId === 1 || blueprintId === 2 || blueprintId === 3) {
      // Bottles
      const allItems = [
        { component: 'Schwere Zamak-Metallkappe', req: 'FEA 17', okReason: 'Mechanisch optimal zentriert. Rastet präzise ein.', errReason: '⚠️ FEA-Konflikt: Kappe erfordert FEA 17 Mündung (Gewinde kollidiert).' },
        { component: 'Massives Eschenholz-Verschluss', req: 'FEA 17', okReason: 'Exakte Passung. Kragendurchmesser deckt Mündung perfekt ab.', errReason: '⚠️ FEA-Konflikt: Holzverschluss erfordert FEA 17.' },
        { component: 'Unsichtbar Crimpless Pumpe', req: 'FEA 15 / FEA 17', okReason: 'Steigrohrlänge reicht bis Flaschenboden. Dichtung schließt dicht.', errReason: '⚠️ FEA-Konflikt: Erfordert FEA 15 oder FEA 17.' },
        { component: 'Sicher Crimp Pumpe', req: 'FEA 15 / FEA 17', okReason: 'Voll kompatibel für Pressverschluss.', errReason: '⚠️ FEA-Konflikt: Erfordert FEA 15 oder FEA 17.' },
        { component: 'Eco PP Verschlusskappe', req: 'FEA 13 / FEA 15', okReason: 'Voll kompatibel mit dem PP-Mündungsgewinde.', errReason: '⚠️ FEA-Konflikt: Erfordert FEA 13 oder FEA 15.' },
        { component: 'Klassische ABS Kappe', req: 'FEA 15 / FEA 17', okReason: 'Optimaler Sitz. Kappeninnengewinde greift fehlerfrei.', errReason: '⚠️ FEA-Konflikt: Kappeninnengewinde greift nicht.' },
        { component: 'Kristallklare Surlyn Kappe', req: 'FEA 15 / FEA 17', okReason: 'Exakte Zentrierung. Gewährleistet edle Glass-on-Glass Optik.', errReason: '⚠️ FEA-Konflikt: Surlyn Kappe erfordert FEA 15 oder FEA 17.' },
        { component: 'Schraubgewinde-Pumpe (Refill)', req: 'FEA 15 / FEA 17', okReason: 'Schraubkupplung dichtet hermetisch ab. Perfekt für nachfüllbare Flakons.', errReason: '⚠️ FEA-Konflikt: Refill-Gewinde wackelt.' },
        { component: 'Schnappverschluss-Pumpe', req: 'FEA 13 / FEA 15', okReason: 'Schnappt sauber auf den Flaschenhals auf. Perfekter B2B-Muster-Standard.', errReason: '⚠️ FEA-Konflikt: Schnappkragen greift nicht über Halsweite.' }
      ];

      const activeComponents = blueprintId === 1 
        ? ['Schwere Zamak-Metallkappe', 'Massives Eschenholz-Verschluss', 'Unsichtbar Crimpless Pumpe', 'Sicher Crimp Pumpe', 'Eco PP Verschlusskappe']
        : blueprintId === 2
        ? ['Klassische ABS Kappe', 'Kristallklare Surlyn Kappe', 'Eco PP Verschlusskappe', 'Schraubgewinde-Pumpe (Refill)', 'Schwere Zamak-Metallkappe']
        : ['Eco PP Verschlusskappe', 'Schnappverschluss-Pumpe', 'Schwere Zamak-Metallkappe', 'Klassische ABS Kappe'];

      return allItems
        .filter(item => activeComponents.includes(item.component))
        .map(item => {
          const compatible = isCompatible(item.req);
          return {
            component: item.component,
            standard: item.req,
            compatible,
            reason: compatible ? item.okReason : item.errReason
          };
        });
    } else {
      // Caps
      const allItems = [
        { component: 'Violet Antelope Flakon (100ml)', req: 'FEA 17', okReason: 'Perfekter Abschluss. Rastung hält Kappe spielfrei in Position.', errReason: '❌ Inkompatibel: Kappe passt mechanisch nicht über den 17.0mm Flaschenkragen.' },
        { component: 'Maison Size Flakon (75ml)', req: 'FEA 17', okReason: 'Satt sitzende Haptik. Spaltmaße liegen unter 0.1mm.', errReason: '❌ Inkompatibel: Kappe passt mechanisch nicht über den 17.0mm Flaschenkragen.' },
        { component: 'Standard Signature Flakon (50ml)', req: 'FEA 15', okReason: 'Optimaler Sitz und präzise Schraubwindung.', errReason: '❌ Inkompatibel: Kappe erfordert FEA 17 Mündung, Flakon hat FEA 15 (Kappe wackelt).' },
        { component: 'Vial Echantillon (5ml)', req: 'FEA 13', okReason: 'Kompakt sitzende Röhrenglashülse.', errReason: '❌ Inkompatibel: Mündungs-Außendurchmesser (13mm) ist zu klein für das Kappeninnengewinde.' }
      ];

      return allItems.map(item => {
        const compatible = isCompatible(item.req);
        return {
          component: item.component,
          standard: item.req,
          compatible,
          reason: compatible ? item.okReason : item.errReason
        };
      });
    }
  };

  const handleSelectBlueprint = (id: number) => {
    setSelectedId(id);
    setScanState('scanning');
    setScanProgress(0);
    setDisplayedLogs([]);

    // Turn off caliper on select until scan completes, clear previous overrides
    setIsCaliperActive(false);
    setCalibratedStandardOverride(null);

    const selected = blueprints.find(b => b.id === id);
    if (!selected) return;

    // Reset caliper to initial blueprint defaults
    if (id === 1) {
      setHandleAX(88);
      setHandleBX(112);
      setCalibrationFactor(0.709); // 24 px * 0.709 = 17.02 mm
    } else if (id === 2) {
      setHandleAX(90);
      setHandleBX(110);
      setCalibrationFactor(0.750); // 20 px * 0.75 = 15.00 mm
    } else if (id === 3) {
      setHandleAX(91);
      setHandleBX(109);
      setCalibrationFactor(0.722); // 18 px * 0.722 = 13.00 mm
    } else if (id === 4) {
      setHandleAX(68);
      setHandleBX(132);
      setCalibrationFactor(0.268); // 64 px * 0.268 = 17.15 mm
    } else if (id === 5) {
      setHandleAX(72);
      setHandleBX(128);
      setCalibrationFactor(0.254); // 56 px * 0.254 = 14.22 mm
    }

    setActiveStandard(selected.identifiedStandard);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Simulate drop by selecting the first blueprint (Violet Antelope)
    handleSelectBlueprint(1);
    
    // Trigger tiny toast
    setToast("CAD-Datei 'Flaschenentwurf_100ml_V3.step' erfolgreich hochgeladen und importiert.");
    setTimeout(() => setToast(null), 5000);
  };

  const handleExportReport = () => {
    const selected = blueprints.find(b => b.id === selectedId);
    if (!selected) return;
    
    const finalStd = activeStandard || selected.identifiedStandard;
    setToast(`Erfolgreich: CAD-Prüfbericht 'Madison-CAD-Report-${finalStd.replace(' ', '')}.pdf' generiert und heruntergeladen.`);
    setTimeout(() => setToast(null), 5000);
  };

  const handleLaunchConfigurator = () => {
    const selected = blueprints.find(b => b.id === selectedId);
    if (!selected) return;

    setSelectedCategory('duefte');
    
    // Establish standard configuration in AppContext matching the scanned blueprint and calibrated standard
    const finalStandard = activeStandard || selected.identifiedStandard;
    let config: Record<string, any> = {
      menge: 10000,
    };

    if (selected.id === 1 || (selected.category === 'Flasche' && finalStandard === 'FEA 17')) {
      config = {
        ...config,
        flaschenvolumen: '100ml',
        flaschenform: 'antelope',
        kappe: 'zamak',
        pumpe: 'crimpless',
        flaschenfarbe: 'klar',
        duftrichtung: 'violet',
        mündung_standard: 'FEA 17' // synchronized caliper data
      };
    } else if (selected.id === 2 || (selected.category === 'Flasche' && finalStandard === 'FEA 15')) {
      config = {
        ...config,
        flaschenvolumen: '50ml',
        flaschenform: 'hoch',
        kappe: 'surlyn',
        pumpe: 'screw',
        flaschenfarbe: 'amber',
        mündung_standard: 'FEA 15'
      };
    } else if (selected.id === 3 || (selected.category === 'Flasche' && finalStandard === 'FEA 13')) {
      config = {
        ...config,
        flaschenvolumen: '5ml',
        flaschenform: 'breit',
        kappe: 'pp',
        pumpe: 'schnapp',
        mündung_standard: 'FEA 13'
      };
    } else {
      config = {
        ...config,
        flaschenvolumen: '100ml',
        flaschenform: 'antelope',
        kappe: 'zamak',
        mündung_standard: finalStandard
      };
    }

    setConfiguratorConfig(config);
    navigate('/konfigurator'); // Direct navigation to the 3D configurator
  };

  const selected = blueprints.find(b => b.id === selectedId);

  // Renders the draggable gold caliper overlay on top of any active SVG blueprint
  const renderCaliperOverlay = (caliperY: number) => {
    if (!isCaliperActive) return null;
    
    return (
      <g className="cursor-pointer select-none">
        {/* Horizontal ruler line */}
        <line 
          x1={handleAX} 
          y1={caliperY} 
          x2={handleBX} 
          y2={caliperY} 
          stroke="#D4AF37" 
          strokeWidth="1.5" 
          strokeDasharray="2 2"
        />
        
        {/* Left vertical extension line */}
        <line 
          x1={handleAX} 
          y1={caliperY - 15} 
          x2={handleAX} 
          y2={caliperY + 15} 
          stroke="#D4AF37" 
          strokeWidth="1"
        />
        
        {/* Right vertical extension line */}
        <line 
          x1={handleBX} 
          y1={caliperY - 15} 
          x2={handleBX} 
          y2={caliperY + 15} 
          stroke="#D4AF37" 
          strokeWidth="1"
        />

        {/* Handle A: Left golden draggable circle */}
        <circle 
          cx={handleAX} 
          cy={caliperY} 
          r="7" 
          fill="#D4AF37" 
          stroke="#0b0c0e" 
          strokeWidth="2"
          className="hover:scale-125 transition-transform cursor-ew-resize duration-150"
          onMouseDown={(e) => { e.stopPropagation(); setDraggingHandle('A'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDraggingHandle('A'); }}
        />

        {/* Handle B: Right golden draggable circle */}
        <circle 
          cx={handleBX} 
          cy={caliperY} 
          r="7" 
          fill="#D4AF37" 
          stroke="#0b0c0e" 
          strokeWidth="2"
          className="hover:scale-125 transition-transform cursor-ew-resize duration-150"
          onMouseDown={(e) => { e.stopPropagation(); setDraggingHandle('B'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDraggingHandle('B'); }}
        />

        {/* Center dimension label bubble */}
        <g transform={`translate(${(handleAX + handleBX) / 2}, ${caliperY - 12})`}>
          <rect 
            x="-25" 
            y="-6" 
            width="50" 
            height="12" 
            rx="3" 
            fill="#0b0c0e" 
            stroke="#D4AF37" 
            strokeWidth="1"
          />
          <text 
            x="0" 
            y="2.5" 
            fill="#D4AF37" 
            fontSize="7" 
            fontWeight="bold" 
            textAnchor="middle" 
            stroke="none"
          >
            {measuredMm} mm
          </text>
        </g>
      </g>
    );
  };

  // SVG Blueprints drawing methods based on selection
  const renderSVGBlueprint = (id: number) => {
    switch (id) {
      case 1:
        // Curvy Violet Antelope Bottle
        return (
          <svg 
            ref={svgRef}
            onMouseMove={handleSVGPointerMove}
            onTouchMove={handleSVGPointerMove}
            viewBox="0 0 200 240" 
            className="w-full h-full text-white/80" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="1.5"
          >
            {/* Dimensions Grid lines */}
            <path d="M 20 20 L 180 20" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            <path d="M 20 215 L 180 215" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            
            {/* Dimension arrow lines */}
            {/* Height 89.84mm */}
            <line x1="20" y1="20" x2="20" y2="215" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="20,20 17,28 23,28" fill="#A47E3C" stroke="none"/>
            <polygon points="20,215 17,207 23,207" fill="#A47E3C" stroke="none"/>
            <text x="12" y="125" transform="rotate(-90 12 125)" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">H: 89.84 mm</text>
            
            {/* Width 95.3mm */}
            <line x1="45" y1="227" x2="155" y2="227" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="45,227 53,224 53,230" fill="#A47E3C" stroke="none"/>
            <polygon points="155,227 147,224 147,230" fill="#A47E3C" stroke="none"/>
            <text x="100" y="237" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">B: 95.30 mm</text>

            {/* Neck 17.02mm */}
            <line x1="88" y1="8" x2="112" y2="8" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="88,8 94,6 94,10" fill="#A47E3C" stroke="none"/>
            <polygon points="112,8 106,6 106,10" fill="#A47E3C" stroke="none"/>
            <text x="100" y="4" fill="#A47E3C" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Mündung Ø 17.02 mm (FEA 17)</text>

            {/* Neck Outer Thread Section */}
            <rect x="88" y="15" width="24" height="20" stroke="currentColor" fill="none"/>
            <path d="M 88 20 L 112 24" stroke="currentColor" strokeWidth="2"/>
            <path d="M 88 28 L 112 32" stroke="currentColor" strokeWidth="2"/>

            {/* Shoulder & Body */}
            <path d="M 100 35 L 82 35 C 75 35 70 42 66 50 C 60 62 45 80 45 110 C 45 150 55 180 70 200 C 78 210 85 215 100 215 C 115 215 122 210 130 200 C 145 180 155 150 155 110 C 155 80 140 62 134 50 C 130 42 125 35 118 35 Z" stroke="currentColor" fill="rgba(164, 126, 60, 0.05)" />
            
            {/* Base thickness */}
            <path d="M 70 200 C 78 210 85 215 100 215 C 115 215 122 210 130 200" stroke="currentColor" strokeWidth="3" opacity="0.6"/>
            
            {/* Centerline */}
            <line x1="100" y1="5" x2="100" y2="230" stroke="#fff" strokeDasharray="5 5" opacity="0.2"/>

            {/* Inner fluid curve */}
            <path d="M 82 52 C 82 52 90 56 100 52 C 110 48 118 52 118 52 C 122 60 144 95 144 125 C 144 175 125 198 100 198 C 75 198 56 175 56 125 Z" stroke="rgba(164, 126, 60, 0.4)" fill="rgba(164, 126, 60, 0.15)"/>
            
            {/* Draggable Caliper Overlay */}
            {renderCaliperOverlay(28)}
          </svg>
        );
      case 2:
        // Signature 50ml Cylindrical Bottle
        return (
          <svg 
            ref={svgRef}
            onMouseMove={handleSVGPointerMove}
            onTouchMove={handleSVGPointerMove}
            viewBox="0 0 200 240" 
            className="w-full h-full text-white/80" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="1.5"
          >
            {/* Dimensions Grid lines */}
            <path d="M 30 30 L 170 30" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            <path d="M 30 205 L 170 205" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            
            {/* Height 76.5mm */}
            <line x1="30" y1="30" x2="30" y2="205" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="30,30 27,38 33,38" fill="#A47E3C" stroke="none"/>
            <polygon points="30,205 27,197 33,197" fill="#A47E3C" stroke="none"/>
            <text x="22" y="118" transform="rotate(-90 22 118)" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">H: 76.50 mm</text>
            
            {/* Width 45mm */}
            <line x1="65" y1="220" x2="135" y2="220" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="65,220 73,217 73,223" fill="#A47E3C" stroke="none"/>
            <polygon points="135,220 127,217 127,223" fill="#A47E3C" stroke="none"/>
            <text x="100" y="232" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">B: 45.00 mm</text>

            {/* Neck 15.01mm */}
            <line x1="90" y1="18" x2="110" y2="18" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="90,18 96,16 96,20" fill="#A47E3C" stroke="none"/>
            <polygon points="110,18 104,16 104,20" fill="#A47E3C" stroke="none"/>
            <text x="100" y="13" fill="#A47E3C" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none">Mündung Ø 15.01 mm (FEA 15)</text>

            {/* Neck Thread */}
            <rect x="90" y="25" width="20" height="15" stroke="currentColor" fill="none"/>
            <path d="M 90 29 L 110 32" stroke="currentColor" strokeWidth="2"/>
            <path d="M 90 35 L 110 38" stroke="currentColor" strokeWidth="2"/>

            {/* Body */}
            <path d="M 100 40 L 70 42 C 67 43 65 45 65 48 L 65 200 C 65 203 67 205 70 205 L 130 205 C 133 205 135 203 135 200 L 135 48 C 135 45 133 43 130 42 Z" stroke="currentColor" fill="rgba(164, 126, 60, 0.05)"/>
            
            {/* Centerline */}
            <line x1="100" y1="10" x2="100" y2="215" stroke="#fff" strokeDasharray="5 5" opacity="0.2"/>

            {/* Liquid */}
            <rect x="71" y="65" width="58" height="132" stroke="rgba(164, 126, 60, 0.3)" fill="rgba(164, 126, 60, 0.1)"/>
            
            {/* Draggable Caliper Overlay */}
            {renderCaliperOverlay(33)}
          </svg>
        );
      case 3:
        // 5ml Test Vial
        return (
          <svg 
            ref={svgRef}
            onMouseMove={handleSVGPointerMove}
            onTouchMove={handleSVGPointerMove}
            viewBox="0 0 200 240" 
            className="w-full h-full text-white/80" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="1.5"
          >
            {/* Dimensions Grid lines */}
            <path d="M 40 40 L 160 40" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            <path d="M 40 180 L 160 180" stroke="#A47E3C" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6"/>
            
            {/* Height 42.0mm */}
            <line x1="40" y1="40" x2="40" y2="180" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="40,40 37,48 43,48" fill="#A47E3C" stroke="none"/>
            <polygon points="40,180 37,172 43,172" fill="#A47E3C" stroke="none"/>
            <text x="32" y="110" transform="rotate(-90 32 110)" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">H: 42.00 mm</text>
            
            {/* Width 14.5mm */}
            <line x1="75" y1="195" x2="125" y2="195" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="75,195 83,192 83,198" fill="#A47E3C" stroke="none"/>
            <polygon points="125,195 117,192 117,198" fill="#A47E3C" stroke="none"/>
            <text x="100" y="207" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">B: 14.50 mm</text>

            {/* Neck 13.0mm */}
            <line x1="91" y1="28" x2="109" y2="28" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="91,28 97,26 97,30" fill="#A47E3C" stroke="none"/>
            <polygon points="109,28 103,26 103,30" fill="#A47E3C" stroke="none"/>
            <text x="100" y="23" fill="#A47E3C" fontSize="6.5" fontWeight="bold" textAnchor="middle" stroke="none">Ø 13.00 mm (FEA 13)</text>

            {/* Neck */}
            <rect x="91" y="32" width="18" height="12" stroke="currentColor" fill="none"/>
            <path d="M 91 36 L 109 38" stroke="currentColor" strokeWidth="2.5"/>

            {/* Body */}
            <rect x="80" y="44" width="40" height="136" stroke="currentColor" fill="rgba(164, 126, 60, 0.05)"/>
            
            {/* Centerline */}
            <line x1="100" y1="15" x2="100" y2="190" stroke="#fff" strokeDasharray="5 5" opacity="0.2"/>

            {/* Fluid */}
            <rect x="83" y="60" width="34" height="117" stroke="rgba(164, 126, 60, 0.3)" fill="rgba(164, 126, 60, 0.1)"/>
            
            {/* Draggable Caliper Overlay */}
            {renderCaliperOverlay(38)}
          </svg>
        );
      case 4:
        // Zamak Cap Section (Interior View)
        return (
          <svg 
            ref={svgRef}
            onMouseMove={handleSVGPointerMove}
            onTouchMove={handleSVGPointerMove}
            viewBox="0 0 200 240" 
            className="w-full h-full text-white/80" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="1.5"
          >
            {/* Cap Height 28.0mm */}
            <line x1="30" y1="50" x2="30" y2="175" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="30,50 27,58 33,58" fill="#A47E3C" stroke="none"/>
            <polygon points="30,175 27,167 33,167" fill="#A47E3C" stroke="none"/>
            <text x="22" y="112" transform="rotate(-90 22 112)" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">H: 28.00 mm</text>

            {/* Cap Width 32mm */}
            <line x1="50" y1="35" x2="150" y2="35" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="50,35 58,32 58,38" fill="#A47E3C" stroke="none"/>
            <polygon points="150,35 142,32 142,38" fill="#A47E3C" stroke="none"/>
            <text x="100" y="27" fill="#A47E3C" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">B: 32.00 mm</text>

            {/* Inner Neck 17.15mm */}
            <line x1="68" y1="188" x2="132" y2="188" stroke="#A47E3C" strokeWidth="1"/>
            <polygon points="68,188 76,185 76,191" fill="#A47E3C" stroke="none"/>
            <polygon points="132,188 124,185 124,191" fill="#A47E3C" stroke="none"/>
            <text x="100" y="200" fill="#A47E3C" fontSize="7.5" fontWeight="bold" textAnchor="middle" stroke="none">Innen-Ø 17.15 mm (FEA 17)</text>

            {/* Cap Outer Body */}
            <path d="M 50 50 L 150 50 L 150 175 L 132 175 L 132 80 L 68 80 L 68 175 L 50 175 Z" stroke="currentColor" fill="rgba(164, 126, 60, 0.05)"/>
            
            {/* Metal thickness hatch markings (Engineering style) */}
            <line x1="53" y1="53" x2="68" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <line x1="68" y1="53" x2="83" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <line x1="117" y1="53" x2="132" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <line x1="132" y1="53" x2="147" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>

            {/* Internal Thread structure */}
            <path d="M 68 95 L 74 98" stroke="currentColor" strokeWidth="3"/>
            <path d="M 68 115 L 74 118" stroke="currentColor" strokeWidth="3"/>
            <path d="M 132 99 L 126 102" stroke="currentColor" strokeWidth="3"/>
            <path d="M 132 119 L 126 122" stroke="currentColor" strokeWidth="3"/>
            
            {/* Centerline */}
            <line x1="100" y1="40" x2="100" y2="185" stroke="#fff" strokeDasharray="5 5" opacity="0.2"/>
            
            {/* Draggable Caliper Overlay */}
            {renderCaliperOverlay(175)}
          </svg>
        );
      case 5:
        // Incompatible Custom plastic cap M14 (Odd Thread)
        return (
          <svg 
            ref={svgRef}
            onMouseMove={handleSVGPointerMove}
            onTouchMove={handleSVGPointerMove}
            viewBox="0 0 200 240" 
            className="w-full h-full text-red-500/80" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="1.5"
          >
            {/* Dimensions */}
            <text x="100" y="27" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle" stroke="none">B: 28.00 mm</text>
            <line x1="55" y1="35" x2="145" y2="35" stroke="#ef4444" strokeWidth="1"/>
            
            <text x="100" y="200" fill="#ef4444" fontSize="7.5" fontWeight="bold" textAnchor="middle" stroke="none">M14 Gewinde (Sondermaß Ø 14.20 mm)</text>
            <line x1="72" y1="188" x2="128" y2="188" stroke="#ef4444" strokeWidth="1"/>

            {/* Outer Silhouette */}
            <path d="M 55 60 L 145 60 L 145 160 L 128 160 L 128 90 L 72 90 L 72 160 L 55 160 Z" stroke="currentColor" fill="rgba(239, 68, 68, 0.05)"/>
            
            {/* Non-standard coarse thread */}
            <path d="M 72 105 L 80 110" stroke="currentColor" strokeWidth="3"/>
            <path d="M 128 120 L 120 125" stroke="currentColor" strokeWidth="3"/>

            {/* warning sign */}
            <g transform="translate(88, 105)" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <path d="M12 2L2 22h20L12 2z" strokeWidth="1.5"/>
              <line x1="12" y1="9" x2="12" y2="14" strokeWidth="2"/>
              <line x1="12" y1="18" x2="12" y2="18.5" strokeWidth="2.5"/>
            </g>
            
            {/* Draggable Caliper Overlay */}
            {renderCaliperOverlay(160)}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-madison-dark/95 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden group/scanner">
      {/* Decorative premium ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-madison-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-madison-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Toast Notification for premium B2B alerts */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16120b] border border-madison-gold/30 text-white rounded-xl py-3.5 px-5 shadow-2xl flex items-center gap-3 animate-slide-up max-w-md">
          <div className="w-2 h-2 rounded-full bg-madison-gold animate-ping"/>
          <Info className="w-4 h-4 text-madison-gold shrink-0"/>
          <span className="text-xs font-semibold tracking-wide text-gray-200">{toast}</span>
        </div>
      )}

      {/* Sektion Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-madison-gold animate-pulse"/>
            <span className="text-madison-gold text-[10px] font-bold tracking-[0.3em] uppercase">
              Madison Packaging Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-zilla font-light tracking-wide text-white">
            AI CAD- & Skizzen-Passungs-Prüfer
          </h2>
          <p className="text-gray-400 text-xs mt-1 font-open max-w-xl">
            Laden Sie eigene Entwürfe hoch oder simulieren Sie einen Blueprint, um Gewindekollisionen vorzubeugen und Passungen (FEA 13/15/17) automatisiert abzugleichen.
          </p>
        </div>
        
        {/* Statistics tag */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start md:self-auto">
          <Layers className="w-4 h-4 text-madison-gold"/>
          <div className="text-left">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Datenbank-Standards</div>
            <div className="text-xs font-bold text-white">FEA 13 • FEA 15 • FEA 17</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: Upload Drag-and-Drop Area & Selector */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="text-xs font-bold uppercase tracking-widest text-madison-gold/80 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5"/> Skizze / CAD importieren
          </div>

          {/* Interactive Drag & Drop Box */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDropFile}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[160px] bg-white/[0.02] ${
              isDragOver 
                ? 'border-madison-gold bg-madison-gold/10 scale-[1.02]' 
                : 'border-white/15 hover:border-madison-gold/50 hover:bg-white/[0.04]'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-madison-gold/70 mb-3 group-hover/scanner:scale-110 transition-transform duration-300"/>
            <span className="text-xs font-bold text-white mb-1">CAD-Datei oder Skizze ablegen</span>
            <span className="text-[10px] text-gray-400">Unterstützt PNG, JPG, STEP, IGES, DWG</span>
            
            <div className="w-full flex items-center justify-center my-3 gap-2">
              <span className="h-[1px] w-8 bg-white/10"></span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">oder</span>
              <span className="h-[1px] w-8 bg-white/10"></span>
            </div>
            
            <button 
              onClick={() => handleSelectBlueprint(1)}
              className="text-[9px] font-bold uppercase tracking-widest text-madison-gold hover:text-white transition-colors duration-200"
            >
              System-Beispiel laden
            </button>
          </div>

          {/* Preloaded Blueprints list */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Interaktive Prüfbeispiele</span>
            {blueprints.map((bp) => {
              const isSelected = selectedId === bp.id;
              const hasClash = bp.identifiedStandard.includes('Inkompatibel');
              return (
                <button
                  key={bp.id}
                  onClick={() => handleSelectBlueprint(bp.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-madison-gold/10 border-madison-gold shadow-md' 
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-madison-gold' : 'text-gray-400'}`}/>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-madison-gold transition-colors duration-200">
                        {bp.name}
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5 font-open flex items-center gap-1.5">
                        <span>{bp.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{bp.dimensions.volumeEstimate || 'Zubehör'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    hasClash 
                      ? 'bg-red-500/10 border border-red-500/25 text-red-400' 
                      : 'bg-madison-gold/10 border border-madison-gold/20 text-madison-gold'
                  }`}>
                    {bp.identifiedStandard}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: High-Fidelity Laser Scanner View */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-widest text-madison-gold/80 mb-1 flex items-center justify-between">
            <span>2D-Blueprint Vektor-Mesh</span>
            {selected && scanState === 'complete' && (
              <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                100% CAD RECONSTRUCTED
              </span>
            )}
          </div>

          <div className="bg-[#0b0c0e] border border-white/10 rounded-2xl h-[390px] p-6 flex items-center justify-center relative overflow-hidden">
            {/* Drafting blueprint grid background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(164, 126, 60, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                backgroundPosition: 'center'
              }}
            />

            {selectedId ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* SVG Blueprint */}
                {renderSVGBlueprint(selectedId)}

                {/* Laser Sweep Line */}
                {scanState === 'scanning' && (
                  <div 
                    className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-madison-gold to-transparent shadow-[0_0_15px_#A47E3C] animate-scan-sweep"
                  />
                )}
              </div>
            ) : (
              <div className="text-center p-6 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4 animate-pulse">
                  <FileText className="w-6 h-6 text-gray-400"/>
                </div>
                <h4 className="text-xs font-bold text-gray-300 mb-1">Kein Blueprint aktiv</h4>
                <p className="text-[10px] text-gray-500 max-w-[200px]">
                  Wählen Sie ein Prüfbeispiel oder laden Sie eine eigene Zeichnung hoch.
                </p>
              </div>
            )}
          </div>

          {/* Extracted dimensions overlay */}
          {selected && scanState === 'complete' && (
            <div className="bg-[#0b0c0e]/80 border border-white/15 rounded-xl p-4 flex flex-wrap gap-x-6 gap-y-3 justify-between">
              <div className="text-left">
                <div className="text-[8px] text-gray-400 font-bold uppercase">Gesamthöhe</div>
                <div className="text-xs font-bold text-white font-mono">{selected.dimensions.height}</div>
              </div>
              <div className="text-left">
                <div className="text-[8px] text-gray-400 font-bold uppercase">Max. Breite</div>
                <div className="text-xs font-bold text-white font-mono">{selected.dimensions.width}</div>
              </div>
              <div className="text-left">
                <div className="text-[8px] text-gray-400 font-bold uppercase">Mündung Ø</div>
                <div className="text-xs font-bold text-white font-mono">{selected.dimensions.neckDiameter}</div>
              </div>
              <div className="text-left">
                <div className="text-[8px] text-gray-400 font-bold uppercase">Gewinde-Pitch</div>
                <div className="text-xs font-bold text-white font-mono">{selected.dimensions.threadPitch}</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Terminal Diagnosis & Compatibility Mating Matrix */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="text-xs font-bold uppercase tracking-widest text-madison-gold/80 mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5"/> AI Diagnose-Terminal
          </div>

          {/* Monospace Console Logger */}
          <div ref={terminalContainerRef} className="bg-[#08090a] border border-white/10 rounded-2xl h-[120px] p-4 font-mono text-[9px] leading-relaxed text-gray-300 overflow-y-auto flex flex-col gap-1.5 select-none relative">
            {displayedLogs.length > 0 ? (
              <>
                {displayedLogs.map((log, index) => {
                  if (!log || typeof log !== 'string') return null;
                  let logColor = 'text-gray-400';
                  if (log.startsWith('[SUCCESS]') || log.startsWith('[MATCH]')) logColor = 'text-green-400 font-bold';
                  if (log.startsWith('[WARNING]')) logColor = 'text-amber-400 font-bold';
                  if (log.startsWith('[CRITICAL]') || log.startsWith('[ERROR]')) logColor = 'text-red-400 font-bold';
                  if (log.startsWith('[AI]')) logColor = 'text-madison-gold';
                  if (log.startsWith('[CALIPER]') || log.startsWith('[CALIBRATOR]')) logColor = 'text-[#D4AF37] font-semibold';
                  
                  return (
                    <div key={index} className={logColor}>
                      {log}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-gray-600 italic h-full flex items-center justify-center">
                Warte auf Eingabe...
              </div>
            )}
            
            {scanState === 'scanning' && (
              <div className="absolute bottom-2 right-4 flex items-center gap-1.5 text-[8px] text-madison-gold font-bold uppercase bg-[#08090a] px-2 py-0.5 rounded border border-madison-gold/20">
                <RefreshCw className="w-2.5 h-2.5 animate-spin"/> {scanProgress}%
              </div>
            )}
          </div>

          {/* Feature 4: Interactive Vision Caliper Card */}
          {selected && scanState === 'complete' && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-madison-gold"/>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Vision-Messschieber</span>
                </div>
                <button
                  onClick={() => {
                    setIsCaliperActive(!isCaliperActive);
                    if (!isCaliperActive) {
                      setDisplayedLogs(prev => [
                        ...prev,
                        `[CALIPER] Manueller Vision-Messschieber aktiviert. Bewege goldene Messbacken A & B auf der Zeichnung.`
                      ]);
                    }
                  }}
                  className={`text-[9px] font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase transition-all duration-300 ${
                    isCaliperActive
                      ? 'bg-madison-gold text-white shadow-[0_0_10px_rgba(164,126,60,0.4)]'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isCaliperActive ? 'Aus' : 'An'}
                </button>
              </div>

              {isCaliperActive && (
                <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-white/5 animate-fade-in">
                  {/* Caliper metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 p-2 rounded-xl text-left">
                      <span className="text-[8px] text-gray-400 font-bold uppercase block">Pixel-Distanz</span>
                      <span className="text-xs font-bold text-white font-mono">{measuredDistanceUnits.toFixed(1)} px</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-2 rounded-xl text-left">
                      <span className="text-[8px] text-gray-400 font-bold uppercase block">Gemessener Ø</span>
                      <span className="text-xs font-bold text-madison-gold font-mono">{measuredMm} mm</span>
                    </div>
                  </div>

                  {/* Calibration Factor Slider */}
                  <div className="text-left bg-black/20 border border-white/5 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Maßstab-Faktor</span>
                      <span className="text-[9px] text-madison-gold font-mono font-bold">x {calibrationFactor.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.100"
                      max="1.500"
                      step="0.001"
                      value={calibrationFactor}
                      onChange={(e) => setCalibrationFactor(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-madison-gold"
                    />
                    <div className="flex justify-between text-[7px] text-gray-500 mt-1 font-mono">
                      <span>x0.10</span>
                      <span>Maßstab kalibrieren</span>
                      <span>x1.50</span>
                    </div>
                  </div>

                  {/* evaluated standard match */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                    evaluatedStandard === 'Sondermaß (Inkompatibel)'
                      ? 'bg-red-500/5 border-red-500/20 text-red-400'
                      : 'bg-green-500/5 border-green-500/20 text-green-400'
                  }`}>
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase block text-left">Passungsauswertung</div>
                      <div className="text-[10px] font-bold mt-0.5 text-left">
                        {evaluatedStandard === 'Sondermaß (Inkompatibel)' ? '⚠️ Sondermaß (Risiko)' : `Erkannt: ${evaluatedStandard}`}
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      evaluatedStandard === 'Sondermaß (Inkompatibel)'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {evaluatedStandard === 'Sondermaß (Inkompatibel)' ? 'Sondermaß' : 'Kompatibel'}
                    </span>
                  </div>

                  {/* Override Calibration Button */}
                  <button
                    onClick={() => {
                      setActiveStandard(evaluatedStandard);
                      setCalibratedStandardOverride(evaluatedStandard);
                      setToast(`Gewindekupplung manuell als '${evaluatedStandard}' festgelegt.`);
                      setDisplayedLogs(prev => [
                        ...prev,
                        `[CALIBRATOR] Gewindemessung manuell kalibriert: ${measuredMm} mm -> Standard deklariert als '${evaluatedStandard}'.`
                      ]);
                      setTimeout(() => setToast(null), 5000);
                    }}
                    disabled={activeStandard === evaluatedStandard}
                    className={`w-full py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${
                      activeStandard === evaluatedStandard
                        ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                    }`}
                  >
                    {activeStandard === evaluatedStandard ? 'Gewindemaß synchronisiert' : 'Mündungswert deklarieren'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Baugruppen Mating Compatibility Matrix */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-widest text-madison-gold/80 flex items-center justify-between">
              <span>Passungs-Kupplungsmatrix</span>
              {selected && scanState === 'complete' && (
                <span className="text-[8px] font-mono text-gray-400">
                  {activeStandard === 'Sondermaß (Inkompatibel)' ? '0 kompatible Teile' : 'Kombinationen aktiv'}
                </span>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              {selected && scanState === 'complete' ? (
                <div className="flex flex-col gap-2.5">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl mb-1 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase text-left">Identifiziertes Gewinde</div>
                      <div className="text-sm font-bold text-white font-zilla mt-0.5 text-left flex items-center gap-1.5">
                        <span>{selected.standardName}</span>
                        <span className="text-madison-gold">({activeStandard})</span>
                        {calibratedStandardOverride && (
                          <span className="text-[7px] bg-madison-gold/15 text-madison-gold border border-madison-gold/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Kalibriert
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`p-1.5 rounded-lg ${
                      activeStandard === 'Sondermaß (Inkompatibel)'
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {activeStandard === 'Sondermaß (Inkompatibel)' ? (
                        <XCircle className="w-5 h-5"/>
                      ) : (
                        <CheckCircle2 className="w-5 h-5"/>
                      )}
                    </div>
                  </div>

                  {/* Components compliance breakdown */}
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1">
                    {computeDynamicMatingMatrix(selected.id, activeStandard).map((item, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-300 ${
                          item.compatible 
                            ? 'bg-green-500/[0.02] border-green-500/10' 
                            : 'bg-red-500/[0.02] border-red-500/10'
                        }`}
                      >
                        <div className="mt-0.5">
                          {item.compatible ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0"/>
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0"/>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-white">
                              {item.component}
                            </span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              item.compatible 
                                ? 'bg-green-500/10 text-green-400' 
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {item.standard}
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-400 mt-1 font-open leading-snug">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={handleExportReport}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3 text-madison-gold"/> PDF-Bericht
                    </button>
                    
                    {activeStandard !== 'Sondermaß (Inkompatibel)' ? (
                      <button
                        onClick={handleLaunchConfigurator}
                        className="bg-madison-gold hover:bg-white hover:text-madison-dark text-white py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
                      >
                        In 3D laden <ChevronRight className="w-3 h-3"/>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-white/5 border border-white/5 text-gray-500 py-3 rounded-xl text-[9px] font-bold tracking-widest uppercase cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        Inkompatibel (3D gesperrt)
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center">
                  <AlertTriangle className="w-5 h-5 text-madison-gold/40 mb-2"/>
                  <span className="text-[10px] text-gray-400">
                    Warten auf AI-Diagnose...
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
