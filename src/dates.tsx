import { DateTime } from "luxon";

export const parseDateInput = (input: string) => {
  return DateTime.fromISO(input);
};

export const formatDate = (date: DateTime) => {
  return date.toLocaleString(DateTime.DATETIME_FULL);
};

interface DateInputProps {
  input: string;
  onChange: (input: string) => void;
  onFocus: () => void;
}

export function DateInput({ input, onChange, onFocus }: DateInputProps) {
  const date = parseDateInput(input);
  return (
    <div className="duration-input">
      <input
        type="datetime-local"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus()}
        value={input}
      ></input>
      <div className="duration-input-display">
        {date.isValid ? formatDate(date) : date.invalidReason}
        &nbsp;
      </div>
    </div>
  );
}
