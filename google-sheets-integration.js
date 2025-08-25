// Integração com Google Sheets (OPCIONAL)
// Este arquivo mostra como integrar a aplicação com Google Sheets

const { google } = require('googleapis');

// Configuração do Google Sheets
const SPREADSHEET_ID = '1DAHPJEImqnqMG2qXh6kuI87R5trjQLGv1lgBZCj8uAU'; // Substitua pelo ID da sua planilha
const RANGE = 'A:C'; // Colunas A, B e C
const API_KEY = 'AIzaSyBx2pAFbepKRMlRdJ8JUvOTWAKrdXWXEuI'; // Substitua pela sua API Key

// Função para autenticar com Google Sheets (Conta de Serviço)
async function authenticateGoogleSheets() {
    try {
        // Para ESCREVER em planilhas, você precisa de uma Conta de Serviço
        // 1. Vá para https://console.cloud.google.com/
        // 2. Crie um projeto ou selecione um existente
        // 3. Vá em "APIs & Services" > "Credentials"
        // 4. Clique em "Create Credentials" > "Service Account"
        // 5. Baixe o arquivo JSON da conta de serviço
        // 6. Renomeie para 'credentials.json' e coloque na raiz do projeto
        
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json', // Arquivo da conta de serviço
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        return auth;
    } catch (error) {
        console.error('Erro na autenticação do Google Sheets:', error);
        console.log('Dica: Para escrita, você precisa de uma Conta de Serviço, não apenas API Key');
        return null;
    }
}

// Função para salvar dados no Google Sheets
async function salvarNoGoogleSheets(dados) {
    try {
        const auth = await authenticateGoogleSheets();
        if (!auth) {
            console.log('Autenticação falhou, salvando apenas localmente');
            return false;
        }


        console.log(auth);
        const sheets = google.sheets({ version: 'v4', auth });
        
        const valores = [
            [
                dados.timestamp,
                dados.nome,
                dados.presentes.join(', ')
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: valores
            }
        });

        console.log('Dados salvos no Google Sheets com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao salvar no Google Sheets:', error);
        return false;
    }
}

// Função para ler dados do Google Sheets
async function lerDoGoogleSheets() {
    try {
        const auth = await authenticateGoogleSheets();
        if (!auth) {
            return null;
        }

        const sheets = google.sheets({ version: 'v4', auth });
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        return response.data.values;
    } catch (error) {
        console.error('Erro ao ler do Google Sheets:', error);
        return null;
    }
}

// Exemplo de uso no server.js:
/*
// No arquivo server.js, adicione:

const { salvarNoGoogleSheets } = require('./google-sheets-integration');

// Na rota POST /api/submeter, após salvar localmente:
const dadosParaSheets = {
    timestamp: new Date().toISOString(),
    nome: nome,
    presentes: presentesEscolhidos.map(id => {
        const presente = presentesFinal.find(p => p.id === id);
        return presente ? presente.nome : `ID: ${id}`;
    })
};

// Tentar salvar no Google Sheets (opcional)
salvarNoGoogleSheets(dadosParaSheets).then(sucesso => {
    if (sucesso) {
        console.log('Dados também salvos no Google Sheets');
    } else {
        console.log('Dados salvos apenas localmente');
    }
});
*/

module.exports = {
    salvarNoGoogleSheets,
    lerDoGoogleSheets
}; 