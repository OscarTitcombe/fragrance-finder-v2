import { useState } from 'react';

interface EmailCollectionPopupProps {
  onClose: () => void;
  onSuccess: () => void;
  fragrances: Array<{
    title: string;
    description: string;
    image: string;
    displayMatch: number;
    fields: {
      link_global?: string;
    };
  }>;
  tags: string[];
  quizUuid: string | null;
}

export default function EmailCollectionPopup({ onClose, onSuccess, fragrances, tags, quizUuid }: EmailCollectionPopupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        body: JSON.stringify({ quizResponseId: quizUuid, email }),
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
      onSuccess();
    } catch (err) {
      setError('Failed to save email. Please try again.');
      console.error('Error saving email:', err);
    } finally {
      setLoading(false);
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
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Me My Results'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 