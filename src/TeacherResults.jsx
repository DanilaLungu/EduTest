import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
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

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Загрузка таблицы результатов...</div>;

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      padding: '30px', 
      borderRadius: '24px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.03)',
      color: 'var(--text-primary)'
    }}>
      <h2 style={{ fontSize: '20px', margin: '0 0 20px 0', fontWeight: '600' }}>📊 Журнал успеваемости студентов</h2>
      
      {results.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Ни один студент еще не проходил тесты.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--bg-input)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ТЕСТ</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ID СТУДЕНТА</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>БАЛЛЫ</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ПРОЦЕНТ</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>ДАТА</th>
              </tr>
            </thead>
            <tbody>
              {results.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '500' }}>{res.testTitle}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{res.userId.substring(0, 8)}...</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{res.score} / {res.totalQuestions}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      padding: '4px 10px', 
                      borderRadius: '8px',
                      background: res.percent >= 50 ? 'rgba(35, 165, 90, 0.1)' : 'rgba(218, 55, 60, 0.1)',
                      color: res.percent >= 50 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {res.percent}%
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {new Date(res.completedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
