import { getState } from './database.js';
import { mostrarAlerta, fecharModal } from './utils.js';
import { buscarConvidados } from './guests.js';
import { atualizarTabelaGerenciamento } from './management.js';
import { atualizarRelatorio } from './reports.js';
import { carregarConfiguracoes } from './gifts.js';

let paginaAtual = 'lista';
let isAuthenticated = false;
let paginaDesejada = '';

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuIcon = document.getElementById('menuIcon');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        
        if (sidebar.classList.contains('show')) {
            menuIcon.textContent = '✕';
        } else {
            menuIcon.textContent = '☰';
        }
    }
}

export function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuIcon = document.getElementById('menuIcon');

    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    menuIcon.textContent = '☰';
}

function limparFiltrosPagina() {
    // Adicionar lógica para limpar campos de busca e filtros se necessário
}

export function mostrarPagina(pagina) {
    limparFiltrosPagina();
    
    const paginasProtegidas = ['gerenciamento', 'relatorio', 'configuracoes'];
    if (paginasProtegidas.includes(pagina) && !isAuthenticated) {
        paginaDesejada = pagina;
        document.getElementById('modalSenhaAcesso').style.display = 'flex';
        document.getElementById('senhaAcesso').focus();
        return;
    }
    
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(`${pagina}-page`).classList.add('active');
    document.getElementById(`nav-${pagina}`).classList.add('active');
    
    paginaAtual = pagina;
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    // Atualizar dados específicos da página
    if (pagina === 'lista') {
        buscarConvidados();
    } else if (pagina === 'gerenciamento') {
        atualizarTabelaGerenciamento();
    } else if (pagina === 'relatorio') {
        atualizarRelatorio();
    } else if (pagina === 'presentes') {


    } else if (pagina === 'configuracoes') {
        carregarConfiguracoes();
    }
}

export function verificarEnterSenha(event) {
    if (event.key === 'Enter') {
        verificarSenhaAcesso();
    }
}

export function verificarSenhaAcesso() {
    const senhaDigitada = document.getElementById('senhaAcesso').value;
    const { senhaMestra } = getState();

    if (senhaDigitada === senhaMestra) {
        isAuthenticated = true;
        fecharModal('modalSenhaAcesso');
        mostrarPagina(paginaDesejada);
        mostrarAlerta('✅ Acesso liberado!', 'success');
        document.getElementById('dbStatus').textContent = '🔓 DB Conectado';
        document.getElementById('dbStatus').classList.replace('db-connected', 'db-unlocked');
    } else {
        mostrarAlerta('❌ Senha incorreta!', 'error');
        document.getElementById('senhaAcesso').value = '';
        document.getElementById('senhaAcesso').focus();
    }
}

export function getPaginaAtual() {
    return paginaAtual;
}

export function getIsAuthenticated() {
    return isAuthenticated;
}

