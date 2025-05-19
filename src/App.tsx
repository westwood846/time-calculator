import { useState } from "react";
import { DateTime, Duration, type DurationLikeObject } from "luxon";
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

const modes = {
  DATE_DIFFERENCE: "Date Difference",
  DURATION_FROM_DATE: "Duration from date",
  DURATIONS: "Durations",
} as const;

type Mode = keyof typeof modes;

const operations = {
  PLUS: "Plus",
  MINUS: "Minus",
} as const;

type Operation = keyof typeof operations;

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

const parseDateInput = (input: string) => {
  return DateTime.fromISO(input);
};

const formatDate = (date: DateTime) => {
  return date.toLocaleString(DateTime.DATETIME_FULL);
};

interface DateInputProps {
  input: string;
  onChange: (input: string) => void;
  onFocus: () => void;
}

function DateInput({ input, onChange, onFocus }: DateInputProps) {
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

type Inputs = "DATE_A" | "DATE_B" | "DURATION_A" | "DURATION_B";

function App() {
  const [focusedInput, setFocusedInput] = useState<Inputs>("DURATION_A");

  const [durationInputA, setDurationInputA] = useState("");
  const durationA = parseDurationInput(durationInputA);
  const [durationInputB, setDurationInputB] = useState("");
  const durationB = parseDurationInput(durationInputB);

  const setFocusedDuration = {
    DURATION_A: setDurationInputA,
    DURATION_B: setDurationInputB,
    DATE_A: () => null,
    DATE_B: () => null,
  }[focusedInput];
  const focusedDuration =
    focusedInput === "DURATION_A" ? durationInputA : durationInputB;
  const appendToFocusedDuration = (value: string) =>
    setFocusedDuration(focusedDuration + value);

  const [dateInputA, setDateInputA] = useState("");
  const dateA = parseDateInput(dateInputA);
  const [dateInputB, setDateInputB] = useState("");
  const dateB = parseDateInput(dateInputB);

  const [operation, setOperation] = useState<Operation>("PLUS");
  const [mode, setMode] = useState<Mode>("DURATION_FROM_DATE");

  const setModeAndFocus = (mode: Mode) => {
    setMode(mode);
    if (mode === "DURATIONS") setFocusedInput("DURATION_A");
    if (mode === "DURATION_FROM_DATE") setFocusedInput("DATE_A");
    if (mode === "DATE_DIFFERENCE") {
      setFocusedInput("DATE_A");
      setOperation("MINUS");
    }
  };

  const dialsDisabled = focusedInput === "DATE_A" || focusedInput === "DATE_B";

  return (
    <>
      <h1>Time Calculator</h1>
      <p>
        Use this to calculate the difference between two dates, to add/subtract
        a duration from a date or to add/subtract two durations from each other.
        Dates use your browser's time-zone and all calculations are made using{" "}
        <a href="https://github.com/moment/luxon">luxon</a>.
      </p>

      <div className="calc-box">
        <div className="input-box">
          {mode === "DURATIONS" && (
            <DurationInput
              input={durationInputA}
              onChange={setDurationInputA}
              onFocus={() => setFocusedInput("DURATION_A")}
            />
          )}
          {(mode === "DURATION_FROM_DATE" || mode === "DATE_DIFFERENCE") && (
            <DateInput
              input={dateInputA}
              onChange={setDateInputA}
              onFocus={() => setFocusedInput("DATE_A")}
            />
          )}
          <div className="operator">{operation === "PLUS" ? "+" : "-"}</div>
          {(mode === "DURATIONS" || mode === "DURATION_FROM_DATE") && (
            <DurationInput
              input={durationInputB}
              onChange={setDurationInputB}
              onFocus={() => setFocusedInput("DURATION_B")}
            />
          )}
          {mode === "DATE_DIFFERENCE" && (
            <DateInput
              input={dateInputB}
              onChange={setDateInputB}
              onFocus={() => setFocusedInput("DATE_B")}
            />
          )}
          <div className="operator">=</div>
        </div>
        <div className="result-box">
          {mode === "DURATIONS" && (
            <>
              {durationA.isValid &&
                durationB.isValid &&
                (operation === "PLUS"
                  ? formatDuration(durationA.plus(durationB))
                  : formatDuration(durationA.minus(durationB)))}
            </>
          )}
          {mode === "DURATION_FROM_DATE" && (
            <>
              {dateA.isValid && durationB.isValid && operation === "PLUS"
                ? formatDate(dateA.plus(durationB))
                : formatDate(dateA.minus(durationB))}
            </>
          )}
          {mode === "DATE_DIFFERENCE" && (
            <>
              {dateA.isValid &&
                dateB.isValid &&
                formatDuration(dateB.diff(dateA))}
            </>
          )}
          &nbsp;
        </div>
      </div>

      <div className="operator-dials-container">
        <fieldset>
          <legend>Mode</legend>
          {Object.entries(modes).map(([key, label]) => (
            <>
              <input
                id={`modeRadio${key}`}
                type="radio"
                name="mode"
                value={key}
                checked={mode === key}
                onChange={() => setModeAndFocus(key as Mode)}
              />
              <label htmlFor={`modeRadio${key}`}>{label}</label>
            </>
          ))}
        </fieldset>
        <fieldset disabled={mode === "DATE_DIFFERENCE"}>
          <legend>Operation</legend>
          {Object.entries(operations).map(([key, label]) => (
            <>
              <input
                id={`operatorRadio${key}`}
                type="radio"
                name="operator"
                value={key}
                checked={operation === key}
                onChange={() => setOperation(key as Operation)}
              />
              <label htmlFor={`operatorRadio${key}`}>{label}</label>
            </>
          ))}
        </fieldset>
      </div>

      <div className="dials-container">
        <div className="dial-grid">
          {new Array(10)
            .fill(0)
            .map((_, i) => (i + 1) % 10)
            .map((val) => (
              <button
                onClick={() => appendToFocusedDuration(String(val))}
                disabled={dialsDisabled}
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
              disabled={dialsDisabled}
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
