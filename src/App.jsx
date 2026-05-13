import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import TeacherPanel from './TeacherPanel';
import StudentPanel from './StudentPanel';
import AdminPanel from './AdminPanel';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // 1. Создание пользователя в Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // 2. Запись в Firestore СТРОГО с ролью student по умолчанию
        await setDoc(doc(db, "users", uid), {
          name: name || "Новый пользователь",
          email: email,
          role: "student" 
        });
        alert("Регистрация успешна! Роль по умолчанию: Ученик");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '5px auto', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2>{isRegister ? "Регистрация в EduTest" : "Авторизация в EduTest"}</h2>
        <form onSubmit={handleAuth}>
          {isRegister && (
            <input type="text" placeholder="Ваше Имя" value={name} onChange={e => setName(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isRegister ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: '#007bff', marginTop: '15px', textAlign: 'center' }}>
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '10px', background: '#f1f1f1', padding: '10px', borderRadius: '4px' }}>
        <span>Вы вошли как: <b>{user.email}</b> | Роль в системе: <span style={{ color: 'red', fontWeight: 'bold' }}>{role}</span></span>
        <button onClick={() => signOut(auth)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Выйти</button>
      </header>
      
      {role === 'admin' && <AdminPanel />}
      {role === 'teacher' && <TeacherPanel />}
      {role === 'student' && <StudentPanel userId={user.uid} />}
    </div>
  );
}
