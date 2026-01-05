// 消防員超勤時數計算系統

// 班別起始日期
const SHIFT_START_DATES = {
    '甲班': new Date('2026-01-02'),
    '乙班': new Date('2026-01-01')
};

// 2026年各月份上班天數（依據人事行政局行事曆）
const WORKDAYS_PER_MONTH_2026 = {
    1: 20,  // 1月：20天
    2: 14,  // 2月：14天
    3: 22,  // 3月：22天
    4: 20,  // 4月：20天
    5: 20,  // 5月：20天
    6: 21,  // 6月：21天
    7: 23,  // 7月：23天
    8: 21,  // 8月：21天
    9: 20,  // 9月：20天
    10: 20, // 10月：20天
    11: 21, // 11月：21天
    12: 22  // 12月：22天
};

// DOM 元素
const form = document.getElementById('overtimeForm');
const resultSection = document.getElementById('resultSection');
const leaveCheckboxes = document.querySelectorAll('input[name="leaveType"]');
const leaveDaysInput = document.getElementById('leaveDaysInput');

// 監聽請假類型勾選
leaveCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const anyChecked = Array.from(leaveCheckboxes).some(cb => cb.checked);
        if (anyChecked) {
            leaveDaysInput.classList.remove('hidden');
        } else {
            leaveDaysInput.classList.add('hidden');
            document.getElementById('leaveDays').value = '';
        }
    });
});

// 設定預設月份為當月
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // 設定預設月份
    const queryMonthInput = document.getElementById('queryMonth');
    queryMonthInput.value = `${year}-${month}`;

    // 初始化顯示當月基本工時
    updateBaseHoursDisplay();

    // 監聽月份變更
    queryMonthInput.addEventListener('change', () => {
        updateBaseHoursDisplay();
        updateShiftWorkDaysDisplay();
    });

    // 監聽班別變更
    const shiftSelect = document.getElementById('shift');
    shiftSelect.addEventListener('change', updateShiftWorkDaysDisplay);
});

/**
 * 更新基本工時顯示
 */
function updateBaseHoursDisplay() {
    const queryMonth = document.getElementById('queryMonth').value;
    if (!queryMonth) return;

    const [year, month] = queryMonth.split('-').map(Number);
    const baseHours = calculateBaseHours(year, month);
    const workDays = WORKDAYS_PER_MONTH_2026[month] || 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    const holidayDays = daysInMonth - workDays;

    // 顯示基本工時
    document.getElementById('baseHoursValue').textContent = baseHours;
    document.getElementById('baseHoursDetail').textContent =
        `${year}年${month}月：${daysInMonth}天 - ${holidayDays}天例假日 = ${workDays}天 × 8小時`;
    document.getElementById('baseHoursDisplay').classList.remove('hidden');
}

/**
 * 更新該班該月應上班天數顯示
 */
function updateShiftWorkDaysDisplay() {
    const shift = document.getElementById('shift').value;
    const queryMonth = document.getElementById('queryMonth').value;

    // 如果班別或月份未選擇，隱藏顯示區域
    if (!shift || !queryMonth) {
        document.getElementById('shiftWorkDaysDisplay').classList.add('hidden');
        return;
    }

    const [year, month] = queryMonth.split('-').map(Number);
    const shiftWorkDays = calculateShiftWorkDays(shift, year, month);

    // 顯示該班該月應上班天數
    document.getElementById('shiftWorkDaysValue').textContent = shiftWorkDays;
    document.getElementById('shiftWorkDaysDetail').textContent =
        `${shift}在${year}年${month}月應上班天數`;
    document.getElementById('shiftWorkDaysDisplay').classList.remove('hidden');
}

// 表單提交處理
form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateOvertime();
});

/**
 * 計算某個班別在某個月份的上班天數
 * @param {string} shift - 班別（甲班或乙班）
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} - 該班該月的上班天數
 */
function calculateShiftWorkDays(shift, year, month) {
    const startDate = SHIFT_START_DATES[shift];
    if (!startDate) return 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);

        // 計算從起始日到當前日期的天數差
        const diffTime = currentDate - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 起始日是上班日（第0天），之後每隔一天上班
        // 如果天數差是偶數（0, 2, 4...），則是上班日
        if (diffDays >= 0 && diffDays % 2 === 0) {
            workDays++;
        }
    }

    return workDays;
}

/**
 * 計算某個月份的基本工時
 * 公式：上班天數 × 8小時
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} - 基本工時
 */
function calculateBaseHours(year, month) {
    // 目前只支援2026年
    if (year !== 2026) {
        console.warn(`暫不支援 ${year} 年的基本工時計算，使用預設值`);
        return 0;
    }

    // 從對照表取得該月份的上班天數
    const workDays = WORKDAYS_PER_MONTH_2026[month] || 0;

    // 基本工時 = 上班天數 × 8小時
    return workDays * 8;
}

/**
 * 計算某個日期是否為上班日
 * @param {Date} date - 要檢查的日期
 * @param {string} shift - 班別（甲班或乙班）
 * @returns {boolean} - 是否為上班日
 */
function isWorkDay(date, shift) {
    const startDate = SHIFT_START_DATES[shift];
    const diffTime = date - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 起始日是上班日（第0天），之後每隔一天上班
    // 如果日期差是偶數（0, 2, 4...），則是上班日
    return diffDays >= 0 && diffDays % 2 === 0;
}

/**
 * 計算日期區間內的上班天數
 * @param {Date} startDate - 開始日期
 * @param {Date} endDate - 結束日期
 * @param {string} shift - 班別
 * @returns {number} - 上班天數
 */
function calculateWorkDays(startDate, endDate, shift) {
    let workDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
        if (isWorkDay(current, shift)) {
            workDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    return workDays;
}

/**
 * 主要計算函數
 */
function calculateOvertime() {
    // 取得表單數據
    const shift = document.getElementById('shift').value;
    const queryMonth = document.getElementById('queryMonth').value;
    const dutyHours = parseInt(document.getElementById('dutyHours').value);
    const leaveDays = parseInt(document.getElementById('leaveDays').value) || 0;

    // 驗證必填欄位
    if (!shift || !dutyHours || !queryMonth) {
        alert('請填寫所有必填欄位！');
        return;
    }

    // 解析年月
    const [year, month] = queryMonth.split('-').map(Number);

    // 計算該月的第一天和最後一天
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 計算基本工時
    const baseHours = calculateBaseHours(year, month);
    const workDaysInMonth = WORKDAYS_PER_MONTH_2026[month] || 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    const holidayDays = daysInMonth - workDaysInMonth;

    const baseHoursCalculationInfo = `${year}年${month}月基本工時：${workDaysInMonth}天上班日 × 8小時 = ${baseHours}小時`;

    // 計算上班天數
    const totalWorkDays = calculateWorkDays(startDate, endDate, shift);

    // 扣除請假天數
    const actualWorkDays = Math.max(0, totalWorkDays - leaveDays);

    // 計算總工作時數
    const totalHours = actualWorkDays * dutyHours;

    // 計算超勤時數（總工作時數 - 基本工時）
    const overtimeHours = Math.max(0, totalHours - baseHours);

    // 顯示結果
    displayResults({
        workDays: actualWorkDays,
        totalHours: totalHours,
        overtimeHours: overtimeHours,
        leaveDays: leaveDays,
        baseHours: baseHours,
        baseHoursCalculationInfo: baseHoursCalculationInfo,
        dutyHours: dutyHours,
        shift: shift,
        startDate: startDate,
        endDate: endDate,
        totalWorkDays: totalWorkDays
    });
}

/**
 * 顯示計算結果
 * @param {Object} data - 計算結果數據
 */
function displayResults(data) {
    // 更新結果數字
    animateNumber('workDaysResult', data.workDays);
    animateNumber('totalHoursResult', data.totalHours);
    animateNumber('overtimeResult', data.overtimeHours);
    animateNumber('leaveDaysResult', data.leaveDays);

    // 更新計算說明
    const details = document.getElementById('calculationDetails');
    const leaveTypes = Array.from(document.querySelectorAll('input[name="leaveType"]:checked'))
        .map(cb => cb.value)
        .join('、');

    const dateRange = `${formatDate(data.startDate)} 至 ${formatDate(data.endDate)}`;

    details.innerHTML = `
        <p><strong>查詢期間：</strong>${dateRange}</p>
        <p><strong>班別：</strong>${data.shift}</p>
        <p><strong>勤務時間：</strong>每班 ${data.dutyHours} 小時</p>
        <p><strong>期間內應上班天數：</strong>${data.totalWorkDays} 天</p>
        ${data.leaveDays > 0 ? `<p><strong>請假天數：</strong>${data.leaveDays} 天（${leaveTypes || '未指定類型'}）</p>` : ''}
        <p><strong>實際上班天數：</strong>${data.workDays} 天</p>
        <p class="text-indigo-600"><strong>基本工時計算：</strong>${data.baseHoursCalculationInfo}</p>
        <p><strong>總工作時數：</strong>${data.workDays} 天 × ${data.dutyHours} 小時/天 = ${data.totalHours} 小時</p>
        <p class="font-semibold text-purple-600 mt-2"><strong>超勤時數：</strong>${data.totalHours} - ${data.baseHours} = ${data.overtimeHours} 小時</p>
    `;

    // 顯示結果區塊
    resultSection.classList.remove('hidden');

    // 平滑滾動到結果區
    setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * 數字動畫效果
 * @param {string} elementId - 元素ID
 * @param {number} targetValue - 目標數值
 */
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 800; // 動畫持續時間（毫秒）
    const steps = 30; // 動畫步驟數
    const stepValue = targetValue / steps;
    const stepDuration = duration / steps;

    let currentValue = 0;
    let currentStep = 0;

    const timer = setInterval(() => {
        currentStep++;
        currentValue += stepValue;

        if (currentStep >= steps) {
            currentValue = targetValue;
            clearInterval(timer);
        }

        element.textContent = Math.round(currentValue);
    }, stepDuration);
}

/**
 * 格式化日期顯示
 * @param {Date} date - 日期物件
 * @returns {string} - 格式化後的日期字串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 防止表單重複提交
let isCalculating = false;
form.addEventListener('submit', (e) => {
    if (isCalculating) {
        e.preventDefault();
        return;
    }
    isCalculating = true;
    setTimeout(() => {
        isCalculating = false;
    }, 1000);
});
