import React, { useState, useEffect } from 'react';
import { db } from './App';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка доступа к списку пользователей:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      alert(`Роль пользователя успешно изменена на ${newRole}`);
      fetchUsers(); // Обновляем список
    } catch (error) {
      alert("Недостаточно прав для изменения роли!");
    }
  };

  const deleteUserRecord = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить профиль этого пользователя из БД?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("Пользователь удален из базы данных.");
        fetchUsers();
      } catch (error) {
        alert("Ошибка удаления!");
      }
    }
  };

  if (loading) return <div>Загрузка панели администратора...</div>;

  return (
    <div style={{ marginTop: '20px', background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
      <h2 style={{ color: '#856404' }}>🛠 ПАНЕЛЬ АДМИНИСТРАТОРА (Управление доступом)</h2>
      <p>Вы можете просматривать зарегистрированных пользователей, выдавать права Преподавателей и удалять учетные записи.</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', background: '#fff' }}>
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
              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{u.name}</td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{u.email}</td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold', color: u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'green' : 'black' }}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                {u.role !== 'admin' ? (
                  <>
                    <button onClick={() => changeRole(u.id, 'teacher')} style={{ marginRight: '5px', background: '#28a745', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Назначить Учителем</button>
                    <button onClick={() => changeRole(u.id, 'student')} style={{ marginRight: '5px', background: '#6c757d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Сделать Учеником</button>
                    <button onClick={() => deleteUserRecord(u.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Удалить</button>
                  </>
                ) : (
                  <span style={{ color: '#aaa', fontStyle: 'italic' }}>Главный админ (нельзя изменить)</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
