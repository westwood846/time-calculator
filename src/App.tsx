import { useState } from "react";
import "./App.css";
import {
  DurationInput,
  durationTokensToUnits,
  formatDuration,
  parseDurationInput,
} from "./durations";
import { DateInput, formatDate, parseDateString } from "./dates";

const modes = {
  DATE_DIFFERENCE: "Date Difference",
  DURATION_FROM_DATE: "Duration From Date",
  DURATIONS: "Durations",
} as const;

type Mode = keyof typeof modes;

const operations = {
  PLUS: "Plus",
  MINUS: "Minus",
} as const;

type Operation = keyof typeof operations;

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
  const dateA = parseDateString(dateInputA);
  const [dateInputB, setDateInputB] = useState("");
  const dateB = parseDateString(dateInputB);

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

          <div className="calc-operator">
            {operation === "PLUS" ? "+" : "-"}
          </div>

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

          <div className="calc-operator">=</div>
        </div>

        <div className="result">
          {mode === "DURATIONS" && (
            <>
              {durationA.isValid && durationB.isValid && (
                <>
                  {operation === "PLUS"
                    ? formatDuration(durationA.plus(durationB))
                    : formatDuration(durationA.minus(durationB))}
                </>
              )}
            </>
          )}
          {mode === "DURATION_FROM_DATE" && (
            <>
              {dateA.isValid && durationB.isValid && (
                <>
                  {operation === "PLUS"
                    ? formatDate(dateA.plus(durationB))
                    : formatDate(dateA.minus(durationB))}
                </>
              )}
            </>
          )}
          {mode === "DATE_DIFFERENCE" && (
            <>
              {dateA.isValid && dateB.isValid && (
                <>{formatDuration(dateB.diff(dateA))}</>
              )}
            </>
          )}
          &nbsp;
        </div>
      </div>

      <div className="settings-box">
        <fieldset>
          <legend>Mode</legend>
          {Object.entries(modes).map(([key, label]) => (
            <label htmlFor={`modeRadio${key}`} key={key}>
              <input
                id={`modeRadio${key}`}
                type="radio"
                name="mode"
                value={key}
                checked={mode === key}
                onChange={() => setModeAndFocus(key as Mode)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <fieldset disabled={mode === "DATE_DIFFERENCE"}>
          <legend>Operation</legend>
          {Object.entries(operations).map(([key, label]) => (
            <label htmlFor={`operationRadio${key}`} key={key}>
              <input
                id={`operationRadio${key}`}
                type="radio"
                name="operation"
                value={key}
                checked={operation === key}
                onChange={() => setOperation(key as Operation)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="dials-box">
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
          {Object.entries(durationTokensToUnits).map(([token, unit]) => (
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
