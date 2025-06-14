import { useState } from 'react';

interface Fragrance {
  title: string
  description: string
  image: string
  displayMatch: number
  fields: {
    link_global?: string
  }
}

interface Tag {
  name: string
}

interface EmailCollectionPopupProps {
  onSuccess: (email: string) => void
  fragrances: Fragrance[]
  tags: Tag[]
  quizUuid: string
}

export default function EmailCollectionPopup({ onSuccess, fragrances, tags, quizUuid }: EmailCollectionPopupProps) {
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConsentError('');
    
    if (!agreed) {
      setConsentError('You must agree to the Privacy Policy.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!quizUuid) {
        console.error('❌ No quiz UUID available for email submission');
        throw new Error('No quiz response found');
      }

      console.log('📩 Saving email for UUID:', quizUuid);

      // Save the email to Supabase via API route
      const saveRes = await fetch('/api/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quizResponseId: quizUuid, 
          email,
          agreed_to_lead_terms: true 
        }),
      });
      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        throw new Error(errorData.error || 'Failed to save email');
      }

      // Send the quiz results email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          fragrances: fragrances.map(f => ({
            title: f.title,
            description: f.description,
            image: f.image,
            matchScore: f.displayMatch,
            purchaseUrl: f.fields.link_global as string | undefined,
          })),
          tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email API error:', errorData);
        throw new Error(errorData.error || 'Failed to send email');
      }

      // Store in localStorage to prevent showing popup again
      localStorage.setItem('email_collected', 'true');
      onSuccess(email);
    } catch (err) {
      setError('Failed to save email. Please try again.');
      console.error('Error saving email:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Get Your Results</h2>
        <p className="text-gray-600 mb-6">
          Enter your email to receive your personalized fragrance recommendations and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="mt-4">
            <label className="text-sm flex gap-2 items-start">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setConsentError('');
                }}
                className="mt-1"
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
                </a>.
              </span>
            </label>
            {consentError && (
              <p className="text-red-500 text-sm mt-1">{consentError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? 'Saving...' : 'Save Email'}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            By submitting your email, you agree to receive personalized fragrance recommendations, promotional content, and occasional updates. You can unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  );
} 