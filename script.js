let timer;
let isRunning = false;
let currentMode = 'FOCUS'; // 'FOCUS' or 'BREAK'

// 기본 설정값
let settings = {
    focusTime: 25,
    breakTime: 5,
    autoStart: false,
    currentBg: 1
};

let timeLeft = settings.focusTime * 60;

// 1. 설정 모달 토글
function toggleSettings(show) {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden', !show);
    if(show) renderChart();
}

// 2. 설정 저장 및 적용
function saveSettings() {
    settings.focusTime = parseInt(document.getElementById('focus-input').value);
    settings.breakTime = parseInt(document.getElementById('break-input').value);
    settings.autoStart = document.getElementById('auto-start-toggle').checked;
    
    // 타이머가 멈춰있을 때만 시간 즉시 반영
    if (!isRunning) {
        resetTimer();
    }
    toggleSettings(false);
}

// 3. 타이머 제어
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
});

function startTimer() {
    isRunning = true;
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

function resetTimer() {
    pauseTimer();
    timeLeft = (currentMode === 'FOCUS' ? settings.focusTime : settings.breakTime) * 60;
    updateDisplay();
}

document.getElementById('reset-btn').addEventListener('click', resetTimer);

// 4. 세션 종료 처리 (자동 다음 세션 포함)
function handleEnd() {
    clearInterval(timer);
    isRunning = false;
    
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

    // 자동 시작 옵션 체크
    if (settings.autoStart) {
        startTimer();
    } else {
        startBtn.textContent = "START";
    }
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 5. 배경 변경
function changeBg(num) {
    settings.currentBg = num;
    document.body.className = `bg-${num}`;
}

// 6. 데이터 저장 및 차트 (기존 로직 유지)
function saveStudyData(mins) {
    const today = new Date().toLocaleDateString();
    let data = JSON.parse(localStorage.getItem('study-data') || '{}');
    data[today] = (data[today] || 0) + mins;
    localStorage.setItem('study-data', JSON.stringify(data));
}

function renderChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const data = JSON.parse(localStorage.getItem('study-data') || '{}');
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data).slice(-7),
            datasets: [{ label: '분', data: Object.values(data).slice(-7), backgroundColor: 'white' }]
        },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });
}

// 초기 실행
updateDisplay();
