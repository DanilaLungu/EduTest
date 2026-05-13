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
      // Безопасное получение коллекции
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      
      if (querySnapshot.empty) {
        setUsers([]);
      } else {
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      }
    } catch (err) {
      console.error("Детальная ошибка в AdminPanel:", err);
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
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      alert(`Роль успешно изменена на ${newRole}`);
      fetchUsers();
    } catch (err) {
      alert(`Ошибка изменения роли: ${err.message}`);
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

  if (loading) {
    return <div style={{ padding: '20px', color: '#fff' }}>Загрузка пользователей базы данных...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', margin: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
        <h3>⚠️ Ошибка загрузки панели администратора</h3>
        <p>{error}</p>
        <button onClick={fetchUsers} style={{ padding: '8px 15px', cursor: 'pointer' }}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
      <h2 style={{ color: '#856404', margin: '0 0 10px 0' }}>🛠 Панель администратора</h2>
      <p style={{ color: '#666' }}>Всего зарегистрировано пользователей в системе: <b>{users.length}</b></p>
      
      {users.length === 0 ? (
        <p>Пользователи в базе данных не найдены.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Имя</th>
              <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Текущая роль</th>
              <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{u.name || 'Без имени'}</td>
                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{u.email}</td>
                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                  <span style={{ fontWeight: 'bold', color: u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'green' : 'blue' }}>
                    {(u.role || 'student').toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                  {u.id !== doc(db, "users", u.id).id && u.role !== 'admin' ? (
                    <>
                      <button onClick={() => changeRole(u.id, 'teacher')} style={{ marginRight: '5px', background: '#28a745', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Учитель</button>
                      <button onClick={() => changeRole(u.id, 'student')} style={{ marginRight: '5px', background: '#6c757d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Ученик</button>
                      <button onClick={() => deleteUserRecord(u.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Удалить</button>
                    </>
                  ) : (
                    <span style={{ color: '#aaa', fontStyle: 'italic' }}>Вы (Главный админ)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
