// Variáveis globais
let presentes = [];
let selectedFraldas = new Set();
let selectedComidas = new Set();

// Elementos do DOM
const fraldasList = document.getElementById('fraldasList');
const comidasList = document.getElementById('comidasList');
const presenteForm = document.getElementById('presenteForm');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarPresentes();
    setupEventListeners();
    atualizarBotaoEnvio(); // Inicializar estado do botão
});

// Configurar event listeners
function setupEventListeners() {
    presenteForm.addEventListener('submit', handleFormSubmit);
    
    // Atualizar lista de presentes a cada 30 segundos
    setInterval(carregarPresentes, 30000);
}

// Carregar presentes do servidor
async function carregarPresentes() {
    try {
        const response = await fetch('/api/presentes');
        if (!response.ok) {
            throw new Error('Erro ao carregar presentes');
        }
        
        presentes = await response.json();
        renderizarPresentes();
    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        mostrarErro('Erro ao carregar a lista de presentes. Tente recarregar a página.');
    }
}

// Renderizar listas de presentes
function renderizarPresentes() {
    if (presentes.length === 0) {
        fraldasList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhum item disponível no momento.
            </div>
        `;
        comidasList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhum item disponível no momento.
            </div>
        `;
        return;
    }

    // Separar fraldas e comidas
    const fraldas = presentes.filter(p => p.categoria === 'fralda');
    const comidas = presentes.filter(p => p.categoria === 'comida');

    // Renderizar fraldas
    if (fraldas.length === 0) {
        fraldasList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhuma fralda disponível no momento.
            </div>
        `;
    } else {
        fraldasList.innerHTML = fraldas.map(fralda => `
            <div class="presente-item ${fralda.ativo ? '' : 'disabled'}" 
                 data-id="${fralda.id}" data-categoria="fralda">
                <input type="checkbox" 
                       class="presente-checkbox" 
                       id="fralda-${fralda.id}"
                       value="${fralda.id}"
                       ${selectedFraldas.has(fralda.id) ? 'checked' : ''}
                       ${fralda.ativo ? '' : 'disabled'}>
                <div class="presente-nome">${fralda.nome}</div>            
            </div>
        `).join('');
    }

    // Renderizar comidas
    if (comidas.length === 0) {
        comidasList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhuma comida disponível no momento.
            </div>
        `;
    } else {
        comidasList.innerHTML = comidas.map(comida => `
            <div class="presente-item ${comida.ativo ? '' : 'disabled'}" 
                 data-id="${comida.id}" data-categoria="comida">
                <input type="checkbox" 
                       class="presente-checkbox" 
                       id="comida-${comida.id}"
                       value="${comida.id}"
                       ${selectedComidas.has(comida.id) ? 'checked' : ''}
                       ${comida.ativo ? '' : 'disabled'}>
                <div class="presente-nome">${comida.nome}</div>            
            </div>
        `).join('');
    }
    
    // Adicionar event listeners após renderizar
    adicionarEventListenersPresentes();
}

// Adicionar event listeners aos presentes
function adicionarEventListenersPresentes() {
    const presenteItems = document.querySelectorAll('.presente-item');
    
    presenteItems.forEach(item => {
        const presenteId = parseInt(item.dataset.id);
        const categoria = item.dataset.categoria;
        const checkbox = item.querySelector('.presente-checkbox');
        const presente = presentes.find(p => p.id === presenteId);
        
        if (presente && presente.ativo) {
            // Event listener para o checkbox
            checkbox.addEventListener('change', function() {
                handleCheckboxChange(this, presenteId, categoria);
            });
            
            // Event listener para clicar no item (exceto no checkbox)
            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    handleCheckboxChange(checkbox, presenteId, categoria);
                }
            });
        }
    });
}

// Manipular mudança no checkbox
function handleCheckboxChange(checkbox, presenteId, categoria) {
    console.log('Item selecionado:', presenteId, 'Categoria:', categoria, 'Checked:', checkbox.checked);
    
    if (categoria === 'fralda') {
        if (checkbox.checked) {
            selectedFraldas.add(presenteId);
            checkbox.closest('.presente-item').classList.add('selected');
        } else {
            selectedFraldas.delete(presenteId);
            checkbox.closest('.presente-item').classList.remove('selected');
        }
    } else if (categoria === 'comida') {
        if (checkbox.checked) {
            selectedComidas.add(presenteId);
            checkbox.closest('.presente-item').classList.add('selected');
        } else {
            selectedComidas.delete(presenteId);
            checkbox.closest('.presente-item').classList.remove('selected');
        }
    }
    
    dispararEventoPresenteSelecionado(); // Disparar efeito visual
    atualizarBotaoEnvio();
}

// Atualizar estado do botão de envio
function atualizarBotaoEnvio() {
    const nome = document.getElementById('nome').value.trim();
    const temFraldas = selectedFraldas.size > 0;
    const temComidas = selectedComidas.size > 0;
    
    // Botão habilitado se tem nome, pelo menos uma fralda e pelo menos uma comida
    submitBtn.disabled = !nome || !temFraldas || !temComidas;
    
    if (!nome) {
        submitBtn.textContent = 'Digite seu nome';
    } else if (!temFraldas) {
        submitBtn.textContent = 'Escolha pelo menos uma fralda';
    } else if (!temComidas) {
        submitBtn.textContent = 'Escolha pelo menos uma comida';
    } else {
        submitBtn.innerHTML = 'Enviar';
    }
}

// Manipular envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const fraldasEscolhidas = Array.from(selectedFraldas);
    const comidasEscolhidas = Array.from(selectedComidas);
    
    if (!nome) {
        mostrarErro('Por favor, preencha seu nome.');
        return;
    }
    
    if (fraldasEscolhidas.length === 0) {
        mostrarErro('Por favor, escolha pelo menos uma fralda.');
        return;
    }
    
    if (comidasEscolhidas.length === 0) {
        mostrarErro('Por favor, escolha pelo menos uma comida.');
        return;
    }
    
    // Combinar todas as escolhas
    const presentesEscolhidos = [...fraldasEscolhidas, ...comidasEscolhidas];
    
    // Desabilitar botão durante o envio
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        const response = await fetch('/api/submeter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                presentesEscolhidos: presentesEscolhidos
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarSucesso(`Obrigado, ${nome}! Sua escolha foi registrada com sucesso.`);
            
            // Limpar formulário
            document.getElementById('nome').value = '';
            selectedFraldas.clear();
            selectedComidas.clear();
            
            // Recarregar presentes para atualizar disponibilidade
            await carregarPresentes();
            
            // Atualizar botão
            atualizarBotaoEnvio();
        } else {
            throw new Error(data.error || 'Erro ao enviar dados');
        }
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        mostrarErro(error.message || 'Erro ao enviar sua escolha. Tente novamente.');
    } finally {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar';
    }
}

// Mostrar modal de sucesso
function mostrarSucesso(mensagem) {
    successMessage.textContent = mensagem;
    successModal.style.display = 'block';
}

// Mostrar modal de erro
function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorModal.style.display = 'block';
}

// Fechar modal
function closeModal() {
    successModal.style.display = 'none';
    errorModal.style.display = 'none';
}

// Fechar modal ao clicar fora dele
window.addEventListener('click', function(event) {
    if (event.target === successModal) {
        closeModal();
    }
    if (event.target === errorModal) {
        closeModal();
    }
});

// Atualizar botão quando o nome for digitado
document.getElementById('nome').addEventListener('input', atualizarBotaoEnvio);

// Adicionar efeitos visuais
function adicionarEfeitosVisuais() {
    // Efeito de confete quando uma escolha é feita
    document.addEventListener('presenteSelecionado', function() {
        // criarConfete();
    });
}

// Inicializar efeitos visuais
adicionarEfeitosVisuais();

// Função para disparar evento de presente selecionado
function dispararEventoPresenteSelecionado() {
    document.dispatchEvent(new Event('presenteSelecionado'));
}