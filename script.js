// =========================================
// GATE 2027 OS | FIREBASE + BRUTAL ENGINE (FINAL V9 - THE MASTERPIECE)
// =========================================

// -----------------------------------------
// 🔴 FIREBASE SETUP (Optional)
// -----------------------------------------
const useFirebase = false;

const firebaseConfig = {
    apiKey: "TERA_API_KEY_YAHAN",
    authDomain: "TERA_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://TERA_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "TERA_PROJECT_ID"
};

let userRef = null;
if (useFirebase) {
    firebase.initializeApp(firebaseConfig);
    userRef = firebase.database().ref('gate_tracker_data');
    document.getElementById('syncStatus').innerText = "Data: Cloud Sync 🟢";
}

// -----------------------------------------
// CORE CONFIG & ENGINE
// -----------------------------------------
const GATE_DATE = new Date('2027-02-06T00:00:00');
const START_DATE = new Date('2026-06-05T00:00:00');
const END_DATE = new Date('2026-12-01T00:00:00');
let today = new Date();
if (today < START_DATE) today = new Date(START_DATE);
today.setHours(0, 0, 0, 0);

const genSeq = (name, count, start = 1) => Array.from({ length: count }, (_, i) => `${name} (${start + i})`);
const slot1Seq = [...genSeq('OS', 70), ...genSeq('COA', 56), 'DBMS (39)', 'DBMS (41)', 'DBMS (43)', 'DBMS (45)', 'DBMS (47)', 'DBMS (49)', 'Algo (85)', 'Algo (88)', 'Algo (91)', 'Algo (94)'];
const slot2Seq = [...genSeq('EM', 38), ...genSeq('DM', 50), ...genSeq('DBMS', 38), 'DBMS (40)', 'DBMS (42)', 'DBMS (44)', 'DBMS (46)', 'DBMS (48)', 'DBMS (50)', 'Algo (86)', 'Algo (89)', 'Algo (92)'];
const slot3Seq = [...genSeq('DLD', 48), ...genSeq('Algo', 84), 'Algo (87)', 'Algo (90)', 'Algo (93)'];
const pracSubjects = ['C', 'CN', 'TOC', 'CD', 'EM', 'DLD', 'OS', 'DM', 'COA', 'DBMS', 'Algo'];
let prac2Seq = []; pracSubjects.forEach(sub => prac2Seq.push(...genSeq(sub, 14, 1)));

function getStudyDayNumber(startDate, targetDate) {
    let count = 0, cur = new Date(startDate);
    while (cur <= targetDate) { if (cur.getDay() !== 0) count++; cur.setDate(cur.getDate() + 1); }
    return count;
}
let currentStudyDayNum = getStudyDayNumber(START_DATE, today);
let isTodaySunday = today.getDay() === 0;
let totalPossibleCheckpoints = currentStudyDayNum * 5;

let db = { dayLogs: {}, missedLog: {}, recoveredLog: {}, customTasks: {}, completedCheckpoints: 0, historyRiskScore: [], extraWork: 0 };

function loadData() {
    if (useFirebase) {
        userRef.on('value', (snapshot) => {
            if (snapshot.exists()) db = snapshot.val();
            if (!db.dayLogs) db.dayLogs = {};
            if (!db.missedLog) db.missedLog = {};
            if (!db.recoveredLog) db.recoveredLog = {};
            if (!db.historyRiskScore) db.historyRiskScore = [];
            if (!db.customTasks) db.customTasks = {};
            runEngine();
        });
    } else {
        db = JSON.parse(localStorage.getItem('gate_hardcore_final')) || db;
        if (!db.recoveredLog) db.recoveredLog = {};
        runEngine();
    }
}

function saveData() {
    if (useFirebase) {
        userRef.set(db);
    } else {
        localStorage.setItem('gate_hardcore_final', JSON.stringify(db));
        runEngine();
    }
}

function calculateAIR(score) {
    if (score >= 70) return Math.round(800 - ((score - 70) * 100));
    if (score >= 65) return Math.round(1500 - ((score - 65) * 140));
    if (score >= 60) return Math.round(2500 - ((score - 60) * 200));
    if (score >= 55) return Math.round(4000 - ((score - 55) * 300));
    if (score >= 50) return Math.round(6000 - ((score - 50) * 400));
    return Math.round(12000 - ((score - 20) * 300));
}

// ENGINE START
function runEngine() {
    const quotes = [
        "Gate 2027 wait nahi karega. Aaj ka din waste kiya toh AIR 1000 bhool ja.",
        "Consistency is boring, but failure is devastating. Padhne baith!",
        "Tere competitors is waqt OS ke questions laga rahe hain. Tu kya kar raha hai?",
        "Ek aur din, ek aur mauka! Aaj screen green honi chahiye.",
        "Aalas aaj meetha lagega, par result wale din bahut kadwa hoga.",
        "No excuses! Hardcore mode on kar aur targets phod de.",
        "Syllabus bada hai, par teri aukaat usse bhi badi honi chahiye.",
        "Portfolio ki tarah is graph ko bhi upar le jaana hai. Lock it!"
    ];
    let quoteIndex = currentStudyDayNum % quotes.length;
    let quoteEl = document.getElementById('dailyQuote');
    if (quoteEl) quoteEl.innerText = `🔥 "${quotes[quoteIndex]}"`;

    let daysLeft = Math.ceil((GATE_DATE - today) / (1000 * 60 * 60 * 24));
    let totalStudyDays = getStudyDayNumber(START_DATE, END_DATE);
    document.getElementById('daysLeft').innerText = `Days Left: ${daysLeft}`;
    document.getElementById('studyDaysLeft').innerText = `Study Days: ${totalStudyDays - currentStudyDayNum}`;

    document.getElementById('studyDayBadge').innerText = isTodaySunday ? "SUNDAY / BACKLOG" : `Study Day ${currentStudyDayNum}`;

    let effectiveDone = db.completedCheckpoints + ((db.extraWork || 0) * 0.30);
    let consistency = totalPossibleCheckpoints === 0 ? 0 : (effectiveDone / totalPossibleCheckpoints) * 100;
    if (consistency > 100) consistency = 100;

    let baseScore = 20 + ((consistency / 100) * 55);
    if (baseScore > 75) baseScore = 75;

    let subBacklogs = { 'OS': 0, 'COA': 0, 'EM': 0, 'DM': 0, 'DBMS': 0, 'DLD': 0, 'Algo': 0, 'Apti': 0, 'Prac': 0 };
    let totalBacklogs = 0;

    for (let d = 1; d < currentStudyDayNum; d++) {
        if (db.missedLog[d]) {
            db.missedLog[d].forEach(sub => {
                if (subBacklogs[sub] !== undefined) subBacklogs[sub]++;
                else subBacklogs['Prac']++;
            });
        } else if (db.dayLogs[d] === undefined) {
            totalBacklogs += 5;
        }
    }

    let recoveredCount = 0;
    if (db.recoveredLog) {
        for (let sub in db.recoveredLog) {
            if (subBacklogs[sub] !== undefined) {
                subBacklogs[sub] -= db.recoveredLog[sub];
                if (subBacklogs[sub] < 0) subBacklogs[sub] = 0;
            }
        }
        recoveredCount = Object.values(db.recoveredLog).reduce((a, b) => a + b, 0);
    }

    let trueTotalBacklog = totalPossibleCheckpoints - db.completedCheckpoints - recoveredCount - (isTodaySunday ? 0 : 5);
    if (trueTotalBacklog < 0) trueTotalBacklog = 0;

    // 🔥 FIX 2: CORE SUBJECT WEIGHTS 🔥
    let subjectWeights = { 'Algo': 2, 'OS': 1.5, 'COA': 1.5, 'DBMS': 1.5, 'DM': 1, 'EM': 1, 'DLD': 1, 'Apti': 1, 'Prac': 1 };
    let subjectPenalty = 0, gridHTML = "";
    let coreSubjects = ['OS', 'COA', 'EM', 'DM', 'DBMS', 'DLD', 'Algo', 'Apti', 'Prac'];

    coreSubjects.forEach(sub => {
        let count = subBacklogs[sub] || 0;
        let statusIcon = count === 0 ? "✅" : count <= 3 ? "⚠️" : count <= 7 ? "🔴" : "☠️";
        let color = count === 0 ? "var(--neon-green)" : count <= 3 ? "var(--neon-yellow)" : count <= 7 ? "var(--neon-orange)" : "var(--neon-red)";

        if (count >= 4) {
            subjectPenalty += (subjectWeights[sub] || 1);
        }

        gridHTML += `<div class="backlog-item" style="border-bottom: 2px solid ${color};">
                        ${sub} <span style="color:${color}">${count} ${statusIcon}</span>
                     </div>`;
    });

    document.getElementById('backlogGrid').innerHTML = gridHTML;
    document.getElementById('totalBacklog').innerText = trueTotalBacklog;

    let backlogPenalty = 0;
    if (trueTotalBacklog < 10) backlogPenalty = trueTotalBacklog * 0.25;
    else if (trueTotalBacklog < 20) backlogPenalty = trueTotalBacklog * 0.35;
    else if (trueTotalBacklog < 35) backlogPenalty = trueTotalBacklog * 0.50;
    else backlogPenalty = trueTotalBacklog * 0.75;

    let backlogStatus = document.getElementById('backlogStatus');
    let dangerEl = document.getElementById('dangerZone');

    if (trueTotalBacklog >= 35) {
        backlogStatus.innerHTML = "DISASTER ☠️"; backlogStatus.style.color = "var(--neon-red)";
        dangerEl.className = 'alert-banner alert-critical';
        dangerEl.innerText = '☠️ CRITICAL: Backlog is destroying your AIR. Recover NOW.';
    }
    else if (trueTotalBacklog >= 20) {
        backlogStatus.innerHTML = "CRITICAL 🔴"; backlogStatus.style.color = "var(--neon-red)";
        dangerEl.className = 'alert-banner alert-warning';
        dangerEl.innerText = '⚠️ WARNING: Backlog piling up. Clear before it compounds.';
    }
    else if (trueTotalBacklog >= 10) {
        backlogStatus.innerHTML = "WARNING ⚠️"; backlogStatus.style.color = "var(--neon-orange)";
        dangerEl.className = 'alert-banner alert-warning';
        dangerEl.innerText = '⚠️ CAUTION: Backlogs are starting to accumulate.';
    }
    else {
        backlogStatus.innerHTML = "SAFE ✅"; backlogStatus.style.color = "var(--neon-green)";
        dangerEl.className = 'alert-banner alert-safe';
        dangerEl.innerText = '✅ ON TRACK: Maintain your momentum.';
    }

    let missStreak = 0;
    for (let i = currentStudyDayNum - 1; i >= 1; i--) {
        if (db.dayLogs[i] === undefined || db.dayLogs[i] < 5) missStreak++;
        else break;
    }

    let streakPenalty = missStreak >= 10 ? 10 : missStreak >= 5 ? 5 : missStreak >= 2 ? 2 : 0;

    document.getElementById('streakBadge').innerText = `Streak: ${missStreak} Misses`;
    document.getElementById('streakBadge').style.background = missStreak > 0 ? 'var(--neon-red)' : 'var(--neon-green)';

    let riskScore = baseScore - backlogPenalty - streakPenalty - subjectPenalty;
    if (riskScore < 20) riskScore = 20;

    document.getElementById('baseScore').innerText = baseScore.toFixed(1);
    document.getElementById('riskScore').innerText = riskScore.toFixed(1);

    let baseAir = calculateAIR(baseScore);
    let riskAir = calculateAIR(riskScore);

    // 🔥 FIX 3: BRUTAL AIR PENALTY 🔥
    riskAir += Math.floor(trueTotalBacklog * 20);

    document.getElementById('baseAir').innerText = baseAir > 0 ? baseAir : 1;
    document.getElementById('riskAir').innerText = riskAir > 0 ? riskAir : 1;

    document.getElementById('realityScore').innerText = riskScore.toFixed(1);
    document.getElementById('realityAir').innerText = riskAir > 0 ? riskAir : 1;

    let trendHTML = `<span style="color:var(--text-muted)">Need 7 days data</span>`;
    if (db.historyRiskScore.length > 7) {
        let oldAir = calculateAIR(db.historyRiskScore[db.historyRiskScore.length - 7]);
        let diff = oldAir - riskAir;
        if (diff > 0) trendHTML = `<span class="trend-up">↑ ${diff} this week</span>`;
        else if (diff < 0) trendHTML = `<span class="trend-down">↓ ${Math.abs(diff)} this week</span>`;
        else trendHTML = `<span style="color:var(--text-muted)">Unchanged</span>`;
    }
    document.getElementById('airTrend').innerHTML = trendHTML;

    if (isTodaySunday) {
        document.getElementById('sundayReview').style.display = 'block';
        let weekTarget = 0;
        for (let i = currentStudyDayNum - 6; i <= currentStudyDayNum; i++) {
            if (db.dayLogs[i]) weekTarget += db.dayLogs[i];
        }
        let wCons = (weekTarget / 30) * 100;
        let gap = wCons - 92;

        document.getElementById('weekTarget').innerText = `${weekTarget}/30`;
        document.getElementById('weekCons').innerText = `${wCons.toFixed(1)}%`;
        let gapEl = document.getElementById('weekGap');
        if (gap >= 0) {
            gapEl.className = 'trend-up';
            gapEl.innerText = `+${gap.toFixed(1)}%`;
        } else {
            gapEl.className = 'trend-down';
            gapEl.innerText = `${gap.toFixed(1)}%`;
        }
    } else {
        document.getElementById('sundayReview').style.display = 'none';
    }

    const calcDrop = (mDays) => {
        let nBase = 20 + (((effectiveDone / ((currentStudyDayNum + mDays) * 5) * 100) / 100) * 55);
        let nRisk = nBase - (backlogPenalty + (mDays * 0.25)) - (streakPenalty + 1) - subjectPenalty;
        if (nRisk < 20) nRisk = 20;
        let nAir = calculateAIR(nRisk) + Math.floor((trueTotalBacklog + (mDays * 5)) * 20);
        return { sDrop: Math.max(0, riskScore - nRisk).toFixed(1), aDrop: Math.max(0, nAir - riskAir) };
    }
    let drop1 = calcDrop(1); document.getElementById('drop1Score').innerText = `-${drop1.sDrop}`; document.getElementById('drop1Air').innerText = `+${drop1.aDrop}`;
    let drop3 = calcDrop(3); document.getElementById('drop3Score').innerText = `-${drop3.sDrop}`; document.getElementById('drop3Air').innerText = `+${drop3.aDrop}`;

    document.getElementById('recoverBtn').style.display = trueTotalBacklog > 0 ? 'block' : 'none';

    renderTasks();
    renderMonthCalendar();
    renderChart();
}

function renderTasks() {
    const list = document.getElementById('taskList'), btn = document.getElementById('lockBtn'), resetBtn = document.getElementById('resetBtn');
    let isLocked = db.dayLogs[currentStudyDayNum] !== undefined;
    list.innerHTML = '';

    if (isTodaySunday) {
        list.innerHTML = `<li style="padding:16px; color:var(--neon-yellow); text-align:center; font-weight:bold;">BACKLOG DAY<br><span style="font-size:0.8rem;">No new modules today. Clear previous targets!</span></li>`;
        btn.style.display = 'none'; resetBtn.style.display = 'none'; return;
    }

    if (isLocked) {
        let count = db.dayLogs[currentStudyDayNum];
        let msg = count === 5 ? "GOOD ✅" : count === 4 ? "SLIGHT PENALTY ⚠️" : count === 3 ? "PENALTY 🔴" : count === 2 ? "HEAVY PENALTY 🩸" : count === 1 ? "SEVERE PENALTY 💀" : "DISASTER ☠️";
        let color = count >= 4 ? 'var(--neon-green)' : count >= 3 ? 'var(--neon-orange)' : 'var(--neon-red)';
        list.innerHTML += `<li style="padding:12px; margin-bottom:10px; background:rgba(255,255,255,0.05); color:${color}; text-align:center; border-radius:6px; font-weight:bold;">DAY LOCKED [${count}/5] <br><span style="font-size:0.8rem; font-weight:normal;">Mode: ${msg}</span></li>`;
        btn.style.display = 'none'; resetBtn.style.display = 'block';
    } else {
        btn.style.display = 'block'; resetBtn.style.display = 'none';
    }

    let t1 = slot1Seq[currentStudyDayNum - 1] || "Slot 1 Done", t2 = slot2Seq[currentStudyDayNum - 1] || "Slot 2 Done", t3 = slot3Seq[currentStudyDayNum - 1] || "Slot 3 Done", tPrac = prac2Seq[currentStudyDayNum - 1] || "Prac Done";

    let targets = [
        { id: 's1', label: t1, sub: t1.split(' ')[0] }, { id: 's2', label: t2, sub: t2.split(' ')[0] },
        { id: 's3', label: t3, sub: t3.split(' ')[0] }, { id: 'apt', label: 'Aptitude (1 hr)', sub: 'Apti' },
        { id: 'prac', label: `Prac: ${tPrac}`, sub: 'Prac' }
    ];

    targets.forEach(t => {
        list.innerHTML += `<li class="task-item"><input type="checkbox" id="chk_${t.id}" class="v13-task" data-sub="${t.sub}" ${isLocked ? 'disabled' : ''}><label for="chk_${t.id}" style="${isLocked ? 'color: var(--text-muted);' : ''}">${t.label} <span class="subject-tag">${t.sub}</span></label></li>`;
    });

    let myCustoms = db.customTasks[currentStudyDayNum] || [];
    myCustoms.forEach((txt, index) => {
        list.innerHTML += `
        <li class="task-item" style="border-left: 3px solid var(--neon-blue); padding-left: 10px;">
            <input type="checkbox" id="chk_custom_${index}" ${isLocked ? 'checked disabled' : ''}>
            <label for="chk_custom_${index}" style="${isLocked ? 'color: var(--text-muted);' : ''}">
                ${txt} <span class="subject-tag" style="background: #374151;">CUSTOM</span>
            </label>
        </li>`;
    });
}

document.getElementById('lockBtn').addEventListener('click', () => {
    let chks = document.querySelectorAll('input.v13-task[type="checkbox"]'), done = 0, missedArr = [];
    chks.forEach(c => {
        if (c.checked) done++;
        else missedArr.push(c.dataset.sub);
    });

    // 🔥 FIX 1: LOCK CONFIRMATION 🔥
    if (!confirm(`You completed ${done}/5 checkpoints.\nLock day?`)) return;

    db.completedCheckpoints += done;
    db.dayLogs[currentStudyDayNum] = done;
    db.missedLog[currentStudyDayNum] = missedArr;

    let riskScoreForChart = document.getElementById('riskScore').innerText;
    db.historyRiskScore.push(parseFloat(riskScoreForChart));

    if (done === 5) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f8fafc'] });
    } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 }, colors: ['#f97316', '#ef4444'] });
    }

    setTimeout(() => {
        saveData();
    }, 1500);
});

function renderChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    let labels = [], targetData = [], actualData = [];
    labels.push("Start"); targetData.push(20.0); actualData.push(20.0);

    for (let i = 0; i < 154; i++) {
        labels.push(`Day ${i + 1}`);
        targetData.push(20 + (((i + 1) / 154) * 55));
        if (i < db.historyRiskScore.length) actualData.push(db.historyRiskScore[i]);
        else actualData.push(null);
    }
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Risk Score (Actual)', data: actualData, borderColor: '#ef4444', borderWidth: 2, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.1, spanGaps: true, pointRadius: ctx => ctx.raw !== null ? 3 : 0 },
                { label: 'Target (70+ Pace)', data: targetData, borderColor: '#f97316', borderWidth: 1.5, borderDash: [5, 5], fill: false, pointRadius: 0 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 15, max: 80, grid: { color: '#262a33' }, ticks: { color: '#8b949e' } }, x: { grid: { display: false }, ticks: { color: '#8b949e', maxTicksLimit: 12 } } }, plugins: { legend: { labels: { color: '#f8fafc' } } } }
    });
}

function renderMonthCalendar() {
    const container = document.getElementById('monthWiseCalendar');
    container.innerHTML = '';
    const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let curDate = new Date(START_DATE), mData = {}, trackingSD = 0;

    while (curDate <= END_DATE) {
        let key = `${curDate.getMonth()}-${curDate.getFullYear()}`;
        if (!mData[key]) {
            mData[key] = { name: mNames[curDate.getMonth()], yr: curDate.getFullYear(), days: [] };
            let pad = new Date(curDate.getFullYear(), curDate.getMonth(), 1).getDay();
            pad = pad === 0 ? 6 : pad - 1;
            for (let i = 0; i < pad; i++) mData[key].days.push({ type: 'empty' });
        }

        let isSun = curDate.getDay() === 0, isPast = curDate <= today;

        let obj = {
            dateStr: curDate.toISOString(),
            dateNum: curDate.getDate(),
            type: 'future',
            sdNum: 0
        };

        if (isSun) { obj.type = 'sunday'; }
        else {
            trackingSD++;
            obj.sdNum = trackingSD;
            if (isPast) {
                let log = db.dayLogs[trackingSD];
                if (log !== undefined) {
                    if (log === 5) obj.type = 'done'; else if (log > 0) obj.type = 'partial'; else obj.type = 'missed';
                } else if (curDate.getTime() !== today.getTime()) obj.type = 'missed';
            }
        }
        mData[key].days.push(obj);
        curDate.setDate(curDate.getDate() + 1);
    }

    for (let k in mData) {
        let html = `<div class="month-block"><div class="month-title">${mData[k].name} ${mData[k].yr}</div><div class="days-grid">`;
        ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(d => html += `<div class="day-label">${d}</div>`);
        mData[k].days.forEach(d => {
            if (d.type === 'empty') html += `<div class="day-cell day-empty"></div>`;
            else html += `<div class="day-cell day-${d.type}" onclick="openDayModal('${d.dateStr}', '${d.type}', ${d.sdNum})">${d.dateNum}</div>`;
        });
        container.innerHTML += html + `</div></div>`;
    }
}

window.openDayModal = function (dateStr, type, sdNum) {
    const modal = document.getElementById('detailModal'), title = document.getElementById('modalDateTitle'), body = document.getElementById('modalTargetDetails');
    let d = new Date(dateStr);
    title.innerHTML = `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - <span style="font-size:0.8rem; color:var(--text-muted)">${type.toUpperCase()}</span>`;

    if (type === 'sunday' || type === 'empty') {
        body.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 20px;">SUNDAY / BREAK DAY<br>No new targets!</div>`;
    } else {
        let t1 = slot1Seq[sdNum - 1] || "Revision", t2 = slot2Seq[sdNum - 1] || "Revision", t3 = slot3Seq[sdNum - 1] || "Revision", p2 = prac2Seq[sdNum - 1] || "Revision";
        let log = db.dayLogs[sdNum], scoreText = log !== undefined ? `Checkpoints: ${log}/5` : (type === 'future' ? 'Status: Upcoming' : 'Checkpoints: --/5 (Missed)');
        let scoreColor = type === 'future' ? 'var(--neon-orange)' : 'var(--neon-blue)';
        body.innerHTML = `<div style="margin-bottom: 15px; font-weight: bold; color: ${scoreColor};">${scoreText}</div>
            <div class="modal-detail-item"><span>Slot 1:</span> <b>${t1}</b></div><div class="modal-detail-item"><span>Slot 2:</span> <b>${t2}</b></div>
            <div class="modal-detail-item"><span>Slot 3:</span> <b>${t3}</b></div><div class="modal-detail-item"><span>Aptitude:</span> <b>1 hr</b></div><div class="modal-detail-item"><span>Practice:</span> <b>${p2}</b></div>`;
    }
    modal.style.display = 'flex';
}
window.closeModalWindow = function () { document.getElementById('detailModal').style.display = 'none'; }
window.onclick = function (e) { if (e.target == document.getElementById('detailModal')) closeModalWindow(); }

window.recoverBacklog = function () {
    let tempBacklogs = { 'OS': 0, 'COA': 0, 'EM': 0, 'DM': 0, 'DBMS': 0, 'DLD': 0, 'Algo': 0, 'Apti': 0, 'Prac': 0 };
    for (let d = 1; d < currentStudyDayNum; d++) {
        if (db.missedLog[d]) {
            db.missedLog[d].forEach(sub => { if (tempBacklogs[sub] !== undefined) tempBacklogs[sub]++; else tempBacklogs['Prac']++; });
        }
    }
    if (db.recoveredLog) {
        for (let sub in db.recoveredLog) {
            if (tempBacklogs[sub] !== undefined) {
                tempBacklogs[sub] -= db.recoveredLog[sub];
                if (tempBacklogs[sub] < 0) tempBacklogs[sub] = 0;
            }
        }
    }

    let maxSub = null;
    let maxVal = 0;
    for (let sub in tempBacklogs) {
        if (tempBacklogs[sub] > maxVal) {
            maxVal = tempBacklogs[sub];
            maxSub = sub;
        }
    }

    if (maxSub) {
        if (!db.recoveredLog) db.recoveredLog = {};
        if (!db.recoveredLog[maxSub]) db.recoveredLog[maxSub] = 0;
        db.recoveredLog[maxSub]++;
    }

    db.extraWork = (db.extraWork || 0) + 1;
    saveData();
}

window.resetToday = function () {
    if (confirm("Undo Today's Lock?")) {
        let log = db.dayLogs[currentStudyDayNum];
        if (log !== undefined) {
            db.completedCheckpoints -= log;
            delete db.dayLogs[currentStudyDayNum];
            delete db.missedLog[currentStudyDayNum];
            if (db.historyRiskScore.length > 0) db.historyRiskScore.pop();
            saveData();
        }
    }
}

window.addCustomTask = function () {
    let input = document.getElementById('customTaskInput');
    let txt = input.value.trim();
    if (txt === "" || isTodaySunday) return;
    if (!db.customTasks[currentStudyDayNum]) db.customTasks[currentStudyDayNum] = [];
    db.customTasks[currentStudyDayNum].push(txt);
    input.value = "";
    saveData();
}

// Start Engine
loadData();