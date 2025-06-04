interface QuestionCardProps {
  question: string;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-medium text-gray-800">{question}</h2>
    </div>
  );
} 