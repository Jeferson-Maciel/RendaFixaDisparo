<div align="center">
  <img src="https://img.icons8.com/nolan/256/combo-chart.png" width="120" alt="RendaFixa Pro"/>
  <h1>RendaFixa Pro - Motor Quantitativo Serverless</h1>
  <p><strong>Filtragem, Compressão e Modelagem de Ativos Financeiros B2B/B2C em O(N)</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Architecture-Serverless-0ea5e9?style=flat-square&logo=awslambda" alt="Architecture" />
    <img src="https://img.shields.io/badge/Javascript-Vanilla%20ES6+-f7df1e?style=flat-square&logo=javascript" alt="JS Vanilla" />
    <img src="https://img.shields.io/badge/Deploy-Netlify_Ready-06b6d4?style=flat-square&logo=netlify" alt="Netlify" />
    <img src="https://img.shields.io/badge/Design_System-Premium_Fintech-10b981?style=flat-square" alt="Premium Design" />
  </p>
</div>

---

## 📌 Visão Institucional

O **RendaFixa Pro** é um motor estático de alta responsividade focado no processamento local (Offline-First) de planilhas financeiras bancárias pesadas. Adotando uma base arquitetural *Frontend-Only* super polida inspirada nos dashboards nativos de grandes corporações (como a própria interface corporativa da Vercel e da Bloomberg), esta Engine mapeia milhares de ativos de Renda Fixa simultaneamente dentro do Cache do Navegador, retornando apenas aquilo que os gerentes de contas institucionais mais procuram: **A maior taxa isolada de cada vértice financeiro.**

A aplicação é construída para erradicar o envio inseguro de informações ao Cloud, blindando a política de Sigilo Bancário, enquanto executa laços `Hash` rigorosamente na casa da complexidade assintótica linear **O(N)**.


---

## ⚙️ Arquitetura Core e Design System

Esta versão marca a ruptura de velhos motores em C++ (Pandas) ou bancos estruturados atrelados ao disco em favor do processamento ultra veloz nos *Browsers Modernos*.

### 1. Zero Infrastructure (Serverless Runtime)
A aplicação roda isolada. Como utilizamos do formato ECMAScript para parsing via biblioteca embarcada de `.XLSX`, basta qualquer provedor estático gratuito (Netlify, Github Pages) hospedá-la em 5 segundos, sem a necessidade de maquinas virtuais para Backend.

### 2. High-End UI (Aesthetic Vercel)
O painel foi construído focado no "Cura e Alívio" dos olhos de mesas de operações. Um Grid escurecido com texturas neon provê alívio sob o fundo negro fosco (Slate-950). É adotada a rigorosa tipografia geométrica `Outfit`, que entrega alto nível de autoridade e estética profissional de Software SaaS Nível 1.

### 3. Edge Storage e Segurança
O antigo mecanismo MySQL/Supabase foi derrubado. Agora, todos os históricos de análises do Assessor ou Gerente de Operações são selados dentro da chave `window.localStorage`, provendo o histórico das varreduras apenas localmente no hardware da pessoa, de forma perene e incorruptível por ataques externos.


---

## 🧠 Engenharia Quantitativa (DDD) e Regras de Negócio O(N)

Por trás dos vidros transparentes do layout, a aplicação utiliza complexos heurísticos para ler qualquer arquivo cru sem a dependência do operador formatar o Excel antes de jogá-lo na plataforma:

### 🎯 1. Auto-Discovery Mapping Vertical
Em vez de quebrar por colunas fora de quadro, o Script varre com varredura as 15 primeiras linhas até achar o peso gravitacional da "Linha Cabeçalho". Ele pontua por menções (*'taxa', 'vencimento', 'emissor'*) e traça as colunas primárias ignorando completamente Logotipos e Disclaimers Sujos na ponta de cima das planilhas que as tesourarias exportam.

### 🥇 2. Combate Matador em Hash (Dict)
O painel varre cada vertice anual (`1 ano`, `2 anos`, `3 anos`). Caso encontre 80 CDBs para `1 ano`, ele não perde tempo em estruturas pesadas. Ele simplesmente mapeia a tabela em memória rápida `has = { 1: taxa }`. No final da linha de combate, o CDB de maior valor sempre sobrescreve o antigo em memória.
Ao finalizar, somente a **Taxa Ouro Absoluta** sobreviveu no dict `O(1)`. O tempo total do processamento fica sempre abaixo de ~5ms.

### 🏦 3. Dupla Face de Extração do Mercado Livre e Secundário
O Robô sabe agir e formatar diferentemente à depender da tela em que o Engenheiro de Operações ativou a Chave "Toggle":
- **Modo Mercado Primário:** Foca no título seco, ocultando automaticamente da prancheta limpa quaisquer "Emissores Institucionais", deixando um resultado clean (`3 anos - CDB 15%`) destinado ao copy-paste veloz em cotações e reuniões C-Level.
- **Modo Mercado Secundário:** Passa a ser voraz. Extrai da coluna *"Ativo"* (seja por um string slicing avançado que recorta palavras atreladas ao ticket ou regex base) nomes cruciais como de dezenas de Bancos como `Pine`, `Original`, `Master`, `Fibra`, e fixa eles com agressividade ao final do Copy-Paste (`3 anos - CDB 15% (PINE)`) assegurando precisão de lastro para o cliente.

### 🛑 4. Abate (Muros de Restrição Funcional)
O código extirpa nativamente ativos que fariam um investidor B2b se enforcar na prancheta de análise de Longo Prazo, expurgando automaticamente a base de fundos rotativos ou `Liquidez de D+0/Diária`. Ele também arredonda os cálculos dos prazos "dias para anos completos" com uma condescendência de até *90 dias*, garantindo a captura perfeita de CDBs com vencimentos engessados para o mercado alvo.


---

## 🚀 Guia de Deploy Absoluto (Pronto em 10 Segundos)

Este Software é `Drag And Drop` no mundo Estático:

### 🌐 Método 1: Netlify Instant Drop
1. Desça o clone total da branch atual, deixando a sua pasta raiz contendo apenas `index.html`, `style.css` e `script.js`.
2. Efetue conta e login em [**App Netlify**](https://app.netlify.com/teams).
3. Dirija-se à barra lateral **Sites** e clique abaixo em **"Add New Site -> Deploy Manually"**.
4. Irá aparecer um disco enorme pontilhado; apenas clique e arraste a sua pasta completa para dentro desse anel.
5. Em no máximo 3.1 segundos, o Netlify cospe a tela e os domínios (`seunome.netlify.app`), tudo rodando liso!

### 💻 Método 2: Execução Local Rápida (Developer)
Caso queira modificar algo, não precisa instalar bibliotecas globais como o `Node.JS` ou `Docker`.
O interpretador em Javascript não requer um Servidor para render.
Apenas acesse a pasta raiz com as três malhas do programa e clique rapidamente 2x no seu arquivo `index.html` e a Mágica renderiza localmente em qualquer navegador (Chrome, OPR, Edge, Firefox).

---
https://gregarious-tiramisu-8f1dba.netlify.app/
