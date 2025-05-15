import { useEffect, useState } from "react";
import { Duration, type DurationLikeObject } from "luxon";
import "./App.css";

const tokensToUnits = {
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

type Token = keyof typeof tokensToUnits;

const parseDurationInput = (input: string) => {
  const parts = input.split(/([a-zA-Z]+)/);
  const pairs = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    pairs.push([parts[i], parts[i + 1]]);
  }
  const durationObject = {} as DurationLikeObject;
  for (let [val, token] of pairs) {
    const parsedVal = Number(val);
    if (Number.isNaN(parsedVal)) {
      return Duration.invalid("Invalid duration value");
    }
    if (!(token in tokensToUnits)) {
      return Duration.invalid("Invalid duration token");
    }
    const unit = tokensToUnits[token as Token];
    durationObject[unit] = Number(val);
  }
  return Duration.fromObject(durationObject);
};

const formatDuration = (duration: Duration) => {
  return duration.rescale().toHuman();
};

interface DurationInputProps {
  value: Duration;
  onChange: (value: Duration) => void;
}

function DurationInput({ value, onChange }: DurationInputProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    onChange(parseDurationInput(input));
  }, [input, onChange]);

  return (
    <div>
      <div>
        <input
          type="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        ></input>
      </div>
      <div>{value.isValid ? formatDuration(value) : value.invalidReason}</div>
    </div>
  );
}

function App() {
  const [durationA, setDurationA] = useState<Duration>(Duration.fromObject({}));
  const [durationB, setDurationB] = useState<Duration>(Duration.fromObject({}));
  const [operation, setOperation] = useState<"PLUS" | "MINUS">("PLUS");

  return (
    <>
      <table>
        <tbody>
          {Object.entries(tokensToUnits).map(([token, unit]) => (
            <tr key={token}>
              <td>
                <code>{token}</code>
              </td>
              <td>{unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <div className="section">
        First duration:
        <DurationInput value={durationA} onChange={setDurationA} />
      </div>
      <div className="section">
        <button onClick={() => setOperation("PLUS")}>
          {operation === "PLUS" ? "> Plus <" : "Plus"}
        </button>
        <button onClick={() => setOperation("MINUS")}>
          {operation === "MINUS" ? "> Minus <" : "Minus"}
        </button>
      </div>
      <div className="section">
        Second duration:
        <DurationInput value={durationB} onChange={setDurationB} />
      </div>
      <hr />
      <div className="section">
        <div>Result:</div>
        {operation === "PLUS"
          ? formatDuration(durationA.plus(durationB))
          : formatDuration(durationA.minus(durationB))}
      </div>
    </>
  );
}

export default App;
