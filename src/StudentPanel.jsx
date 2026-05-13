import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export default function StudentPanel({ userId }) {
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [myAttempts, setMyAttempts] = useState([]);

  // Загрузка доступных тестов и личной истории попыток студента
  const loadData = async () => {
    // 1. Загружаем все тесты
    const testsSnapshot = await getDocs(collection(db, "tests"));
    setTests(testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // 2. Загружаем только попытки текущего студента (фильтрация на стороне БД)
    try {
      const q = query(
        collection(db, "attempts"), 
        where("userId", "==", userId)
      );
      const attemptsSnapshot = await getDocs(q);
      // Сортируем на клиенте, чтобы не требовать создания сложного индекса в Firebase на этапе отладки
      const list = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setMyAttempts(list);
    } catch (e) {
      console.error("Ошибка загрузки истории:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [result, userId]);

  const startTest = async (test) => {
    setActiveTest(test);
    setResult(null);
    setStudentAnswers({});
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Левая колонка: Доступные тесты */}
          <div>
            <h3>Доступные тесты:</h3>
            {tests.length === 0 ? <p>Тестов пока нет.</p> : (
              <ul style={{ paddingLeft: '20px' }}>
                {tests.map(test => (
                  <li key={test.id} style={{ marginBottom: '15px' }}>
                    <div><b>{test.title}</b></div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{test.description}</div>
                    <button onClick={() => startTest(test)} style={{ marginTop: '5px', padding: '5px 10px', cursor: 'pointer' }}>Пройти тест</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Правая колонка: История прохождения студента */}
          <div style={{ background: '#f1f3f5', padding: '15px', borderRadius: '6px' }}>
            <h3>Мои результаты (История):</h3>
            {myAttempts.length === 0 ? <p>Вы еще не проходили тесты.</p> : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {myAttempts.map(att => (
                  <li key={att.id} style={{ background: '#fff', padding: '10px', marginBottom: '8px', borderRadius: '4px', borderLeft: `5px solid ${att.percent >= 50 ? 'green' : 'red'}` }}>
                    <b>{att.testTitle}</b> <br />
                    <span>Результат: {att.score}/{att.totalQuestions} ({att.percent}%)</span> <br />
                    <span style={{ fontSize: '11px', color: '#888' }}>{new Date(att.completedAt).toLocaleString('ru-RU')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
