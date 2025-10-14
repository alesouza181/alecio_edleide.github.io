// ==================== FUNÇÕES DE NAVEGAÇÃO ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
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

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuIcon = document.getElementById('menuIcon');

    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    menuIcon.textContent = '☰';
}

let paginaAtual = 'lista';
let isAuthenticated = false;
let senhaMestra = '123'; // Senha para acesso às páginas protegidas

function mostrarPagina(pagina) {
    if (['gerenciamento', 'relatorio', 'configuracoes'].includes(pagina) && !isAuthenticated) {
        document.getElementById('modalSenhaAcesso').style.display = 'flex';
        document.getElementById('senhaAcesso').value = '';
        document.getElementById('senhaAcesso').focus();
        return;
    }

    const paginas = document.querySelectorAll('.page-content');
    paginas.forEach(p => p.classList.remove('active'));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    document.getElementById(`${pagina}-page`).classList.add('active');
    document.getElementById(`nav-${pagina}`).classList.add('active');
    paginaAtual = pagina;

    // Atualizar conteúdo específico da página
    if (pagina === 'lista') {
        buscarConvidados();
    } else if (pagina === 'gerenciamento') {
        atualizarTabelaGerenciamento();
    } else if (pagina === 'relatorio') {
        atualizarRelatorio();
    } else if (pagina === 'configuracoes') {
        carregarConfiguracoes();
        renderizarPresentesCadastrados();
    }

    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

function verificarEnterSenha(event) {
    if (event.key === 'Enter') {
        verificarSenhaAcesso();
    }
}

function verificarSenhaAcesso() {
    const senhaDigitada = document.getElementById('senhaAcesso').value;
    if (senhaDigitada === senhaMestra) {
        isAuthenticated = true;
        fecharModal('modalSenhaAcesso');
        mostrarPagina(paginaAtual); // Tenta mostrar a página novamente
        mostrarAlerta('✅ Acesso liberado!', 'success');
        document.getElementById('dbStatus').textContent = '🔓 DB Conectado';
        document.getElementById('dbStatus').classList.remove('db-connected');
        document.getElementById('dbStatus').classList.add('db-unlocked');
    } else {
        mostrarAlerta('❌ Senha incorreta!', 'error');
        document.getElementById('senhaAcesso').value = '';
        document.getElementById('senhaAcesso').focus();
    }
}

// ==================== BANCO DE DADOS (LocalStorage) ====================
let convidados = [];
let proximoId = 1;
let senhaAtual = 'admin123'; // Senha para alterar configurações
let configuracoes = {
    coupleNames: '',
    pixKey: '',
    welcomeMessage: '',
    gifts: []
};

const DB_KEY = 'gerenciadorConvidadosDB';

function carregarDados() {
    const dadosSalvos = localStorage.getItem(DB_KEY);
    if (dadosSalvos) {
        const parsedData = JSON.parse(dadosSalvos);
        convidados = parsedData.convidados || [];
        proximoId = parsedData.proximoId || 1;
        senhaAtual = parsedData.senhaAtual || 'admin123';
        configuracoes = parsedData.configuracoes || {
            coupleNames: '',
            pixKey: '',
            welcomeMessage: '',
            gifts: []
        };

        // Garantir que proximoId seja maior que os IDs existentes
        if (convidados.length > 0) {
            const maxId = Math.max(...convidados.map(c => c.id));
            proximoId = maxId + 1;
        }
    }
}

async function salvarDados() {
    const dadosParaSalvar = {
        convidados,
        proximoId,
        senhaAtual,
        configuracoes
    };
    localStorage.setItem(DB_KEY, JSON.stringify(dadosParaSalvar));
    // Simular sincronização com 
