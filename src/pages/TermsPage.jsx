import en from '../locales/en.json';

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">{en.tos.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{en.tos.effective_date}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Definition</h2>
        <p className="mt-2 text-gray-700">{en.tos.definition}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Liability</h2>
        <p className="mt-2 text-gray-700">{en.tos.liability}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">User Responsibility</h2>
        <p className="mt-2 text-gray-700">{en.tos.user_responsibility}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Knowledge Base Currency</h2>
        <p className="mt-2 text-gray-700">{en.tos.kb_currency}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Intellectual Property</h2>
        <p className="mt-2 text-gray-700">{en.tos.intellectual_property}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Termination</h2>
        <p className="mt-2 text-gray-700">{en.tos.termination}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Language</h2>
        <p className="mt-2 text-gray-700">{en.tos.language}</p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-400">
        <p>{en.tos.version_label}</p>
      </div>
    </main>
  );
}
