import { useState, useEffect, useRef, useCallback } from 'react';
import { INPUTS_DEBOUNCE_MS } from '../logic/constants';

const INPUTS_KEY = 'gapsight_inputs';
const PROFILE_KEY = 'gapsight_profile';

/**
 * Loads and parses JSON from localStorage, returning null on failure.
 *
 * @param {string} key - localStorage key
 * @returns {object|null} Parsed value or null
 */
function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const DEFAULT_PROFILE = {
  role: null,
  gpai_flag: null,
  risk_category: null,
  deployment_status: null,
};

const DEFAULT_INPUTS = {};

/**
 * Custom hook for assessment state management with localStorage persistence.
 *
 * Manages two data stores:
 * - **profile**: user role, risk category, frameworks (saved immediately)
 * - **inputs**: metric values, governance answers (saved with debounce)
 *
 * @returns {{
 *   profile: object,
 *   inputs: object,
 *   restored: boolean,
 *   setProfile: (updates: object) => void,
 *   setInput: (field: string, value: any) => void,
 *   setInputs: (updates: object) => void,
 *   resetAssessment: () => void,
 *   dismissRestored: () => void,
 * }}
 */
export default function useAssessmentStore() {
  const [profile, setProfileState] = useState(() => loadJSON(PROFILE_KEY) || DEFAULT_PROFILE);
  const [inputs, setInputsState] = useState(() => loadJSON(INPUTS_KEY) || DEFAULT_INPUTS);
  const [restored, setRestored] = useState(false);

  const debounceRef = useRef(null);

  // Check if we restored a previous session
  useEffect(() => {
    const savedInputs = loadJSON(INPUTS_KEY);
    const savedProfile = loadJSON(PROFILE_KEY);
    if (savedProfile && savedProfile.role) {
      setRestored(true);
    }
    if (savedInputs) setInputsState(savedInputs);
    if (savedProfile) setProfileState(savedProfile);
  }, []);

  // Debounced save for inputs
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveJSON(INPUTS_KEY, inputs);
    }, INPUTS_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputs]);

  // Immediate save for profile (small data, changes infrequently)
  useEffect(() => {
    saveJSON(PROFILE_KEY, profile);
  }, [profile]);

  const setProfile = useCallback((updates) => {
    setProfileState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setInput = useCallback((field, value) => {
    setInputsState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setInputs = useCallback((updates) => {
    setInputsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAssessment = useCallback(() => {
    setProfileState(DEFAULT_PROFILE);
    setInputsState(DEFAULT_INPUTS);
    localStorage.removeItem(INPUTS_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setRestored(false);
  }, []);

  return {
    profile,
    inputs,
    restored,
    setProfile,
    setInput,
    setInputs,
    resetAssessment,
    dismissRestored: () => setRestored(false),
  };
}
