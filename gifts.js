import { getState, salvarDados } from './database.js';
import { mostrarAlerta, mostrarConfirmacao, fecharModal, escapeHtml } from './utils.js';
import { atualizarTodasTabelas } from './guests.js';

// ==================== FUNÇÕES DE PRESENTES ====================
export function updateGiftDisplay() {
    const { configuracoes } = getState();
    const giftsContainer = document.getElementById('gifts-container');
    if (!giftsContainer) return;

    giftsContainer.innerHTML = '';

    if (configuracoes.gifts.length === 0) {
        giftsContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum presente cadastrado ainda.</p>';
        return;
    }

    configuracoes.gifts.forEach(gift => {
        const giftCard = document.createElement('div');
        giftCard.className = 'gift-card';
       // giftCard.addEventListener(\'click\', () => openGiftModal(gift)); // Removido para evitar abertura automática        giftCard.innerHTML = `
            <div class="text-4xl mb-4 text-center">${gift.emoji}</div>
            <h3 class="text-xl font-semibold text-center text-gray-800 mb-2">${escapeHtml(gift.name)}</h3>
            <p class="text-center text-pink-600 font-bold text-lg mb-4">R$ ${parseFloat(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p class="text-center text-gray-600 text-sm">${escapeHtml(gift.description)}</p>
        `;
        giftsContainer.appendChild(giftCard);
    });
}

export function openGiftModal(gift) {
    const { configuracoes } = getState();
    document.getElementById('modalTitle').textContent = gift.name;
    document.getElementById('modalEmoji').textContent = gift.emoji;
    document.getElementById('modalPrice').textContent = `R$ ${parseFloat(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('pixKeyDisplay').textContent = configuracoes.pixKey;

    // Gerar QR Code
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = ''; // Limpar QR Code anterior
    if (configuracoes.pixKey) {
        // Usar uma API de QR Code ou biblioteca local
        // Exemplo simples com API externa (pode ser substituído por uma biblioteca local como qrcode.js)
        const pixData = `00020126360014BR.GOV.BCB.PIX0114${configuracoes.pixKey}5204000053039865802BR5913${configacoes.coupleNames}6007BRASIL62070503***6304E01F`;
        const qrCodeImg = document.createElement('img');
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(pixData)}`;
        qrCodeImg.alt = 'QR Code Pix';
        qrCodeContainer.appendChild(qrCodeImg);
    } else {
        qrCodeContainer.innerHTML = '<p class="text-red-500 text-sm">Chave Pix não configurada.</p>';
    }

    document.getElementById('giftModal').style.display = 'flex';
}

export function closeGiftModal() {
    fecharModal('giftModal');
}

// ==================== FUNÇÕES DE CONFIGURAÇÃO ====================
export function carregarConfiguracoes() {
    const { configuracoes } = getState();
    document.getElementById('coupleNamesInput').value = configuracoes.coupleNames;
    document.getElementById('pixKeyInput').value = configuracoes.pixKey;
    document.getElementById('welcomeMessageInput').value = configuracoes.welcomeMessage;
    renderizarPresentesCadastrados();
}

export async function salvarConfiguracoes() {
    const { configuracoes } = getState();
    configuracoes.coupleNames = document.getElementById('coupleNamesInput').value.trim();
    configuracoes.pixKey = document.getElementById('pixKeyInput').value.trim();
    configuracoes.welcomeMessage = document.getElementById('welcomeMessageInput').value.trim();
    await salvarDados();
    mostrarAlerta('✅ Configurações salvas com sucesso!', 'success');
}

export async function adicionarPresente() {
    const { configuracoes } = getState();
    const newGiftName = document.getElementById('newGiftName').value.trim();
    const newGiftPrice = document.getElementById('newGiftPrice').value.trim();
    const newGiftEmoji = document.getElementById('newGiftEmoji').value.trim();
    const newGiftDescription = document.getElementById('newGiftDescription').value.trim();

    if (!newGiftName || !newGiftPrice || !newGiftEmoji) {
        mostrarAlerta('❌ Nome, Preço e Emoji do presente são obrigatórios!', 'error');
        return;
    }

    configuracoes.gifts.push({
        id: Date.now(), // ID único
        name: newGiftName,
        price: newGiftPrice.replace(',', '.'), // Garantir formato numérico
        emoji: newGiftEmoji,
        description: newGiftDescription
    });

    await salvarDados();
    mostrarAlerta('✅ Presente adicionado!', 'success');
    renderizarPresentesCadastrados();
    // Limpar campos
    document.getElementById('newGiftName').value = '';
    document.getElementById('newGiftPrice').value = '';
    document.getElementById('newGiftEmoji').value = '';
    document.getElementById('newGiftDescription').value = '';
}

export function renderizarPresentesCadastrados() {
    const { configuracoes } = getState();
    const currentGiftsList = document.getElementById('currentGiftsList');
    currentGiftsList.innerHTML = '';

    if (configuracoes.gifts.length === 0) {
        currentGiftsList.innerHTML = '<p class="text-center text-gray-500">Nenhum presente cadastrado.</p>';
        return;
    }

    configuracoes.gifts.forEach(gift => {
        const giftItem = document.createElement('div');
        giftItem.className = 'selected-item';
        giftItem.innerHTML = `
            <div>
                <span class="text-xl mr-2">${gift.emoji}</span>
                <strong>${escapeHtml(gift.name)}</strong> - R$ ${parseFloat(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <p class="text-sm text-gray-600">${escapeHtml(gift.description)}</p>
            </div>
            <button onclick="removerPresente(${gift.id})" class="danger">Remover</button>
        `;
        currentGiftsList.appendChild(giftItem);
    });
}

export async function removerPresente(id) {
    const { configuracoes } = getState();
    mostrarConfirmacao(
        'Tem certeza que deseja remover este presente?',
        async () => {
            configuracoes.gifts = configuracoes.gifts.filter(gift => gift.id !== id);
            await salvarDados();
            mostrarAlerta('✅ Presente removido!', 'success');
            renderizarPresentesCadastrados();
             // Atualizar a página de presentes também
        }
    );
}

export function formatGiftCurrency(input) {
    let value = input.value.replace(/[^0-9,]/g, '');
    value = value.replace(/,/g, '.');
    if (!isNaN(value) && value.trim() !== '') {
        input.value = parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    } else if (value.trim() === '') {
        input.value = '';
    }
}

export async function sincronizarBanco() {
    mostrarAlerta('🔄 Sincronizando dados com o banco...', 'info');
    await salvarDados();
    atualizarTodasTabelas();
    mostrarAlerta('✅ Dados sincronizados e salvos!', 'success');
}

export async function exportarBackup() {
    try {
        const { exportarBanco } = await import('./database.js');
        const dadosBanco = exportarBanco();
        
        const blob = new Blob([dadosBanco], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `backup_banco_convidados_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        mostrarAlerta('💾 Backup do banco criado com sucesso!', 'success');
    } catch (error) {
        mostrarAlerta('❌ Erro ao criar backup: ' + error.message, 'error');
    }
}

export async function importarBackup(arquivo) {
    if (!arquivo) return;

    mostrarConfirmacao(
        '⚠️ Restaurar backup irá substituir todo o banco de dados atual. Continuar?',
        async () => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const { importarBanco } = await import('./database.js');
                    const conteudo = e.target.result;
                    importarBanco(conteudo);
                    atualizarTodasTabelas();
                    carregarConfiguracoes();
                    mostrarAlerta('✅ Backup restaurado com sucesso!', 'success');
                } catch (error) {
                    mostrarAlerta('❌ Erro ao restaurar backup: ' + error.message, 'error');
                }
            };
            reader.readAsText(arquivo);
        }
    );
}

export async function alterarSenha(event) {
    event.preventDefault();
    const { senhaAtual: storedSenhaAtual } = getState();

    const senhaAtualInput = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senhaAtualInput !== storedSenhaAtual) {
        mostrarAlerta('❌ Senha atual incorreta!', 'error');
        return;
    }
    if (novaSenha !== confirmarSenha) {
        mostrarAlerta('❌ As senhas não conferem!', 'error');
        return;
    }
    if (novaSenha.length < 3) {
        mostrarAlerta('❌ A nova senha deve ter pelo menos 3 caracteres!', 'error');
        return;
    }
    getState().senhaAtual = novaSenha;
    await salvarDados();
    fecharModal('modalSenha');
    
    document.getElementById('senhaAtual').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
    
    mostrarAlerta('🔒 Senha alterada e salva no banco com segurança!', 'success');
}

