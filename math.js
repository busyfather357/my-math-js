  <!-- 4. JavaScript：初始化與互動邏輯 (含題庫機制) -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      let min = 1;
      let max = 20;
      const decimalPlaces = 2;
      const allOperators = {
        '+': { display: '+', compute: (a, b) => a + b },
        '-': { display: '-', compute: (a, b) => a - b },
        '*': { display: '×', compute: (a, b) => a * b },
        '/': { display: '÷', compute: (a, b) => parseFloat((a / b).toFixed(decimalPlaces)) }
      };
      let operators = Object.values(allOperators);

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

      // DOM Elements
      const questionEl = document.querySelector('#math-widget .question');
      const answerInput = document.getElementById('answer');
      const submitBtn = document.getElementById('submitBtn');
      const feedbackEl = document.querySelector('#math-widget .feedback');
      const scoreEl = document.querySelector('#math-widget .score');
      const minInput = document.getElementById('minInput');
      const maxInput = document.getElementById('maxInput');
      const opCheckboxes = document.querySelectorAll('.op-checkbox');
      const applySettingsBtn = document.getElementById('applySettings');

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
        newQuestion();
      }

      function newQuestion() {
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
      }

      function checkAnswer() {
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

        const rate = Math.round((correct / total) * 100);
        scoreEl.innerHTML = `${correct} / ${total} 題，正確率 ${rate}%`;

        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.disabled = false;
          newQuestion();
        }, 800);
      }

      applySettingsBtn.addEventListener('click', applySettings);
      submitBtn.addEventListener('click', checkAnswer);
      answerInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkAnswer();
      });

      // 啟動第一輪題目
      applySettings();
    });
  </script>
