import { Link, useNavigate } from 'react-router-dom';
import en from '../locales/en.json';

export default function Header({ onClearSession, onNewAssessment }) {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          {en.header.logo}
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 text-sm text-gray-600">
            <button onClick={() => { onNewAssessment(); navigate('/'); }} className="hover:text-gray-900">{en.header.nav_new_assessment}</button>
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
    </header>
  );
}
