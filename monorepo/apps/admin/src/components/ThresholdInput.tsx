import { memo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface ThresholdInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const ThresholdInput = memo<ThresholdInputProps>(({
  value,
  onChange,
  min = 0,
  max = 1000,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    const newValue = parseFloat(newInputValue);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    let clampedValue: number;
    if (isNaN(newValue)) {
      clampedValue = min;
    } else if (newValue < min) {
      clampedValue = min;
    } else if (newValue > max) {
      clampedValue = max;
    } else {
      clampedValue = newValue;
    }
    setInputValue(clampedValue.toString());
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="threshold-input" className="text-sm font-medium text-slate-700 whitespace-nowrap">
        Alert Threshold
      </label>
      <div className="relative">
        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <Input
          id="threshold-input"
          type="number"
          min={min}
          max={max}
          step="1"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-28 pl-8 h-9 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
});

ThresholdInput.displayName = 'ThresholdInput';