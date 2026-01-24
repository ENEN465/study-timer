// 1. 초기 변수 설정
let timer;
let timeLeft = 1500; // 기본 25분
let isRunning = false;
let currentBgIndex = 1;
const totalBgCount = 3; // 등록된 배경 이미지 개수

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');

// 2. 타이머 숫자 업데이트 함수
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 3. 타이머 시작/일시정지 로직
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        // 시작
        isRunning = true;
        startBtn.textContent = "PAUSE";
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                // 시간 종료
                clearInterval(timer);
                isRunning = false;
                startBtn.textContent = "START";
                alert("집중 시간이 끝났습니다! 고생하셨어요.");
                saveRecord(Math.floor(25)); // 완료 시 25분 저장 (모드별 분기 가능)
            }
        }, 1000);
    } else {
        // 일시정지
        isRunning = false;
        startBtn.textContent = "START";
        clearInterval(timer);
    }
});

// 4. 초기화 버튼
document.getElementById('reset-btn').addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = "START";
    // 현재 선택된 모드에 맞춰 초기화하려면 추가 로직이 필요하지만, 기본은 25분으로 설정
    timeLeft = 1500;
    updateDisplay();
});

// 5. 모드 변경 (Pomodoro, Break 등)
function changeMode(minutes, modeName, element) {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = "START";
    
    timeLeft = minutes * 60;
    updateDisplay();

    // 버튼 활성화 스타일 변경
    document.querySelectorAll('.mode-selector button').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// 6. 배경 이미지 변경 로직
function nextBackground() {
    currentBgIndex = (currentBgIndex % totalBgCount) + 1;
    document.body.className = `bg-${currentBgIndex}`;
}

// 7. 통계 팝업 열기/닫기
function toggleStats() {
    const overlay = document.getElementById('stats-overlay');
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
        renderChart();
    }
}

// 8. 데이터 저장 (localStorage)
function saveRecord(minutes) {
    const today = new Date().toLocaleDateString();
    let stats = JSON.parse(localStorage.getItem('study-stats') || '{}');
    stats[today] = (stats[today] || 0) + minutes;
    localStorage.setItem('study-stats', JSON.stringify(stats));
}

// 9. 차트 그리기 (Chart.js 라이브러리 사용)
function renderChart() {
    const stats = JSON.parse(localStorage.getItem('study-stats') || '{}');
    const labels = Object.keys(stats).slice(-7); // 최근 7일치만
    const data = labels.map(date => stats[date]);

    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 파괴하고 새로 생성
    if (window.studyChart) window.studyChart.destroy();

    window.studyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '집중 시간 (분)',
                data: data,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                x: { ticks: { color: 'white' } }
            },
            plugins: {
                legend: { labels: { color: 'white' } }
            }
        }
    });
}

// 처음 실행 시 화면 업데이트
updateDisplay();
