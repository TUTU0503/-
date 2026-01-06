// 消防員超勤時數計算系統

// 班別起始日期（使用 new Date(year, month-1, day) 避免時區問題）
const SHIFT_START_DATES = {
    '甲班': new Date(2026, 0, 2),  // 2026/01/02
    '乙班': new Date(2026, 0, 1)   // 2026/01/01
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

// 各班別2026年每月應上班天數（隔日勤務制）
// 甲班起始日：2026/01/02，乙班起始日：2026/01/01
const SHIFT_WORKDAYS_2026 = {
    '甲班': {
        1: 15, 2: 14, 3: 16, 4: 15, 5: 15, 6: 15,
        7: 16, 8: 15, 9: 15, 10: 16, 11: 15, 12: 15
        // 全年總計：182天
    },
    '乙班': {
        1: 16, 2: 14, 3: 15, 4: 15, 5: 16, 6: 15,
        7: 15, 8: 16, 9: 15, 10: 15, 11: 15, 12: 16
        // 全年總計：183天
    }
};

// 各號碼對應的時薪
const HOURLY_RATE = {
    '1號': 324,
    '2號': 328,
    '3號': 298,
    '4號': 328,
    '5號': 298,
    '6號': 182,
    '7號': 217,
    '8號': 244,
    '9號': 249,
    '10號': 278,
    '11號': 269,
    '12號': 249,
    '13號': 282,
    '14號': 205,
    '15號': 268,
    '16號': 203,
    '17號': 259,
    '18號': 182,
    '19號': 249,
    '20號': 208,
    '21號': 308,
    '22號': 254,
    '23號': 250,
    '24號': 249,
    '25號': 308,
    '26號': 308,
    '27號': 221
};

// DOM 元素
const form = document.getElementById('overtimeForm');
const resultSection = document.getElementById('resultSection');

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
    const name = document.getElementById('name').value;
    const shift = document.getElementById('shift').value;
    const queryMonth = document.getElementById('queryMonth').value;
    const dutyHours = parseInt(document.getElementById('dutyHours').value);

    // 取得各種請假天數
    const rotationDays = parseInt(document.getElementById('rotationDays').value) || 0;
    const vacationDays = parseInt(document.getElementById('vacationDays').value) || 0;
    const compensatoryDays = parseInt(document.getElementById('compensatoryDays').value) || 0;
    const overnightDays = parseInt(document.getElementById('overnightDays').value) || 0;

    // 驗證必填欄位
    if (!name || !shift || !dutyHours || !queryMonth) {
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

    const baseHoursCalculationInfo = `${year}年${month}月基本工時：${workDaysInMonth}天上班日 × 8小時 = ${baseHours}小時`;

    // 計算該班該月應上班天數
    const totalWorkDays = calculateWorkDays(startDate, endDate, shift);

    // 計算總請假天數
    const totalLeaveDays = rotationDays + vacationDays + compensatoryDays + overnightDays;

    // 計算實際上班天數
    const actualWorkDays = Math.max(0, totalWorkDays - totalLeaveDays);

    // 使用新的超勤時數計算公式
    // 超勤時數 = (上班天數 - 輪休天數 - 休假天數 - 補休天數 - 外宿) * 勤務時間 + 休假天數 * 8 + 外宿 * 12 - 當月基本工時
    const overtimeHours = Math.max(0,
        (totalWorkDays - rotationDays - vacationDays - compensatoryDays - overnightDays) * dutyHours
        + vacationDays * 8
        + overnightDays * 12
        - baseHours
    );

    // 取得該號碼的時薪
    const hourlyRate = HOURLY_RATE[name] || 0;

    // 計算原始超勤費用
    const totalOvertimePay = overtimeHours * hourlyRate;

    // 超勤費用上限為19000元
    const overtimePayLimit = 19000;
    const overtimePay = Math.min(totalOvertimePay, overtimePayLimit);

    // 計算剩餘時數（如果超過上限）
    let remainingHours = 0;
    if (totalOvertimePay > overtimePayLimit && hourlyRate > 0) {
        // 已支付時數 = 19000 / 時薪，無條件進位
        const paidHours = Math.ceil(overtimePayLimit / hourlyRate);
        remainingHours = Math.max(0, overtimeHours - paidHours);
    }

    // 計算總工作時數（用於顯示）
    const totalHours = actualWorkDays * dutyHours;

    // 顯示結果
    displayResults({
        name: name,
        workDays: actualWorkDays,
        totalHours: totalHours,
        overtimeHours: overtimeHours,
        hourlyRate: hourlyRate,
        overtimePay: overtimePay,
        remainingHours: remainingHours,
        leaveDays: totalLeaveDays,
        rotationDays: rotationDays,
        vacationDays: vacationDays,
        compensatoryDays: compensatoryDays,
        overnightDays: overnightDays,
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
    animateNumber('overtimeResult', data.overtimeHours);
    animateNumber('hourlyRateResult', data.hourlyRate);
    animateNumber('overtimePayResult', Math.round(data.overtimePay));
    animateNumber('remainingHoursResult', Math.round(data.remainingHours * 10) / 10);
    animateNumber('monthlyOvertimeResult', data.overtimeHours);

    // 更新計算說明
    const details = document.getElementById('calculationDetails');
    const dateRange = `${formatDate(data.startDate)} 至 ${formatDate(data.endDate)}`;

    // 建立請假明細
    let leaveDetails = '';
    if (data.leaveDays > 0) {
        const items = [];
        if (data.rotationDays > 0) items.push(`輪休${data.rotationDays}天`);
        if (data.vacationDays > 0) items.push(`休假${data.vacationDays}天`);
        if (data.compensatoryDays > 0) items.push(`補休${data.compensatoryDays}天`);
        if (data.overnightDays > 0) items.push(`外宿${data.overnightDays}天`);
        leaveDetails = `<p><strong>請假明細：</strong>${items.join('、')} (合計 ${data.leaveDays} 天)</p>`;
    }

    // 超勤時數計算公式說明
    const overtimeFormula = `
        <p class="font-semibold text-purple-600 mt-2"><strong>超勤時數計算：</strong></p>
        <p class="ml-4 text-sm">
            (${data.totalWorkDays} - ${data.rotationDays} - ${data.vacationDays} - ${data.compensatoryDays} - ${data.overnightDays}) × ${data.dutyHours}
            + ${data.vacationDays} × 8
            + ${data.overnightDays} × 12
            - ${data.baseHours}
            = ${data.overtimeHours} 小時
        </p>
    `;

    details.innerHTML = `
        <p><strong>號碼：</strong>${data.name}</p>
        <p><strong>查詢期間：</strong>${dateRange}</p>
        <p><strong>班別：</strong>${data.shift}</p>
        <p><strong>勤務時間：</strong>每班 ${data.dutyHours} 小時</p>
        <p><strong>期間內應上班天數：</strong>${data.totalWorkDays} 天</p>
        ${leaveDetails}
        <p><strong>實際上班天數：</strong>${data.workDays} 天</p>
        <p class="text-indigo-600"><strong>基本工時計算：</strong>${data.baseHoursCalculationInfo}</p>
        <p><strong>總工作時數：</strong>${data.workDays} 天 × ${data.dutyHours} 小時/天 = ${data.totalHours} 小時</p>
        ${overtimeFormula}
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
