document.addEventListener('DOMContentLoaded', () => {
    let min = 1;
    let max = 20;
    const decimalPlaces = 2;
    const TIME_LIMIT = 15; // Time in seconds for each question

    const allOperators = {
        '+': { display: '+', compute: (a, b) => a + b },
        '-': { display: '-', compute: (a, b) => a - b },
        '*': { display: '×', compute: (a, b) => a * b },
        '/': { display: '÷', compute: (a, b) => parseFloat((a / b).toFixed(decimalPlaces)) }
    };
    let operators = Object.values(allOperators);

    // --- Timer Variables ---
    let timer;
    let timeLeft = TIME_LIMIT;

    // --- DOM Elements ---
    const questionEl = document.querySelector('#math-widget .question');
    const answerInput = document.getElementById('answer');
    const submitBtn = document.getElementById('submitBtn');
    const feedbackEl = document.querySelector('#math-widget .feedback');
    const scoreEl = document.querySelector('#math-widget .score');
    const timerDisplay = document.getElementById('timerDisplay'); // Timer display element
    const minInput = document.getElementById('minInput');
    const maxInput = document.getElementById('maxInput');
    const opCheckboxes = document.querySelectorAll('.op-checkbox');
    const applySettingsBtn = document.getElementById('applySettings');
    const timerToggle = document.getElementById('timerToggle');

    // 題庫與洗牌函式
    let questionPool = [];
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function generatePool() {
        questionPool = [];
        operators.forEach(opObj => {
            for (let a = min; a <= max; a++) {
                for (let b = min; b <= max; b++) {
                    if (opObj.display === '÷' && b === 0) continue;
                    questionPool.push({ a, b, opObj });
                }
            }
        });
        shuffle(questionPool);
    }

    let total = 0;
    let correct = 0;
    let currentAnswer = null;

    function resetScore() {
        total = 0;
        correct = 0;
        scoreEl.innerHTML = `0 / 0 題，正確率 0%`;
    }

    function applySettings() {
        const newMin = parseInt(minInput.value, 10);
        const newMax = parseInt(maxInput.value, 10);
        if (isNaN(newMin) || isNaN(newMax) || newMin >= newMax) {
            alert('請輸入正確的最小與最大值，且最小值需小於最大值');
            return;
        }
        min = newMin;
        max = newMax;

        const chosenOps = [...opCheckboxes]
            .filter(chk => chk.checked)
            .map(chk => chk.dataset.op);

        if (chosenOps.length === 0) {
            alert('請至少選擇一種運算符號');
            return;
        }
        operators = chosenOps.map(op => allOperators[op]);

        resetScore();
        generatePool();
        // 【修改】套用新設定時，也更新計時器的可見狀態
        updateTimerState(); 
        newQuestion();
    }
    // 【新增】一個函數用來處理計時器的顯示狀態與行為
    function updateTimerState() {
        if (timerToggle.checked) {
            timerDisplay.style.display = 'block'; // 或者 'inline', 'flex' 等，依你的 CSS 設計
        } else {
            timerDisplay.style.display = 'none';
            clearInterval(timer); // 如果關掉開關，清除正在跑的計時器
        }
    }
    
    // --- Timer Functions ---
    function startTimer() {
        // 【修改】如果開關是關閉的，直接返回，不啟動計時器
        if (!timerToggle.checked) {
            return;
        }
        timeLeft = TIME_LIMIT;
        timerDisplay.textContent = timeLeft;
        timerDisplay.style.color = 'black'; // Reset color

        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft < 6 && timeLeft > 0) {
                timerDisplay.style.color = 'red'; // Warning color
            }
            if (timeLeft <= 0) {
                handleTimeUp();
            }
        }, 1000);
    }

    function handleTimeUp() {
        clearInterval(timer);
        total++;
        feedbackEl.innerHTML = `❌ 時間到！正確答案是 ${currentAnswer}`;
        feedbackEl.style.color = 'orange';

        updateScore();
        
        answerInput.disabled = true;
        submitBtn.disabled = true;
        setTimeout(() => {
            answerInput.disabled = false;
            submitBtn.disabled = false;
            newQuestion();
        }, 1500);
    }
    
    function updateScore() {
        const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
        scoreEl.innerHTML = `${correct} / ${total} 題，正確率 ${rate}%`;
    }

    function newQuestion() {
        clearInterval(timer); // Clear previous timer
        
        if (questionPool.length === 0) {
            generatePool();
        }
        const { a, b, opObj } = questionPool.pop();
        currentAnswer = opObj.compute(a, b);

        questionEl.innerHTML = `${a} ${opObj.display} ${b} = ?`;
        feedbackEl.innerHTML = '';
        answerInput.value = '';
        answerInput.focus();
        document.getElementById('math-widget').style.visibility = 'visible';

        startTimer(); // Start new timer
    }

    function checkAnswer() {
        clearInterval(timer); // Stop the timer on submit
        const userAns = parseFloat(answerInput.value);
        if (isNaN(userAns)) return;

        total++;
        if (userAns.toFixed(decimalPlaces) === currentAnswer.toFixed(decimalPlaces)) {
            correct++;
            feedbackEl.innerHTML = '✔️ 正確！';
            feedbackEl.style.color = 'green';
        } else {
            feedbackEl.innerHTML = `❌ 錯誤！正確答案是 ${currentAnswer}`;
            feedbackEl.style.color = 'red';
        }

        updateScore();

        submitBtn.disabled = true;
        setTimeout(() => {
            submitBtn.disabled = false;
            newQuestion();
        }, 800);
    }
    // 【新增】為計時器開關添加事件監聽
    timerToggle.addEventListener('change', updateTimerState);

    applySettingsBtn.addEventListener('click', applySettings);
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkAnswer();
    });

    // 啟動第一輪題目
    applySettings();
});

