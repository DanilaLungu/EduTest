import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

export default function StudentPanel({ userId }) {
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [myAttempts, setMyAttempts] = useState([]);

  const loadData = async () => {
    const testsSnapshot = await getDocs(collection(db, "tests"));
    setTests(testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    try {
      const q = query(
        collection(db, "attempts"), 
        where("userId", "==", userId)
      );
      const attemptsSnapshot = await getDocs(q);
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {result && (
        <div style={{ background: 'rgba(35, 165, 90, 0.15)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '20px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '5px' }}>✅</div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px' }}>Тест успешно завершен!</h3>
          <p style={{ margin: 0, fontSize: '16px' }}>Ваш результат: <b>{result.score} / {result.totalQuestions}</b> ({result.percent}%)</p>
        </div>
      )}

      {!activeTest ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Левая колонка: Доступные тесты */}
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Доступные тесты</h2>
            {tests.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Тестов пока нет.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tests.map(test => (
                  <div key={test.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.02)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '600' }}>{test.title}</h4>
                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{test.description}</p>
                    <button onClick={() => startTest(test)} style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Пройти тест</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая колонка: Мои результаты (Теперь полностью идентична левой по стилю) */}
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Мои результаты</h2>
            {myAttempts.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Вы еще не проходили тесты.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {myAttempts.map(att => (
                  <div key={att.id} style={{ 
                    background: 'var(--bg-card)', 
                    padding: '20px', 
                    borderRadius: '18px', 
                    border: '1px solid rgba(255,255,255,0.02)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '600' }}>{att.testTitle}</h4>
                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Дата прохождения: {new Date(att.completedAt).toLocaleDateString()}
                    </p>
                    
                    {/* Стилизованная плашка результата на месте кнопки */}
                    <div style={{ 
                      display: 'inline-block',
                      padding: '10px 20px', 
                      borderRadius: '10px', 
                      fontWeight: '600', 
                      fontSize: '14px',
                      background: att.percent >= 50 ? 'rgba(35, 165, 90, 0.15)' : 'rgba(218, 55, 60, 0.15)',
                      color: att.percent >= 50 ? 'var(--accent-green)' : 'var(--accent-red)',
                      border: `1px solid ${att.percent >= 50 ? 'rgba(35, 165, 90, 0.2)' : 'rgba(218, 55, 60, 0.2)'}`
                    }}>
                      Результат: {att.score} / {att.totalQuestions} ({att.percent}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Окно прохождения теста */
        <div style={{ maxWidth: '550px', margin: '0 auto', background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{activeTest.title}</h3>
            <div style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>Вопросов: {questions.length}</div>
          </div>

          <div style={{ background: '#111', padding: '15px', borderRadius: '16px', textAlign: 'center', marginBottom: '25px', fontSize: '24px', fontWeight: '700', letterSpacing: '1px' }}>
            ⏱️ Экзамен
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.id} style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '15px', textAlign: 'center' }}>{q.text}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = studentAnswers[q.id] === oIdx;
                  return (
                    <button key={oIdx} onClick={() => handleSelectAnswer(q.id, oIdx)} style={{ width: '100%', padding: '14px 20px', textAlign: 'left', background: isSelected ? 'var(--accent-purple)' : 'var(--bg-input)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', cursor: 'pointer', transition: '0.2s', fontWeight: isSelected ? '600' : '400' }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={submitTest} style={{ width: '100%', background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '15px', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
            Завершить и отправить
          </button>
        </div>
      )}
    </div>
  );
}