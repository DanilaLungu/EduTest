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
    <div style={{ marginTop: '20px' }}>
      <h2>Панель создания тестов (Преподаватель)</h2>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>1. Основная информация</h3>
        <input type="text" placeholder="Название теста" value={title} onChange={e => setTitle(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <textarea placeholder="Описание теста" value={description} onChange={e => setDescription(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
      </div>

      <div style={{ background: '#e9e9e9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>2. Конструктор вопросов</h3>
        <input type="text" placeholder="Текст вопроса" value={currentQuestion} onChange={e => setCurrentQuestion(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        
        <h4>Варианты ответов (отметьте правильный):</h4>
        {options.map((opt, idx) => (
          <div key={idx} style={{ marginBottom: '5px' }}>
            <input type="radio" name="correct" checked={correctAnswer === idx} onChange={() => setCorrectAnswer(idx)} />
            <input type="text" placeholder={`Вариант ${idx + 1}`} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} style={{ marginLeft: '10px', width: '80%', padding: '5px' }} />
          </div>
        ))}
        <button onClick={addQuestionToStructure} style={{ marginTop: '10px', padding: '5px 10px' }}>Добавить вопрос в список</button>
      </div>

      <div>
        <h3>Список добавленных вопросов ({questions.length})</h3>
        <ul>
          {questions.map((q, i) => (
            <li key={i}>{q.text} (Правильный ответ: Вариант {q.correctAnswer + 1})</li>
          ))}
        </ul>
      </div>

      <button onClick={saveTestToFirebase} style={{ background: 'green', color: 'white', padding: '12px 24px', fontSize: '16px', cursor: 'pointer', border: 'none', borderRadius: '5px', marginTop: '20px' }}>
        Опубликовать тест
      </button>
    </div>
  );
}
