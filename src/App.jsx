import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import DisclaimerBar from './components/DisclaimerBar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import InlineDisclaimerModal from './components/InlineDisclaimerModal';
import ClearSessionModal from './components/ClearSessionModal';
import RiskLevelModal from './components/RiskLevelModal';
import kbChangelog from './data/kb-changelog.json';
import { STORAGE_KEYS } from './logic/constants';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const KBChangelogPage = lazy(() => import('./pages/KBChangelogPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const SharedViewPage = lazy(() => import('./pages/SharedViewPage'));

const PageFallback = <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Loading...</div>;

/**
 * Generates a v4-format UUID using Math.random.
 *
 * @returns {string} UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Reads the current session object from localStorage.
 *
 * @returns {object|null} Parsed session or null if missing/corrupt
 */
function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Creates and persists a new session with a fresh UUID and timestamps.
 *
 * @returns {object} The newly created session object
 */
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
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return session;
}

/**
 * Merges updates into the current session and persists to localStorage.
 *
 * @param {object} updates - Fields to merge into the session
 * @returns {object} The updated session object
 */
function updateSession(updates) {
  const session = getSession() || initSession();
  const updated = { ...session, ...updates, last_modified_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
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
    localStorage.removeItem(STORAGE_KEYS.INPUTS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    setAssessmentKey((k) => k + 1);
  }, []);

  const handleClearSession = useCallback(() => {
    setShowClearModal(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEYS.PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
    setShowClearModal(false);
    setTosAccepted(false);
  }, []);

  const triggerInlineDisclaimer = useCallback(() => {
    if (sessionStorage.getItem(STORAGE_KEYS.DISCLAIMER_SHOWN) === 'true') {
      return true;
    }
    setShowInlineDisclaimer(true);
    return false;
  }, []);

  const handleInlineDisclaimerConfirm = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEYS.DISCLAIMER_SHOWN, 'true');
    updateSession({ disclaimer_confirmed_at: new Date().toISOString() });
    setShowInlineDisclaimer(false);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <Header onClearSession={handleClearSession} onNewAssessment={handleNewAssessment} />
        <DisclaimerBar />

        <div className="flex-1">
          <ErrorBoundary>
          <Suspense fallback={PageFallback}>
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
          </Suspense>
          </ErrorBoundary>
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
