import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import DisclaimerBar from './components/DisclaimerBar';
import Footer from './components/Footer';
import InlineDisclaimerModal from './components/InlineDisclaimerModal';
import ClearSessionModal from './components/ClearSessionModal';
import RiskLevelModal from './components/RiskLevelModal';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import KBChangelogPage from './pages/KBChangelogPage';
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultsPage from './pages/ResultsPage';
import SharedViewPage from './pages/SharedViewPage';
import kbChangelog from './data/kb-changelog.json';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSession() {
  try {
    const raw = localStorage.getItem('gapsight_session');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function initSession() {
  const now = new Date().toISOString();
  const session = {
    schema_version: 1,
    assessment_id: generateUUID(),
    created_at: now,
    last_modified_at: now,
    kb_version: kbChangelog.current_version,
    tos_accepted_at: null,
    disclaimer_confirmed_at: null,
  };
  localStorage.setItem('gapsight_session', JSON.stringify(session));
  return session;
}

function updateSession(updates) {
  const session = getSession() || initSession();
  const updated = { ...session, ...updates, last_modified_at: new Date().toISOString() };
  localStorage.setItem('gapsight_session', JSON.stringify(updated));
  return updated;
}


function App() {
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showInlineDisclaimer, setShowInlineDisclaimer] = useState(false);
  const [assessmentKey, setAssessmentKey] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (session && session.tos_accepted_at) {
      setTosAccepted(true);
    }
  }, []);

  const handleTosAccept = useCallback(() => {
    updateSession({ tos_accepted_at: new Date().toISOString() });
    setTosAccepted(true);
  }, []);

  const handleTosExit = useCallback(() => {
    window.location.href = 'about:blank';
  }, []);

  const handleNewAssessment = useCallback(() => {
    localStorage.removeItem('gapsight_inputs');
    localStorage.removeItem('gapsight_profile');
    setAssessmentKey((k) => k + 1);
  }, []);

  const handleClearSession = useCallback(() => {
    setShowClearModal(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('gapsight_'));
    keys.forEach((k) => localStorage.removeItem(k));
    setShowClearModal(false);
    setTosAccepted(false);
  }, []);

  const triggerInlineDisclaimer = useCallback(() => {
    if (sessionStorage.getItem('gapsight_disclaimer_shown') === 'true') {
      return true;
    }
    setShowInlineDisclaimer(true);
    return false;
  }, []);

  const handleInlineDisclaimerConfirm = useCallback(() => {
    sessionStorage.setItem('gapsight_disclaimer_shown', 'true');
    updateSession({ disclaimer_confirmed_at: new Date().toISOString() });
    setShowInlineDisclaimer(false);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <Header onClearSession={handleClearSession} onNewAssessment={handleNewAssessment} />
        <DisclaimerBar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={
              <AssessmentPage
                key={assessmentKey}
                onTriggerDisclaimer={triggerInlineDisclaimer}
                tosAccepted={tosAccepted}
                onTosAccept={handleTosAccept}
                onTosExit={handleTosExit}
              />
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/kb-changelog" element={<KBChangelogPage />} />
            <Route path="/results" element={<ResultsPage onShowRiskModal={() => setShowRiskModal(true)} />} />
            <Route path="/shared/:uuid" element={<SharedViewPage />} />
          </Routes>
        </div>

        <Footer />

        {showClearModal && (
          <ClearSessionModal
            onConfirm={handleConfirmClear}
            onCancel={() => setShowClearModal(false)}
          />
        )}

        {showRiskModal && (
          <RiskLevelModal onClose={() => setShowRiskModal(false)} />
        )}

        {showInlineDisclaimer && (
          <InlineDisclaimerModal onConfirm={handleInlineDisclaimerConfirm} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
