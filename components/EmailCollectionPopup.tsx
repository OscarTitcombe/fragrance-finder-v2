import { useState } from 'react';
import type { Fragrance } from '@/app/results/page';

type EmailCollectionPopupProps = {
  quizUuid: string;
  fragrances: Fragrance[];
  tags: string[];
};

export default function EmailCollectionPopup({ quizUuid, fragrances, tags }: EmailCollectionPopupProps) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConsentError('');

    if (!agreed) {
      setConsentError('Please agree to the Privacy Policy to continue');
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!quizUuid) {
        console.error('❌ No quiz UUID available for email submission');
        throw new Error('No quiz response found');
      }

      console.log('📩 Saving email for UUID:', quizUuid);

      const response = await fetch('/api/save-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizResponseId: quizUuid,
          email,
          agreed_to_lead_terms: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save email');
      }

      // If subscribing to newsletter, send to newsletter_subscribers
      if (subscribe) {
        try {
          // Get quiz answers and geo from localStorage
          const quizAnswers = JSON.parse(localStorage.getItem('quiz_answers') || '{}');
          const geo = JSON.parse(localStorage.getItem('geo_data') || '{}');
          console.log('📧 Subscribing to newsletter:', { email, quizAnswers, geo, tags });
          console.log('📧 localStorage quiz_answers:', localStorage.getItem('quiz_answers'));
          console.log('📧 localStorage geo_data:', localStorage.getItem('geo_data'));
          
          const newsletterResponse = await fetch('/api/newsletter-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              quizAnswers,
              geo,
              tags
            })
          });
          
          if (!newsletterResponse.ok) {
            const errorData = await newsletterResponse.json().catch(() => ({}));
            console.error('❌ Newsletter subscription failed:', errorData);
            throw new Error(`Newsletter subscription failed: ${errorData.error || 'Unknown error'}`);
          }
          
          const newsletterData = await newsletterResponse.json();
          console.log('✅ Newsletter subscription successful:', newsletterData);
        } catch (newsletterError) {
          console.error('❌ Newsletter subscription error:', newsletterError);
          // Don't fail the entire form submission for newsletter errors
          // Just log the error and continue
        }
      }

      // Send results email
      const formattedFragrances = fragrances.map(f => ({
        title: f.title,
        description: f.description,
        image: f.image,
        matchScore: f.displayMatch,
        purchaseUrl: f.fields.link_global as string | undefined,
      }));
      const sendRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, fragrances: formattedFragrances, tags }),
      });
      if (!sendRes.ok) throw new Error('Failed to send results email');

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error saving or sending email:', err);
      setError('Failed to save or send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent your personalized fragrance recommendations to your email address. Please check your inbox.
          </p>
          <p className="text-sm text-gray-500">
            💡 Don&apos;t see it? Check your spam or junk folder - sometimes our emails end up there!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Get Your Personalized Recommendations</h2>
        <p className="text-gray-600 mb-4">
          Enter your email to receive your personalized fragrance recommendations and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <label className="flex gap-2 items-start">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
              required
            />
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-900 underline hover:text-neutral-700"
              >
                Privacy Policy
              </a>
            </span>
          </label>
          <label className="flex gap-2 items-start">
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span className="text-sm text-gray-600">
              Subscribe to The Scent Newsletter
            </span>
          </label>
          {consentError && <p className="text-red-500 text-sm">{consentError}</p>}
          <button
            type="submit"
            disabled={!agreed || isSubmitting}
            className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Get My Recommendations'}
          </button>
        </form>
      </div>
    </div>
  );
} 