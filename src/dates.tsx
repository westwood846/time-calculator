import { DateTime } from "luxon";

export const parseDateString = (input: string) => {
  return DateTime.fromISO(input);
};

export const formatDate = (date: DateTime) => {
  return date.toLocaleString(DateTime.DATETIME_FULL);
};

const formatDateString = (dateString: string) => {
  if (dateString === "") return "";
  const date = parseDateString(dateString);
  if (!date.isValid) return date.invalidReason;
  return formatDate(date);
};

interface DateInputProps {
  input: string;
  onChange: (input: string) => void;
  onFocus: () => void;
}

export function DateInput({ input, onChange, onFocus }: DateInputProps) {
  return (
    <div className="duration-input">
      <input
        type="datetime-local"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus()}
        value={input}
      ></input>
      <div className="duration-input-display">
        {formatDateString(input)}
        &nbsp;
      </div>
    </div>
  );
}
