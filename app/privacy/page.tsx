export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">🔐 Privacy Policy</h1>
      <div className="text-gray-700 text-base space-y-4">
        <p className="italic">Effective Date: 08/06/2025</p>
        <p>Fragrance Finder (“we”, “our”, “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data.</p>
        <ol className="list-decimal list-inside space-y-2 mt-4">
          <li>
            <strong>Information We Collect</strong><br />
            We collect the following types of data when you use our services:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Your quiz responses and selected preferences</li>
              <li>Metadata such as session ID, timestamp, and approximate location (country, city, and region) collected via IP geolocation</li>
              <li>Optional information you provide (e.g. email for updates or offers)</li>
            </ul>
            We do not collect sensitive personal data like government IDs, health records, or precise GPS location.
          </li>
          <li>
            <strong>How We Use Your Data</strong><br />
            We use your data to:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Provide personalized fragrance recommendations</li>
              <li>Improve our recommendation algorithm and overall experience</li>
              <li>Understand broader fragrance preferences and user trends</li>
              <li>(If applicable) Send occasional updates, offers, or insights if you&apos;ve opted in</li>
            </ul>
            <p className="mt-2">We may share anonymized and aggregated data (e.g. “40% of users aged 18–25 prefer fresh citrus scents”) with trusted third-party partners and clients, such as fragrance brands, trend analysts, or retail platforms.</p>
            <p>This data cannot be used to identify you and contains no personal information like your name or email.</p>
            <p>We do not sell your personal data (e.g. name, email, quiz responses linked to you individually) to third parties.</p>
          </li>
          <li>
            <strong>Cookies &amp; Analytics</strong><br />
            We may use cookies and analytics tools (such as Google Analytics or custom tracking) to monitor app performance and understand how users engage with the quiz and results pages.<br />
            You can disable cookies in your browser settings, although some features may not work as intended.
          </li>
          <li>
            <strong>Data Storage &amp; Security</strong><br />
            Your data is securely stored using Supabase, a fully encrypted, GDPR-compliant cloud platform.<br />
            We take reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse.
          </li>
          <li>
            <strong>Your Rights</strong><br />
            You have the right to:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Request access to your data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Ask questions about how your data is used</li>
            </ul>
            <p>To exercise these rights, contact us at help@fragrancefinder.co.uk.</p>
          </li>
          <li>
            <strong>Changes to This Policy</strong><br />
            We may update this Privacy Policy from time to time. We&apos;ll notify you of any significant changes via our website or other communication methods.
          </li>
          <li>
            <strong>Contact Us</strong><br />
            If you have any questions or concerns about this policy, you can contact:<br />
            <span className="block mt-1">📩 Email: <a href="mailto:help@fragrancefinder.co.uk" className="underline">help@fragrancefinder.co.uk</a></span>
          </li>
        </ol>
      </div>
    </main>
  );
} 