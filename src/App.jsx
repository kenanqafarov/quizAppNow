import React, { useState } from "react";
import Quiz from "./components/Quiz";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [started, setStarted] = useState(false);
  const [minIndex, setMinIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(692);
  const [customRange, setCustomRange] = useState("");
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [showCorrectToggle, setShowCorrectToggle] = useState(false);
  const [errors, setErrors] = useState({});

  const handleStart = () => {
    const newErrors = {};
    const questionCount = useCustomRange
      ? parseCustomRange(customRange).length
      : maxIndex - minIndex;

    if (!useCustomRange) {
      if (minIndex < 0 || minIndex >= maxIndex) {
        newErrors.min = "Başlanğıc sual düzgün deyil.";
      }
      if (maxIndex > 692) {
        newErrors.max = "Maksimum sual sayı 280-dir.";
      }
    } else {
      if (parseCustomRange(customRange).length === 0) {
        newErrors.custom = "Daxil edilən sual aralığı düzgün deyil.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (questionCount < 30) {
      toast.warn("Seçilmiş sual sayı 30-dan azdır. Davam edilir...");
      setTimeout(() => setStarted(true), 2000);
    } else {
      setStarted(true);
    }
  };

  const parseCustomRange = (input) => {
    const parts = input.split(/[\s,]+/);
    const numbers = new Set();

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            const index = i - 1;
            if (index >= 0 && index <= 199) numbers.add(index);
          }
        }
      } else {
        const num = Number(part);
        const index = num - 1;
        if (!isNaN(index) && index >= 0 && index <= 199) {
          numbers.add(index);
        }
      }
    }

    return [...numbers];
  };

  if (started) {
    return (
      <>
        <Quiz
          minIndex={minIndex}
          maxIndex={maxIndex}
          customRange={
            useCustomRange ? parseCustomRange(customRange) : undefined
          }
          showCorrectToggle={showCorrectToggle}
        />
        <ToastContainer position="top-center" autoClose={2000} />
      </>
    );
  }

  return (
    <div className="start-screen">
      <p className="start-title">Quiz App</p>
      <p className="subject">Fənn: Sahibkarlığın əsasları və biznesə giriş</p>

      {useCustomRange ? (
        <div className={`custom-input-wrapper ${useCustomRange ? "open" : ""}`}>
          <label>
            Sual nömrələri (məs: 1,2,5-10):
            <input
              className={`custom-input ${errors.custom ? "error" : ""}`}
              type="text"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
            />
            {errors.custom && (
              <div className="error-message">{errors.custom}</div>
            )}
          </label>
        </div>
      ) : (
        <div className="inputs">
          <label>
            Başlanğıc sual:
            <input
              type="number"
              placeholder={minIndex}
              min={0}
              max={199}
              className={errors.min ? "error" : ""}
              onChange={(e) =>
                setMinIndex(parseInt(e.target.value) || 0)
              }
            />
            {errors.min && <div className="error-message">{errors.min}</div>}
          </label>

          <label>
            Son sual:
            <input
              type="number"
              placeholder={maxIndex}
              min={1}
              max={200}
              className={errors.max ? "error" : ""}
              onChange={(e) =>
                setMaxIndex(parseInt(e.target.value) || 200)
              }
            />
            {errors.max && <div className="error-message">{errors.max}</div>}
          </label>
        </div>
      )}
      <div className="wrappers">
        <div className="toggle-wrapper" onClick={() => setShowCorrectToggle(!showCorrectToggle)}>
          <div className={`toggle-button ${showCorrectToggle ? "on" : ""}`}>
            <div className="toggle-circle" />
          </div>
          <span>Düzgün cavablara baxmaq imkanı</span>
        </div>
        <div className="toggle-wrapper" onClick={() => setUseCustomRange(!useCustomRange)}>
          <div className={`toggle-button ${useCustomRange ? "on" : ""}`}>
            <div className="toggle-circle" />
          </div>
          <span>Xüsusi sual aralığı daxil et</span>
        </div>
      </div>

      <button className="start-button" onClick={handleStart}>
        İmtahana başla
      </button>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default App;
