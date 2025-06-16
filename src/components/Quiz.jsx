import React, { useState, useEffect } from "react";
import { FaRegClock, FaCheckCircle, FaTimesCircle, FaRegCircle, FaChartPie } from "react-icons/fa";
import questionsData from "../data/questions.json";
import "../style/quiz.css";

function Quiz({ minIndex, maxIndex, customRange, showCorrectToggle }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showCorrect, setShowCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [filter, setFilter] = useState("all");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [timerStopped, setTimerStopped] = useState(false);

  useEffect(() => {
    const questionIndices = customRange ?? Array.from({ length: maxIndex - minIndex }, (_, i) => i + minIndex);
    const shuffledIndices = [...questionIndices].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledIndices.slice(0, 50).map((i) => {
      const q = { ...questionsData[i] };
      q.options = [...q.options].sort(() => Math.random() - 0.5);
      return q;
    });
    setQuestions(selectedQuestions);
  }, [minIndex, maxIndex, customRange]);

  useEffect(() => {
    if (timerStopped) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQuizFinished(true);
          setTimerStopped(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStopped]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (questions.length === 0) return <p>Yüklənir...</p>;

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const correctAnswer = currentQuestion.answer.trim();
  const selectedAnswer = selectedOptions[currentIndex]?.trim();

  const handleOptionClick = (optionText) => {
    if (quizFinished) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optionText.trim(),
    }));
  };

  const handlePrevNext = (direction) => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + direction;
      if (nextIndex < 0 || nextIndex >= questions.length) return prev;
      setShowCorrect(false);
      return nextIndex;
    });
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    setTimerStopped(true);
  };

  const calculateResults = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const selected = selectedOptions[i];
      if (selected === undefined) {
        emptyCount++;
      } else if (selected.trim() === questions[i].answer.trim()) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const total = questions.length;
    const score = correctCount;

    return { correctCount, wrongCount, emptyCount, score };
  };

  const { correctCount, wrongCount, emptyCount, score } = calculateResults();

  const renderQuestions = () => {
    let filteredQuestions = questions;
    if (filter === "correct") {
      filteredQuestions = questions.filter((q, i) => selectedOptions[i]?.trim() === q.answer.trim());
    } else if (filter === "wrong") {
      filteredQuestions = questions.filter((q, i) => selectedOptions[i]?.trim() !== q.answer.trim() && selectedOptions[i] !== undefined);
    } else if (filter === "empty") {
      filteredQuestions = questions.filter((_, i) => selectedOptions[i] === undefined);
    }

    return filteredQuestions.map((question, index) => {
      const selected = selectedOptions[index]?.trim();
      const correct = question.answer.trim();

      return (
        <div key={index} className="options">
          <p className="question-text">{index + 1}. {question.question}</p>
          {question.options.map((opt, idx) => {
            let className = "option-btn";
            const trimmedOpt = opt.trim();

            if (quizFinished) {
              if (trimmedOpt === correct) {
                className += " correct-answer";
              }
              if (selected === trimmedOpt && trimmedOpt !== correct) {
                className += " wrong-answer";
              }
            }

            const isSelected = selected === trimmedOpt && !quizFinished;

            return (
              <button
                key={idx}
                className={`${className} ${isSelected ? "selected" : ""}`}
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="quiz-container">
      <div className={`quiz-timer ${timeLeft < 900 ? "red" : ""}`}>
        <span className="timer-icon"><FaRegClock /></span>
        {formatTime(timeLeft)}
      </div>

      {!quizFinished ? (
        <>
          <div className="question-header">
            <p>{currentIndex + 1}/{questions.length}</p>
            <p className="question-text">{currentIndex + 1}. {currentQuestion.question}</p>
          </div>

          <div className="options">
            {currentQuestion.options.map((opt, idx) => {
              const trimmedOpt = opt.trim();
              const isSelected = selectedAnswer === trimmedOpt;
              const isCorrectAnswer = correctAnswer === trimmedOpt;
              const showGreen = showCorrect && showCorrectToggle && isCorrectAnswer;

              return (
                <button
                  key={idx}
                  className={`option-btn ${isSelected ? "selected" : ""} ${showGreen ? "correct-answer" : ""}`}
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="controls">
            <button onClick={() => handlePrevNext(-1)} disabled={currentIndex === 0}>
              Geri
            </button>

            {showCorrectToggle && (
              <button className="correct-toggle" onClick={() => setShowCorrect((prev) => !prev)}>
                {showCorrect ? "Düzgün cavabı gizlət" : "Düzgün cavabı göstər"}
              </button>
            )}

            <button onClick={() => handlePrevNext(1)} disabled={currentIndex === questions.length - 1}>
              İrəli
            </button>
          </div>
        </>
      ) : (
        <div className="results">
          <div className="results-header">
            <p className="result-title">Nəticəniz</p>
            <p><FaCheckCircle /> {correctCount} doğru</p>
            <p><FaTimesCircle /> {wrongCount} yanlış</p>
            <p><FaRegCircle /> {emptyCount} boş</p>
            <p><FaChartPie /> Ballar: {score} / 50</p>
          </div>

          <div className="filter-buttons">
            <button onClick={() => setFilter("all")}>Bütün suallar</button>
            <button onClick={() => setFilter("correct")}>Düzgün cavablar</button>
            <button onClick={() => setFilter("wrong")}>Yanlış cavablar</button>
            <button onClick={() => setFilter("empty")}>Boş cavablar</button>
          </div>

          <div className="filtered-questions">{renderQuestions()}</div>
        </div>
      )}

      {!quizFinished && (
        <button className="finish-btn" onClick={handleFinishQuiz}>
          Nəticəni gör
        </button>
      )}
    </div>
  );
}

export default Quiz;
