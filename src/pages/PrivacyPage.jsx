export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">What Data Is Collected</h2>
        <p className="mt-2 text-gray-700">
          GapSight does not collect personal data. All assessment data is processed and stored entirely
          in your browser using localStorage. No assessment inputs, results, or metrics are sent to
          any server during normal use.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="mt-2 text-gray-700">
          GapSight uses Vercel Analytics to collect anonymous, aggregated page view data. Vercel
          Analytics does not use cookies, does not collect personal data, and does not track individual
          users. This is compatible with GDPR requirements and does not require a cookie consent banner.
          For details, see{' '}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Vercel's Privacy Policy
          </a>.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Share Feature</h2>
        <p className="mt-2 text-gray-700">
          When you create a share link, the assessment data is stored temporarily on Vercel serverless
          infrastructure with a 12-month time-to-live. No account or personal data is associated with
          the shared link. The shared data includes only the assessment inputs and computed results.
          You may optionally protect the link with a PIN.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Feedback Submissions</h2>
        <p className="mt-2 text-gray-700">
          When you submit a feedback report via the "Report an Issue" form, your issue type, optional
          reference, and description are sent to Formspree for processing. No personal data is required
          or collected. Feedback submissions are retained for product improvement purposes.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Third-Party Tracking and Advertising</h2>
        <p className="mt-2 text-gray-700">
          GapSight does not use third-party tracking scripts, advertising networks, or marketing pixels.
          There are no Google Analytics, Facebook Pixel, or similar tracking services on this site.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Your Rights</h2>
        <p className="mt-2 text-gray-700">
          Since GapSight stores assessment data locally in your browser, you have full control over it.
          Use the "Clear Session" button to delete all locally stored data at any time. For share links,
          data is automatically deleted after 12 months. Under GDPR, you have the right to access,
          rectify, and erase your personal data.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>
          Contact:{' '}
          <a
            href="https://github.com/mmilovanovic87/gapsight/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            GitHub Issues
          </a>
        </p>
      </div>
    </main>
  );
}
