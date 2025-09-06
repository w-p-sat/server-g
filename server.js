// // Цей код відповідає за генерацію та збереження даних у Firebase
// // Це повинен бути єдиний "авторитетний" джерело даних.
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, get } from "firebase/database";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDVEhuyqT3JQRIF7tHFpDCKe1lYzf0WbYs",
//     authDomain: "analizatot-slots.firebaseapp.com",
//     projectId: "analizatot-slots",
//     storageBucket: "analizatot-slots.firebasestorage.app",
//     messagingSenderId: "1019195914545",
//     appId: "1:1019195914545:web:7f2974395cc1dd17b01810",
//     measurementId: "G-HVW128CCQS"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// // Ігри беруться з games.js
// const games = [
//     { id: "book_of_ra", name: "Book of Ra" },
//     { id: "lucky_lady", name: "Lucky Lady's Charm" }
// ];

// // --- Додаємо фіксовані seed для кожної гри ---
// const gameSeeds = {
//     "book_of_ra": 12345,
//     "lucky_lady": 67890
// };

// // --- PRNG з seed ---
// function seededRandom(seed) {
//     let x = Math.sin(seed) * 10000;
//     return x - Math.floor(x);
// }

// // --- Генерація випадкової фази ---
// function getRandomPhase(seed) {
//     const isGreen = seededRandom(seed) < 0.5;
//     if (isGreen) {
//         return {
//             type: 'normal',
//             color: '#00c107',
//             duration: Math.floor(seededRandom(seed + 1) * 600) + 180,
//             minRTP: 60,
//             maxRTP: 95
//         };
//     } else {
//         return {
//             type: 'normal',
//             color: '#ff6666',
//             duration: Math.floor(seededRandom(seed + 2) * 600) + 120,
//             minRTP: 10,
//             maxRTP: 45
//         };
//     }
// }

// // --- Отримання "синхронізованої" ціни графіка ---
// function getPriceAtTick(gameId, tickIndex) {
//     const seed = gameSeeds[gameId] + tickIndex;
//     const phase = getRandomPhase(seed);
//     const range = phase.maxRTP - phase.minRTP;
//     const volatilityFactor = (seededRandom(seed + 3) - 0.5) * range;
//     return Math.max(phase.minRTP, Math.min(phase.maxRTP, phase.minRTP + range / 2 + volatilityFactor));
// }

// // --- Функція для ініціалізації або оновлення даних гри ---
// async function updateGameData(gameId) {
//     const gameRef = ref(db, `games/${gameId}`);
//     const snapshot = await get(gameRef);
//     let state = snapshot.val();
    
//     // Якщо даних немає, створюємо початковий стан
//     if (!state) {
//         state = {
//             prices: [],
//             maxPoints: 50,
//             currentPhase: getRandomPhase(gameSeeds[gameId]),
//             phaseStartTime: Date.now(),
//             longestStreakValue: 9,
//             bonusProbabilityValue: 5.0,
//             lastBigWinTime: '--',
//             activePlayersValue: 0,
//             lastJackpotTime: '--', // Будемо оновлювати
//             lastJackpotUpdate: Date.now()
//         };
//         const nowTick = Math.floor(Date.now() / 5000);
//         for (let i = state.maxPoints - 1; i >= 0; i--) {
//             state.prices.push(getPriceAtTick(gameId, nowTick - i));
//         }
//     } else {
//         // Якщо дані є, оновлюємо їх
//         const now = Date.now();
//         if ((now - state.phaseStartTime) / 1000 >= state.currentPhase.duration) {
//             state.currentPhase = getRandomPhase(gameSeeds[gameId] + now);
//             state.phaseStartTime = now;
//         }

//         const lastPrice = state.prices[state.prices.length - 1];
//         const range = state.currentPhase.maxRTP - state.currentPhase.minRTP;
//         const volatilityFactor = (seededRandom(lastPrice * 1000) - 0.5) * range;
//         let newPrice = lastPrice + volatilityFactor;
//         newPrice = Math.max(state.currentPhase.minRTP, Math.min(state.currentPhase.maxRTP, newPrice));
//         state.prices.push(newPrice);
//         if (state.prices.length > state.maxPoints) {
//             state.prices.shift();
//         }

//         state.activePlayersValue = Math.floor(Math.random() * 2000) + 1000;
//         if (Math.random() < 0.1) state.longestStreakValue = Math.floor(Math.random() * 10) + 5;
//     }
    
//     // Зберігаємо оновлений стан у Firebase
//     await set(gameRef, state);
//     console.log(`Дані для ${gameId} успішно оновлені.`);
// }

// // Запускаємо оновлення для всіх ігор
// games.forEach(game => {
//     updateGameData(game.id);
//     setInterval(() => updateGameData(game.id), 5000); // Оновлюємо дані кожні 5 секунд
// });





// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, get } from "firebase/database";
// import express from 'express';
// import cors from 'cors';

// console.log("Починаю ініціалізацію сервера...");

// // Перехоплення необроблених помилок, щоб скрипт не зупинявся
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Виявлена необроблена помилка:', reason);
//     // Додаткові кроки налагодження, якщо потрібно
// });

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDVEhuyqT3JQRIF7tHFpDCKe1lYzf0WbYs",
//     authDomain: "analizatot-slots.firebaseapp.com",
//     projectId: "analizatot-slots",
//     storageBucket: "analizatot-slots.firebasestorage.app",
//     messagingSenderId: "1019195914545",
//     appId: "1:1019195914545:web:7f2974395cc1dd17b01810",
//     measurementId: "G-HVW128CCQS"
// };

// // Initialize Firebase
// let app, db;
// try {
//     app = initializeApp(firebaseConfig);
//     db = getDatabase(app);
//     console.log("Firebase успішно ініціалізовано.");
// } catch (error) {
//     console.error("Помилка під час ініціалізації Firebase:", error);
//     process.exit(1); // Виходимо з помилкою
// }

// const games = [
//     { id: "book_of_ra", name: "Book of Ra" },
//     { id: "lucky_lady", name: "Lucky Lady's Charm" }
// ];

// const states = {};

// // --- Справжня випадкова функція ---
// function getRandom(min, max) {
//     return Math.random() * (max - min) + min;
// }

// // --- Ініціалізація та оновлення даних ---
// async function updateData(gameId) {
//     let state = states[gameId];
//     if (!state) {
//         // Ініціалізуємо новий стан, якщо його не існує
//         state = {
//             prices: [],
//             maxPoints: 50,
//             longestStreakValue: 9,
//             bonusProbabilityValue: 5.0,
//             lastBigWinTime: '--',
//             activePlayersValue: 0,
//             lastJackpotTime: '--',
//             currentPrice: getRandom(10, 95) // Починаємо з випадкової ціни
//         };
//         states[gameId] = state;
//     }

//     const { currentPrice } = state;

//     // Випадковий "крок" для ціни, щоб зробити рух непередбачуваним
//     const step = getRandom(-10, 10);
//     let newPrice = currentPrice + step;

//     // Гарантуємо, що ціна залишається в межах 10% - 95%
//     if (newPrice > 95) {
//         newPrice = 95 - getRandom(0, 10);
//     } else if (newPrice < 10) {
//         newPrice = 10 + getRandom(0, 10);
//     }

//     state.currentPrice = newPrice;
//     state.prices.push(newPrice);
//     if (state.prices.length > state.maxPoints) {
//         state.prices.shift();
//     }

//     // Оновлення інших значень
//     state.activePlayersValue = Math.floor(Math.random() * 2000) + 1000;
//     if (Math.random() < 0.1) {
//         state.longestStreakValue = Math.floor(Math.random() * 10) + 5;
//     }
//     if (Math.random() < 0.05) {
//         state.lastBigWinTime = new Date().toLocaleTimeString();
//     }
//     if (Math.random() < 0.01) {
//         state.lastJackpotTime = new Date().toLocaleTimeString();
//     }
//     state.bonusProbabilityValue = newPrice / 10;

//     try {
//         await set(ref(db, `games/${gameId}`), state);
//         console.log(`Дані для ${gameId} успішно оновлені.`);
//     } catch (error) {
//         console.error(`Помилка під час запису даних для ${gameId}:`, error);
//     }
// }

// // --- Запуск ---
// games.forEach(game => {
//     updateData(game.id);
//     setInterval(() => updateData(game.id), 5000);
// });

// // Додатковий код для Express, якщо ви його використовуєте
// const appExpress = express();
// const PORT = process.env.PORT || 3000;
// appExpress.use(cors());
// appExpress.get('/', (req, res) => {
//     res.send('Сервер генерації даних працює.');
// });
// appExpress.listen(PORT, () => {
//     console.log(`Сервер працює на http://localhost:${PORT}`);
// });


// Цей код генерує і відправляє дані в Firebase для відображення графіка.
// Він реалізує фазову модель для імітації стабільних періодів і різких змін.

// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";
// import express from 'express';
// import cors from 'cors';

// console.log("Починаю ініціалізацію генератора даних...");

// // Перехоплення необроблених помилок, щоб скрипт не зупинявся
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Виявлена необроблена помилка:', reason);
// });

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDVEhuyqT3JQRIF7tHFpDCKe1lYzf0WbYs",
//     authDomain: "analizatot-slots.firebaseapp.com",
//     projectId: "analizatot-slots",
//     storageBucket: "analizatot-slots.firebasestorage.app",
//     messagingSenderId: "1019195914545",
//     appId: "1:1019195914545:web:7f2974395cc1dd17b01810",
//     measurementId: "G-HVW128CCQS"
// };

// // Initialize Firebase
// let app, db;
// try {
//     app = initializeApp(firebaseConfig);
//     db = getDatabase(app);
//     console.log("Firebase успішно ініціалізовано.");
// } catch (error) {
//     console.error("Помилка під час ініціалізації Firebase:", error);
//     process.exit(1); // Виходимо з помилкою
// }

// const games = [
//     { id: "book_of_ra", name: "Book of Ra" },
//     { id: "lucky_lady", name: "Lucky Lady's Charm" }
// ];

// const states = {};

// // Визначення фаз для імітації поведінки ринку
// const PHASES = {
//     HIGH_STABILITY: 'high_stability',
//     TRANSITION_DOWN: 'transition_down',
//     LOW_STABILITY: 'low_stability',
//     TRANSITION_UP: 'transition_up'
// };

// // --- Справжня випадкова функція ---
// function getRandom(min, max) {
//     return Math.random() * (max - min) + min;
// }

// // --- Ініціалізація та оновлення даних ---
// async function updateData(gameId) {
//     let state = states[gameId];
//     if (!state) {
//         // Ініціалізуємо новий стан, якщо його не існує
//         state = {
//             prices: [],
//             maxPoints: 50,
//             longestStreakValue: 9,
//             bonusProbabilityValue: 5.0,
//             lastBigWinTime: '--',
//             activePlayersValue: 0,
//             lastJackpotTime: '--',
//             currentPrice: getRandom(10, 95),
//             phase: PHASES.HIGH_STABILITY,
//             phaseStartTime: Date.now()
//         };
//         states[gameId] = state;
//     }

//     let { currentPrice, phase, phaseStartTime } = state;
//     const now = Date.now();
//     let newPrice;

//     // Визначаємо тривалість поточної фази в хвилинах
//     const phaseDurationMinutes = (now - phaseStartTime) / 1000 / 60;

//     // Логіка переходу між фазами
//     switch (phase) {
//         case PHASES.HIGH_STABILITY:
//             if (phaseDurationMinutes > getRandom(20, 60)) {
//                 state.phase = PHASES.TRANSITION_DOWN;
//                 state.phaseStartTime = now;
//                 console.log(`Перехід ${gameId} до фази спаду.`);
//             }
//             // Коливання в діапазоні 50-95
//             newPrice = currentPrice + getRandom(-0.5, 0.5);
//             newPrice = Math.min(95, Math.max(50, newPrice));
//             break;
//         case PHASES.TRANSITION_DOWN:
//             if (currentPrice <= 50) {
//                 state.phase = PHASES.LOW_STABILITY;
//                 state.phaseStartTime = now;
//                 console.log(`Перехід ${gameId} до фази низької стабільності.`);
//             }
//             // Плавне зниження ціни
//             newPrice = currentPrice - getRandom(1, 3);
//             newPrice = Math.max(10, newPrice);
//             break;
//         case PHASES.LOW_STABILITY:
//             if (phaseDurationMinutes > getRandom(20, 60)) {
//                 state.phase = PHASES.TRANSITION_UP;
//                 state.phaseStartTime = now;
//                 console.log(`Перехід ${gameId} до фази зростання.`);
//             }
//             // Коливання в діапазоні 10-50
//             newPrice = currentPrice + getRandom(-0.5, 0.5);
//             newPrice = Math.min(50, Math.max(10, newPrice));
//             break;
//         case PHASES.TRANSITION_UP:
//             if (currentPrice >= 50) {
//                 state.phase = PHASES.HIGH_STABILITY;
//                 state.phaseStartTime = now;
//                 console.log(`Перехід ${gameId} до фази високої стабільності.`);
//             }
//             // Плавне збільшення ціни
//             newPrice = currentPrice + getRandom(1, 3);
//             newPrice = Math.min(95, newPrice);
//             break;
//     }

//     state.currentPrice = newPrice;
//     state.prices.push(newPrice);
//     if (state.prices.length > state.maxPoints) {
//         state.prices.shift();
//     }
//     const minPlayers = 4000;
//     const maxPlayers = 7000;
//     // Оновлення кількості гравців в межах 4000-7000
//     state.activePlayersValue = Math.floor(Math.random() * (maxPlayers - minPlayers + 1)) + minPlayers;
    
//     if (Math.random() < 0.1) {
//         state.longestStreakValue = Math.floor(Math.random() * 10) + 5;
//     }
//     if (Math.random() < 0.05) {
//         state.lastBigWinTime = new Date().toLocaleTimeString();
//     }
//     if (Math.random() < 0.01) {
//         state.lastJackpotTime = new Date().toLocaleTimeString();
//     }
//     state.bonusProbabilityValue = newPrice / 10;

//     try {
//         await set(ref(db, `games/${gameId}`), state);
//         console.log(`Дані для ${gameId} успішно оновлені.`);
//     } catch (error) {
//         console.error(`Помилка під час запису даних для ${gameId}:`, error);
//     }
// }

// // --- Запуск ---
// games.forEach(game => {
//     updateData(game.id);
//     // Оновлюємо дані кожні 5 секунд
//     setInterval(() => updateData(game.id), 5000);
// });

// // Додатковий код для Express
// const appExpress = express();
// const PORT = process.env.PORT || 3000;
// appExpress.use(cors());
// appExpress.get('/', (req, res) => {
//     res.send('Сервер генерації даних працює.');
// });
// appExpress.listen(PORT, () => {
//     console.log(`Сервер працює на http://localhost:${PORT}`);
// });



// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";
// import express from 'express';
// import cors from 'cors';

// console.log("Починаю ініціалізацію генератора даних...");

// // Перехоплення необроблених помилок, щоб скрипт не зупинявся
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Виявлена необроблена помилка:', reason);
// });

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDVEhuyqT3JQRIF7tHFpDCKe1lYzf0WbYs",
//     authDomain: "analizatot-slots.firebaseapp.com",
//     projectId: "analizatot-slots",
//     storageBucket: "analizatot-slots.firebasestorage.app",
//     messagingSenderId: "1019195914545",
//     appId: "1:1019195914545:web:7f2974395cc1dd17b01810",
//     measurementId: "G-HVW128CCQS"
// };

// // Initialize Firebase
// let app, db;
// try {
//     app = initializeApp(firebaseConfig);
//     db = getDatabase(app);
//     console.log("Firebase успішно ініціалізовано.");
// } catch (error) {
//     console.error("Помилка під час ініціалізації Firebase:", error);
//     process.exit(1); // Виходимо з помилкою
// }

// const games = [
//     { id: "book_of_ra", name: "Book of Ra" },
//     { id: "lucky_lady", name: "Lucky Lady's Charm" },
//     { id: "sizzling_hot", name: "Sizzling Hot" },
//     { id: "gonzos_quest", name: "Gonzo's Quest"}
// ];

// const states = {};

// // Визначення фаз для імітації поведінки ринку
// const PHASES = {
//     HIGH_STABILITY: 'high_stability',
//     TRANSITION_DOWN: 'transition_down',
//     LOW_STABILITY: 'low_stability',
//     TRANSITION_UP: 'transition_up'
// };

// // --- Справжня випадкова функція ---
// function getRandom(min, max) {
//     return Math.random() * (max - min) + min;
// }

// // --- Ініціалізація та оновлення даних ---
// async function updateData(gameId) {
//     let state = states[gameId];
//     if (!state) {
//         // Ініціалізуємо новий стан, якщо його не існує
//         state = {
//             prices: [],
//             maxPoints: 50,
//             longestStreakValue: 9,
//             bonusProbabilityValue: 5.0,
//             lastBigWinTime: '--',
//             activePlayersValue: 0,
//             lastJackpotTime: '--',
//             currentPrice: getRandom(10, 95),
//             phase: PHASES.HIGH_STABILITY,
//             phaseStartTime: Date.now(),
//             phaseDurationMinutes: getRandom(20, 60)
//         };
//         states[gameId] = state;
//     }

//     let { currentPrice, phase, phaseStartTime, phaseDurationMinutes } = state;
//     const now = Date.now();
//     let newPrice;

//     // Визначаємо тривалість поточної фази
//     const elapsedMinutes = (now - phaseStartTime) / 1000 / 60;

//     // Логіка переходу між фазами
//     switch (phase) {
//         case PHASES.HIGH_STABILITY:
//             if (elapsedMinutes > phaseDurationMinutes) {
//                 state.phase = PHASES.TRANSITION_DOWN;
//                 state.phaseStartTime = now;
//                 state.phaseDurationMinutes = getRandom(5, 15);
//                 console.log(`Перехід ${gameId} до фази спаду.`);
//             }
//             // Коливання в діапазоні
//             newPrice = currentPrice + getRandom(-0.5, 0.5);
//             break;
//         case PHASES.TRANSITION_DOWN:
//             if (elapsedMinutes > phaseDurationMinutes) {
//                 state.phase = PHASES.LOW_STABILITY;
//                 state.phaseStartTime = now;
//                 state.phaseDurationMinutes = getRandom(20, 60);
//                 console.log(`Перехід ${gameId} до фази низької стабільності.`);
//             }
//             // Плавне зниження ціни
//             newPrice = currentPrice - getRandom(1, 3);
//             break;
//         case PHASES.LOW_STABILITY:
//             if (elapsedMinutes > phaseDurationMinutes) {
//                 state.phase = PHASES.TRANSITION_UP;
//                 state.phaseStartTime = now;
//                 state.phaseDurationMinutes = getRandom(5, 15);
//                 console.log(`Перехід ${gameId} до фази зростання.`);
//             }
//             // Коливання в діапазоні
//             newPrice = currentPrice + getRandom(-0.5, 0.5);
//             break;
//         case PHASES.TRANSITION_UP:
//             if (elapsedMinutes > phaseDurationMinutes) {
//                 state.phase = PHASES.HIGH_STABILITY;
//                 state.phaseStartTime = now;
//                 state.phaseDurationMinutes = getRandom(20, 60);
//                 console.log(`Перехід ${gameId} до фази високої стабільності.`);
//             }
//             // Плавне збільшення ціни
//             newPrice = currentPrice + getRandom(1, 3);
//             break;
//     }

//     state.currentPrice = newPrice;
//     state.prices.push(newPrice);
//     if (state.prices.length > state.maxPoints) {
//         state.prices.shift();
//     }
//     const minPlayers = 4000;
//     const maxPlayers = 7000;
//     // Оновлення кількості гравців в межах 4000-7000
//     state.activePlayersValue = Math.floor(Math.random() * (maxPlayers - minPlayers + 1)) + minPlayers;
    
//     if (Math.random() < 0.1) {
//         state.longestStreakValue = Math.floor(Math.random() * 10) + 5;
//     }
//     if (Math.random() < 0.05) {
//         state.lastBigWinTime = new Date().toLocaleTimeString();
//     }
//     if (Math.random() < 0.01) {
//         state.lastJackpotTime = new Date().toLocaleTimeString();
//     }
//     state.bonusProbabilityValue = newPrice / 10;

//     try {
//         await set(ref(db, `games/${gameId}`), state);
//         console.log(`Дані для ${gameId} успішно оновлені.`);
//     } catch (error) {
//         console.error(`Помилка під час запису даних для ${gameId}:`, error);
//     }
// }

// // --- Запуск ---
// games.forEach(game => {
//     updateData(game.id);
//     // Оновлюємо дані кожні 5 секунд
//     setInterval(() => updateData(game.id), 5000);
// });

// // Додатковий код для Express
// const appExpress = express();
// const PORT = process.env.PORT || 3000;
// appExpress.use(cors());
// appExpress.get('/', (req, res) => {
//     res.send('Сервер генерації даних працює.');
// });
// appExpress.listen(PORT, () => {
//     console.log(`Сервер працює на http://localhost:${PORT}`);
// });



import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import express from 'express';
import cors from 'cors';
import { games } from "./games-data.js";

console.log("Починаю ініціалізацію генератора даних...");

// Перехоплення необроблених помилок, щоб скрипт не зупинявся
process.on('unhandledRejection', (reason, promise) => {
    console.error('Виявлена необроблена помилка:', reason);
});

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVEhuyqT3JQRIF7tHFpDCKe1lYzf0WbYs",
    authDomain: "analizatot-slots.firebaseapp.com",
    projectId: "analizatot-slots",
    storageBucket: "analizatot-slots.firebasestorage.app",
    messagingSenderId: "1019195914545",
    appId: "1:1019195914545:web:7f2974395cc1dd17b01810",
    measurementId: "G-HVW128CCQS"
};

// Initialize Firebase
let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase успішно ініціалізовано.");
} catch (error) {
    console.error("Помилка під час ініціалізації Firebase:", error);
    process.exit(1); // Виходимо з помилкою
}

const states = {};

// Визначення фаз для імітації поведінки ринку
const PHASES = {
    HIGH_STABILITY: 'high_stability',
    TRANSITION_DOWN: 'transition_down',
    LOW_STABILITY: 'low_stability',
    TRANSITION_UP: 'transition_up'
};

// --- Справжня випадкова функція ---
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Ініціалізація та оновлення даних ---
async function updateData(gameId) {
    let state = states[gameId];
    if (!state) {
        // Ініціалізуємо новий стан, якщо його не існує
        state = {
            prices: [],
            maxPoints: 50,
            longestStreakValue: 9,
            bonusProbabilityValue: 5.0,
            lastBigWinTime: '--',
            activePlayersValue: 0,
            lastJackpotTime: '--',
            currentPrice: getRandom(10, 95),
            phase: PHASES.HIGH_STABILITY,
            phaseStartTime: Date.now(),
            phaseDurationMinutes: getRandom(20, 60)
        };
        states[gameId] = state;
    }

    let { currentPrice, phase, phaseStartTime, phaseDurationMinutes } = state;
    const now = Date.now();
    let newPrice;

    // Визначаємо тривалість поточної фази
    const elapsedMinutes = (now - phaseStartTime) / 1000 / 60;

    // Логіка переходу між фазами
    switch (phase) {
        case PHASES.HIGH_STABILITY:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.TRANSITION_DOWN;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(5, 15);
                console.log(`Перехід ${gameId} до фази спаду.`);
            }
            // Коливання в діапазоні
            newPrice = currentPrice + getRandom(-0.5, 0.5);
            break;
        case PHASES.TRANSITION_DOWN:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.LOW_STABILITY;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(20, 60);
                console.log(`Перехід ${gameId} до фази низької стабільності.`);
            }
            // Плавне зниження ціни
            newPrice = currentPrice - getRandom(1, 3);
            break;
        case PHASES.LOW_STABILITY:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.TRANSITION_UP;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(5, 15);
                console.log(`Перехід ${gameId} до фази зростання.`);
            }
            // Коливання в діапазоні
            newPrice = currentPrice + getRandom(-0.5, 0.5);
            break;
        case PHASES.TRANSITION_UP:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.HIGH_STABILITY;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(20, 60);
                console.log(`Перехід ${gameId} до фази високої стабільності.`);
            }
            // Плавне збільшення ціни
            newPrice = currentPrice + getRandom(1, 3);
            break;
    }

    // Обмеження значення RTP в діапазоні від 0 до 100
    newPrice = Math.max(0, Math.min(100, newPrice));

    state.currentPrice = newPrice;
    state.prices.push(newPrice);
    if (state.prices.length > state.maxPoints) {
        state.prices.shift();
    }
    const minPlayers = 4000;
    const maxPlayers = 7000;
    // Оновлення кількості гравців в межах 4000-7000
    state.activePlayersValue = Math.floor(Math.random() * (maxPlayers - minPlayers + 1)) + minPlayers;
    
    if (Math.random() < 0.1) {
        state.longestStreakValue = Math.floor(Math.random() * 10) + 5;
    }
    if (Math.random() < 0.05) {
        state.lastBigWinTime = new Date().toLocaleTimeString();
    }
    if (Math.random() < 0.01) {
        state.lastJackpotTime = new Date().toLocaleTimeString();
    }
    state.bonusProbabilityValue = newPrice / 10;

    try {
        await set(ref(db, `games/${gameId}`), state);
        console.log(`Дані для ${gameId} успішно оновлені.`);
    } catch (error) {
        console.error(`Помилка під час запису даних для ${gameId}:`, error);
    }
}

// --- Запуск ---
games.forEach(game => {
    updateData(game.id);
    // Оновлюємо дані кожні 5 секунд
    setInterval(() => updateData(game.id), 5000);
});

// Додатковий код для Express
const appExpress = express();
const PORT = process.env.PORT || 3000;
appExpress.use(cors());
appExpress.get('/', (req, res) => {
    res.send('Сервер генерації даних працює.');
});
appExpress.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});