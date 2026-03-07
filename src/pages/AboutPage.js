import en from '../locales/en.json';
import kbChangelog from '../data/kb-changelog.json';

const KB_VERSION = kbChangelog.current_version;
const KB_DATE = kbChangelog.versions[0].date;

export default function AboutPage() {
  const kbVersionText = en.about.kb_version
    .replace('{version}', KB_VERSION)
    .replace('{date}', KB_DATE);

  const nextReviewText = en.about.next_review
    .replace('{date}', kbChangelog.versions[0].next_review);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">{en.about.title}</h1>
      <p className="mt-2 text-gray-600">{en.about.subtitle}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.about.what_title}</h2>
        <p className="mt-2 text-gray-700">{en.about.what_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.about.what_not_title}</h2>
        <ul className="mt-2 space-y-1 text-gray-700">
          {en.about.what_not_items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">&#8226;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.about.who_title}</h2>
        <p className="mt-2 text-gray-700">{en.about.who_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.about.how_title}</h2>
        <p className="mt-2 text-gray-700">{en.about.how_body}</p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>{kbVersionText}</p>
        <p>{nextReviewText}</p>
      </div>
    </main>
  );
}
