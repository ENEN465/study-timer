// 1. 상태 및 설정 변수
let settings = {
    focusTime: 30,
    breakTime: 5,
    autoStart: true,
    font: "'Montserrat', sans-serif"
};

let timer = null;
let isRunning = false;
let currentMode = 'FOCUS';
let wakeLock = null;
let timeLeft = settings.focusTime * 60;

// 2. 화면 꺼짐 방지 로직
const requestWakeLock = async () => {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('화면 꺼짐 방지 활성화');
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
};

document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});

// 3. 알람음 및 UI 기능
const alarmSound = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3');

// 탭 전환 (event 인자 사용하여 버튼 활성화 상태 표시)
function openTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.remove('hidden');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    if(tabName === 'stats') updateStatsView();
}

function toggleSettings(show) {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.toggle('hidden', !show);
}

// 배경 이미지 업로드 및 변경
function uploadBg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('body-bg').style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function changeBg(bgClass) {
    const body = document.getElementById('body-bg');
    body.className = bgClass;
    body.style.backgroundImage = ''; 
}

function changeFont(fontValue) {
    settings.font = fontValue;
    document.getElementById('timer-display').style.fontFamily = fontValue;
}

// 4. 타이머 핵심 로직
const startBtn = document.getElementById('start-btn');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (!isRunning) startTimer();
        else pauseTimer();
    });
}

function startTimer() {
    isRunning = true;
    requestWakeLock();
    if (startBtn) startBtn.textContent = "PAUSE";
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            handleEnd();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    if (startBtn) startBtn.textContent = "START";
    clearInterval(timer);
}

function handleEnd() {
    clearInterval(timer);
    isRunning = false;
    alarmSound.play().catch(e => console.log("소리 재생 클릭 필요"));
    
    if (currentMode === 'FOCUS') {
        saveStudyData(settings.focusTime);
        currentMode = 'BREAK';
        timeLeft = settings.breakTime * 60;
    } else {
        currentMode = 'FOCUS';
        timeLeft = settings.focusTime * 60;
    }
    
    document.getElementById('current-mode').textContent = currentMode;
    updateDisplay();
    if (settings.autoStart) startTimer();
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function saveSettings() {
    const focusInput = document.getElementById('focus-input');
    const breakInput = document.getElementById('break-input');
    const autoToggle = document.getElementById('auto-start-toggle');
    
    if (focusInput) settings.focusTime = parseInt(focusInput.value) || 30;
    if (breakInput) settings.breakTime = parseInt(breakInput.value) || 5;
    if (autoToggle) settings.autoStart = autoToggle.checked;
    
    if(!isRunning) {
        timeLeft = (currentMode === 'FOCUS' ? settings.focusTime : settings.breakTime) * 60;
        updateDisplay();
    }
    toggleSettings(false);
}

// 5. 통계 로직
function saveStudyData(mins) {
    const today = new Date().toLocaleDateString();
    let data = JSON.parse(localStorage.getItem('wish-luck-stats') || '{}');
    data[today] = (data[today] || 0) + mins;
    localStorage.setItem('wish-luck-stats', JSON.stringify(data));
}

function updateStatsView() {
    const data = JSON.parse(localStorage.getItem('wish-luck-stats') || '{}');
    const today = new Date().toLocaleDateString();
    const todayTime = data[today] || 0;
    const display = document.getElementById('today-total-display');
    if (display) display.textContent = `${todayTime}분`;
    renderChart(data);
}

function renderChart(data) {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data).slice(-7),
            datasets: [{ label: '학습 시간(분)', data: Object.values(data).slice(-7), backgroundColor: 'rgba(255,255,255,0.7)' }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
    });
}

const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        pauseTimer();
        timeLeft = settings.focusTime * 60;
        updateDisplay();
    });
}

// 6. 서비스 워커 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('서비스 워커 등록 성공'))
      .catch(err => console.error('서비스 워커 등록 실패', err));
  });
}

// 초기 실행
updateDisplay();
