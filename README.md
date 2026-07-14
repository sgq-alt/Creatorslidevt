# 📊 SlideAI Studio — Apresentações de Resultados Operacionais & Lean

SlideAI Studio é uma plataforma moderna e elegante para criação, edição e exportação de apresentações corporativas de alta qualidade, focada em resultados do chã de fábrica, indicadores de performance (KPIs), melhorias contínuas (Lean/SMED) e análises de antes e depois.

O aplicativo é **híbrido e resiliente**: ele funciona tanto com um servidor de retaguarda (Node/Express com IA real do Gemini e sincronização remota) quanto em **modo 100% estático (client-side)** para hospedagem em serviços como o **GitHub Pages**, salvando todas as suas alterações diretamente no navegador via `localStorage` e fornecendo simulações inteligentes de IA offline!

---

## 🚀 Como Executar Localmente (Com Servidor & IA do Gemini)

Se você baixou o código do projeto e quer executá-lo no seu computador com sincronização de banco de dados e inteligência artificial ativa:

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### 2. Instalar Dependências
Abra o terminal na pasta raiz do projeto e execute:
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env` na raiz do projeto (ou copie o `.env.example`) e adicione sua chave de API do Gemini:
```env
GEMINI_API_KEY=sua_chave_real_aqui
```

### 4. Executar em Modo de Desenvolvimento
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O projeto estará rodando localmente em `http://localhost:3000`. Você terá acesso completo à IA real do Gemini para sugerir tópicos, melhorar textos e recomendar imagens!

---

## 🌐 Como Publicar no GitHub Pages (Site Estático 100% Gratuito)

Se você quer transformar este projeto em um site público no GitHub Pages, você pode fazer isso de forma totalmente gratuita! O aplicativo foi otimizado para que, ao rodar sem o servidor Express, ele **carregue os projetos de exemplo automaticamente** e salve todas as suas edições de forma segura no `localStorage` do navegador do visitante.

### Passo a Passo para Publicar:

### Opção A: Usando a Ferramenta Integrada `gh-pages` (Recomendado)

1. No seu terminal, instale o pacote de deploy do GitHub Pages:
   ```bash
   npm install -D gh-pages
   ```

2. Abra o arquivo `package.json` e adicione a seguinte propriedade no topo (substituindo pelo seu usuário e nome de repositório no GitHub):
   ```json
   "homepage": "https://seu-usuario.github.io/nome-do-repositorio",
   ```

3. No mesmo `package.json`, adicione estes dois scripts dentro da seção `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. No terminal, execute o comando de deploy:
   ```bash
   npm run deploy
   ```
   *Pronto!* O projeto será compilado automaticamente e enviado para o branch `gh-pages` do seu repositório GitHub. Em poucos minutos seu site estará online!

---

### Opção B: Deploy Manual via Pasta `dist`

Se preferir não usar scripts, você pode subir os arquivos compilados manualmente:

1. No seu terminal local, gere os arquivos estáticos de produção:
   ```bash
   npm run build
   ```
   Isso criará uma pasta chamada `dist/` com todo o HTML, CSS e JavaScript do seu aplicativo.

2. Crie um repositório no GitHub para o seu projeto.
3. Envie o conteúdo da pasta `dist/` para a raiz do branch principal (como `main` ou `gh-pages`), ou configure o GitHub Pages para servir a partir da pasta que você enviar.
4. Vá em **Settings** > **Pages** no seu repositório no GitHub, selecione o branch que contém os arquivos estáticos e clique em salvar!

---

## 🎨 Principais Recursos Ativos no Modo Estático (GitHub Pages)

- **Cache Inteligente de Projetos**: Os projetos "Resultados Q2", "Eficiência Energética" e "Logística" vêm pré-carregados no sistema para que seu portfólio ou site nunca apareça vazio.
- **Banco de Dados no Navegador**: Qualquer alteração, novo slide ou novos comentários que você adicionar serão salvos instantaneamente no `localStorage`. Se você fechar a aba e voltar depois, seus dados estarão lá!
- **IA de Sugestão Integrada (Offline)**: As ferramentas de "Refinar Texto", "Gerar Tópicos por IA" e "Recomendação de Imagem" utilizam um motor de recomendação simulado inteligente que responde instantaneamente com ideias de alta qualidade alinhadas ao tema do slide selecionado.
- **Exportação Perfeita de PDF**: Imprima ou salve a apresentação completa em formato PDF paisagem em alta definição diretamente do seu navegador.
- **Integração Google Planilhas**: Exporte todos os slides e tabelas operacionais em abas organizadas em tempo real!
