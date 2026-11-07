// Interactive Algorithm Visualizer Embedded Demo
// Bubble Sort & Insertion Sort visualizer with Step, Play, Pause, Reset
// Updated with Harshith's bespoke palette (#DA7B93, #67E8F9, #376E6F)

export function initAlgoVisualizer() {
  const container = document.getElementById('algo-visualizer-container');
  if (!container) return;

  const barContainer = document.getElementById('algo-bars');
  const playBtn = document.getElementById('algo-play-btn');
  const resetBtn = document.getElementById('algo-reset-btn');
  const algoSelect = document.getElementById('algo-select');
  const stepCountSpan = document.getElementById('algo-step-count');

  if (!barContainer || !playBtn || !resetBtn) return;

  const ARRAY_SIZE = 18;
  let array = [];
  let isRunning = false;
  let animationTimeout = null;
  let stepsGenerator = null;
  let stepCounter = 0;

  function generateRandomArray() {
    array = [];
    for (let i = 0; i < ARRAY_SIZE; i++) {
      array.push(Math.floor(Math.random() * 85) + 15);
    }
    stepCounter = 0;
    if (stepCountSpan) stepCountSpan.textContent = '0 operations';
    renderBars();
  }

  function renderBars(comparingIndices = [], sortedIndices = []) {
    barContainer.innerHTML = '';
    array.forEach((val, idx) => {
      const bar = document.createElement('div');
      bar.className = 'algo-bar';
      bar.style.height = `${val}%`;
      bar.style.width = '12px';
      bar.style.borderRadius = '3px 3px 0 0';

      if (comparingIndices.includes(idx)) {
        bar.style.backgroundColor = '#DA7B93'; // Vibrant dusty pink
        bar.style.boxShadow = '0 0 10px #DA7B93';
      } else if (sortedIndices.includes(idx)) {
        bar.style.backgroundColor = '#67E8F9'; // Icy cyan
        bar.style.boxShadow = '0 0 10px #67E8F9';
      } else {
        bar.style.backgroundColor = '#376E6F'; // Deep teal
        bar.style.boxShadow = 'none';
      }

      barContainer.appendChild(bar);
    });
  }

  function* bubbleSortGenerator() {
    const arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        yield { comparing: [j, j + 1], sorted: [] };
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          array = [...arr];
          yield { comparing: [j, j + 1], sorted: [] };
        }
      }
    }
    const allSorted = Array.from({ length: n }, (_, k) => k);
    yield { comparing: [], sorted: allSorted };
  }

  function* insertionSortGenerator() {
    const arr = [...array];
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        yield { comparing: [j, j + 1], sorted: [] };
        arr[j + 1] = arr[j];
        j = j - 1;
        array = [...arr];
        yield { comparing: [j + 1, i], sorted: [] };
      }
      arr[j + 1] = key;
      array = [...arr];
    }
    const allSorted = Array.from({ length: n }, (_, k) => k);
    yield { comparing: [], sorted: allSorted };
  }

  function runSortLoop() {
    if (!isRunning) return;

    if (!stepsGenerator) {
      const algoType = algoSelect ? algoSelect.value : 'bubble';
      stepsGenerator = algoType === 'insertion' ? insertionSortGenerator() : bubbleSortGenerator();
    }

    const next = stepsGenerator.next();
    if (!next.done) {
      stepCounter++;
      if (stepCountSpan) stepCountSpan.textContent = `${stepCounter} operations`;
      renderBars(next.value.comparing, next.value.sorted);
      animationTimeout = setTimeout(runSortLoop, 140);
    } else {
      if (next.value && next.value.sorted) {
        renderBars([], next.value.sorted);
      }
      stopSort();
    }
  }

  function startSort() {
    isRunning = true;
    playBtn.innerHTML = `<span>Pause</span>`;
    runSortLoop();
  }

  function stopSort() {
    isRunning = false;
    clearTimeout(animationTimeout);
    playBtn.innerHTML = `<span>Simulate</span>`;
  }

  playBtn.addEventListener('click', () => {
    if (isRunning) {
      stopSort();
    } else {
      startSort();
    }
  });

  resetBtn.addEventListener('click', () => {
    stopSort();
    stepsGenerator = null;
    generateRandomArray();
  });

  if (algoSelect) {
    algoSelect.addEventListener('change', () => {
      stopSort();
      stepsGenerator = null;
      generateRandomArray();
    });
  }

  generateRandomArray();
}
