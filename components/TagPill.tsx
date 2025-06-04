interface TagPillProps {
  label: string;
  color?: 'gray' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'pink' | 'indigo' | 'teal' | 'orange';
  matchCount?: number;
}

type TagColor = 'gray' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'pink' | 'indigo' | 'teal' | 'orange';

const colorMap: Record<TagColor, { bg: string; text: string }> = {
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-800' },
  green:  { bg: 'bg-green-100',  text: 'text-green-800' },
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-800' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  red:    { bg: 'bg-red-100',    text: 'text-red-800' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  pink:   { bg: 'bg-pink-100',   text: 'text-pink-800' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-800' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export default function TagPill({ label, color = 'gray', matchCount }: TagPillProps) {
  const safeColor: TagColor = color || 'gray';
  const { bg, text } = colorMap[safeColor];
  const display = matchCount !== undefined ? `${label} (${matchCount})` : label;
  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full ${bg} ${text}`}>
      {display}
    </span>
  );
} 