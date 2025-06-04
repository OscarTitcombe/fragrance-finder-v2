import { useState } from "react";

interface FragranceCardProps {
  name: string;
  description: string;
  image: string;
  ratings: {
    Longevity: number;
    Projection: number;
    Versatility: number;
    Complexity: number;
    Uniqueness: number;
    Overall: number;
  };
  moreInfo?: string;
  purchaseUrl?: string;
}

export default function FragranceCard({
  name,
  description,
  image,
  ratings,
  moreInfo,
  purchaseUrl,
}: FragranceCardProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-md mx-auto">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-32 h-40 object-contain mb-4 rounded-xl shadow"
        />
      )}
      <h2 className="text-xl font-bold mb-1 text-center font-jakarta">{name}</h2>
      <p className="text-gray-500 text-center mb-4 line-clamp-2">{description}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mb-4">
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Longevity:</span>
          <span className="font-semibold">{ratings.Longevity ?? 0}/10</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Projection:</span>
          <span className="font-semibold">{ratings.Projection ?? 0}/10</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Versatility:</span>
          <span className="font-semibold">{ratings.Versatility ?? 0}/10</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Complexity:</span>
          <span className="font-semibold">{ratings.Complexity ?? 0}/10</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Uniqueness:</span>
          <span className="font-semibold">{ratings.Uniqueness ?? 0}/10</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Overall:</span>
          <span className="font-semibold">{ratings.Overall ?? 0}/10</span>
        </div>
      </div>
      {purchaseUrl && (
        <a
          href={purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-black text-white text-center py-3 rounded-xl font-semibold text-lg mb-2 hover:bg-neutral-800 transition-colors"
        >
          Purchase Here
        </a>
      )}
      <button
        onClick={() => setShowMore((v) => !v)}
        className="w-full text-center text-sm text-gray-700 py-2 rounded-lg hover:bg-neutral-100 transition mb-1"
      >
        {showMore ? "Hide Info" : "More Info"}
      </button>
      {showMore && moreInfo && (
        <div className="w-full bg-neutral-50 rounded-lg p-3 text-gray-600 text-sm mt-1 shadow-inner">
          {moreInfo}
        </div>
      )}
    </div>
  );
} 