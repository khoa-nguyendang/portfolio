import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';

interface SlugInputProps {
  value: string;
  sourceValue: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SlugInput({
  value,
  sourceValue,
  onChange,
  disabled,
}: SlugInputProps) {
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (!isManual && sourceValue) {
      onChange(generateSlug(sourceValue));
    }
  }, [sourceValue, isManual, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManual(true);
    onChange(generateSlug(e.target.value));
  };

  const handleAutoGenerate = () => {
    setIsManual(false);
    onChange(generateSlug(sourceValue));
  };

  return (
    <div>
      <label className="flex items-center gap-2">
        <Link2 className="h-3.5 w-3.5" />
        Slug
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="auto-generated-slug"
          className="flex-1"
        />
        {isManual && (
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="whitespace-nowrap rounded-lg border border-gray-700 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200"
          >
            Auto
          </button>
        )}
      </div>
    </div>
  );
}
