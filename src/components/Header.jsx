import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import en from '../locales/en.json';

export default function Header({ onClearSession, onNewAssessment }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          {en.header.logo}
        </Link>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-4 text-sm text-gray-600">
            <button onClick={() => { onNewAssessment(); navigate('/assessment'); }} className="hover:text-gray-900">{en.header.nav_new_assessment}</button>
            <Link to="/kb-changelog" className="hover:text-gray-900">{en.header.nav_kb_changelog}</Link>
            <Link to="/about" className="hover:text-gray-900">{en.header.nav_about}</Link>
            <Link to="/privacy" className="hover:text-gray-900">{en.header.nav_privacy}</Link>
            <Link to="/terms" className="hover:text-gray-900">{en.header.nav_terms}</Link>
          </nav>
          <button
            onClick={onClearSession}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            {en.header.clear_session}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-3 text-sm text-gray-600 border-t border-gray-200 pt-4">
          <button onClick={() => { onNewAssessment(); navigate('/assessment'); setMenuOpen(false); }} className="text-left hover:text-gray-900">{en.header.nav_new_assessment}</button>
          <Link to="/kb-changelog" onClick={() => setMenuOpen(false)} className="hover:text-gray-900">{en.header.nav_kb_changelog}</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-gray-900">{en.header.nav_about}</Link>
          <Link to="/privacy" onClick={() => setMenuOpen(false)} className="hover:text-gray-900">{en.header.nav_privacy}</Link>
          <Link to="/terms" onClick={() => setMenuOpen(false)} className="hover:text-gray-900">{en.header.nav_terms}</Link>
          <button
            onClick={() => { onClearSession(); setMenuOpen(false); }}
            className="text-left text-sm text-red-600 hover:text-red-800"
          >
            {en.header.clear_session}
          </button>
        </nav>
      )}
    </header>
  );
}
