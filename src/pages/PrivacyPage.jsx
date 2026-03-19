import en from '../locales/en.json';

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">{en.privacy.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{en.privacy.effective_date}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.data_collected_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.data_collected_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.third_parties_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.third_parties_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.user_rights_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.user_rights_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.data_retention_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.data_retention_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.role_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.role_body}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{en.privacy.changes_title}</h2>
        <p className="mt-2 text-gray-700">{en.privacy.changes_body}</p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>Contact: {en.privacy.contact_email}</p>
      </div>
    </main>
  );
}
