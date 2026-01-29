let settings = {
    focusTime: 30,
    breakTime: 5,
    autoStart: true,
    font: "'Montserrat', sans-serif"
};
let timer null;;
let isRunning = false;
let currentMode = 'FOCUS';
let wakeLock = null;
let timeLeft = settings.focusTime * 60;

//화면꺼짐방지
const requestWakeLock = async () => {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('화면 꺼짐 방지on');
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
};
//이친구 이벤트리스너
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});

//알람음함수
const alarmSound = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3');
// 1. 탭 전환 기능
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.remove('hidden');
    event.currentTarget.classList.add('active');
    if(tabName === 'stats') updateStatsView();
}

function toggleSettings(show) {
    document.getElementById('settings-modal').classList.toggle('hidden', !show);
}

// 2. 배경 이미지 업로드
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

// 3. 폰트 변경
function changeFont(fontValue) {
    settings.font = fontValue;
    document.getElementById('timer-display').style.fontFamily = fontValue;
}

// 4. 타이머 로직
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    if (!isRunning) startTimer();
    else pauseTimer();
});

function startTimer() {
    isRunning = true;
    requestWakeLock();
    startBtn.textContent = "PAUSE";
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
    startBtn.textContent = "START";
    clearInterval(timer);
}

function handleEnd() {
    clearInterval(timer);
    isRunning = false;
    alarmSound.play().catch(e => console.log("소리 재생을 위해 화면 클릭이 필요합니다."));
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
    document.getElementById('timer-display').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function saveSettings() {
    settings.focusTime = parseInt(document.getElementById('focus-input').value);
    settings.breakTime = parseInt(document.getElementById('break-input').value);
    settings.autoStart = document.getElementById('auto-start-toggle').checked;
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
    document.getElementById('today-total-display').textContent = `${todayTime}분`;
    renderChart(data);
}

function renderChart(data) {
    const ctx = document.getElementById('statsChart').getContext('2d');
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

document.getElementById('reset-btn').addEventListener('click', () => {
    pauseTimer();
    timeLeft = settings.focusTime * 60;
    updateDisplay();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('서비스 워커 등록 성공! 범위:', reg.scope))
      .catch(err => console.log('서비스 워커 등록 실패:', err));
  });
}

updateDisplay();







