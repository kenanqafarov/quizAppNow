import React, { useEffect, useState } from "react";
import questionsData from "../data/questions.json";
import "../style/quiz.css";

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 dəq

  useEffect(() => {
    const selected = shuffleArray(questionsData).slice(0, 30);
    setQuestions(selected);
  }, []);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft === 0) {
      setSubmitted(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleAnswer = (option) => {
    if (submitted) return;
    setAnswers({ ...answers, [current]: option });
  };

  const handleSubmit = () => {
    setSubmitted(true);
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

  return (
    <div className="quiz-container">
      <div className="timer">⏳ {formatTime(timeLeft)}</div>

      {submitted && (
        <div className="results">
          <h3>📊 Nəticələr</h3>
          <p>✅ Düzgün: {stats.correct}</p>
          <p>❌ Səhv: {stats.wrong}</p>
          <p>⚠️ Boş: {stats.empty}</p>
        </div>
      )}

      {!submitted && questions.length > 0 && (
        <>
          <div className="question-block">
            <h2>Sual {current + 1} / 30</h2>
            <p className="question-text">{currentQuestion.question}</p>
            <ul className="options">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[current] === opt;
                const isCorrect = currentQuestion.answer === opt;
                let className = "option";
                if (submitted) {
                  if (isCorrect) className += " correct";
                  else if (isSelected) className += " wrong";
                } else if (isSelected) {
                  className += " selected";
                }

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
              onClick={() => setCurrent(current + 1)}
              disabled={current === questions.length - 1}
            >
              Növbəti
            </button>
          </div>

          <div className="submit-section">
            {!submitted && (
              <button onClick={handleSubmit}>Təsdiqlə (Submit)</button>
            )}
          </div>
        </>
      )}

      {submitted && (
        <div className="all-answers">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            return (
              <div className="answer-block" key={i}>
                <p className="question-text">{i + 1}. {q.question}</p>
                <ul className="options">
                  {q.options.map((opt, idx) => {
                    const isCorrect = q.answer === opt;
                    const isSelected = userAnswer === opt;
                    let className = "option";
                    if (isCorrect) className += " correct";
                    if (isSelected && !isCorrect) className += " wrong";
                    return (
                      <li key={idx} className={className}>
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }).reverse()}
        </div>
      )}
    </div>
  );
};

export default Quiz;
