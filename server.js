const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const { salvarNoGoogleSheets } = require('./google-sheets-integration');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Caminho para o arquivo de dados dos presentes
const PRESENTES_FILE = 'data/presentes.json';

// Garantir que o diretório data existe
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Inicializar dados dos presentes se não existir
if (!fs.existsSync(PRESENTES_FILE)) {
    const presentesIniciais = [
        { id: 1, nome: "Fralda RN", categoria: "fralda", quantidade: 5, escolhido: 0, ativo: true },
        { id: 2, nome: "Fralda P", categoria: "fralda", quantidade: 10, escolhido: 0, ativo: true },
        { id: 3, nome: "Fralda M", categoria: "fralda", quantidade: 15, escolhido: 0, ativo: true },
        { id: 4, nome: "Fralda G", categoria: "fralda", quantidade: 15, escolhido: 0, ativo: true },
        { id: 5, nome: "Fralda GG", categoria: "fralda", quantidade: 10, escolhido: 0, ativo: true },
        { id: 6, nome: "Fralda XG", categoria: "fralda", quantidade: 5, escolhido: 0, ativo: true },
        { id: 7, nome: "Bolo de Chocolate", categoria: "comida", quantidade: 3, escolhido: 0, ativo: true },
        { id: 8, nome: "Bolo de Cenoura", categoria: "comida", quantidade: 2, escolhido: 0, ativo: true },
        { id: 9, nome: "Cupcakes", categoria: "comida", quantidade: 4, escolhido: 0, ativo: true },
        { id: 10, nome: "Brigadeiros", categoria: "comida", quantidade: 5, escolhido: 0, ativo: true },
        { id: 11, nome: "Beijinhos", categoria: "comida", quantidade: 5, escolhido: 0, ativo: true },
        { id: 12, nome: "Quindim", categoria: "comida", quantidade: 3, escolhido: 0, ativo: true },
        { id: 13, nome: "Pão de Queijo", categoria: "comida", quantidade: 4, escolhido: 0, ativo: true },
        { id: 14, nome: "Coxinhas", categoria: "comida", quantidade: 3, escolhido: 0, ativo: true },
        { id: 15, nome: "Empadinhas", categoria: "comida", quantidade: 3, escolhido: 0, ativo: true },
        { id: 16, nome: "Sanduíches", categoria: "comida", quantidade: 4, escolhido: 0, ativo: true },
        { id: 17, nome: "Salgadinhos Variados", categoria: "comida", quantidade: 5, escolhido: 0, ativo: true },
        { id: 18, nome: "Torta Salgada", categoria: "comida", quantidade: 2, escolhido: 0, ativo: true },
        { id: 19, nome: "Refrigerantes", categoria: "comida", quantidade: 6, escolhido: 0, ativo: true },
        { id: 20, nome: "Sucos", categoria: "comida", quantidade: 4, escolhido: 0, ativo: true },
        { id: 21, nome: "Água", categoria: "comida", quantidade: 8, escolhido: 0, ativo: true },
    ];
    fs.writeFileSync(PRESENTES_FILE, JSON.stringify(presentesIniciais, null, 2));
}

// Função para ler dados dos presentes
function lerPresentes() {
    try {
        const data = fs.readFileSync(PRESENTES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler dados dos presentes:', error);
        return [];
    }
}

// Função para salvar dados dos presentes
function salvarPresentes(presentes) {
    try {
        fs.writeFileSync(PRESENTES_FILE, JSON.stringify(presentes, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados dos presentes:', error);
        return false;
    }
}

// Função para atualizar status dos presentes
function atualizarStatusPresentes(presentes) {
    return presentes.map(presente => ({
        ...presente,
        ativo: presente.escolhido < presente.quantidade
    }));
}

// Rota principal - serve a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter lista de presentes ativos
app.get('/api/presentes', (req, res) => {
    try {
        const presentes = lerPresentes();
        const presentesAtualizados = atualizarStatusPresentes(presentes);
        salvarPresentes(presentesAtualizados);
        
        // Retorna TODOS os presentes (ativos e inativos)
        res.json(presentesAtualizados);
    } catch (error) {
        console.error('Erro ao obter presentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para submeter escolha de presentes
app.post('/api/submeter', async (req, res) => {
    try {
        const { nome, presentesEscolhidos } = req.body;
        
        if (!nome || !presentesEscolhidos || presentesEscolhidos.length === 0) {
            return res.status(400).json({ error: 'Nome e pelo menos um item são obrigatórios' });
        }

        // Ler dados atuais
        const presentes = lerPresentes();
        const presentesAtualizados = atualizarStatusPresentes(presentes);

        // Verificar se os presentes escolhidos ainda estão disponíveis
        for (const presenteId of presentesEscolhidos) {
            const presente = presentesAtualizados.find(p => p.id === presenteId);
            if (!presente || !presente.ativo) {
                return res.status(400).json({ 
                    error: `O item "${presente?.nome || 'ID: ' + presenteId}" não está mais disponível` 
                });
            }
        }

        // Atualizar contadores dos presentes escolhidos
        for (const presenteId of presentesEscolhidos) {
            const presente = presentesAtualizados.find(p => p.id === presenteId);
            if (presente) {
                presente.escolhido += 1;
            }
        }

        // Atualizar status dos presentes
        const presentesFinal = atualizarStatusPresentes(presentesAtualizados);
        
        // Salvar dados atualizados
        if (!salvarPresentes(presentesFinal)) {
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }
        
        // Por enquanto, vamos apenas salvar em um arquivo local
        const escolhas = {
            timestamp: new Date().toISOString(),
            nome: nome,
            presentes: presentesEscolhidos.map(id => {
                const presente = presentesFinal.find(p => p.id === id);
                return presente ? presente.nome : `ID: ${id}`;
            })
        };
        
        // Enviar dados para o Google Sheets
        await salvarNoGoogleSheets(escolhas);

        // Salvar escolha em arquivo separado
        const escolhasFile = 'data/escolhas.json';
        let escolhasAnteriores = [];
        if (fs.existsSync(escolhasFile)) {
            escolhasAnteriores = JSON.parse(fs.readFileSync(escolhasFile, 'utf8'));
        }
        escolhasAnteriores.push(escolhas);
        fs.writeFileSync(escolhasFile, JSON.stringify(escolhasAnteriores, null, 2));

        res.json({ 
            success: true, 
            message: 'Escolha registrada com sucesso!',
            presentesAtualizados: presentesFinal.filter(p => p.ativo)
        });

    } catch (error) {
        console.error('Erro ao submeter escolha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para obter estatísticas (opcional)
app.get('/api/estatisticas', (req, res) => {
    try {
        const presentes = lerPresentes();
        const totalPresentes = presentes.length;
        const presentesDisponiveis = presentes.filter(p => p.ativo).length;
        const totalEscolhido = presentes.reduce((sum, p) => sum + p.escolhido, 0);
        
        // Separar por categoria
        const fraldas = presentes.filter(p => p.categoria === 'fralda');
        const comidas = presentes.filter(p => p.categoria === 'comida');
        
        res.json({
            totalPresentes,
            presentesDisponiveis,
            totalEscolhido,
            fraldas: {
                total: fraldas.length,
                disponiveis: fraldas.filter(p => p.ativo).length,
                escolhidas: fraldas.reduce((sum, p) => sum + p.escolhido, 0)
            },
            comidas: {
                total: comidas.length,
                disponiveis: comidas.filter(p => p.ativo).length,
                escolhidas: comidas.reduce((sum, p) => sum + p.escolhido, 0)
            },
            presentes: presentes.map(p => ({
                id: p.id,
                nome: p.nome,
                categoria: p.categoria,
                quantidade: p.quantidade,
                escolhido: p.escolhido,
                disponivel: p.quantidade - p.escolhido,
                ativo: p.ativo
            }))
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🎉 Chá de Revelação - Vamos descobrir juntos!`);
}); 