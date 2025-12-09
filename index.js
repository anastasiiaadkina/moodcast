// ================== Простая i18n ==================

const translations = {
    en: {
        logoSubtitle: "Track your mood & weather",
        signupBtn: "Sign Up",
        loginBtn: "Login",
        logoutBtn: "Logout",
        headingMain: "Your Mood",
        heroText: "See how the weather affects the way you feel and keep a soft pastel diary of your moods.",
        weatherMoodTitle: "Weather & today’s mood",
        inputPlaceholder: "Enter city (e.g. Moscow)",
        getMoodWeatherBtn: "Get weather & set mood",
        howDoYouFeel: "How do you feel today?",
        sadHint: "It’s okay to feel low — the app will keep it for you.",
        happyHint: "Capture the light moments and come back to them.",
        moodHistoryTitle: "Your mood history",
        clearHistoryBtn: "Clear history",
        moodAnalyticsTitle: "Your mood analytics",
        footerText: "Your feelings matter. This is your soft corner of the internet. 🌸",
        weatherLoading: "Loading weather...",
        weatherError: "Couldn’t load weather. Please check the city name.",
        moodSaved: "Your mood has been saved 💗",
        noHistory: "No mood entries yet. Try saving today’s mood!",
        analyticsIntro: "We will show how your mood relates to the weather.",
        analyticsSummary(temp, moodWord) {
            return `Most often you feel ${moodWord} when the temperature is around ${temp.toFixed(
                1
            )}°C.`;
        },
        moodWord_sad: "sad",
        moodWord_neutral: "calm",
        moodWord_happy: "happy"
    },
    ru: {
        logoSubtitle: "Отслеживай настроение и погоду",
        signupBtn: "Регистрация",
        loginBtn: "Вход",
        logoutBtn: "Выйти",
        headingMain: "Твоё настроение",
        heroText: "Смотри, как погода влияет на чувства, и веди нежный пастельный дневник настроения.",
        weatherMoodTitle: "Погода и настроение на сегодня",
        inputPlaceholder: "Введите город (например, Moscow)",
        getMoodWeatherBtn: "Узнать погоду и выбрать настроение",
        howDoYouFeel: "Как ты себя чувствуешь сегодня?",
        sadHint: "Иногда бывает грустно — просто сохраняй это сюда.",
        happyHint: "Запиши светлые моменты, чтобы возвращаться к ним.",
        moodHistoryTitle: "История настроения",
        clearHistoryBtn: "Очистить историю",
        moodAnalyticsTitle: "Аналитика настроения",
        footerText: "Твои чувства важны. Это твой мягкий уголок интернета. 🌸",
        weatherLoading: "Загружаем погоду...",
        weatherError: "Не удалось получить погоду. Проверь название города.",
        moodSaved: "Настроение сохранено 💗",
        noHistory: "Записей пока нет. Попробуй сохранить настроение за сегодня!",
        analyticsIntro: "Здесь появится связь твоего настроения с погодой.",
        analyticsSummary(temp, moodWord) {
            return `Чаще всего ты чувствуешь себя ${moodWord}, когда температура около ${temp.toFixed(
                1
            )}°C.`;
        },
        moodWord_sad: "грустно",
        moodWord_neutral: "спокойно",
        moodWord_happy: "радостно"
    }
};

let currentLang = "en";

function applyTranslations() {
    const dict = translations[currentLang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const val = dict[key];
        if (typeof val === "string") el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        const val = dict[key];
        if (typeof val === "string") el.placeholder = val;
    });
}

const langSelect = document.getElementById("languageSelect");
if (langSelect) {
    langSelect.addEventListener("change", () => {
        currentLang = langSelect.value || "en";
        localStorage.setItem("ym_lang", currentLang);
        applyTranslations();
        renderMoodHistory();
        renderAnalytics();
    });

    const savedLang = localStorage.getItem("ym_lang");
    if (savedLang && (savedLang === "en" || savedLang === "ru")) {
        currentLang = savedLang;
        langSelect.value = savedLang;
    }
}

applyTranslations();

// ================== Простая «авторизация» через localStorage ==================

const authButtons = document.getElementById("authButtons");
const userPanel = document.getElementById("userPanel");
const userEmailDisplay = document.getElementById("userEmailDisplay");
const logoutBtn = document.getElementById("logoutBtn");

function updateAuthUI() {
    const currentUser = localStorage.getItem("ym_currentUser");
    if (currentUser) {
        if (authButtons) authButtons.style.display = "none";
        if (userPanel) userPanel.style.display = "flex";
        if (userEmailDisplay) userEmailDisplay.textContent = currentUser;
    } else {
        if (authButtons) authButtons.style.display = "flex";
        if (userPanel) userPanel.style.display = "none";
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("ym_currentUser");
        updateAuthUI();
    });
}

updateAuthUI();

// ================== Работа с погодой ==================

const moodCityInput = document.getElementById("moodCityInput");
const getMoodWeatherBtn = document.getElementById("getMoodWeatherBtn");
const moodWeatherInfo = document.getElementById("moodWeatherInfo");

let lastWeather = null; // сохраняем погоду для записи в историю

async function fetchWeather(city) {
    // Используем OpenWeatherMap. Нужен свой API ключ.
    const apiKey = "adcfd7e8550334340ecf64bd12e1c459";
    const url =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        encodeURIComponent(city) +
        "&appid=" +
        apiKey +
        "&units=metric";

    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error("Weather error");
    }
    const data = await resp.json();
    return {
        temp: data.main.temp,
        feels: data.main.feels_like,
        description: data.weather[0].description,
        icon: data.weather[0].icon
    };
}

if (getMoodWeatherBtn) {
    getMoodWeatherBtn.addEventListener("click", async () => {
        const city = moodCityInput.value.trim();
        if (!city) return;

        const dict = translations[currentLang];
        moodWeatherInfo.textContent = dict.weatherLoading;

        try {
            const weather = await fetchWeather(city);
            lastWeather = { city, ...weather };

            moodWeatherInfo.innerHTML = `
                <div class="weather-row">
                    <strong>${city}</strong> · ${weather.description}
                </div>
                <div class="weather-row">
                    <span>${weather.temp.toFixed(1)}°C</span>
                    <span style="font-size: 12px; color: #8d849c;">feels like ${weather.feels.toFixed(
                        1
                    )}°C</span>
                </div>
            `;
        } catch (e) {
            console.error(e);
            moodWeatherInfo.textContent = dict.weatherError;
            lastWeather = null;
        }
    });
}

// ================== Настроение + история ==================

const moodButtons = document.querySelectorAll(".mood-btn");
const moodSavedMessage = document.getElementById("moodSavedMessage");
const moodHistoryContainer = document.getElementById("moodHistory");
const clearMoodHistoryBtn = document.getElementById("clearMoodHistoryBtn");

function getMoodHistory() {
    const raw = localStorage.getItem("ym_moodHistory");
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveMoodHistory(history) {
    localStorage.setItem("ym_moodHistory", JSON.stringify(history));
}

function setActiveMoodButton(mood) {
    moodButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mood === mood);
    });
}

moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const mood = btn.dataset.mood;
        setActiveMoodButton(mood);

        const history = getMoodHistory();
        const now = new Date();

        const entry = {
            id: Date.now(),
            mood,
            createdAt: now.toISOString(),
            weather: lastWeather
        };

        history.unshift(entry);
        saveMoodHistory(history);

        const dict = translations[currentLang];
        moodSavedMessage.textContent = dict.moodSaved;

        renderMoodHistory();
        renderAnalytics();
    });
});

function formatDate(iso, lang) {
    const d = new Date(iso);
    return d.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderMoodHistory() {
    if (!moodHistoryContainer) return;

    const dict = translations[currentLang];
    const history = getMoodHistory();

    if (!history.length) {
        moodHistoryContainer.textContent = dict.noHistory;
        return;
    }

    moodHistoryContainer.innerHTML = "";

    history.forEach((entry) => {
        const div = document.createElement("div");
        div.className = "history-item";

        const emoji = entry.mood === "sad" ? "😢" : entry.mood === "happy" ? "😊" : "😐";

        const cityText = entry.weather && entry.weather.city ? entry.weather.city : "—";
        const tempText =
            entry.weather && typeof entry.weather.temp === "number"
                ? entry.weather.temp.toFixed(1) + "°C"
                : "—";

        div.innerHTML = `
            <div class="history-item-header">
                <span class="history-city">${cityText}</span>
                <span>${emoji}</span>
            </div>
            <div class="history-date">${formatDate(entry.createdAt, currentLang)}</div>
            <div class="history-meta">
                ${tempText} · ${entry.weather && entry.weather.description ? entry.weather.description : ""}
            </div>
        `;
        moodHistoryContainer.appendChild(div);
    });
}

if (clearMoodHistoryBtn) {
    clearMoodHistoryBtn.addEventListener("click", () => {
        saveMoodHistory([]);
        renderMoodHistory();
        renderAnalytics();
    });
}

renderMoodHistory();

// ================== Аналитика настроения ==================

const moodAnalyticsContainer = document.getElementById("moodAnalytics");

function renderAnalytics() {
    if (!moodAnalyticsContainer) return;

    const dict = translations[currentLang];
    const history = getMoodHistory().filter(
        (h) => h.weather && typeof h.weather.temp === "number"
    );

    if (!history.length) {
        moodAnalyticsContainer.textContent = dict.analyticsIntro;
        return;
    }

    // Средняя температура по каждому настроению
    const moodTemps = {
        sad: [],
        neutral: [],
        happy: []
    };

    history.forEach((entry) => {
        if (moodTemps[entry.mood]) {
            moodTemps[entry.mood].push(entry.weather.temp);
        }
    });

    let bestMood = null;
    let bestAvgTemp = null;

    ["happy", "neutral", "sad"].forEach((mood) => {
        const arr = moodTemps[mood];
        if (!arr.length) return;
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        if (bestAvgTemp === null || (mood === "happy" && arr.length >= (moodTemps[bestMood] || []).length)) {
            bestMood = mood;
            bestAvgTemp = avg;
        }
    });

    if (!bestMood) {
        moodAnalyticsContainer.textContent = dict.analyticsIntro;
        return;
    }

    const moodWordKey = "moodWord_" + bestMood;
    const moodWord = dict[moodWordKey] || bestMood;

    const summary = dict.analyticsSummary(bestAvgTemp, moodWord);

    moodAnalyticsContainer.innerHTML = `
        <div style="font-size:14px; margin-bottom:6px;">
            ${summary}
        </div>
        <div style="font-size:12px; color:#8d849c;">
            (${history.length} ${
        currentLang === "ru" ? "записей в выборке" : "entries in analysis"
    })
        </div>
    `;
}

renderAnalytics();
