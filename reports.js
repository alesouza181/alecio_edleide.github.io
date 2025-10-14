import { getState } from './database.js';
import { escapeHtml } from './utils.js';
import { getStatusIcon } from './guests.js';

export function atualizarRelatorio() {
    atualizarEstatisticasRepresentantes();
    atualizarFiltroRepresentantes();
    filtrarRelatorio();
}

function atualizarEstatisticasRepresentantes() {
    const { convidados } = getState();
    const container = document.getElementById('stats-representantes');
    const representantes = [...new Set(convidados.map(c => c.representante))];
    
    let html = '';
    representantes.forEach(rep => {
        const convidadosRep = convidados.filter(c => c.representante === rep);
        const confirmados = convidadosRep.filter(c => c.status === 'Confirmado').length;
        const cancelados = convidadosRep.filter(c => c.status === 'Cancelado').length;
        const total = convidadosRep.length;
        const percentual = total > 0 ? Math.round((confirmados / total) * 100) : 0;
        
        html += `
            <div class="stat-representante">
                <h4 style="margin: 0 0 15px 0; color: #1e40af; font-size: 1.2rem;">${escapeHtml(rep)}</h4>
                <p style="margin: 8px 0; display: flex; justify-content: space-between;">📊 Total: <strong>${total}</strong></p>
                <p style="margin: 8px 0; color: #16a34a; display: flex; justify-content: space-between;">✅ Confirmados: <strong>${confirmados}</strong></p>
                <p style="margin: 8px 0; color: #f59e0b; display: flex; justify-content: space-between;">⏳ Pendentes: <strong>${total - confirmados - cancelados}</strong></p>
                <p style="margin: 8px 0; color: #dc2626; display: flex; justify-content: space-between;">❌ Cancelados: <strong>${cancelados}</strong></p>
                <p style="margin: 8px 0; color: #1e40af; font-weight: 600; display: flex; justify-content: space-between;">📈 Taxa: <strong>${percentual}%</strong></p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function atualizarFiltroRepresentantes() {
    const { convidados } = getState();
    const select = document.getElementById('filtro-representante');
    const representantes = [...new Set(convidados.map(c => c.representante))];
    
    let html = '<option value="">Todos os Representantes</option>';
    representantes.forEach(rep => {
        html += `<option value="${escapeHtml(rep)}">${escapeHtml(rep)}</option>`;
    });
    
    select.innerHTML = html;
}

export function filtrarRelatorio() {
    const { convidados } = getState();
    const termoBusca = document.getElementById('busca-relatorio').value.toLowerCase();
    const filtroRep = document.getElementById('filtro-representante').value;
    const filtroStatus = document.getElementById('filtro-status').value;
    const tbody = document.querySelector('#tabela-relatorio tbody');
    
    let dadosFiltrados = convidados;
    
    if (termoBusca.trim()) {
        dadosFiltrados = dadosFiltrados.filter(c => 
            c.representante.toLowerCase().includes(termoBusca) ||
            c.convidado.toLowerCase().includes(termoBusca)
        );
    }
    
    if (filtroRep) {
        dadosFiltrados = dadosFiltrados.filter(c => c.representante === filtroRep);
    }
    
    if (filtroStatus) {
        dadosFiltrados = dadosFiltrados.filter(c => c.status === filtroStatus);
    }
    
    tbody.innerHTML = '';
    
    if (dadosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6c757d; padding: 40px;">📭 Nenhum registro encontrado</td></tr>';
        return;
    }
    
    dadosFiltrados.forEach(convidado => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(convidado.representante)}</td>
            <td>${escapeHtml(convidado.convidado)}</td>
            <td>
                <span class="status-badge status-${convidado.status.toLowerCase()}">
                    ${getStatusIcon(convidado.status)} ${convidado.status}
                </span>
            </td>
            <td>${convidado.data}</td>
        `;
        tbody.appendChild(tr);
    });
}

export function exportarRelatorio() {
    const { convidados } = getState();
    if (convidados.length === 0) {
        mostrarAlerta('⚠️ Não há dados para gerar relatório!', 'error');
        return;
    }

    const stats = {
        total: convidados.length,
        confirmados: convidados.filter(c => c.status === 'Confirmado').length,
        pendentes: convidados.filter(c => c.status === 'Pendente').length,
        cancelados: convidados.filter(c => c.status === 'Cancelado').length
    };
    stats.taxa = stats.total > 0 ? Math.round((stats.confirmados / stats.total) * 100) : 0;

    const representantes = [...new Set(convidados.map(c => c.representante))];
    let statsHtml = '';
    representantes.forEach(rep => {
        const convidadosRep = convidados.filter(c => c.representante === rep);
        const confirmadosRep = convidadosRep.filter(c => c.status === 'Confirmado').length;
        const canceladosRep = convidadosRep.filter(c => c.status === 'Cancelado').length;
        const totalRep = convidadosRep.length;
        const percentual = totalRep > 0 ? Math.round((confirmadosRep / totalRep) * 100) : 0;
        
        statsHtml += `
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${escapeHtml(rep)}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${totalRep}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #16a34a;">${confirmadosRep}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #f59e0b;">${totalRep - confirmadosRep - canceladosRep}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #dc2626;">${canceladosRep}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #1e40af;">${percentual}%</td>
            </tr>
        `;
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Convidados</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; border-radius: 8px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
        .stat { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #1e40af; margin: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; }
        tr:nth-child(even) { background-color: #f8fafc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Relatório de Convidados</h1>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <h3>Total</h3>
            <p style="font-size: 2em; font-weight: bold; color: #1e40af;">${stats.total}</p>
        </div>
        <div class="stat">
            <h3>Confirmados</h3>
            <p style="font-size: 2em; font-weight: bold; color: #16a34a;">${stats.confirmados}</p>
        </div>
        <div class="stat">
            <h3>Pendentes</h3>
            <p style="font-size: 2em; font-weight: bold; color: #f59e0b;">${stats.pendentes}</p>
        </div>
        <div class="stat">
            <h3>Cancelados</h3>
            <p style="font-size: 2em; font-weight: bold; color: #dc2626;">${stats.cancelados}</p>
        </div>
        <div class="stat">
            <h3>Taxa</h3>
            <p style="font-size: 2em; font-weight: bold; color: #1e40af;">${stats.taxa}%</p>
        </div>
    </div>
    
    <h2>📈 Estatísticas por Representante</h2>
    <table>
        <thead>
            <tr>
                <th>Representante</th>
                <th>Total</th>
                <th>Confirmados</th>
                <th>Pendentes</th>
                <th>Cancelados</th>
                <th>Taxa</th>
            </tr>
        </thead>
        <tbody>${statsHtml}</tbody>
    </table>
    
    <h2>👥 Lista Completa</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Representante</th>
                <th>Convidado</th>
                <th>Status</th>
                <th>Data</th>
            </tr>
        </thead>
        <tbody>
            ${getState().convidados.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td>${escapeHtml(c.representante)}</td>
                    <td>${escapeHtml(c.convidado)}</td>
                    <td style="color: ${c.status === 'Confirmado' ? '#16a34a' : c.status === 'Cancelado' ? '#dc2626' : '#f59e0b'};">${c.status}</td>
                    <td>${c.data}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `relatorio_convidados_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarAlerta('📊 Relatório HTML exportado com sucesso!', 'success');
}
