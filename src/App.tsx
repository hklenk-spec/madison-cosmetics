import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { CategorySelection } from './pages/CategorySelection';
import { Configurator } from './pages/Configurator';
import { Inquiry } from './pages/Inquiry';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<Login />} />
          
          {/* Main Dashboard Catalog */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* B2B Customer Profile Stammdaten */}
          <Route path="/profil" element={<Profile />} />
          
          {/* Product Category quick pick grid */}
          <Route path="/kategorie" element={<CategorySelection />} />
          
          {/* Custom specifications B2B configurator */}
          <Route path="/konfigurator" element={<Configurator />} />
          
          {/* Inquiry summary & request submission */}
          <Route path="/anfrage" element={<Inquiry />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
