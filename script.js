let processes = [];

document.getElementById('btnAdd').addEventListener('click', () => {
    const id = document.getElementById('procId').value || `P${processes.length + 1}`;
    const arrival = parseInt(document.getElementById('arrivalTime').value) || 0;
    const burst = parseInt(document.getElementById('burstTime').value) || 1;

    processes.push({ id, arrival, burst, remaining: burst, completed: false });
    updateTable();

    document.getElementById('procId').value = "";
    document.getElementById('arrivalTime').value = "";
    document.getElementById('burstTime').value = "";
});

function updateTable() {
    const tbody = document.getElementById('processList');
    tbody.innerHTML = processes.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
        </tr>
    `).join('');
}

document.getElementById('btnStart').addEventListener('click', () => {
    if (processes.length === 0) return alert("Aggiungi almeno un processo!");
    simulateSRTF();
});

document.getElementById('btnReset').addEventListener('click', () => {
    processes = [];
    updateTable();
    document.getElementById('resultArea').classList.add('hidden');
});

function simulateSRTF() {
    let tempProcesses = processes.map(p => ({ ...p }));
    let currentTime = 0;
    let completed = 0;
    let ganttData = [];
    let n = tempProcesses.length;

    while (completed < n) {
        let available = tempProcesses.filter(p => p.arrival <= currentTime && p.remaining > 0);

        if (available.length > 0) {
            available.sort((a, b) => a.remaining - b.remaining);
            let currentP = available[0];

            ganttData.push(currentP.id);
            currentP.remaining--;
            currentTime++;

            if (currentP.remaining === 0) {
                completed++;
                currentP.finishTime = currentTime;
                currentP.turnaround = currentP.finishTime - currentP.arrival;
                currentP.waiting = currentP.turnaround - currentP.burst;
            }
        } else {
            ganttData.push("Idle");
            currentTime++;
        }
    }
    renderResults(ganttData);
}
function renderResults(gantt) {
    const area = document.getElementById('resultArea');
    const chart = document.getElementById('ganttChart');
    area.classList.remove('hidden');

    const colors = {
        "Idle": "#444",
        "P1": "#22c55e",
        "P2": "#f59e0b",
        "P3": "#ef4444",
        "P4": "#3b82f6",
        "P5": "#a855f7"
    };

    let blocks = [];
    let current = gantt[0];
    let length = 1;

    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i] === current) {
            length++;
        } else {
            blocks.push({ name: current, len: length });
            current = gantt[i];
            length = 1;
        }
    }
    blocks.push({ name: current, len: length });

    chart.innerHTML = blocks.map(b => `
        <div class="gantt-block" 
             style="flex:${b.len}; background:${colors[b.name] || '#38bdf8'}">
            ${b.name}
        </div>
    `).join('');
}
