import { carregarDados, salvarDados, importarBanco, exportarBanco, getState } from './database.js';
import { toggleSidebar, closeSidebar, mostrarPagina, verificarEnterSenha, verificarSenhaAcesso, getPaginaAtual } from './navigation.js';
import { buscarConvidados, adicionarConvidado, atualizarTodasTabelas, atualizarEstatisticas, atualizarTotalInicial, importarArquivo, exportarCSV, abrirModalAdicionar } from './guests.js';
import { atualizarTabelaGerenciamento, filtrarTabelaGerenciamento, alterarStatus, editarConvidado, removerConvidado } from './management.js';
import { atualizarRelatorio, filtrarRelatorio, exportarRelatorio } from './reports.js';
import { updateGiftDisplay, openGiftModal, closeGiftModal, carregarConfiguracoes, salvarConfiguracoes, adicionarPresente, renderizarPresentesCadastrados, removerPresente, formatGiftCurrency, sincronizarBanco, exportarBackup, importarBackup, alterarSenha } from './gifts.js';
import { fecharModal, mostrarConfirmacao } from './utils.js';

// Expor funções globalmente para que possam ser chamadas do HTML
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.mostrarPagina = mostrarPagina;
window.verificarEnterSenha = verificarEnterSenha;
window.verificarSenhaAcesso = verificarSenhaAcesso;
window.buscarConvidados = buscarConvidados;
window.adicionarConvidado = adicionarConvidado;
window.atualizarTodasTabelas = atualizarTodasTabelas;
window.atualizarEstatisticas = atualizarEstatisticas;
window.atualizarTotalInicial = atualizarTotalInicial;
window.importarArquivo = (event) => importarArquivo(event.target.files[0]);
window.exportarCSV = exportarCSV;
window.abrirModalAdicionar = abrirModalAdicionar;
window.atualizarTabelaGerenciamento = atualizarTabelaGerenciamento;
window.filtrarTabelaGerenciamento = filtrarTabelaGerenciamento;
window.alterarStatus = alterarStatus;
window.editarConvidado = editarConvidado;
window.removerConvidado = removerConvidado;
window.atualizarRelatorio = atualizarRelatorio;
window.filtrarRelatorio = filtrarRelatorio;
window.exportarRelatorio = exportarRelatorio;
window.openGiftModal = openGiftModal;
window.closeGiftModal = closeGiftModal;
window.carregarConfiguracoes = carregarConfiguracoes;
window.salvarConfiguracoes = salvarConfiguracoes;
window.adicionarPresente = adicionarPresente;
window.renderizarPresentesCadastrados = renderizarPresentesCadastrados;
window.removerPresente = removerPresente;
window.formatGiftCurrency = formatGiftCurrency;
window.sincronizarBanco = sincronizarBanco;
window.exportarBackup = exportarBackup;
window.importarBackup = (event) => importarBackup(event.target.files[0]);
window.alterarSenha = alterarSenha;
window.fecharModal = fecharModal;
window.mostrarConfirmacao = mostrarConfirmacao;

// ==================== EVENT LISTENERS GLOBAIS ====================

// Fechar modais clicando fora
window.onclick = function(event) {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
};

// Redimensionamento da janela
window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        const menuIcon = document.getElementById("menuIcon");
        
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
        menuIcon.textContent = "☰";
    }
});

// Atalhos de teclado
document.addEventListener("keydown", function(e) {
    // Escape para fechar modais e sidebar
    if (e.key === "Escape") {
        const modals = document.querySelectorAll(".modal");
        modals.forEach(modal => {
            if (modal.style.display === "block" || modal.style.display === "flex") {
                modal.style.display = "none";
            }
        });
        
        // Fechar sidebar no mobile
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }
    
    // Ctrl+N para novo convidado
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (getPaginaAtual() === "gerenciamento" && getState().isAuthenticated) {
            abrirModalAdicionar();
        }
    }
    
    // Ctrl+F para focar na busca
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const paginaAtual = getPaginaAtual();
        if (paginaAtual === "lista") {
            document.getElementById("busca-lista").focus();
        } else if (paginaAtual === "gerenciamento" && getState().isAuthenticated) {
            document.getElementById("busca-gerenciamento").focus();
        } else if (paginaAtual === "relatorio" && getState().isAuthenticated) {
            document.getElementById("busca-relatorio").focus();
        }
    }
    
    // Ctrl+S para salvar/sincronizar
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (getState().isAuthenticated) {
            sincronizarBanco();
        }
    }
});

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    mostrarPagina("lista");
    atualizarEstatisticas();
    atualizarTotalInicial();
    
});

