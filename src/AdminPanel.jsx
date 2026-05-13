import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      const querySnapshot = await getDocs(collection(db, "users"));
      if (querySnapshot.empty) {
        setUsers([]);
      } else {
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) {
      console.error("Ошибка в AdminPanel:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert(`Роль изменена на ${newRole}`);
      fetchUsers();
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const deleteUserRecord = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить профиль этого пользователя из БД?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("Пользователь удален.");
        fetchUsers();
      } catch (err) {
        alert(`Ошибка удаления: ${err.message}`);
      }
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Загрузка пользователей БД...</div>;

  if (error) {
    return (
      <div style={{ padding: '20px', background: 'rgba(218, 55, 60, 0.1)', color: 'var(--accent-red)', borderRadius: '16px', border: '1px solid rgba(218, 55, 60, 0.2)' }}>
        <h3>⚠️ Ошибка загрузки данных</h3>
        <p>{error}</p>
        <button onClick={fetchUsers} style={{ padding: '8px 15px', background: 'var(--bg-input)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Повторить</button>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      padding: '30px', 
      borderRadius: '24px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.03)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>🛠 Панель администратора</h2>
        <div style={{ background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Всего в системе: <b>{users.length}</b>
        </div>
      </div>
      
      {users.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Пользователи не найдены.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--bg-input)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ИМЯ</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>EMAIL</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ТЕКУЩАЯ РОЛЬ</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', fontSize: '15px', fontWeight: '500' }}>{u.name || 'Без имени'}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      padding: '4px 10px', 
                      borderRadius: '8px',
                      background: u.role === 'admin' ? 'rgba(218, 55, 60, 0.1)' : u.role === 'teacher' ? 'rgba(138, 79, 255, 0.1)' : 'rgba(88, 101, 242, 0.1)',
                      color: u.role === 'admin' ? 'var(--accent-red)' : u.role === 'teacher' ? 'var(--accent-purple)' : 'var(--accent-blue)'
                    }}>
                      {(u.role || 'student').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {u.role !== 'admin' ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => changeRole(u.id, 'teacher')} style={{ background: 'var(--bg-input)', color: 'var(--accent-green)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Учитель</button>
                        <button onClick={() => changeRole(u.id, 'student')} style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Ученик</button>
                        <button onClick={() => deleteUserRecord(u.id)} style={{ background: 'rgba(218, 55, 60, 0.1)', color: 'var(--accent-red)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Удалить</button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>Главный аккаунт</span>
                    )}
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
