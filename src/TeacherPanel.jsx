import TeacherResults from './TeacherResults';
import React, { useState } from 'react';
import { db, auth } from './App';
import { collection, addDoc } from 'firebase/firestore';

export default function TeacherPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const addQuestionToStructure = () => {
    if (!currentQuestion || options.some(opt => opt === '')) {
      alert("Заполните текст вопроса и все 4 варианта ответа!");
      return;
    }
    const newQuestion = {
      text: currentQuestion,
      options: [...options],
      correctAnswer: parseInt(correctAnswer),
      type: "single"
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const saveTestToFirebase = async () => {
    if (!title || questions.length === 0) {
      alert("Введите название теста и добавьте хотя бы один вопрос!");
      return;
    }

    try {
      // 1. Создаем сам тест
      const testRef = await addDoc(collection(db, "tests"), {
        title,
        description,
        authorId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      // 2. Записываем вопросы в подколлекцию
      for (const q of questions) {
        await addDoc(collection(db, "tests", testRef.id, "questions"), q);
      }

      alert("Тест успешно создан и опубликован для учеников!");
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch (error) {
      console.error("Ошибка сохранения теста:", error);
    }
  };

return (
  <div style={{ maxWidth: '650px', margin: '0 auto', background: 'var(--bg-card)', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
    <h2 style={{ fontSize: '22px', margin: '0 0 25px 0', fontWeight: '600' }}>⚙️ Создание нового теста</h2>
    
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>НАЗВАНИЕ ТЕСТА</label>
      <input type="text" placeholder="Контрольная работа по математике" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }} />
    </div>

    <div style={{ marginBottom: '25px' }}>
      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>ОПИСАНИЕ И КРИТЕРИИ</label>
      <textarea placeholder="Тест включает вопросы по тригонометрии..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }} />
    </div>

    <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', marginBottom: '25px' }}>
      <h3 style={{ fontSize: '16px', margin: '0 0 15px 0' }}>🧩 Конструктор вопросов</h3>
      <input type="text" placeholder="Текст вопроса (например: 2 + 2 = ?)" value={currentQuestion} onChange={e => setCurrentQuestion(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', marginBottom: '15px', boxSizing: 'border-box' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '10px 15px', borderRadius: '12px' }}>
            <input type="radio" name="correct" checked={correctAnswer === idx} onChange={() => setCorrectAnswer(idx)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <input type="text" placeholder={`Вариант ответа №${idx + 1}`} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '12px', width: '100%', fontSize: '14px', outline: 'none' }} />
          </div>
        ))}
      </div>
      <button onClick={addQuestionToStructure} style={{ marginTop: '15px', width: '100%', padding: '10px', background: 'rgba(138, 79, 255, 0.15)', color: 'var(--accent-purple)', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Добавить вопрос в список</button>
    </div>

    {questions.length > 0 && (
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>СПИСОК ВОПРОСОВ ({questions.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {questions.map((q, i) => (
            <div key={i} style={{ background: 'var(--bg-input)', padding: '10px 15px', borderRadius: '10px', fontSize: '14px' }}>
              {i + 1}. {q.text} <span style={{ color: 'var(--accent-green)', float: 'right' }}>✓ Вариант {q.correctAnswer + 1}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <button onClick={saveTestToFirebase} style={{ width: '100%', background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
      Опубликовать тест на сервер
    </button>
  </div>
);

