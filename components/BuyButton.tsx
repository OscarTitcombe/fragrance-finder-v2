interface BuyButtonProps {
  href: string;
}

export default function BuyButton({ href }: BuyButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
    >
      Buy Now
    </a>
  );
} 