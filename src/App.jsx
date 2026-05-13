import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Безопасный импорт панелей (убедитесь, что файлы лежат в папке src/)
import AdminPanel from './AdminPanel';
import TeacherPanel from './TeacherPanel';
import StudentPanel from './StudentPanel';

// Перенесите ваши реальные ключи из консоли Firebase сюда:
const firebaseConfig = {
  apiKey: "AIzaSyA3zHso5Nl8YbhpOjap_nENBdNslcSbCq4",
  authDomain: "edutest-ff8b8.firebaseapp.com",
  projectId: "edutest-ff8b8",
  storageBucket: "edutest-ff8b8.firebasestorage.app",
  messagingSenderId: "976394305657",
  appId: "1:976394305657:web:f61b764ea90feed35894a8",
  measurementId: "G-CPQ3QB126F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        // Приводим к нижнему регистру для исключения ошибок синтаксиса
        setRole(userRole ? userRole.toLowerCase() : "student");
      } else {
        setRole("student");
      }
    } catch (e) {
      console.error("Ошибка при получении роли:", e);
      setRole("student"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserRole(currentUser.uid);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        await setDoc(doc(db, "users", uid), {
          name: name || "Новый пользователь",
          email: email,
          role: "student"
        });
        
        setRole("student");
        alert("Регистрация успешна!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>Загрузка профиля EduTest...</div>;
  }

if (!user) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        
        {/* Иконка и Логотип как на 1-м экране макета */}
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>📖</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 30px 0', letterSpacing: '-0.5px' }}>EduTest</h1>
        
        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          {isRegister && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', display: 'block', marginBottom: '5px' }}>ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
              <input type="text" placeholder="Данила" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', display: 'block', marginBottom: '5px' }}>ЭЛЕКТРОННАЯ ПОЧТА</label>
            <input type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', display: 'block', marginBottom: '5px' }}>ПАРОЛЬ</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }} />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
            {isRegister ? "Создать аккаунт" : "Войти"}
          </button>
        </form>
        
        <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: 'var(--accent-blue)', marginTop: '20px', fontSize: '14px', fontWeight: '500' }}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </p>
      </div>
    </div>
  );
}


  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
<header style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  background: 'var(--bg-card)', 
  padding: '16px 24px', 
  borderRadius: '18px', 
  marginBottom: '30px', 
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.03)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    {/* Аватар пользователя в стиле Discord */}
    <div style={{ 
      width: '40px', 
      height: '40px', 
      borderRadius: '50%', 
      background: 'var(--bg-input)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '18px',
      border: `2px solid ${role === 'admin' ? 'var(--accent-red)' : role === 'teacher' ? 'var(--accent-purple)' : 'var(--accent-blue)'}`
    }}>
      {role === 'admin' ? '👑' : role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
        {user.email}
      </span>
      <span style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        letterSpacing: '0.5px',
        color: role === 'admin' ? 'var(--accent-red)' : role === 'teacher' ? 'var(--accent-purple)' : 'var(--accent-blue)'
      }}>
        {role?.toUpperCase()}
      </span>
    </div>
  </div>

  <button onClick={() => signOut(auth)} style={{ 
    background: 'rgba(218, 55, 60, 0.1)', 
    color: 'var(--accent-red)', 
    border: '1px solid rgba(218, 55, 60, 0.2)', 
    padding: '10px 18px', 
    borderRadius: '12px', 
    fontSize: '13px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}
  onMouseEnter={(e) => {
    e.target.style.background = 'var(--accent-red)';
    e.target.style.color = '#fff';
  }}
  onMouseLeave={(e) => {
    e.target.style.background = 'rgba(218, 55, 60, 0.1)';
    e.target.style.color = 'var(--accent-red)';
  }}>
    <span>🚪</span> Выйти
  </button>
</header>

      
      {/* Безопасный рендеринг панелей с текстовым индикатором */}
      <div style={{ marginTop: '20px' }}>
        {role === 'admin' && <AdminPanel />}
        {role === 'teacher' && <TeacherPanel />}
        {role === 'student' && <StudentPanel userId={user.uid} />}
        
        {/* Предохранитель на случай, если роль пустая или указана неверно */}
        {!['admin', 'teacher', 'student'].includes(role) && (
          <div style={{ color: '#fff' }}>
            <p>Ваша роль в базе данных ("{role}") не распознана приложением.</p>
            <p>Доступные роли: admin, teacher, student.</p>
          </div>
        )}
      </div>
    </div>
  );
}
