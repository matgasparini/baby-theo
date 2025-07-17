# 🎉 Chá de Bebê do Theo - Festa Junina

Uma aplicação web interativa para gerenciar a lista de presentes do chá de bebê do Theo, com tema de festa junina!

## ✨ Funcionalidades

- 🎨 **Tema de Festa Junina**: Design colorido e animado com lanternas e decorações
- 📝 **Formulário Interativo**: Usuários podem escolher múltiplos presentes
- 🔄 **Atualização em Tempo Real**: Lista de presentes se atualiza automaticamente
- 📊 **Controle de Estoque**: Presentes ficam indisponíveis quando esgotados
- 💾 **Armazenamento Local**: Dados salvos em arquivos JSON
- 📱 **Responsivo**: Funciona perfeitamente em dispositivos móveis
- 🎊 **Efeitos Visuais**: Animações e confete ao selecionar presentes

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Clone ou baixe o projeto**

   ```bash
   git clone <url-do-repositorio>
   cd cha-de-bebe-theo
   ```
2. **Instale as dependências**

   ```bash
   npm install
   ```
3. **Execute a aplicação**

   ```bash
   npm start
   ```
4. **Acesse no navegador**

   ```
   http://localhost:3000
   ```

### Modo de Desenvolvimento

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
cha-de-bebe-theo/
├── public/
│   ├── index.html      # Página principal
│   ├── styles.css      # Estilos com tema de festa junina
│   └── script.js       # JavaScript interativo
├── data/
│   ├── presentes.json  # Lista de presentes (criado automaticamente)
│   └── escolhas.json   # Histórico de escolhas (criado automaticamente)
├── server.js           # Servidor Express
├── package.json        # Dependências do projeto
└── README.md          # Este arquivo
```

## 🎯 Como Usar

### Para os Convidados

1. **Acesse a página**: Abra `http://localhost:3000` no navegador
2. **Digite seu nome**: Preencha o campo "Seu Nome"
3. **Escolha os presentes**: Clique nos presentes desejados (pode escolher múltiplos)
4. **Envie a escolha**: Clique em "Enviar Escolha"
5. **Confirmação**: Uma mensagem de sucesso aparecerá

### Para os Organizadores

- **Visualizar estatísticas**: Acesse `http://localhost:3000/api/estatisticas`
- **Ver dados salvos**: Consulte os arquivos em `data/`
- **Modificar presentes**: Edite `data/presentes.json` diretamente

## 🔧 Configuração

### Personalizar Lista de Presentes

Edite o arquivo `server.js` na seção de inicialização:

```javascript
const presentesIniciais = [
    { id: 1, nome: "Fraldas P", quantidade: 5, escolhido: 0, ativo: true },
    { id: 2, nome: "Fraldas M", quantidade: 5, escolhido: 0, ativo: true },
    // Adicione mais presentes aqui...
];
```

### Alterar Porta do Servidor

Modifique a variável `PORT` no `server.js`:

```javascript
const PORT = process.env.PORT || 3000; // Mude 3000 para a porta desejada
```

## 📊 API Endpoints

### GET `/api/presentes`

Retorna a lista de presentes disponíveis.

### POST `/api/submeter`

Envia a escolha de presentes.

```json
{
    "nome": "Nome do Convidado",
    "presentesEscolhidos": [1, 3, 5]
}
```

### GET `/api/estatisticas`

Retorna estatísticas completas dos presentes.

## 🎨 Personalização

### Cores e Tema

Edite o arquivo `public/styles.css` para personalizar:

- Cores do gradiente de fundo
- Cores das lanternas
- Estilos dos botões e formulários

### Animações

Modifique as animações CSS em `public/styles.css`:

- `@keyframes gradientShift` - Animação do fundo
- `@keyframes bounce` - Animação do título
- `@keyframes glow` - Efeito das lanternas

## 🔒 Segurança

- Validação de dados no servidor
- Verificação de disponibilidade em tempo real
- Proteção contra seleção de presentes esgotados

## 📱 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móveis

## 🚀 Deploy

### Heroku

```bash
heroku create cha-de-bebe-theo
git push heroku main
```

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

Faça upload dos arquivos da pasta `public` e configure o build.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se encontrar algum problema:

1. Verifique se o Node.js está instalado corretamente
2. Certifique-se de que a porta 3000 está livre
3. Verifique os logs do console para erros
4. Abra uma issue no repositório

## 🎊 Agradecimentos

- Família do Theo pela inspiração
- Comunidade Node.js
- Font Awesome pelos ícones
- Google Fonts pela fonte Fredoka

---

**Desenvolvido com ❤️ para o chá de bebê do Theo!** 🍼👶
