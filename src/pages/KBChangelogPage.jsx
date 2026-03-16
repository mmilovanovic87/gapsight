import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';

export default function KBChangelogPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">{en.kb_changelog.title}</h1>
      <p className="mt-2 text-gray-600">{en.kb_changelog.description}</p>

      <div className="mt-8 space-y-8">
        {kbChangelog.versions.map((v) => (
          <div key={v.version} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {en.kb_changelog.version_label.replace('{version}', v.version)}
              </h2>
              <span className="text-sm text-gray-500">
                {en.kb_changelog.date_label.replace('{date}', v.date)}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{en.kb_changelog.changes_label}</h3>
              <p className="mt-1 text-gray-700">{v.changes}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{en.kb_changelog.frameworks_label}</h3>
              <ul className="mt-1 text-sm text-gray-700 space-y-1">
                {Object.entries(v.frameworks).map(([key, val]) => (
                  <li key={key}>
                    <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>{' '}
                    {val}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">{en.kb_changelog.gpai_threshold_label}: </span>
                <span className="text-gray-700">{v.gpai_threshold_flops}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">{en.kb_changelog.next_review_label}: </span>
                <span className="text-gray-700">{v.next_review}</span>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <span className="font-medium text-gray-500">{en.kb_changelog.breaking_changes_label}: </span>
              <span className={v.breaking_changes ? 'text-red-600 font-medium' : 'text-green-600'}>
                {v.breaking_changes ? en.kb_changelog.breaking_yes : en.kb_changelog.breaking_no}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
