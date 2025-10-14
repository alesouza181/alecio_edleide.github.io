import { getState, salvarDados } from './database.js';
import { mostrarAlerta, mostrarConfirmacao, escapeHtml } from './utils.js';
import { getStatusIcon, atualizarEstatisticas, atualizarTotalInicial } from './guests.js';

export function atualizarTabelaGerenciamento() {
    const { convidados } = getState();
    const termoBusca = document.getElementById('busca-gerenciamento').value.toLowerCase();
    const tbody = document.querySelector('#tabela-gerenciamento tbody');
    tbody.innerHTML = '';

    const dadosFiltrados = convidados.filter(c => 
        c.representante.toLowerCase().includes(termoBusca) ||
        c.convidado.toLowerCase().includes(termoBusca)
    );

    if (dadosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d; padding: 40px;">📭 Nenhum convidado encontrado</td></tr>';
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
            <td class="action-buttons">
                <button onclick="alterarStatus(${convidado.id})" title="Alterar Status">
                    ${getNextStatusIcon(convidado.status)}
                </button>
                <button onclick="editarConvidado(${convidado.id})" title="Editar">✏️</button>
                <button onclick="removerConvidado(${convidado.id})" class="danger" title="Remover">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getNextStatusIcon(currentStatus) {
    switch(currentStatus) {
        case 'Confirmado': return '⏳';
        case 'Cancelado': return '⏳';
        default: return '✅';
    }
}

export function filtrarTabelaGerenciamento() {
    atualizarTabelaGerenciamento();
}

export async function alterarStatus(id) {
    const { convidados } = getState();
    const convidado = convidados.find(c => c.id === id);
    if (convidado) {
        if (convidado.status === 'Pendente') {
            convidado.status = 'Confirmado';
        } else {
            convidado.status = 'Pendente';
        }
        
        convidado.timestamp = new Date().toISOString();
        
        await salvarDados();
        atualizarTabelaGerenciamento();
        atualizarEstatisticas();
        atualizarTotalInicial();
        mostrarAlerta(`✅ Status alterado para "${convidado.status}" e salvo!`, 'success');
    }
}

export async function editarConvidado(id) {
    const { convidados } = getState();
    const convidado = convidados.find(c => c.id === id);
    if (!convidado) return;

    const novoRepresentante = prompt('✏️ Novo representante:', convidado.representante);
    if (novoRepresentante === null) return;

    const novoConvidadoNome = prompt('✏️ Novo nome do convidado:', convidado.convidado);
    if (novoConvidadoNome === null) return;

    if (!novoRepresentante.trim() || !novoConvidadoNome.trim()) {
        mostrarAlerta('❌ Campos não podem estar vazios!', 'error');
        return;
    }

    convidado.representante = novoRepresentante.trim();
    convidado.convidado = novoConvidadoNome.trim();
    convidado.data = new Date().toLocaleDateString('pt-BR');
    convidado.timestamp = new Date().toISOString();
    
    await salvarDados();
    atualizarTabelaGerenciamento();
    atualizarTotalInicial();
    mostrarAlerta('✅ Convidado editado e salvo no banco!', 'success');
}

export async function removerConvidado(id) {
    const { convidados } = getState();
    const convidado = convidados.find(c => c.id === id);
    if (!convidado) return;

    mostrarConfirmacao(
        `Tem certeza que deseja remover "${convidado.convidado}" (${convidado.representante})?`,
        async () => {
            getState().convidados = convidados.filter(c => c.id !== id);
            await salvarDados();
            atualizarTabelaGerenciamento();
            atualizarEstatisticas();
            atualizarTotalInicial();
            mostrarAlerta('✅ Convidado removido e salvo no banco!', 'success');
        }
    );
}

