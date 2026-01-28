let processi = [];

document.getElementById('btnAggiungi').addEventListener('click', () => {
    const id = document.getElementById('idProcesso').value || `P${processi.length + 1}`;
    const arrivo = parseInt(document.getElementById('tempoArrivo').value) || 0;
    const burst = parseInt(document.getElementById('tempoBurst').value) || 1;

    processi.push({ id, arrivo, burst, rimanente: burst, burstOriginale: burst });

    const corpoTabella = document.getElementById('tabellaProcessi');
    corpoTabella.innerHTML += `
        <tr>
            <td>${id}</td>
            <td>${arrivo}</td>
            <td class="text-center">${burst}</td>
        </tr>`;

    document.getElementById('idProcesso').value = "";
    document.getElementById('tempoArrivo').value = "";
    document.getElementById('tempoBurst').value = "";
});


document.getElementById('btnAvvia').addEventListener('click', () => {
    if (processi.length === 0) return alert("Aggiungi processi!");
    simulaSRTF();
});

function simulaSRTF() {
    let temp = processi.map(p => ({ ...p, rimanente: parseInt(p.burst), fineTempo: 0 }));
    let tempoCorrente = 0;
    let completati = 0;
    let datiGantt = [];
    let lavoroTotale = 0;

    temp.forEach(p => lavoroTotale += p.burstOriginale);

    while (completati < temp.length) {
        let validi = temp.filter(p => p.arrivo <= tempoCorrente && p.rimanente > 0);

        if (validi.length > 0) {
            validi.sort((a, b) => a.rimanente - b.rimanente || a.arrivo - b.arrivo);
            let p = validi[0];

            datiGantt.push(p.id);
            p.rimanente--;
            tempoCorrente++;

            if (p.rimanente === 0) {
                completati++;
                p.fineTempo = tempoCorrente;
            }
        } else {
            datiGantt.push("Idle");
            tempoCorrente++;
        }
    }

    disegnaGantt(datiGantt);
    calcolaMedie(temp, tempoCorrente, lavoroTotale);
}

function disegnaGantt(gantt) {
    document.getElementById('areaRisultati').classList.remove('d-none');
    const grafico = document.getElementById('graficoGantt');
    grafico.innerHTML = "";

    let blocchi = [];
    let attuale = gantt[0];
    let durata = 1;

    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i] === attuale) {
            durata++;
        } else {
            blocchi.push({ id: attuale, size: durata });
            attuale = gantt[i];
            durata = 1;
        }
    }
    blocchi.push({ id: attuale, size: durata });

    blocchi.forEach(b => {
        let colore = b.id === "Idle" ? "#6c757d" : "#0d6efd";
        grafico.innerHTML += `<div class="gantt-block" style="flex: ${b.size}; background: ${colore}">${b.id}</div>`;
    });

}

function calcolaMedie(finiti, tempoTotale, lavoro) {
    let sommaAttesa = 0;
    let sommaBurst = 0;

    finiti.forEach(p => {
        let attesa = p.fineTempo - p.arrivo - p.burstOriginale;
        sommaAttesa += attesa;
        sommaBurst += p.burstOriginale;
    });

    document.getElementById('mediaBurst').innerText = (sommaBurst / finiti.length).toFixed(2) + " ms";
    document.getElementById('mediaAttesa').innerText = (sommaAttesa / finiti.length).toFixed(2) + " ms";
    document.getElementById('efficienzaCpu').innerText = ((lavoro / tempoTotale) * 100).toFixed(1) + "%";
}

document.getElementById('btnReset').addEventListener('click', () => {
    location.reload();
});
