// 全域變數
let vocabList = []; // 儲存詞彙列表
let cellSize = 45; // 預設格子大小

// DOM 元素
const titleInput = document.getElementById('titleInput');
const worksheetTitle = document.getElementById('worksheetTitle');
const vocabInput = document.getElementById('vocabInput');
const addWordsBtn = document.getElementById('addWordsBtn');
const wordList = document.getElementById('wordList');
const quizContentTop = document.getElementById('quizContentTop');
const quizContentBottom = document.getElementById('quizContentBottom');
const cellSizeSlider = document.getElementById('cellSizeSlider');
const cellSizeValue = document.getElementById('cellSizeValue');
const clearAllBtn = document.getElementById('clearAllBtn');
const blankAllZhuyin = document.getElementById('blankAllZhuyin');
const blankAllWord = document.getElementById('blankAllWord');
const showAll = document.getElementById('showAll');
const printBtn = document.getElementById('printBtn');

// 拼音到注音的對照表
const pinyinToZhuyinMap = {
    // 聲母
    'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
    'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
    'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
    'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
    'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
    'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',

    // 韻母
    'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ê': 'ㄝ',
    'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
    'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
    'i': 'ㄧ', 'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ', 'iou': 'ㄧㄡ',
    'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ',
    'u': 'ㄨ', 'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
    'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
    'ü': 'ㄩ', 'v': 'ㄩ', 'üe': 'ㄩㄝ', 've': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'van': 'ㄩㄢ', 'ün': 'ㄩㄣ', 'vn': 'ㄩㄣ',
    'iong': 'ㄩㄥ',

    // 聲調
    '1': '', '2': 'ˊ', '3': 'ˇ', '4': 'ˋ', '5': '˙', '0': '˙'
};

// 拼音轉注音函數
function pinyinToZhuyin(pinyin) {
    if (!pinyin) return '';

    // 如果已經是注音符號，直接返回
    if (/[ㄅ-ㄩˊˇˋ˙]/.test(pinyin)) {
        return pinyin;
    }

    pinyin = pinyin.toLowerCase().trim();

    // 提取聲調
    const toneMatch = pinyin.match(/[12345]/);
    const tone = toneMatch ? toneMatch[0] : '';
    const pinyinWithoutTone = pinyin.replace(/[12345]/g, '');

    let result = '';

    // 特殊整體認讀音節
    const wholeMap = {
        'zhi': 'ㄓ', 'chi': 'ㄔ', 'shi': 'ㄕ', 'ri': 'ㄖ',
        'zi': 'ㄗ', 'ci': 'ㄘ', 'si': 'ㄙ',
        'yi': 'ㄧ', 'wu': 'ㄨ', 'yu': 'ㄩ',
        'ye': 'ㄧㄝ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yin': 'ㄧㄣ', 'yun': 'ㄩㄣ', 'ying': 'ㄧㄥ'
    };

    if (wholeMap[pinyinWithoutTone]) {
        result = wholeMap[pinyinWithoutTone];
    } else {
        // 分離聲母和韻母
        let initial = '';
        let final = '';

        // 嘗試匹配聲母
        if (pinyinWithoutTone.startsWith('zh')) {
            initial = 'zh';
            final = pinyinWithoutTone.substring(2);
        } else if (pinyinWithoutTone.startsWith('ch')) {
            initial = 'ch';
            final = pinyinWithoutTone.substring(2);
        } else if (pinyinWithoutTone.startsWith('sh')) {
            initial = 'sh';
            final = pinyinWithoutTone.substring(2);
        } else if (/^[bpmfdtnlgkhjqxrzcsyw]/.test(pinyinWithoutTone)) {
            initial = pinyinWithoutTone[0];
            final = pinyinWithoutTone.substring(1);
        } else {
            final = pinyinWithoutTone;
        }

        // 轉換聲母
        if (initial && pinyinToZhuyinMap[initial]) {
            result += pinyinToZhuyinMap[initial];
        }

        // 轉換韻母
        if (final && pinyinToZhuyinMap[final]) {
            result += pinyinToZhuyinMap[final];
        } else if (final) {
            // 如果找不到完整韻母，嘗試拆分
            result += final;
        }
    }

    // 加上聲調
    if (tone && pinyinToZhuyinMap[tone]) {
        result += pinyinToZhuyinMap[tone];
    }

    return result || pinyin;
}

// 初始化
function init() {
    console.log('初始化開始...');

    // 檢查 DOM 元素是否存在
    if (!addWordsBtn) {
        console.error('找不到 addWordsBtn 元素');
        return;
    }

    console.log('所有 DOM 元素已找到');

    // 載入儲存的資料
    loadFromStorage();

    // 標題同步
    if (titleInput && worksheetTitle) {
        titleInput.addEventListener('input', () => {
            worksheetTitle.textContent = titleInput.value;
            saveToStorage();
        });

        worksheetTitle.addEventListener('input', () => {
            titleInput.value = worksheetTitle.textContent;
            saveToStorage();
        });
    }

    // 新增詞彙
    addWordsBtn.addEventListener('click', () => {
        console.log('按鈕被點擊');
        addWords();
    });

    // 也支援 Enter 鍵新增（選填）
    if (vocabInput) {
        vocabInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                addWords();
            }
        });
    }

    // 格子大小調整
    if (cellSizeSlider) {
        cellSizeSlider.addEventListener('input', (e) => {
            cellSize = parseInt(e.target.value);
            cellSizeValue.textContent = cellSize + 'px';
            document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
            saveToStorage();
        });
    }

    // 清除全部
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('確定要清除所有詞彙嗎？')) {
                vocabList = [];
                updateWordList();
                renderQuiz();
                saveToStorage();
            }
        });
    }

    // 快速挖空按鈕
    if (blankAllZhuyin) blankAllZhuyin.addEventListener('click', () => blankAll('zhuyin'));
    if (blankAllWord) blankAllWord.addEventListener('click', () => blankAll('word'));
    if (showAll) showAll.addEventListener('click', () => blankAll('show'));

    // 列印
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    // 初始渲染
    renderQuiz();

    console.log('初始化完成');
}

// 新增詞彙
function addWords() {
    console.log('addWords 函數被調用');

    const input = vocabInput.value.trim();
    console.log('輸入內容：', input);

    if (!input) {
        alert('請輸入詞彙！');
        return;
    }

    const lines = input.split('\n').filter(line => line.trim());
    console.log('分割後的行數：', lines.length);

    let hasError = false;
    let errorLines = [];

    lines.forEach(line => {
        console.log('處理行：', line);
        const parts = line.split(',').map(p => p.trim());
        console.log('分割後的部分：', parts);

        if (parts.length >= 2) {
            const word = parts[0];
            const pinyin = parts[1];
            const zhuyin = pinyinToZhuyin(pinyin);

            console.log(`詞彙：${word}, 拼音：${pinyin}, 注音：${zhuyin}`);

            vocabList.push({
                word: word,
                zhuyin: zhuyin,
                wordBlanks: Array(word.length).fill(false),
                zhuyinBlanks: Array(word.length).fill(false)
            });
        } else {
            console.warn('格式錯誤，需要用逗號分隔：', line);
            hasError = true;
            errorLines.push(line);
        }
    });

    // 如果有格式錯誤，顯示提示
    if (hasError) {
        alert('格式錯誤！\n\n請使用正確格式：國字,拼音\n\n例如：\n蘋果,ping2guo3\n香蕉,xiang1jiao1\n\n錯誤的行：\n' + errorLines.join('\n'));
        return;
    }

    // 如果沒有成功新增任何詞彙
    if (vocabList.length === 0 || lines.length === 0) {
        alert('未新增任何詞彙！\n\n請確認格式：國字,拼音\n例如：蘋果,ping2guo3');
        return;
    }

    console.log('詞彙列表：', vocabList);

    vocabInput.value = '';
    updateWordList();
    renderQuiz();
    saveToStorage();
}

// 更新詞彙列表顯示
function updateWordList() {
    wordList.innerHTML = '';

    if (vocabList.length === 0) {
        wordList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">尚無詞彙</div>';
        return;
    }

    vocabList.forEach((vocab, index) => {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.innerHTML = `
            <div>
                <span class="word-text">${vocab.word}</span>
                <span class="word-zhuyin"> (${vocab.zhuyin})</span>
            </div>
            <button class="delete-btn" onclick="deleteWord(${index})">刪除</button>
        `;
        wordList.appendChild(item);
    });
}

// 刪除詞彙
function deleteWord(index) {
    vocabList.splice(index, 1);
    updateWordList();
    renderQuiz();
    saveToStorage();
}

// 渲染練習單（分成上下兩部分，智能分配）
function renderQuiz() {
    quizContentTop.innerHTML = '';
    quizContentBottom.innerHTML = '';

    console.log('=== 開始渲染練習單 ===');
    console.log('詞彙總數:', vocabList.length);
    console.log('詞彙列表:', vocabList);
    console.log('格子大小:', cellSize);

    if (vocabList.length === 0) {
        quizContentTop.innerHTML = '<div style="writing-mode: horizontal-tb; text-align: center; color: #999; padding: 50px;">請在右側新增詞彙</div>';
        return;
    }

    // 計算每個詞彙會產生幾個欄位（考慮超過4字會分割）
    let columnCounts = [];
    let totalColumns = 0;
    vocabList.forEach((vocab) => {
        const maxCharsPerColumn = 4;
        const columns = Math.ceil(vocab.word.length / maxCharsPerColumn);
        columnCounts.push(columns);
        totalColumns += columns;
    });

    // 估算一行能放多少欄（根據頁面寬度和格子大小）
    // A4 橫向寬度約 267mm (297mm - 30mm padding)
    const pageWidth = 267; // mm
    const columnWidthMM = (cellSize + 35) / 3.78; // px 轉 mm (加上邊框和間距)
    const maxColumnsPerRow = Math.floor(pageWidth / columnWidthMM);

    console.log(`總欄數: ${totalColumns}, 每行最多: ${maxColumnsPerRow} 欄`);

    // 智能分配：盡量填滿上半部
    let topColumns = 0;
    let splitIndex = 0;

    for (let i = 0; i < vocabList.length; i++) {
        if (topColumns + columnCounts[i] <= maxColumnsPerRow) {
            topColumns += columnCounts[i];
            splitIndex = i + 1;
        } else {
            break;
        }
    }

    // 如果沒有詞彙能放進上半部（計算錯誤），使用預設分割
    if (splitIndex === 0) {
        splitIndex = Math.ceil(vocabList.length / 2);
    }

    // 如果所有詞彙都能放進上半部，全部放上面，下面留空
    // (不需要強制分割)

    console.log(`分割點: 前 ${splitIndex} 個詞彙在上半部，共 ${topColumns} 欄，最多可放 ${maxColumnsPerRow} 欄`);

    // 渲染上半部
    for (let i = 0; i < splitIndex; i++) {
        const vocab = vocabList[i];
        console.log(`上半部 - 項目 ${i + 1}: ${vocab.word}`);
        renderVocabToSection(vocab, i + 1, i, quizContentTop);
    }

    // 渲染下半部
    for (let i = splitIndex; i < vocabList.length; i++) {
        const vocab = vocabList[i];
        console.log(`下半部 - 項目 ${i + 1}: ${vocab.word}`);
        renderVocabToSection(vocab, i + 1, i, quizContentBottom);
    }

    console.log('=== 渲染完成 ===');
}

// 將詞彙渲染到指定區域
function renderVocabToSection(vocab, number, index, targetSection) {
    const entries = createVocabEntry(vocab, number, index);

    if (Array.isArray(entries)) {
        // 長詞彙被分成多段
        entries.forEach((entry) => {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'quiz-column';
            columnDiv.appendChild(entry);
            targetSection.appendChild(columnDiv);
        });
    } else {
        // 單一詞彙
        const columnDiv = document.createElement('div');
        columnDiv.className = 'quiz-column';
        columnDiv.appendChild(entries);
        targetSection.appendChild(columnDiv);
    }
}

// 創建詞彙項目（支援自動分欄，每欄最多4字）
function createVocabEntry(vocab, number, index) {
    const maxCharsPerColumn = 4; // 每欄最多4個字
    const entries = []; // 可能會創建多個entry（如果超過4字）

    // 拆分注音（每個字對應的注音）
    const zhuyinArray = splitZhuyinByChar(vocab.zhuyin, vocab.word.length);

    // 計算需要幾欄
    const columnCount = Math.ceil(vocab.word.length / maxCharsPerColumn);

    for (let col = 0; col < columnCount; col++) {
        const entry = document.createElement('div');
        entry.className = 'vocab-entry';
        entry.dataset.index = index;

        // 編號（第一欄顯示，續接欄用透明佔位）
        const numSpan = document.createElement('span');
        numSpan.className = 'entry-number';
        if (col === 0) {
            numSpan.textContent = number + '.';
        } else {
            numSpan.textContent = number + '.'; // 保持相同內容
            numSpan.classList.add('invisible'); // 添加透明樣式
        }
        entry.appendChild(numSpan);

        // 字符容器
        const charContainer = document.createElement('div');
        charContainer.className = 'char-container';

        // 計算這一欄要顯示的字符範圍
        const startIdx = col * maxCharsPerColumn;
        const endIdx = Math.min(startIdx + maxCharsPerColumn, vocab.word.length);

        // 為這一欄的字創建格子
        for (let i = startIdx; i < endIdx; i++) {
            const char = vocab.word[i];
            const zhuyin = zhuyinArray[i] || '';
            const charBox = createCharBox(char, zhuyin, index, i);
            charContainer.appendChild(charBox);
        }

        entry.appendChild(charContainer);
        entries.push(entry);
    }

    // 如果只有一欄，直接返回；如果有多欄，返回陣列
    return entries.length === 1 ? entries[0] : entries;
}

// 拆分注音（簡化版：平均分配）
function splitZhuyinByChar(zhuyinStr, charCount) {
    if (!zhuyinStr) return Array(charCount).fill('');

    // 如果注音已經用空格分隔，直接分割
    if (zhuyinStr.includes(' ')) {
        return zhuyinStr.split(' ');
    }

    // 簡單拆分：找出每個完整的注音（包含聲調）
    const result = [];
    let current = '';
    const tones = ['ˊ', 'ˇ', 'ˋ', '˙'];

    for (let i = 0; i < zhuyinStr.length; i++) {
        current += zhuyinStr[i];

        // 如果遇到聲調或是最後一個字符，就結束當前注音
        if (tones.includes(zhuyinStr[i]) || i === zhuyinStr.length - 1) {
            result.push(current);
            current = '';
        } else if (i < zhuyinStr.length - 1 && /[ㄅ-ㄩ]/.test(zhuyinStr[i + 1]) && !tones.includes(zhuyinStr[i])) {
            // 如果下一個是聲母開頭且當前不是聲調，結束當前注音
            if (/[ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ]/.test(zhuyinStr[i + 1])) {
                result.push(current);
                current = '';
            }
        }
    }

    // 如果拆分結果不夠，補空字符串
    while (result.length < charCount) {
        result.push('');
    }

    return result.slice(0, charCount);
}

// 創建單個字的格子
function createCharBox(char, zhuyin, vocabIndex, charIndex) {
    const box = document.createElement('div');
    box.className = 'char-box';
    box.dataset.vocabIndex = vocabIndex;
    box.dataset.charIndex = charIndex;

    // 先加國字（在左側）
    const charText = document.createElement('div');
    charText.className = 'char-text';
    charText.textContent = char;

    // 檢查是否挖空
    if (vocabList[vocabIndex].wordBlanks[charIndex]) {
        charText.classList.add('blank');
    }

    // 右鍵切換挖空
    charText.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleBlank(vocabIndex, charIndex, 'word');
    });

    box.appendChild(charText);

    // 後加注音（在右側）
    const zhuyinContainer = document.createElement('div');
    zhuyinContainer.className = 'zhuyin-container';

    if (zhuyin) {
        console.log('創建注音容器，注音內容：', zhuyin);

        // 分離聲調和基本注音
        const tones = ['ˊ', 'ˇ', 'ˋ', '˙'];
        let baseZhuyin = '';
        let tone = '';

        for (let i = 0; i < zhuyin.length; i++) {
            if (tones.includes(zhuyin[i])) {
                tone = zhuyin[i];
            } else {
                baseZhuyin += zhuyin[i];
            }
        }

        // 創建基本注音容器（垂直排列）
        const baseContainer = document.createElement('div');
        baseContainer.className = 'zhuyin-base';

        for (let i = 0; i < baseZhuyin.length; i++) {
            const zhuyinChar = document.createElement('div');
            zhuyinChar.className = 'zhuyin-char';
            zhuyinChar.textContent = baseZhuyin[i];

            // 檢查是否挖空
            if (vocabList[vocabIndex].zhuyinBlanks[charIndex]) {
                zhuyinChar.classList.add('blank');
            }

            baseContainer.appendChild(zhuyinChar);
        }

        zhuyinContainer.appendChild(baseContainer);

        // 創建聲調容器（垂直居中）
        const toneContainer = document.createElement('div');
        toneContainer.className = 'zhuyin-tone';
        if (tone) {
            toneContainer.textContent = tone;

            // 檢查是否挖空
            if (vocabList[vocabIndex].zhuyinBlanks[charIndex]) {
                toneContainer.classList.add('blank');
            }
        }

        zhuyinContainer.appendChild(toneContainer);

        // 雙擊編輯
        zhuyinContainer.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            editZhuyin(vocabIndex, charIndex, zhuyinContainer);
        });

        // 右鍵切換挖空
        zhuyinContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            toggleBlank(vocabIndex, charIndex, 'zhuyin');
        });
    }

    box.appendChild(zhuyinContainer);

    return box;
}

// 切換挖空
function toggleBlank(vocabIndex, charIndex, type) {
    if (type === 'zhuyin') {
        vocabList[vocabIndex].zhuyinBlanks[charIndex] = !vocabList[vocabIndex].zhuyinBlanks[charIndex];
    } else {
        vocabList[vocabIndex].wordBlanks[charIndex] = !vocabList[vocabIndex].wordBlanks[charIndex];
    }
    renderQuiz();
    saveToStorage();
}

// 編輯注音
function editZhuyin(vocabIndex, charIndex, container) {
    const currentZhuyin = container.textContent;
    const newZhuyin = prompt('編輯注音：', currentZhuyin);

    if (newZhuyin !== null) {
        // 更新整個詞的注音
        const zhuyinArray = splitZhuyinByChar(vocabList[vocabIndex].zhuyin, vocabList[vocabIndex].word.length);
        zhuyinArray[charIndex] = newZhuyin;
        vocabList[vocabIndex].zhuyin = zhuyinArray.join(' ');

        updateWordList();
        renderQuiz();
        saveToStorage();
    }
}

// 快速挖空全部
function blankAll(mode) {
    vocabList.forEach(vocab => {
        for (let i = 0; i < vocab.word.length; i++) {
            if (mode === 'zhuyin') {
                vocab.zhuyinBlanks[i] = true;
                vocab.wordBlanks[i] = false;
            } else if (mode === 'word') {
                vocab.zhuyinBlanks[i] = false;
                vocab.wordBlanks[i] = true;
            } else {
                vocab.zhuyinBlanks[i] = false;
                vocab.wordBlanks[i] = false;
            }
        }
    });
    renderQuiz();
    saveToStorage();
}

// 儲存到 localStorage
function saveToStorage() {
    const data = {
        title: titleInput.value,
        cellSize: cellSize,
        vocabList: vocabList
    };
    localStorage.setItem('quizData', JSON.stringify(data));
}

// 從 localStorage 載入
function loadFromStorage() {
    const saved = localStorage.getItem('quizData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            titleInput.value = data.title || '圈詞練習單';
            worksheetTitle.textContent = data.title || '圈詞練習單';
            cellSize = data.cellSize || 45;
            cellSizeSlider.value = cellSize;
            cellSizeValue.textContent = cellSize + 'px';
            document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
            vocabList = data.vocabList || [];

            updateWordList();
            renderQuiz();
        } catch (e) {
            console.error('載入資料失敗：', e);
        }
    }
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', init);
