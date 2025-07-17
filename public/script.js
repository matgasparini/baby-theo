// Variáveis globais
let presentes = [];
let selectedPresentes = new Set();

// Elementos do DOM
const presentesList = document.getElementById('presentesList');
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

// Renderizar lista de presentes
function renderizarPresentes() {
    if (presentes.length === 0) {
        presentesList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhum presente disponível no momento.
            </div>
        `;
        return;
    }

    presentesList.innerHTML = presentes.map(presente => `
        <div class="presente-item ${presente.ativo ? '' : 'disabled'}" 
             data-id="${presente.id}">
            <input type="checkbox" 
                   class="presente-checkbox" 
                   id="presente-${presente.id}"
                   value="${presente.id}"
                   ${selectedPresentes.has(presente.id) ? 'checked' : ''}
                   ${presente.ativo ? '' : 'disabled'}>
            <div class="presente-nome">${presente.nome}</div>            
        </div>
    `).join('');
    
    // <div class="presente-status">
    //             ${presente.ativo ? 
    //                 `✅ Disponível (${presente.quantidade - presente.escolhido}/${presente.quantidade})` : 
    //                 `❌ Esgotado (${presente.escolhido}/${presente.quantidade})`
    //             }
    //         </div>
    // Adicionar event listeners após renderizar
    adicionarEventListenersPresentes();
    
    // Atualizar estatísticas
    // atualizarEstatisticas();
}

// Atualizar estatísticas gerais
function atualizarEstatisticas() {
    const totalPresentes = presentes.length;
    const disponiveis = presentes.filter(p => p.ativo).length;
    const esgotados = totalPresentes - disponiveis;
    
    document.getElementById('totalPresentes').textContent = totalPresentes;
    document.getElementById('disponiveis').textContent = disponiveis;
    document.getElementById('esgotados').textContent = esgotados;
}

// Adicionar event listeners aos presentes
function adicionarEventListenersPresentes() {
    const presenteItems = document.querySelectorAll('.presente-item');
    
    presenteItems.forEach(item => {
        const presenteId = parseInt(item.dataset.id);
        const checkbox = item.querySelector('.presente-checkbox');
        const presente = presentes.find(p => p.id === presenteId);
        
        if (presente && presente.ativo) {
            // Event listener para o checkbox
            checkbox.addEventListener('change', function() {
                handleCheckboxChange(this, presenteId);
            });
            
            // Event listener para clicar no item (exceto no checkbox)
            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    handleCheckboxChange(checkbox, presenteId);
                }
            });
        }
    });
}



// Manipular mudança no checkbox
function handleCheckboxChange(checkbox, presenteId) {
    console.log('Presente selecionado:', presenteId, 'Checked:', checkbox.checked);
    console.log('Set antes:', Array.from(selectedPresentes));
    
    if (checkbox.checked) {
        selectedPresentes.add(presenteId);
        checkbox.closest('.presente-item').classList.add('selected');
        dispararEventoPresenteSelecionado(); // Disparar efeito visual
    } else {
        selectedPresentes.delete(presenteId);
        checkbox.closest('.presente-item').classList.remove('selected');
    }
    
    console.log('Set depois:', Array.from(selectedPresentes));
    atualizarBotaoEnvio();
}

// Atualizar estado do botão de envio
function atualizarBotaoEnvio() {
    const nome = document.getElementById('nome').value.trim();
    const temPresentes = selectedPresentes.size > 0;
    
    // Botão habilitado se tem nome, mas mostra mensagem diferente baseada na seleção de presentes
    submitBtn.disabled = !nome;
    
    if (!nome) {
        submitBtn.textContent = 'Digite seu nome';
    } else if (!temPresentes) {
        submitBtn.textContent = 'Escolha pelo menos um presente';
    } else {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Escolha';
    }
}

// Manipular envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const presentesEscolhidos = Array.from(selectedPresentes);
    
    if (!nome) {
        mostrarErro('Por favor, preencha seu nome.');
        return;
    }
    
    if (presentesEscolhidos.length === 0) {
        mostrarErro('Por favor, escolha pelo menos um presente.');
        return;
    }
    
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
            selectedPresentes.clear();
            
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
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Escolha';
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
        criarConfete();
    });
}

// Criar efeito de confete
function criarConfete() {
    const cores = ['#ff6b6b', '#ffa726', '#66bb6a', '#42a5f5', '#ab47bc', '#ffeb3b'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confete = document.createElement('div');
            confete.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * window.innerWidth}px;
                width: 10px;
                height: 10px;
                background: ${cores[Math.floor(Math.random() * cores.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confeteFall 3s linear forwards;
            `;
            
            document.body.appendChild(confete);
            
            setTimeout(() => {
                confete.remove();
            }, 3000);
        }, i * 100);
    }
}

// Adicionar CSS para animação do confete
const confeteStyle = document.createElement('style');
confeteStyle.textContent = `
    @keyframes confeteFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confeteStyle);

// Inicializar efeitos visuais
adicionarEfeitosVisuais();

// Função para disparar evento de presente selecionado
function dispararEventoPresenteSelecionado() {
    document.dispatchEvent(new Event('presenteSelecionado'));
}