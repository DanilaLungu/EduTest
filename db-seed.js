import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";

// TODO: Замените этот объект на ваши реальные ключи из консоли Firebase
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
const db = getFirestore(app);

async function seedDatabase() {
  console.log("Запуск инициализации базы данных...");

  try {
    // 1. Создание тестовых пользователей (Учитель и Студент)
    await setDoc(doc(db, "users", "teacher_demo_id"), {
      name: "Иван Иванович (Преподаватель)",
      email: "teacher@edu.ru",
      role: "teacher"
    });

    await setDoc(doc(db, "users", "student_demo_id"), {
      name: "Петр Петров (Студент)",
      email: "student@edu.ru",
      role: "student"
    });

    console.log("✔ Коллекция 'users' создана и заполнена.");

    // 2. Создание демонстрационного теста
    const testRef = await addDoc(collection(db, "tests"), {
      title: "Тестирование по курсу 'Веб-технологии'",
      description: "Базовый тест для проверки знаний синтаксиса JavaScript и React",
      authorId: "teacher_demo_id",
      createdAt: new Date().toISOString()
    });

    console.log(`✔ Коллекция 'tests' создана. ID теста: ${testRef.id}`);

    // 3. Добавление вопросов внутрь созданного теста (Подколлекция)
    const q1Ref = collection(db, "tests", testRef.id, "questions");
    
    await addDoc(q1Ref, {
      text: "Какая технология используется для создания интерфейсов в React?",
      options: ["JSX", "SQL", "Python XML", "C++ Templates"],
      correctAnswer: 0, // Индекс правильного ответа (JSX)
      type: "single"
    });

    await addDoc(q1Ref, {
      text: "Какой хук в React отвечает за управление локальным состоянием компонента?",
      options: ["useEffect", "useContext", "useState", "useReducer"],
      correctAnswer: 2, // Индекс правильного ответа (useState)
      type: "single"
    });

    console.log("✔ Подколлекция 'questions' успешно заполнена вопросами.");

    // 4. Создание фиктивного результата (генерация первой попытки)
    await addDoc(collection(db, "attempts"), {
      userId: "student_demo_id",
      testId: testRef.id,
      testTitle: "Тестирование по курсу 'Веб-технологии'",
      score: 2, // Количество правильных
      totalQuestions: 2,
      percent: 100,
      completedAt: new Date().toISOString()
    });

    console.log("✔ Коллекция 'attempts' создана. Пример результата сохранен.");
    console.log("🎉 База данных Firebase Cloud Firestore успешно развернута!");

  } catch (error) {
    console.error("Ошибка при инициализации БД: ", error);
  }
}

// Запуск скрипта
seedDatabase();
