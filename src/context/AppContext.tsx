import React, { createContext, useContext, useState } from 'react';

export interface CustomerProfile {
  firmenname: string;
  land: string;
  branche: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  materialien: string[];
  zertifizierungen: string[];
}

export type CategoryType = 'kosmetikstift' | 'duefte' | null;

export interface B2BProject {
  id: string;
  name: string;
  category: 'kosmetikstift' | 'duefte';
  config: Record<string, any>;
  status: 'Entwurf' | 'Musterbau läuft' | 'Zollabwicklung läuft' | 'Euro-Paletten im Transit';
  progress: number;
  lastModified: string;
}

interface AppContextType {
  customerProfile: CustomerProfile;
  setCustomerProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  selectedCategory: CategoryType;
  setSelectedCategory: React.Dispatch<React.SetStateAction<CategoryType>>;
  configuratorConfig: Record<string, any>;
  setConfiguratorConfig: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  savedProjects: B2BProject[];
  saveProject: (
    name: string,
    category: 'kosmetikstift' | 'duefte',
    config: Record<string, any>,
    status?: B2BProject['status'],
    progress?: number
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({
    firmenname: '',
    land: '',
    branche: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    materialien: [],
    zertifizierungen: [],
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [configuratorConfig, setConfiguratorConfig] = useState<Record<string, any>>({});
  
  const [savedProjects, setSavedProjects] = useState<B2BProject[]>([
    {
      id: 'proj-1',
      name: 'Sommerkollektion 2026 - Rose Gold Elixir',
      category: 'duefte',
      config: {
        menge: 25000,
        flaschenvolumen: '100ml',
        flaschenform: 'antelope',
        flaschenmaterial: 'glas',
        flaschenfarbe: 'klar',
        flaschenveredelung: 'heissfolie',
        folienfarbe: 'rose',
        pumpe: 'crimpless',
        gehaeusematerial: 'aluminium',
        ueberwurfring: 'aluminium',
        kappe: 'zamak',
        kappen_finish: 'poliert',
        faltschachtel: 'ja',
        verpackungsmaterial: 'rigidboard',
        dekoration: ['mattgloss', 'heissfolie'],
        duft: 'Rose Gold Elixir'
      },
      status: 'Musterbau läuft',
      progress: 60,
      lastModified: '2026-05-20T11:42:00Z'
    },
    {
      id: 'proj-2',
      name: 'Herrenlinie Black Label',
      category: 'duefte',
      config: {
        menge: 15000,
        flaschenvolumen: '50ml',
        flaschenform: 'eckig',
        flaschenmaterial: 'glas',
        flaschenfarbe: 'lackiert',
        flaschenveredelung: 'siebdruck',
        siebdruckfarbe: 'weiss',
        pumpe: 'screw',
        gehaeusematerial: 'abs',
        ueberwurfring: 'abs',
        kappe: 'abs',
        faltschachtel: 'ja',
        verpackungsmaterial: 'karton',
        dekoration: ['spotuv'],
        duft: 'Black Label'
      },
      status: 'Zollabwicklung läuft',
      progress: 80,
      lastModified: '2026-05-18T16:15:00Z'
    },
    {
      id: 'proj-3',
      name: 'Artisan Blend Mini-Vials',
      category: 'duefte',
      config: {
        menge: 50000,
        flaschenvolumen: '5ml',
        flaschenform: 'rund',
        flaschenmaterial: 'petg',
        flaschenfarbe: 'klar',
        flaschenveredelung: 'siebdruck',
        siebdruckfarbe: 'gold',
        pumpe: 'schnapp',
        gehaeusematerial: 'pp',
        ueberwurfring: 'abs',
        kappe: 'pp',
        faltschachtel: 'nein',
        duft: 'Artisan Blend'
      },
      status: 'Euro-Paletten im Transit',
      progress: 95,
      lastModified: '2026-05-15T09:30:00Z'
    }
  ]);

  const saveProject = (
    name: string,
    category: 'kosmetikstift' | 'duefte',
    config: Record<string, any>,
    status: B2BProject['status'] = 'Entwurf',
    progress = 20
  ) => {
    setSavedProjects((prev) => {
      const existingIdx = prev.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
      const nowStr = new Date().toISOString();
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          config,
          status,
          progress,
          lastModified: nowStr
        };
        return updated;
      } else {
        const newProj: B2BProject = {
          id: `proj-${Date.now()}`,
          name,
          category,
          config,
          status,
          progress,
          lastModified: nowStr
        };
        return [newProj, ...prev];
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        customerProfile,
        setCustomerProfile,
        selectedCategory,
        setSelectedCategory,
        configuratorConfig,
        setConfiguratorConfig,
        savedProjects,
        saveProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
