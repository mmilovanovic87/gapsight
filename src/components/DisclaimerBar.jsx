import { useLocation } from 'react-router-dom';
import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';

const KB_VERSION = kbChangelog.current_version;
const KB_DATE = kbChangelog.versions[0].date;

export default function DisclaimerBar() {
  const location = useLocation();
  const isResults = location.pathname === '/results';

  const bgClass = isResults
    ? 'bg-yellow-50 border-b border-yellow-200 text-yellow-800'
    : 'bg-blue-50 border-b border-blue-200 text-blue-800';

  const versionText = en.disclaimer_bar.kb_version
    .replace('{version}', KB_VERSION)
    .replace('{date}', KB_DATE);

  return (
    <div className={`${bgClass} px-6 py-2 text-sm`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
        <span role="img" aria-label="Information">&#8505;</span>
        <span className="flex-1 min-w-0">{en.disclaimer_bar.text}</span>
        <span className="text-xs opacity-75 whitespace-nowrap">{versionText}</span>
      </div>
    </div>
  );
}
