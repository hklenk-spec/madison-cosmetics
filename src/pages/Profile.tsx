import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { FormSection } from '../components/FormSection';
import { Building2, User as UserIcon, Settings, ArrowRight } from 'lucide-react';

const INDUSTRIES = ['Kosmetikmarke', 'Private Label', 'Einzelhandel', 'Distributor', 'Sonstiges'];
const MATERIALS = ['Glas', 'PET', 'Aluminium', 'Bambus', 'PCR-Kunststoff'];
const CERTIFICATIONS = ['ISO 9001', 'FSC', 'Vegan', 'Cruelty-Free'];

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { customerProfile, setCustomerProfile } = useAppContext();
  
  // Local state initialized with context data
  const [profile, setProfile] = useState({ ...customerProfile });
  
  // Validation status
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTextChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayToggle = (field: 'materialien' | 'zertifizierungen', value: string) => {
    setProfile((prev) => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple verification - matching premium UX expectations
    const newErrors: Record<string, string> = {};
    if (!profile.firmenname.trim()) newErrors.firmenname = 'Firmenname wird benötigt';
    if (!profile.land.trim()) newErrors.land = 'Land wird benötigt';
    if (!profile.branche) newErrors.branche = 'Bitte wählen Sie eine Branche';
    if (!profile.vorname.trim()) newErrors.vorname = 'Vorname wird benötigt';
    if (!profile.nachname.trim()) newErrors.nachname = 'Nachname wird benötigt';
    if (!profile.email.trim()) {
      newErrors.email = 'E-Mail wird benötigt';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Ungültiges E-Mail-Format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Save to AppContext & navigate
    setCustomerProfile(profile);
    navigate('/kategorie');
  };

  return (
    <div className="min-h-screen bg-madison-alabaster text-madison-dark font-open selection:bg-madison-gold/20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <span className="font-open text-[10px] tracking-[0.3em] text-madison-gold uppercase font-bold mb-3 block">
            MADISON CUSTOMER PORTAL
          </span>
          <h1 className="font-zilla text-3xl md:text-4xl font-bold tracking-tight text-madison-dark mb-4">
            Kundenprofil
          </h1>
          <div className="h-[1px] w-20 bg-madison-gold/40 my-4 mx-auto md:mx-0" />
          <p className="text-sm text-madison-muted max-w-xl leading-relaxed">
            Bitte vervollständigen Sie Ihr B2B-Kundenprofil. Diese Daten werden automatisch für Ihre personalisierte Angebotsanfrage verwendet.
          </p>
        </div>

        <form onSubmit={handleSaveAndContinue} className="space-y-8">
          {/* Section 1: Unternehmensinformationen */}
          <FormSection nr="1" title="Unternehmensinformationen">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-madison-gold/80">
              <Building2 className="w-3.5 h-3.5" />
              <span>Stammdaten</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Firmenname */}
              <div data-error={!!errors.firmenname}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Firmenname <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="text"
                  value={profile.firmenname}
                  onChange={(e) => handleTextChange('firmenname', e.target.value)}
                  placeholder="z.B. Madison Cosmetics GmbH"
                  className={`w-full border ${
                    errors.firmenname ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.firmenname && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.firmenname}</p>
                )}
              </div>

              {/* Land */}
              <div data-error={!!errors.land}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Land <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="text"
                  value={profile.land}
                  onChange={(e) => handleTextChange('land', e.target.value)}
                  placeholder="z.B. Deutschland"
                  className={`w-full border ${
                    errors.land ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.land && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.land}</p>
                )}
              </div>

              {/* Branche */}
              <div className="sm:col-span-2" data-error={!!errors.branche}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Branche <span className="text-madison-gold">*</span>
                </label>
                <select
                  value={profile.branche}
                  onChange={(e) => handleTextChange('branche', e.target.value)}
                  className={`w-full border ${
                    errors.branche ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200 cursor-pointer`}
                >
                  <option value="">Bitte wählen...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                {errors.branche && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.branche}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Section 2: Ansprechpartner */}
          <FormSection nr="2" title="Ansprechpartner">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-madison-gold/80">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Kontaktperson</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Vorname */}
              <div data-error={!!errors.vorname}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Vorname <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="text"
                  value={profile.vorname}
                  onChange={(e) => handleTextChange('vorname', e.target.value)}
                  placeholder="Max"
                  className={`w-full border ${
                    errors.vorname ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.vorname && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.vorname}</p>
                )}
              </div>

              {/* Nachname */}
              <div data-error={!!errors.nachname}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Nachname <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="text"
                  value={profile.nachname}
                  onChange={(e) => handleTextChange('nachname', e.target.value)}
                  placeholder="Mustermann"
                  className={`w-full border ${
                    errors.nachname ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.nachname && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.nachname}</p>
                )}
              </div>

              {/* E-Mail */}
              <div data-error={!!errors.email}>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  E-Mail-Adresse <span className="text-madison-gold">*</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleTextChange('email', e.target.value)}
                  placeholder="m.mustermann@firma.de"
                  className={`w-full border ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  } bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-madison-muted mb-2">
                  Telefonnummer
                </label>
                <input
                  type="text"
                  value={profile.telefon}
                  onChange={(e) => handleTextChange('telefon', e.target.value)}
                  placeholder="+49 (0) 123 456789"
                  className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-madison-gold focus:border-madison-gold transition duration-200"
                />
              </div>
            </div>
          </FormSection>

          {/* Section 3: Beschaffungspräferenzen */}
          <FormSection nr="3" title="Beschaffungspräferenzen">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-widest text-madison-gold/80">
              <Settings className="w-3.5 h-3.5" />
              <span>Vorauswahl</span>
            </div>

            {/* Materialien */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-madison-muted mb-3">
                Bevorzugte Verpackungsmaterialien
              </p>
              <div className="flex flex-wrap gap-3">
                {MATERIALS.map((mat) => {
                  const isChecked = profile.materialien.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => handleArrayToggle('materialien', mat)}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-300 ${
                        isChecked
                          ? 'bg-madison-dark border-madison-dark text-white shadow-sm'
                          : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/55 hover:text-madison-dark'
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zertifizierungen */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-madison-muted mb-3">
                Erforderliche Zertifizierungen
              </p>
              <div className="flex flex-wrap gap-3">
                {CERTIFICATIONS.map((cert) => {
                  const isChecked = profile.zertifizierungen.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleArrayToggle('zertifizierungen', cert)}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-300 ${
                        isChecked
                          ? 'bg-madison-gold border-madison-gold text-white shadow-sm'
                          : 'bg-white border-gray-200 text-madison-muted hover:border-madison-gold/55 hover:text-madison-dark'
                      }`}
                    >
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-madison-dark hover:bg-madison-gold text-white font-zilla text-base font-bold py-4 px-8 rounded-xl shadow-lg border border-madison-dark transition-all duration-500 group"
          >
            <span>Profil speichern &amp; Weiter</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </form>
      </div>
    </div>
  );
};
