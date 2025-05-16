import { useState } from "react";
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
  for (const [val, token] of pairs) {
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
  input: string;
  onChange: (input: string) => void;
  onFocus: () => void;
}

function DurationInput({ input, onChange, onFocus }: DurationInputProps) {
  const duration = parseDurationInput(input);
  return (
    <div className="duration-input">
      <input
        type="text"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus()}
        value={input}
      ></input>
      <div className="duration-input-display">
        {duration.isValid ? formatDuration(duration) : duration.invalidReason}
        &nbsp;
      </div>
    </div>
  );
}

function App() {
  const [focusedInput, setFocusedInput] = useState<"A" | "B">("A");

  const [durationInputA, setDurationInputA] = useState("");
  const durationA = parseDurationInput(durationInputA);
  const [durationInputB, setDurationInputB] = useState("");
  const durationB = parseDurationInput(durationInputB);

  const setFocusedDuration =
    focusedInput === "A" ? setDurationInputA : setDurationInputB;
  const focusedDuration =
    focusedInput === "A" ? durationInputA : durationInputB;
  const appendToFocusedDuration = (value: string) =>
    setFocusedDuration(focusedDuration + value);

  const [operation, setOperation] = useState<"PLUS" | "MINUS">("PLUS");

  return (
    <>
      <div className="calc-box">
        <div className="input-box">
          <DurationInput
            input={durationInputA}
            onChange={setDurationInputA}
            onFocus={() => setFocusedInput("A")}
          />
          <div className="operator">{operation === "PLUS" ? "+" : "-"}</div>
          <DurationInput
            input={durationInputB}
            onChange={setDurationInputB}
            onFocus={() => setFocusedInput("B")}
          />
          <div className="operator">=</div>
        </div>
        <div className="result-box">
          {operation === "PLUS"
            ? formatDuration(durationA.plus(durationB))
            : formatDuration(durationA.minus(durationB))}
          &nbsp;
        </div>
      </div>

      <div className="operator-dials-container">
        <div className="operator-grid">
          <button onClick={() => setOperation("PLUS")} title="Plus">
            +
          </button>
          <button onClick={() => setOperation("MINUS")} title="Minus">
            -
          </button>
        </div>
      </div>

      <div className="dials-container">
        <div className="dial-grid">
          {new Array(10)
            .fill(0)
            .map((_, i) => (i + 1) % 10)
            .map((val) => (
              <button
                onClick={() => appendToFocusedDuration(String(val))}
                key={val}
              >
                {val}
              </button>
            ))}
        </div>
        <div className="dial-grid">
          {Object.entries(tokensToUnits).map(([token, unit]) => (
            <button
              onClick={() => appendToFocusedDuration(token)}
              title={unit}
              key={token}
            >
              {token}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
