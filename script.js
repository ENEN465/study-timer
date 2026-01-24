let timer;
let timeLeft = 1500; // 25분
let isRunning = false;
let currentTheme = 1;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');

// 타이머 로직
function updateTimer() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (timeLeft === 0) {
        clearInterval(timer);
        saveRecord(25); // 25분 기록 저장
        alert("목표 달성! 기록이 저장되었습니다.");
        resetTimer();
    } else {
        timeLeft--;
    }
}

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        timer = setInterval(updateTimer, 1000);
        startBtn.textContent = "일시정지";
    } else {
        clearInterval(timer);
        startBtn.textContent = "시작";
    }
    isRunning = !isRunning;
});

// 기록 저장 (localStorage)
function saveRecord(minutes) {
    const today = new Date().toLocaleDateString();
    let records = JSON.parse(localStorage.getItem('studyStats') || '{}');
    records[today] = (records[today] || 0) + minutes;
    localStorage.setItem('studyStats', JSON.stringify(records));
    renderChart();
}

// 화면 전환
function showSection(section) {
    document.getElementById('timer-section').classList.toggle('hidden', section !== 'timer');
    document.getElementById('stats-section').classList.toggle('hidden', section !== 'stats');
    if (section === 'stats') renderChart();
}

// 테마 변경
function toggleTheme() {
    currentTheme = (currentTheme % 3) + 1;
    document.body.className = `theme-${currentTheme}`;
}

// 차트 렌더링
function renderChart() {
    const records = JSON.parse(localStorage.getItem('studyStats') || '{}');
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    if (window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(records),
            datasets: [{
                label: '공부 시간 (분)',
                data: Object.values(records),
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true, ticks: { color: 'white' } } } }
    });
}