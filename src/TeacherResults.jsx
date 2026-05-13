import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Запрос на получение всех попыток, отсортированных по дате (свежие сверху)
        const q = query(collection(db, "attempts"), orderBy("completedAt", "desc"));
        const querySnapshot = await getDocs(q);
        setResults(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Ошибка загрузки результатов:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <div>Загрузка таблицы результатов...</div>;

  return (
    <div style={{ marginTop: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '5px', border: '1px solid #dee2e6' }}>
      <h3>📊 Журнал успеваемости студентов</h3>
      {results.length === 0 ? <p>Ни один студент еще не прошел тесты.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Тест</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>ID Студента</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Баллы</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Процент</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Дата прохождения</th>
            </tr>
          </thead>
          <tbody>
            {results.map(res => (
              <tr key={res.id}>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{res.testTitle}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', fontSize: '12px', color: '#555' }}>{res.userId}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{res.score} / {res.totalQuestions}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: res.percent >= 50 ? 'green' : 'red' }}>
                  {res.percent}%
                </td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', fontSize: '13px' }}>
                  {new Date(res.completedAt).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
