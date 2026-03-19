import { Link } from 'react-router-dom';
import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';

const KB_VERSION = kbChangelog.current_version;
const KB_DATE = kbChangelog.versions[0].date;

export default function Footer() {
  const versionText = en.footer.kb_version
    .replace('{version}', KB_VERSION)
    .replace('{date}', KB_DATE);

  return (
    <footer className="bg-gray-100 border-t border-gray-200 px-6 py-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-medium text-gray-700">{en.footer.tagline}</p>
        <p className="mt-1">{en.footer.positioning}</p>
        <p className="mt-1 text-xs">{versionText}</p>
        <nav className="mt-4 flex justify-center gap-4">
          <Link to="/privacy" className="hover:text-gray-700">{en.footer.nav_privacy}</Link>
          <Link to="/terms" className="hover:text-gray-700">{en.footer.nav_terms}</Link>
          <Link to="/about" className="hover:text-gray-700">{en.footer.nav_about}</Link>
          <Link to="/kb-changelog" className="hover:text-gray-700">{en.footer.nav_kb_changelog}</Link>
          <a href="https://github.com/mmilovanovic87/gapsight/issues" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700" aria-label="Report an issue on GitHub">
            {en.footer.nav_report_issue}
          </a>
        </nav>
        <p className="mt-4 text-xs text-gray-400">{en.footer.legal_disclaimer}</p>
        <p className="mt-4">{en.footer.copyright}</p>
      </div>
    </footer>
  );
}
