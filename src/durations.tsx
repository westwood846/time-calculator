import { Duration, type DurationLikeObject } from "luxon";

export const durationTokensToUnits = {
  y: "years",
  q: "quarters",
  mon: "months",
  w: "weeks",
  d: "days",
  h: "hours",
  min: "minutes",
  s: "seconds",
  ms: "milliseconds",
} as const;

export type DurationToken = keyof typeof durationTokensToUnits;

export const parseDurationInput = (input: string) => {
  const parts = input.split(/([a-zA-Z]+)/);
  const pairs = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    pairs.push([parts[i], parts[i + 1]]);
  }
  const durationObject = {} as DurationLikeObject;
  for (const [val, token] of pairs) {
    const parsedVal = Number(val);
    if (Number.isNaN(parsedVal)) {
      return Duration.invalid("Invalid duration value");
    }
    if (!(token in durationTokensToUnits)) {
      return Duration.invalid("Invalid duration token");
    }
    const unit = durationTokensToUnits[token as DurationToken];
    durationObject[unit] = Number(val);
  }
  return Duration.fromObject(durationObject);
};

export const formatDuration = (duration: Duration) => {
  return duration.rescale().toHuman();
};

interface DurationInputProps {
  input: string;
  onChange: (input: string) => void;
  onFocus: () => void;
}

export function DurationInput({
  input,
  onChange,
  onFocus,
}: DurationInputProps) {
  const duration = parseDurationInput(input);
  return (
    <div className="duration-input">
      <input
        type="text"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus()}
        value={input}
        placeholder="e.g. 1y3m20d"
      ></input>

      <div className="duration-input-display">
        {duration.isValid ? formatDuration(duration) : duration.invalidReason}
        &nbsp;
      </div>
    </div>
  );
}
