let array = [];
const container = document.getElementById("container");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(value) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = value * 5;

    oscillator.type = "sine";

    gainNode.gain.value = 0.05;

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1)
}

function generateArray() {
    container.innerHTML= "";
    array = [];

    for (let i = 0; i < 25; i++) {
        let value = Math.floor(Math.random() * 200) + 10;
        array.push(value);

        let bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = value + "px";

        container.appendChild(bar);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getBars() {
    return document.getElementsByClassName("bar");
}

function updateBars() {
    let bars = getBars();
    for (let i = 0; i < array.length; i++) {
        bars[i].style.height = array[i] + "px";
    }
}

function clearColors() {
    let bars = getBars();
    for (let bar of bars) {
        bar.classList.remove("active", "swap", "sorted");
    }
}

async function bubbleSort() {
    if (audioCtx.state === "suspended") {
        await audioCtx.resume();
    }

    let bars = document.getElementsByClassName("bar");

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].classList.add("active");
            bars[j + 1].classList.add("active");

            playSound(array[j]);
            playSound(array[j+1]);

            await sleep(50);

            if (array[j] > array[j + 1]) {
                playSound(200);

                bars[j].classList.add("swap");
                bars[j+1].classList.add("swap");

                await sleep(50);

                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;

                bars[j].style.height = array[j] + "px";
                bars[j+1].style.height = array[j+1] + "px";

                await sleep(50);

                bars[j].classList.remove("swap");
                bars[j+1].classList.remove("swap");
            }

            bars[j].classList.remove("active");
            bars[j + 1].classList.remove("active");
        }

        bars[array.length - i - 1].classList.add("sorted");
    }

    bars[0].classList.add("sorted");
}

async function selectionSort() {
    if (audioCtx.state === "suspended") await audioCtx.resume();

    let bars = getBars();

    for (let i = 0; i < array.length; i++) {
        let minIndex = i;

        bars[i].classList.add("active");

        for (let j = i + 1; j < array.length; j++) {
            bars[j].classList.add("active");

            playSound(array[j]);
            await sleep(50);

            if (array[j] < array[minIndex]) {
                minIndex = j;
            }

            bars[j].classList.remove("active");
        }

        if (minIndex !== i) {
            bars[i].classList.add("swap");
            bars[minIndex].classList.add("swap");

            await sleep(50);

            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            updateBars();

            playSound(200);
            await sleep(50);

            bars[i].classList.remove("swap");
            bars[minIndex].classList.remove("swap");
        }

        bars[i].classList.remove("active");
        bars[i].classList.add("sorted");
    }
}

async function insertionSort() {
    if (audioCtx.state === "suspended") await audioCtx.resume();

    let bars = getBars();

    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;

        bars[i].classList.add("active");
        playSound(key);

        await sleep(50);

        while (j >= 0 && array[j] > key) {
            bars[j].classList.add("swap");

            array[j + 1] = array[j];
            updateBars();

            playSound(array[j]);
            await sleep(50);

            bars[j].classList.remove("swap");
            j--;
        }

        array[j + 1] = key;
        updateBars();

        bars[i].classList.remove("active");
    }

    for (let bar of bars) {
        bar.classList.add("sorted");
        await sleep(50);
    }
}

async function quickSort(start = 0, end = array.length -1) {
    if (start >= end) return;

    let index = await partition(start, end);

    await quickSort(start, index - 1);
    await quickSort(index + 1, end);

    if (start === 0 && end === array.length - 1) {
        let bars = getBars();
        for (let bar of bars) {
            bar.classList.add("sorted");
            await sleep(50);
        }
    }
}

async function partition(start, end) {
    let bars = getBars();

    let pivotValue = array[end];
    let pivotIndex = start;

    bars[end].classList.add("swap");

    for (let i = start; i < end; i++) {
        bars[i].classList.add("active");
        playSound(array[i]);
        await sleep(50);

        if (array[i] < pivotValue) {
            [array[i], array[pivotIndex]] =
                [array[pivotIndex], array[i]];

            updateBars();
            playSound(200);
            await sleep(50);

            pivotIndex++;
        }

        bars[i].classList.remove("active");
    }

    [array[pivotIndex], array[end]] =
        [array[end], array[pivotIndex]];

    updateBars();
    playSound(250);
    await sleep(50);

    bars[end].classList.remove("swap");

    return pivotIndex;
}

async function mergeSort(start = 0, end = array.length - 1) {
    if (start >= end) return;

    let mid = Math.floor((start + end) / 2);

    await mergeSort(start, mid);
    await mergeSort(mid + 1, end);

    await merge(start, mid, end);

    if (start === 0 && end === array.length - 1) {
        let bars = getBars();
        for (let bar of bars) {
            bar.classList.add("sorted");
            await sleep(50);
        }
    }
}

async function merge(start, mid, end) {
    let bars = getBars();

    let left = array.slice(start, mid + 1);
    let right = array.slice(mid + 1, end + 1);

    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        bars[k].classList.add("active");
        await sleep(50);

        if (left[i] <= right[j]) {
            array[k] = left[i];
            playSound(left[i]);
            i++;
        } else {
            array[k] = right[j];
            playSound(right[j]);
            j++;
        }

        updateBars();
        await sleep(50);

        bars[k].classList.remove("active");
        k++;
    }

    while (i < left.length) {
        array[k] = left[i];
        playSound(left[i]);
        updateBars();
        await sleep(50);
        i++;
        k++;
    }

    while (j < right.length) {
        array[k] = right[j];
        playSound(right[j]);
        updateBars();
        await sleep(50);
        j++;
        k++;
    }
}

generateArray();