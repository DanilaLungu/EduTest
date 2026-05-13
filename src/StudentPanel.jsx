import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function StudentPanel({ userId }) {
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Загрузка доступных тестов
  useEffect(() => {
    const fetchTests = async () => {
      const querySnapshot = await getDocs(collection(db, "tests"));
      setTests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTests();
  }, [result]);

  const startTest = async (test) => {
    setActiveTest(test);
    setResult(null);
    setStudentAnswers({});
    // Загружаем вопросы из подколлекции выбранного теста
    const qSnapshot = await getDocs(collection(db, "tests", test.id, "questions"));
    setQuestions(qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setStudentAnswers({ ...studentAnswers, [qId]: optionIdx });
  };

  const submitTest = async () => {
    if (Object.keys(studentAnswers).length < questions.length) {
      alert("Пожалуйста, ответьте на все вопросы!");
      return;
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (studentAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);

    const attemptData = {
      userId,
      testId: activeTest.id,
      testTitle: activeTest.title,
      score: correctCount,
      totalQuestions: questions.length,
      percent,
      completedAt: new Date().toISOString()
    };

    // Сохраняем результат в БД
    await addDoc(collection(db, "attempts"), attemptData);
    setResult(attemptData);
    setActiveTest(null);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Панель тестирования (Студент)</h2>

      {result && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Результат отправлен!</h3>
          <p>Вы прошли тест: <b>{result.testTitle}</b></p>
          <p>Правильных ответов: {result.score} из {result.totalQuestions} ({result.percent}%)</p>
        </div>
      )}

      {!activeTest ? (
        <div>
          <h3>Доступные тесты для прохождения:</h3>
          {tests.length === 0 ? <p>Тестов пока нет.</p> : (
            <ul>
              {tests.map(test => (
                <li key={test.id} style={{ marginBottom: '10px' }}>
                  <b>{test.title}</b> — {test.description} {' '}
                  <button onClick={() => startTest(test)} style={{ marginLeft: '10px' }}>Пройти тест</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
          <h3>Прохождение теста: {activeTest.title}</h3>
          {questions.map((q, qIdx) => (
            <div key={q.id} style={{ marginBottom: '20px', borderBottom: '1px dashed #ccc', paddingBottom: '15px' }}>
              <p><b>Вопрос {qIdx + 1}:</b> {q.text}</p>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} style={{ display: 'block', margin: '5px 0', cursor: 'pointer' }}>
                  <input type="radio" name={`question-${q.id}`} checked={studentAnswers[q.id] === oIdx} onChange={() => handleSelectAnswer(q.id, oIdx)} />
                  <span style={{ marginLeft: '8px' }}>{opt}</span>
                </label>
              ))}
            </div>
          ))}
          <button onClick={submitTest} style={{ background: 'blue', color: 'white', padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>
            Завершить тест и отправить результат
          </button>
        </div>
      )}
    </div>
  );
}
