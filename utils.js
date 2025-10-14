export function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

export function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById('alertContainer');
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} fade-in`;
    alerta.innerHTML = mensagem;
    alerta.style.display = 'block';
    
    container.appendChild(alerta);
    
    setTimeout(() => {
        alerta.remove();
    }, 7000);
}

export function mostrarConfirmacao(mensagem, callback) {
    document.getElementById('mensagemConfirmacao').textContent = mensagem;
    document.getElementById('modalConfirmar').style.display = 'flex'; // Usar flex para centralizar
    
    document.getElementById('btnConfirmar').onclick = function() {
        fecharModal('modalConfirmar');
        callback();
    };
}

export function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

export class SimpleCrypto {
    static encrypt(text, key) {
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encrypted);
    }
    
    static decrypt(encryptedText, key) {
        try {
            const encrypted = atob(encryptedText);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return decrypted;
        } catch (e) {
            throw new Error('Falha na descriptografia');
        }
    }
}

