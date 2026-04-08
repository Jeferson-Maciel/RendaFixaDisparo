/**
 * RendaFixa Pro - Motor Local (Offline-First)
 * Arquitetura Serverless baseada em SheetJS e Processamento em HashTabelas Javascript.
 */

// Elementos da UI
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');
const actionSection = document.getElementById('actionSection');
const resultDisplay = document.getElementById('resultDisplay');
const dbStatus = document.getElementById('dbStatus');
const marketToggle = document.getElementById('marketToggle');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');

let currentFileData = null;
let currentResultStr = '';
let currentStats = { total: 0, filtered: 0, best: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    dbStatus.innerHTML = '<span class="status-dot" style="background:#10b981;box-shadow:0 0 10px #10b981;"></span> Online (Local)';
    loadHistory();
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

removeFileBtn.addEventListener('click', () => {
    currentFileData = null;
    fileInput.value = '';
    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    actionSection.classList.add('hidden');
    resultDisplay.innerHTML = `<div class="empty-state"><div class="empty-icon">📈</div><p>Importe uma planilha para ver as melhores oportunidades de renda fixa</p></div>`;
    copyBtn.disabled = true;
    saveBtn.disabled = true;
    document.getElementById('statsBar').classList.add('hidden');
});

document.getElementById('clearBtn').addEventListener('click', () => {
    removeFileBtn.click();
});

marketToggle.addEventListener('change', () => {
    if (currentFileData) {
        processRows(currentFileData, marketToggle.checked);
    }
});

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function handleFile(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    actionSection.classList.remove('hidden');

    resultDisplay.innerHTML = `<div class="empty-state"><div class="spinner"></div><p>Processando via motor local...</p></div>`;
    copyBtn.disabled = true;
    saveBtn.disabled = true;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, {type: 'array', cellDates: true});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converte para Matriz (Array de Arrays)
        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        currentFileData = rows;
        
        processRows(rows, marketToggle.checked);
    } catch (e) {
        console.error(e);
        resultDisplay.innerHTML = `<div class="empty-state" style="color:var(--danger)"><div class="empty-icon" style="color:var(--danger)">❌</div><p>Erro ao ler o arquivo XLSX/CSV.</p></div>`;
    }
}

function removeAccents(str) {
    if (!str) return "";
    return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function parseTaxaLocal(raw) {
    if (!raw) return null;
    let s = String(raw).trim();
    if (!s) return null;
    
    if (typeof raw === 'number') {
        if (raw < 1 && raw > 0) return raw * 100;
        return raw;
    }
    
    // extrair numero real
    const match = s.match(/[\d\.,]+/);
    if (!match) return null;
    
    let numStr = match[0];
    if (numStr.includes(',') && numStr.includes('.')) {
        numStr = numStr.replace(/\./g, '').replace(',', '.');
    } else if (numStr.includes(',')) {
        numStr = numStr.replace(',', '.');
    }
    
    let val = parseFloat(numStr);
    if (!isNaN(val)) {
        if (s.includes('%') && val < 5 && val > 0 && String(raw).includes('CDI')) {
             return val; // CDI values aren't usually > 500
        }
        if (val < 1 && val > 0 && s.includes('%')) return val * 100;
        return val;
    }
    return null;
}

function parsePrazoLocal(raw) {
    if (!raw) return null;
    if (typeof raw === 'number') {
        const serialDate = new Date(Math.round((raw - 25569)*86400*1000));
        return calcularAnos(serialDate);
    }
    if (raw instanceof Date) {
        return calcularAnos(raw);
    }
    const txt = String(raw).toLowerCase().trim();
    const diasm = txt.match(/(\d+)\s*dias?/);
    if (diasm) {
        const dias = parseInt(diasm[1], 10);
        return Math.round(dias / 360);
    }
    const mesesm = txt.match(/(\d+)\s*mes(es)?/);
    if (mesesm) {
        const meses = parseInt(mesesm[1], 10);
        return Math.round(meses / 12);
    }
    const anosm = txt.match(/(\d+)\s*anos?/);
    if (anosm) {
        return parseInt(anosm[1], 10);
    }
    
    const datematch = txt.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (datematch) {
        const dt = new Date(`${datematch[3]}-${datematch[2]}-${datematch[1]}T12:00:00Z`);
        return calcularAnos(dt);
    }
    
    return null;
}

function calcularAnos(dateTarget) {
    const today = new Date();
    const diffTime = dateTarget - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return null;
    
    let anos_exatos = diffDays / 365;
    let delta = anos_exatos - Math.floor(anos_exatos);
    let extra_days = delta * 365;
    
    if (extra_days >= (365 - 90)) {
        return Math.ceil(anos_exatos);
    }
    return Math.floor(anos_exatos) > 0 ? Math.floor(anos_exatos) : null;
}

function normalizeTipoLocal(raw) {
    const s = removeAccents(String(raw));
    if (s.includes('cdb')) return 'CDB';
    if (s.includes('lca')) return 'LCA';
    if (s.includes('lci')) return 'LCI';
    if (s.includes('lc')) return 'LC';
    if (s.includes('lf')) return 'LF';
    if (s.includes('cri')) return 'CRI';
    if (s.includes('cra')) return 'CRA';
    if (s.includes('debenture')) return 'DEBÊNTURE';
    return null;
}

function processRows(rows, isSecundario) {
    if (!rows || rows.length === 0) return;
    
    // Regras Core O(N)
    let headerIdx = 0;
    let bestScore = 0;
    let limit = Math.min(rows.length, 15);
    const keywords = ['taxa', 'ativo', 'instrumento', 'vencimento', 'rentabilidade', 'juros'];
    
    for (let i = 0; i < limit; i++) {
        if (!rows[i]) continue;
        const sRow = rows[i].map(c => removeAccents(String(c)));
        let score = 0;
        for (let kw of keywords) {
            if (sRow.some(val => val.includes(kw))) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            headerIdx = i;
        }
    }
    
    const headers = rows[headerIdx] || [];
    const mapping = { tipo: -1, taxa: -1, indexador: -1, vencimento: -1, liquidez: -1, emissor: -1, emissao: -1 };
    
    headers.forEach((col, idx) => {
        if (!col) return;
        const norm = removeAccents(String(col));
        if (norm.includes('tipo') || norm.includes('ativo') || norm.includes('produto')) mapping.tipo = idx;
        if (norm.includes('taxa') || norm.includes('rentabilidade')) mapping.taxa = idx;
        if (norm.includes('indexador') || norm.includes('indice')) mapping.indexador = idx;
        if (norm.includes('vencimento') || norm.includes('prazo') || norm.includes('vertice')) mapping.vencimento = idx;
        if (norm.includes('emissor') || norm.includes('banco') || norm.includes('instituicao') || norm.includes('contraparte')) mapping.emissor = idx;
        if (norm.includes('emissao')) mapping.emissao = idx;
    });
    
    let total_filtered = 0;
    let prefixado = {};
    let posfixado = {};
    let ipca = {};
    let isentos = {};
    
    for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const getV = (key) => mapping[key] !== -1 ? row[mapping[key]] : null;
        
        let emissaoRaw = getV('emissao') ? String(getV('emissao')).trim() : '';
        let isSecRow = (emissaoRaw.length > 0 && emissaoRaw.toLowerCase() !== 'nan');
        
        if (isSecundario && !isSecRow) { total_filtered++; continue; }
        if (!isSecundario && isSecRow) { total_filtered++; continue; }
        
        let tipoRaw = getV('tipo') || '';
        let taxaRaw = getV('taxa');
        let indexadorRaw = getV('indexador') || '';
        let vencRaw = getV('vencimento');
        let liquidezRaw = String(getV('liquidez') || '').toUpperCase();
        let emissorRaw = getV('emissor') || '';
        
        if (liquidezRaw.includes('DIARIA') || liquidezRaw === 'D+0') {
            total_filtered++; continue;
        }
        
        let taxa = parseTaxaLocal(taxaRaw);
        if (!taxa && taxa !== 0) {
            for (let cell of row) {
                if (typeof cell === 'string' && cell.includes('%')) {
                    let test = parseTaxaLocal(cell);
                    if (test > 0) { taxa = test; break; }
                }
            }
        }
        
        if (!taxa || taxa <= 0) { total_filtered++; continue; }
        
        let prazo = parsePrazoLocal(vencRaw);
        if (!prazo || prazo <= 0) { total_filtered++; continue; }
        
        let tipoNorm = normalizeTipoLocal(tipoRaw);
        if (!tipoNorm) {
            for (let j=0; j<Math.min(5, row.length); j++) {
               let test = normalizeTipoLocal(row[j]);
               if (test) { tipoNorm = test; break; }
            }
        }
        
        if (!tipoNorm) { total_filtered++; continue; }
        
        let fullText = `${removeAccents(String(tipoRaw))} ${removeAccents(String(indexadorRaw))}`.toUpperCase();
        let cat = '';
        if (['LCA', 'LCI', 'CRI', 'CRA'].includes(tipoNorm)) cat = 'ISENTO';
        else if (fullText.includes('IPCA') || fullText.includes('INFLA')) cat = 'IPCA';
        else if (fullText.includes('CDI') || fullText.includes('SELIC') || fullText.includes('%')) cat = 'POS';
        else cat = 'PRE';
        
        let emissorIdent = '';
        if (emissorRaw && String(emissorRaw).trim().toLowerCase() !== 'nan' && String(emissorRaw).trim().length > 0) {
            emissorIdent = String(emissorRaw).trim();
        } else if (isSecundario || (!isSecundario && typeof row[0] === 'string')) {
            let desc = String(row[0] || '').toUpperCase();
            let m = desc.match(/(?:XP|BTG|ITAU|ITAÚ|BRADESCO|SANTANDER|SAFRA|BMG|DAYCOVAL|MASTER|PINE|C6|ABC|OMNI|ORIGINAL|PAN|SOFISA|FIBRA|BARI|BRB|INTER|MERCANTIL|MAXIMA|MÁXIMA|PAULISTA|VOTORANTIM|BV|CAIXA|MODAL|C6 BANK|SICOOB|SICREDI)/i);
            if (m) {
                emissorIdent = m[0].toUpperCase();
            } else {
                let parts = desc.split(/[\s\-]+/);
                for (let j=0; j<parts.length; j++) {
                    let w = parts[j];
                    if (["CDB","LCA","LCI","CRI","CRA","LC","LF","DEBENTURE"].includes(w) && j+1 < parts.length) {
                         let nextW = parts[j+1];
                         if (["BANCO", "BCO"].includes(nextW) && j+2 < parts.length) {
                             nextW = parts[j+2];
                         }
                         if (nextW.length > 2 && !nextW.match(/\d/)) {
                             emissorIdent = nextW;
                         }
                         break;
                    }
                }
            }
        }
        emissorIdent = emissorIdent.replace('S/A', '').replace('SA', '').trim();
        
        let entry = { taxa, tipo: tipoNorm, emissor: emissorIdent };
        
        if (cat === 'PRE') {
            if (!prefixado[prazo] || prefixado[prazo].taxa < taxa) prefixado[prazo] = entry;
        } else if (cat === 'POS') {
            if (!posfixado[prazo] || posfixado[prazo].taxa < taxa) posfixado[prazo] = entry;
        } else if (cat === 'IPCA') {
            if (!ipca[prazo] || ipca[prazo].taxa < taxa) ipca[prazo] = entry;
        } else if (cat === 'ISENTO') {
            let sub = 'PRE';
            if (fullText.includes('CDI') || fullText.includes('SELIC')) sub = 'CDI';
            else if (fullText.includes('IPCA')) sub = 'IPCA';
            
            if (sub === 'PRE' && prazo > 3) { total_filtered++; continue; }
            if (['CDI', 'IPCA'].includes(sub) && prazo > 2) { total_filtered++; continue; }
            
            let k = `${prazo}_${sub}`;
            if (!isentos[k] || isentos[k].taxa < taxa) isentos[k] = {...entry, subtype: sub};
        }
    }
    
    let total_best = Object.keys(prefixado).length + Object.keys(posfixado).length + Object.keys(ipca).length + Object.keys(isentos).length;
    
    currentStats.total = rows.length - headerIdx - 1;
    currentStats.filtered = total_filtered;
    currentStats.best = total_best;
    
    renderResult(prefixado, posfixado, ipca, isentos, isSecundario);
}

function fmtT(num) {
    let s = num.toFixed(2).replace('.', ',');
    if (s.endsWith(',00')) return s.slice(0, -3);
    return s;
}

function fmtP(a) { return a === 1 ? '1 ano' : `${a} anos`; }

function renderResult(prefixado, posfixado, ipca, isentos, isSec) {
    let lines = [];
    let title = `*Oportunidades de RENDA FIXA hoje!* ⭐${isSec ? '\n(MERCADO SECUNDÁRIO)' : ''}\n`;
    lines.push(title);
    
    let has = false;
    
    let preK = Object.keys(prefixado).map(Number).filter(k => k <= 7).sort((a,b)=>a-b);
    if (preK.length) {
        has = true;
        lines.push('*Taxas pré fixadas:*');
        preK.forEach(k => {
            let e = prefixado[k];
            let em = (isSec && e.emissor) ? ` (${e.emissor})` : '';
            lines.push(`-> ${fmtP(k)} - ${e.tipo} ${fmtT(e.taxa)}% a.a.${em}`);
        });
        lines.push('');
    }
    
    let posK = Object.keys(posfixado).map(Number).filter(k => k >= 2 && k <= 6).sort((a,b)=>a-b);
    if (posK.length) {
        has = true;
        lines.push('*Taxas Pós-fixadas:*');
        posK.forEach(k => {
            let e = posfixado[k];
            let em = (isSec && e.emissor) ? ` (${e.emissor})` : '';
            lines.push(`-> ${fmtP(k)} - ${e.tipo} ${fmtT(e.taxa)}% CDI${em}`);
        });
        lines.push('');
    }
    
    let ipcaK = Object.keys(ipca).map(Number).filter(k => k <= 3).sort((a,b)=>a-b);
    if (ipcaK.length) {
        has = true;
        lines.push('*Taxas IPCA+:*');
        ipcaK.forEach(k => {
            let e = ipca[k];
            let em = (isSec && e.emissor) ? ` (${e.emissor})` : '';
            lines.push(`-> ${fmtP(k)} - ${e.tipo} IPCA + ${fmtT(e.taxa)}% a.a.${em}`);
        });
        lines.push('');
    }
    
    let isK = Object.keys(isentos).sort((a,b) => parseInt(a.split('_')[0]) - parseInt(b.split('_')[0]));
    if (isK.length) {
        has = true;
        lines.push('*LCAs/LCIs ISENTA DE IR:*');
        isK.forEach(k => {
            let e = isentos[k];
            let p = parseInt(k.split('_')[0]);
            let em = (isSec && e.emissor) ? ` (${e.emissor})` : '';
            if (e.subtype === 'CDI') lines.push(`-> ${fmtP(p)} – ${e.tipo} ${fmtT(e.taxa)}% CDI${em}`);
            else if (e.subtype === 'IPCA') lines.push(`-> ${fmtP(p)} – ${e.tipo} IPCA +${fmtT(e.taxa)}%${em}`);
            else lines.push(`-> ${fmtP(p)} – ${e.tipo} ${fmtT(e.taxa)}% a.a.${em}`);
        });
    }
    
    if (!has) {
        currentResultStr = "Nenhuma oportunidade refinada encontrada na planilha com esses filtros.";
        resultDisplay.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${currentResultStr}</p></div>`;
    } else {
        currentResultStr = lines.join('\n');
        resultDisplay.innerHTML = `<pre class="result-text">${escapeHTML(currentResultStr)}</pre>`;
        copyBtn.disabled = false;
        saveBtn.disabled = false;
    }
    
    document.getElementById('statsBar').classList.remove('hidden');
    document.getElementById('statTotal').innerText = currentStats.total;
    document.getElementById('statFiltered').innerText = currentStats.filtered;
    document.getElementById('statBest').innerText = currentStats.best;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Interações Resposta
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(currentResultStr);
        const toast = document.getElementById('toast');
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    } catch (err) {
        console.error('Falha ao copiar:', err);
    }
});

saveBtn.addEventListener('click', () => {
    let history = JSON.parse(localStorage.getItem('rendafixa_history') || '[]');
    history.unshift({
        id: Date.now(),
        resultado: currentResultStr,
        total_ativos: currentStats.total,
        total_oportunidades: currentStats.best,
        created_at: new Date().toISOString()
    });
    
    if (history.length > 20) history = history.slice(0, 20); // max 20
    localStorage.setItem('rendafixa_history', JSON.stringify(history));
    
    saveBtn.innerHTML = "<span>✅</span> Salvo";
    saveBtn.style.background = "var(--success)";
    saveBtn.disabled = true;
    
    loadHistory();
});

// History do LocalStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('rendafixa_history') || '[]');
    
    if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
    }
    
    historySection.classList.remove('hidden');
    historyList.innerHTML = history.map(record => {
        const date = new Date(record.created_at).toLocaleString('pt-BR');
        return `
            <div class="history-item">
                <div class="history-meta">
                    <span class="history-date">${date}</span>
                    <span class="tag">Ativos Lidos: ${record.total_ativos}</span>
                    <span class="tag tag-accent">Oportunidades: ${record.total_oportunidades}</span>
                </div>
                <div class="history-content">
                    <pre>${escapeHTML(record.resultado.substring(0, 300))}${record.resultado.length > 300 ? '...\n(Resultado truncado)' : ''}</pre>
                </div>
                <div class="history-action-bar">
                    <button class="btn-icon delete-btn" onclick="deleteHistory(${record.id})">🗑️ Excluir</button>
                    <button class="btn-small" onclick="navigator.clipboard.writeText('${escapeHTML(record.resultado).replace(/\n/g, '\\n')}'); alert('Copiado do Histórico!')">📋 Copiar Todo</button>
                </div>
            </div>
        `;
    }).join('');
}

window.deleteHistory = function(id) {
    if(confirm('Apagar este registro salvo?')) {
        let history = JSON.parse(localStorage.getItem('rendafixa_history') || '[]');
        history = history.filter(h => h.id !== id);
        localStorage.setItem('rendafixa_history', JSON.stringify(history));
        loadHistory();
    }
}
