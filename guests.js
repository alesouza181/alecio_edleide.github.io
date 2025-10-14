import { getState, salvarDados } from './database.js';
import { mostrarAlerta, mostrarConfirmacao, escapeHtml } from './utils.js';
import { getIsAuthenticated } from './navigation.js';

export function adicionarConvidado(event) {
    event.preventDefault();
    const { convidados, proximoId } = getState();

    const novoRepresentante = document.getElementById('novoRepresentante').value.trim();
    const novoConvidadoNome = document.getElementById('novoConvidado').value.trim();

    if (!novoRepresentante || !novoConvidadoNome) {
        mostrarAlerta('❌ Por favor, preencha todos os campos!', 'error');
        return;
    }

    const duplicata = convidados.find(c => 
        c.representante.toLowerCase() === novoRepresentante.toLowerCase() && 
        c.convidado.toLowerCase() === novoConvidadoNome.toLowerCase()
    );

    if (duplicata) {
        mostrarAlerta('⚠️ Convidado já existe para este representante!', 'warning');
        return;
    }

    convidados.push({
        id: proximoId,
        representante: novoRepresentante,
        convidado: novoConvidadoNome,
        status: 'Pendente',
        data: new Date().toLocaleDateString('pt-BR'),
        timestamp: new Date().toISOString()
    });

    getState().proximoId++;
    salvarDados();
    atualizarTodasTabelas();
    atualizarEstatisticas();
    atualizarTotalInicial();
    mostrarAlerta('✅ Convidado adicionado e salvo no banco!', 'success');

    document.getElementById('novoRepresentante').value = '';
    document.getElementById('novoConvidado').value = '';
    document.getElementById('modalAdicionar').style.display = 'none';
}

export function buscarConvidados() {
    const { convidados } = getState();
    const termoBusca = document.getElementById('busca-lista').value.toLowerCase();
    const tbody = document.querySelector('#tabela-convidados tbody');
    tbody.innerHTML = '';

    const dadosFiltrados = convidados.filter(convidado => 
        convidado.representante.toLowerCase().includes(termoBusca) ||
        convidado.convidado.toLowerCase().includes(termoBusca)
    );

    if (dadosFiltrados.length === 0) {
        document.getElementById('initial-message').style.display = 'block';
        document.getElementById('tabela-convidados').style.display = 'none';
        return;
    }

    document.getElementById('initial-message').style.display = 'none';
    document.getElementById('tabela-convidados').style.display = 'table';

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

export function getStatusIcon(currentStatus) {
    switch(currentStatus) {
        case 'Confirmado': return '✅';
        case 'Pendente': return '⏳';
        case 'Cancelado': return '❌';
        default: return '';
    }
}

export function atualizarTodasTabelas() {
    buscarConvidados();
    if (getIsAuthenticated()) {
        // Funções de gerenciamento e relatório serão importadas aqui
    }
}

export function atualizarEstatisticas() {
    const { convidados } = getState();
    const total = convidados.length;
    const confirmados = convidados.filter(c => c.status === 'Confirmado').length;
    const pendentes = convidados.filter(c => c.status === 'Pendente').length;
    const cancelados = convidados.filter(c => c.status === 'Cancelado').length;
    const taxa = total > 0 ? Math.round((confirmados / total) * 100) : 0;

    const totalEl = document.getElementById('total');
    const confirmadosEl = document.getElementById('confirmados');
    const pendentesEl = document.getElementById('pendentes');
    const canceladosEl = document.getElementById('cancelados');
    const taxaEl = document.getElementById('taxa');

    if (totalEl) totalEl.textContent = total;
    if (confirmadosEl) confirmadosEl.textContent = confirmados;
    if (pendentesEl) pendentesEl.textContent = pendentes;
    if (canceladosEl) canceladosEl.textContent = cancelados;
    if (taxaEl) taxaEl.textContent = taxa + '%';
}

export function atualizarTotalInicial() {
    const { convidados } = getState();
    const totalInicialElement = document.getElementById('total-inicial');
    if (totalInicialElement) {
        totalInicialElement.textContent = convidados.length;
    }
}

export function importarArquivo(arquivo) {
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const conteudo = e.target.result;
            const linhas = conteudo.split('\n').filter(linha => linha.trim());
            
            let adicionados = 0;
            let erros = 0;
            let duplicatas = 0;

            linhas.forEach((linha, index) => {
                if (index === 0 && linha.toLowerCase().includes('representante')) {
                    return;
                }

                const partes = linha.split(',').map(p => p.trim().replace(/"/g, ''));
                
                if (partes.length >= 2 && partes[0] && partes[1]) {
                    const representante = partes[0];
                    const convidado = partes[1];
                    
                    const duplicata = getState().convidados.find(c => 
                        c.representante.toLowerCase() === representante.toLowerCase() && 
                        c.convidado.toLowerCase() === convidado.toLowerCase()
                    );

                    if (!duplicata) {
                        getState().convidados.push({
                            id: getState().proximoId++,
                            representante,
                            convidado,
                            status: 'Pendente',
                            data: new Date().toLocaleDateString('pt-BR'),
                            timestamp: new Date().toISOString()
                        });
                        adicionados++;
                    } else {
                        duplicatas++;
                    }
                } else if (linha.trim()) {
                    erros++;
                }
            });

            await salvarDados();
            atualizarTodasTabelas();
            atualizarEstatisticas();
            atualizarTotalInicial();
            
            let mensagem = `📥 Importação concluída e salva no banco!<br>✅ ${adicionados} convidados adicionados`;
            if (duplicatas > 0) mensagem += `<br>⚠️ ${duplicatas} duplicatas ignoradas`;
            if (erros > 0) mensagem += `<br>❌ ${erros} linhas com erro`;
            
            mostrarAlerta(mensagem, adicionados > 0 ? 'success' : 'error');
            
            document.getElementById('arquivo').value = '';
            
        } catch (error) {
            mostrarAlerta('❌ Erro ao processar arquivo!', 'error');
        }
    };
    reader.readAsText(arquivo);
}

export function exportarCSV() {
    const { convidados } = getState();
    if (convidados.length === 0) {
        mostrarAlerta('⚠️ Não há dados para exportar!', 'error');
        return;
    }

    let csv = 'ID,Representante,Convidado,Status,Data\n';
    convidados.forEach(c => {
        csv += `${c.id},"${c.representante}","${c.convidado}","${c.status}","${c.data}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `convidados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarAlerta('📤 Arquivo CSV exportado com sucesso!', 'success');
}

export function abrirModalAdicionar() {
    document.getElementById('modalAdicionar').style.display = 'flex';
    document.getElementById('novoRepresentante').focus();
}

