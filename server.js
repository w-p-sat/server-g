

// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";
// import express from 'express';
// import cors from 'cors';
// import { games } from "./games-data.js";

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

//     // Обмеження значення RTP в діапазоні від 0 до 100
//     newPrice = Math.max(0, Math.min(100, newPrice));

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










// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const admin = require('firebase-admin');
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set } from "firebase/database";
// import { games } from "./games-data.js";

// console.log("Починаю ініціалізацію генератора даних...");

// // Перехоплення необроблених помилок, щоб скрипт не зупинявся
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Виявлена необроблена помилка:', reason);
// });

// // Налаштування Firebase Admin
// try {
//     const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
//     if (!serviceAccountJSON) {
//         console.error("Помилка: Не знайдено змінну середовища FIREBASE_SERVICE_ACCOUNT_KEY.");
//         process.exit(1);
//     }
//     const serviceAccount = JSON.parse(serviceAccountJSON);

//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: "https://analizatot-slots-default-rtdb.europe-west1.firebasedatabase.app/"
//     });
//     console.log("Firebase Admin успішно ініціалізовано.");
// } catch (error) {
//     console.error("Помилка під час ініціалізації Firebase Admin:", error);
//     process.exit(1);
// }

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

//     // Обмеження значення RTP в діапазоні від 0 до 100
//     newPrice = Math.max(0, Math.min(100, newPrice));

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
import express from 'express';
import cors from 'cors';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
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
const PHASE_KEYS = Object.keys(PHASES);

// --- Справжня випадкова функція ---
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Ініціалізація та оновлення даних ---
async function updateData(gameId) {
    let state = states[gameId];
    if (!state) {
        // Ініціалізуємо новий стан, якщо його не існує
        const randomPhaseIndex = Math.floor(Math.random() * PHASE_KEYS.length);
        const initialPhase = PHASES[PHASE_KEYS[randomPhaseIndex]];
        let initialPrice;
        let initialDuration;

        switch (initialPhase) {
            case PHASES.HIGH_STABILITY:
                initialPrice = getRandom(60, 95);
                initialDuration = getRandom(20, 60);
                break;
            case PHASES.TRANSITION_DOWN:
                initialPrice = getRandom(60, 95);
                initialDuration = getRandom(3, 5);
                break;
            case PHASES.LOW_STABILITY:
                initialPrice = getRandom(10, 40);
                initialDuration = getRandom(12, 30);
                break;
            case PHASES.TRANSITION_UP:
                initialPrice = getRandom(10, 40);
                initialDuration = getRandom(5, 15);
                break;
        }

        state = {
            prices: [],
            maxPoints: 50,
            longestStreakValue: 9,
            bonusProbabilityValue: 5.0,
            lastBigWinTime: '--',
            activePlayersValue: 0,
            lastJackpotTime: '--',
            currentPrice: initialPrice,
            phase: initialPhase,
            phaseStartTime: Date.now(),
            phaseDurationMinutes: initialDuration
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
                state.phaseDurationMinutes = getRandom(3, 5);
                console.log(`Перехід ${gameId} до фази спаду.`);
            }
            // Коливання в діапазоні 50-100
            if (currentPrice > 90) {
                 newPrice = currentPrice + getRandom(-3, 1);
            } else if (currentPrice < 60) {
                 newPrice = currentPrice + getRandom(0.5, 3);
            } else {
                 newPrice = currentPrice + getRandom(-2.5, 2.5);
            }
            break;
        case PHASES.TRANSITION_DOWN:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.LOW_STABILITY;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(12, 30);
                console.log(`Перехід ${gameId} до фази низької стабільності.`);
            }
            // Випадкове, менш передбачуване зниження
            newPrice = currentPrice - getRandom(1, 4);
            break;
        case PHASES.LOW_STABILITY:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.TRANSITION_UP;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(5, 15);
                console.log(`Перехід ${gameId} до фази зростання.`);
            }
            // Коливання в діапазоні 0-50
            if (currentPrice < 10) {
                newPrice = currentPrice + getRandom(1.5, 4);
            } else if (currentPrice > 40) {
                newPrice = currentPrice + getRandom(-3, 0.5);
            } else {
                newPrice = currentPrice + getRandom(-2.5, 2.5);
            }
            break;
        case PHASES.TRANSITION_UP:
            if (elapsedMinutes > phaseDurationMinutes) {
                state.phase = PHASES.HIGH_STABILITY;
                state.phaseStartTime = now;
                state.phaseDurationMinutes = getRandom(20, 60);
                console.log(`Перехід ${gameId} до фази високої стабільності.`);
            }
            // Випадкове, менш передбачуване зростання
            newPrice = currentPrice + getRandom(1, 4);
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
