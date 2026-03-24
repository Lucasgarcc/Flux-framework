<div align="center">

# Flux

**Task manager construído com um mini framework reativo vanilla JS**

Sem React. Sem Vue. Sem dependências. Só JavaScript puro.

[Ver Demo](https://flux-framework.vercel.app/) · [Reportar Bug](https://github.com/Lucasgarcc/Flux-framework/blob/main/public/core/docs/debugging/DEBUGGING.md)

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![ES Modules](https://img.shields.io/badge/ES_Modules-007ACC?style=flat&logo=javascript&logoColor=white)](https://esmodules.com/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat)](https://www.npmjs.com/package/dependency)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

</div>

---

## Sobre o projeto

Flux é um task manager desenvolvido do zero com o objetivo de entender como frameworks modernos funcionam por baixo dos panos.

Em vez de usar React ou Vue, o projeto implementa seu próprio motor reativo em JavaScript puro — com os mesmos conceitos que grandes frameworks usam internamente: reatividade via Proxy, reconciliação de DOM via Diff e gerenciamento de eventos via Dispatch.

O resultado é um app funcional, reativo e modular — provando que os fundamentos da web são suficientes para construir interfaces complexas.

---

## Funcionalidades

- Criar, editar e excluir tarefas
- Checklist de subitens por tarefa
- Filtros — Todas, Ativas e Concluídas
- Painel lateral com progresso e estatísticas
- Visão rápida de tarefas pendentes
- Interface totalmente reativa — sem recarregar a página

---

## O Motor Reativo

O coração do projeto é um mini framework construído do zero com 4 pilares:

### Proxy — Estado Reativo
Intercepta mudanças no estado automaticamente. Qualquer alteração dispara o render sem precisar chamar nada manualmente.

```javascript
const stateReactive = new Proxy(state, {
    set(target, prop, value) {
        if (target[prop] === value) return true;
        target[prop] = value;
        listeners.forEach(listener => listener(target)); // render automático
        return true;
    }
});
```

### Diff — Reconciliação do DOM
Compara o DOM atual com o novo gerado pelo template e aplica apenas as mudanças mínimas necessárias — sem destruir e recriar tudo.

```javascript
function diff(parent, oldNode, newNode) {
    if (!oldNode) return parent.appendChild(newNode);
    if (!newNode) return parent.removeChild(oldNode);
    if (oldNode.nodeName !== newNode.nodeName) return parent.replaceChild(newNode, oldNode);
    if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.textContent !== newNode.textContent)
            oldNode.textContent = newNode.textContent;
        return;
    }
    patchAttributes(oldNode, newNode);
    // recursão nos filhos...
}
```

### Dispatch — Sistema de Eventos
Registra handlers com IDs únicos via `bind()`. O HTML chama `window.__dispatch()` que localiza e executa o handler correto com acesso ao estado reativo.

```javascript
// fora do template — criado uma única vez
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

// no template
const Template = ({ state }) => `
    <button onclick="${onAddTask}">Adicionar</button>
`;
```

### Two-Way Binding — Sincronização de Inputs
Inspirado no Angular — o estado atualiza a view e a view atualiza o estado. Foco e posição do cursor são preservados durante re-renders.

```html
<input
    data-bind="taskName"
    value="${state.taskName}"
    oninput="${onTaskNameInput}"
/>
```

---

## Estrutura do Projeto

```
flux/
├── public/
│   ├── index.html
│   ├── app/
│   │   ├── js/
│   │   │   └── motor.js          # motor reativo
│   │   ├── pages/
│   │   │   └── Template.js       # template principal
│   │   └── components/
│   │       ├── dashboard/        # painel lateral
│   │       ├── workspace/        # área de tarefas
│   │       ├── tasks/            # item de tarefa
│   │       ├── overlays/         # painéis e modais
│   │       ├── ui/               # Button, Input, Icon
│   │       └── shared/           # componentes compartilhados
├── server/
│   └── index.js                  # servidor local (dev)
├── vercel.json
└── package.json
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# Clone o repositório
git clone https://github.com/seu-user/flux.git
cd flux

# Instale as dependências de desenvolvimento
npm install

# Inicie o servidor local
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy

O projeto não tem build — é JavaScript puro servido como arquivo estático.

[![Deploy with Vercel](https://vercel.com/button)](https://flux-framework.vercel.app/)

Ou manualmente:
1. Importe o repositório na [Vercel](https://vercel.com)
2. Deixe Build Command e Install Command **vazios**
3. Configure Output Directory como `public`
4. Deploy

---

## Aprendizados

Este projeto foi construído para responder uma pergunta: **é possível construir uma interface reativa complexa sem nenhum framework?**

A resposta é sim — e o processo de construir o motor do zero trouxe clareza sobre o que React, Vue e Angular fazem internamente:

- Por que o estado não pode ser mutado diretamente
- Como o Virtual DOM decide o que atualizar
- Por que handlers precisam ser estáveis entre re-renders
- Como o two-way binding preserva a experiência do usuário

---

## Tecnologias

- JavaScript ES2022+
- ES Modules nativos
- HTML5 e CSS3
- Node.js (apenas desenvolvimento local)
- Vercel (deploy)

---

<div align="center">

Feito por **Lucas Garcia**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-garcia-l/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Lucasgarcc)

</div>
