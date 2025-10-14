_**
 * Módulo para gerenciar o armazenamento de dados no localStorage.
 * @module database
 */

import { SimpleCrypto } from './utils.js';

const DB_KEY = 'gerenciadorConvidadosDB';
const ENCRYPTION_KEY = 'sua-chave-secreta-aqui'; // ATENÇÃO: Mudar para uma chave mais segura em produção

let state = {
    convidados: [],
    proximoId: 1,
    senhaMestra: '123', // Senha de acesso
    senhaAtual: 'admin123', // Senha de configurações
    configuracoes: {
        coupleNames: '',
        pixKey: '',
        welcomeMessage: '',
        gifts: []
    }
};

/**
 * Carrega os dados do localStorage para o estado da aplicação.
 */
export function carregarDados() {
    const dadosSalvos = localStorage.getItem(DB_KEY);
    if (dadosSalvos) {
        try {
            const decryptedData = SimpleCrypto.decrypt(dadosSalvos, ENCRYPTION_KEY);
            const parsedData = JSON.parse(decryptedData);
            state = { ...state, ...parsedData };

            // Garantir que proximoId seja maior que os IDs existentes
            if (state.convidados.length > 0) {
                const maxId = Math.max(...state.convidados.map(c => c.id));
                state.proximoId = maxId + 1;
            }
        } catch (error) {
            console.error("Erro ao carregar ou descriptografar dados:", error);
            // Se houver erro, reseta para o estado padrão
            salvarDados();
        }
    }
}

/**
 * Salva o estado atual da aplicação no localStorage.
 */
export async function salvarDados() {
    try {
        const dataToSave = JSON.stringify(state);
        const encryptedData = SimpleCrypto.encrypt(dataToSave, ENCRYPTION_KEY);
        localStorage.setItem(DB_KEY, encryptedData);
    } catch (error) {
        console.error("Erro ao salvar ou criptografar dados:", error);
    }
}

/**
 * Exporta o banco de dados como uma string JSON.
 * @returns {string} O banco de dados em formato JSON.
 */
export function exportarBanco() {
    return JSON.stringify(state, null, 2); // Formatação para melhor leitura
}

/**
 * Importa um banco de dados a partir de uma string JSON.
 * @param {string} jsonString - A string JSON contendo os dados do banco.
 */
export function importarBanco(jsonString) {
    try {
        const newState = JSON.parse(jsonString);
        state = { ...state, ...newState };
        salvarDados();
    } catch (error) {
        throw new Error("Arquivo de backup inválido ou corrompido.");
    }
}

/**
 * Retorna o estado atual da aplicação.
 * @returns {object} O objeto de estado.
 */
export function getState() {
    return state;
}

