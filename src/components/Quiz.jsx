import React, { useEffect, useState } from "react";
import questionsData from "../data/questions.json";
import "../style/quiz.css";

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [minIndex, setMinIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(200);
  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    if (!started) return;
    const selected = shuffleArray(
      questionsData.slice(minIndex, maxIndex + 1)
    ).slice(0, 30);
    setQuestions(selected);
  }, [started, minIndex, maxIndex]);

  useEffect(() => {
    if (submitted || !started) return;
    if (timeLeft === 0) {
      setSubmitted(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, started]);

  const handleAnswer = (option) => {
    if (submitted) return;
    setAnswers({ ...answers, [current]: option });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const toggleReveal = (index) => {
    setRevealed((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const getStats = () => {
    let correct = 0, wrong = 0, empty = 0;
    questions.forEach((q, i) => {
      if (!answers[i]) empty++;
      else if (answers[i] === q.answer) correct++;
      else wrong++;
    });
    return { correct, wrong, empty };
  };

  const currentQuestion = questions[current];
  const stats = getStats();

  if (!started) {
    return (
      <div className="start-screen">
        <h2>Aralığı daxil edin (0 - 200)</h2>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minIndex}
            min={0}
            max={199}
            onChange={(e) => setMinIndex(parseInt(e.target.value) || 0)}
            className="range-input"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxIndex}
            min={1}
            max={200}
            onChange={(e) => setMaxIndex(parseInt(e.target.value) || 200)}
            className="range-input"
          />
        </div>
        <button onClick={() => setStarted(true)} className="start-button">
          Başla
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="timer">⏳ {formatTime(timeLeft)}</div>

      {submitted && (
        <div className="results">
          <h3>📊 Nəticələr</h3>
          <p>✅ Düzgün: {stats.correct}</p>
          <p>❌ Səhv: {stats.wrong}</p>
          <p>⚠️ Boş: {stats.empty}</p>
          <p>🎯 Bal: {stats.correct} / {questions.length}</p>
        </div>
      )}

      {!submitted && questions.length > 0 && (
        <>
          <div className="question-block">
            <h2>Sual {current + 1} / {questions.length}</h2>
            <p className="question-text">
              {questions[current].question.replace(/^\d+\.\s*/, "")}
            </p>
            <ul className="options">
              {questions[current].options.map((opt, idx) => {
                const isSelected = answers[current] === opt;
                let className = "option";
                if (isSelected) className += " selected";
                return (
                  <li
                    key={idx}
                    className={className}
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="nav-buttons">
            <button
              onClick={() => setCurrent(current - 1)}
              disabled={current === 0}
            >
              Əvvəlki
            </button>

            <button
              className="reveal-button"
              onClick={() => toggleReveal(current)}
            >
              {revealed[current] ? "Gizlət" : "✅ Doğru Cavabı Göstər"}
            </button>

            <button
              onClick={() => setCurrent(current + 1)}
              disabled={current === questions.length - 1}
            >
              Növbəti
            </button>
          </div>

          {revealed[current] && (
            <div className="correct-answer-box">
              ✅ Doğru cavab: <strong>{questions[current].answer}</strong>
            </div>
          )}

          <div className="submit-section">
            <button onClick={handleSubmit}>Təsdiqlə (Submit)</button>
          </div>
        </>
      )}

      {submitted && (
        <div className="all-answers">
          {[...questions].map((q, i) => {
            const userAnswer = answers[i];
            return (
              <div className="answer-block" key={i}>
                <p className="question-text">{i + 1}. {q.question.replace(/^\d+\.\s*/, "")}</p>
                <ul className="options">
                  {q.options.map((opt, idx) => {
                    const isCorrect = q.answer === opt;
                    const isSelected = userAnswer === opt;
                    let className = "option";
                    if (isCorrect) className += " correct";
                    return (
                      <li key={idx} className={className}>
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quiz;
