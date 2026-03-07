import { useState, useEffect, useRef, useCallback } from 'react';

const INPUTS_KEY = 'gapsight_inputs';
const PROFILE_KEY = 'gapsight_profile';
const DEBOUNCE_MS = 500;

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
    }, DEBOUNCE_MS);
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
