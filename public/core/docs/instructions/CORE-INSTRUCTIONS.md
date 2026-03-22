# Core.js — Guia de Instruções

> Mini framework reativo em JavaScript puro.
> Este documento explica como o core funciona, seus pilares fundamentais, como começar do jeito mais simples e quando evoluir para a forma com componentes.

---

## Os 4 Pilares Fundamentais

### Pilar 1: Proxy (Estado Reativo)

**O que é?**
Um intermediário que intercepta mudanças no estado. Sempre que você faz `state.nome = "João"`, o Proxy detecta e avisa: render de novo.

**Por que existe?**
Sem Proxy você teria que chamar `render()` manualmente a cada mudança. Com Proxy o render é automático — mudou o estado, a tela atualiza.

**Analogia:**
```
Imagine um secretário que não deixa nada passar:

SEM PROXY (manual):
   Você: "Fiz uma mudança no arquivo"
   Sistema: (não faz nada)
   Você: "Agora atualiza a tela!"

COM PROXY (automático):
   Você: "Fiz uma mudança no arquivo"
   Proxy: (detecta a mudança, avisa o render)
   Tela: "Ué, mudou? Deixa eu atualizar!"
```

**Código:**
```javascript
const stateReactive = new Proxy(state, {
    set(target, prop, value) {
        // Ignora se o valor não mudou (otimização)
        if (target[prop] === value) return true;

        target[prop] = value;

        // Notifica todos os listeners — principalmente o render()
        listeners.forEach(listener => listener(target));

        return true;
    }
});

// Sempre que você faz isso:
stateReactive.taskName = "Nova tarefa"; // Proxy intercepta e chama render()
```

---

### Pilar 2: Diff (Reconciliação do DOM)

**O que é?**
Um algoritmo que compara o DOM atual com o novo gerado pelo template e aplica apenas as mudanças mínimas necessárias.

**Por que existe?**
Sem Diff você reconstruiria o HTML todo a cada mudança — `root.innerHTML = ...` destrói o DOM inteiro, inputs perdem foco, scroll reseta. Com Diff só o que mudou é atualizado.

**Analogia:**
```
Imagine que você precisa atualizar um livro:

SEM DIFF (reescreve tudo):
   Joga o livro inteiro no lixo
   Escreve tudo de novo do zero (1000 páginas!)

COM DIFF (só muda o necessário):
   Compara página por página
   "Só mudou uma palavra aqui?"
   Corrige só aquela palavra
```

**Algoritmo — 5 casos de reconciliação:**
```javascript
function diff(parent, oldNode, newNode) {
    // Caso 1: elemento novo, não existia antes → adiciona
    if (!oldNode) {
        parent.appendChild(newNode);
        return;
    }

    // Caso 2: elemento foi removido → deleta
    if (!newNode) {
        parent.removeChild(oldNode);
        return;
    }

    // Caso 3: tipo mudou (<div> → <span>) → substitui
    if (oldNode.nodeName !== newNode.nodeName) {
        parent.replaceChild(newNode, oldNode);
        return;
    }

    // Caso 4: é texto → compara e atualiza conteúdo
    if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.textContent !== newNode.textContent) {
            oldNode.textContent = newNode.textContent;
        }
        return;
    }

    // Caso 5: mesma tag → atualiza atributos e recursiona nos filhos
    patchAttributes(oldNode, newNode);

    const oldChildren = Array.from(oldNode.childNodes);
    const newChildren = Array.from(newNode.childNodes);
    const max = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < max; i++) {
        diff(oldNode, oldChildren[i], newChildren[i]);
    }
}
```

---

### Pilar 3: Eventos (Do Simples ao Dispatch)

**O problema fundamental:**
O template gera HTML como string. Strings não carregam referências de função. Então como conectar um elemento do HTML a uma função JavaScript?

Existem duas formas — uma simples para começar, outra mais robusta para quando o projeto cresce.

---

#### Forma simples: `app.on()` + `data-*`

A primeira ideia é marcar os elementos com atributos `data-*` e registrar os handlers separadamente na raiz. É a forma mais fácil de entender e ótima para começar.

```html
<!-- Template: marca o elemento com data-click -->
<button data-click="addTask">Adicionar</button>
<button data-click="deleteTask">Excluir</button>
```

```javascript
// app.js: registra handlers para cada seletor
app.on('click', '[data-click=addTask]', (event, state) => {
    state.tasks = [...state.tasks, newTask];
});

app.on('click', '[data-click=deleteTask]', (event, state) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
});
```

```javascript
// No core: UM listener na raiz captura tudo (Event Delegation)
root.addEventListener('click', (event) => {
    handlers.forEach(({ selector, handler }) => {
        const target = event.target.closest(selector);
        if (target) handler(event, stateReactive);
    });
});
```

**Analogia:**
```
Imagine uma recepção de hotel:

SEM DELEGATION (recepcionista em cada quarto):
   Quarto 101 → recepcionista próprio
   Quarto 102 → recepcionista próprio
   Quarto 500 → recepcionista próprio
   (500 recepcionistas! Caro demais)

COM DELEGATION (1 recepcionista na entrada):
   Qualquer hóspede chega → recepcionista central atende
   "Qual quarto? Vou te encaminhar."
   (1 listener na raiz, eficiente!)
```

**Quando usar essa forma:**
- Projetos pequenos ou quando está aprendendo o core
- Quando todos os handlers vivem bem no `app.js`
- Quando não há componentização — tudo num template só

**Quando essa forma começa a pesar:**

Conforme o projeto cresce, os handlers de todos os componentes precisam ficar em `app.js` — separados dos elementos que os usam:

```
CreateTaskPanel.js  → botão "Adicionar"
WorkspaceHeader.js  → botão "Nova tarefa"
TaskItem.js         → botão "Deletar", "Editar", "Salvar"
DashboardHero.js    → botão "Abrir painel"
```

Fica cada vez mais difícil rastrear qual handler pertence a qual componente. É o sinal de que está na hora de evoluir.

---

#### Forma com componentes: `bind()` + `__dispatch`

A solução é inverter a lógica: em vez de registrar o handler fora e marcar o elemento com `data-*`, o `bind()` registra o handler com um ID único e devolve a string pronta para o `onclick` — mantendo handler e elemento juntos no mesmo componente.

```javascript
// No componente — handler e elemento juntos no mesmo arquivo
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

const CreateTaskPanel = ({ isOpen }) => `
    <button onclick="${onAddTask}">Adicionar</button>
`;
// O template já sabe qual função chamar — sem precisar do app.js
```

**Como o `bind()` funciona internamente:**
```javascript
export function bind(fnc) {
    // 1. Gera um ID único para este handler
    const id = `fn_${Math.random().toString(36).substring(2, 9)}`;

    // 2. Salva a função no Map com o ID como chave
    dispacherRegistry.set(id, fnc);

    // 3. Retorna a string onclick pronta para o HTML
    return `window.__dispatch(&quot;${id}&quot;, event)`;
}

// O que vai no HTML:
// <button onclick="window.__dispatch(&quot;fn_abc123&quot;, event)">
```

**Como o `__dispatch` executa o handler:**
```javascript
window.__dispatch = (fncID, event) => {
    const handler = dispacherRegistry.get(fncID);
    if (handler) {
        handler(event, stateReactive);
    }
};
```

**Analogia:**
```
Imagine um painel de senhas de banco:

SEM DISPATCH (grita no corredor):
   "Alguém me atende?!"
   Todo mundo olha, ninguém sabe o que fazer

COM DISPATCH (senha individual):
   Você pega a senha "fn_abc123"
   Painel chama: "fn_abc123, guichê 3!"
   O atendente certo vem até você
```

---

#### Comparação direta: `app.on()` vs `bind()`

```javascript
// FORMA SIMPLES: app.on() ─────────────────────────────────
// Template: elemento marcado com data-*
const Template = () => `
    <button data-click="addTask">Adicionar</button>
`;

// app.js: handler separado do componente
app.on('click', '[data-click=addTask]', (event, state) => {
    state.tasks = [...state.tasks, newTask];
});


// FORMA COM COMPONENTES: bind() ───────────────────────────
// Handler e elemento juntos no componente
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

const Template = () => `
    <button onclick="${onAddTask}">Adicionar</button>
`;
// app.js não precisa saber nada sobre este evento
```

---

#### Regra crítica — `bind()` sempre fora do template

```javascript
// CORRETO — fora da função template, criado uma única vez
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

const Template = ({ state }) => `
    <button onclick="${onAddTask}">Adicionar</button>
`;

// ERRADO — dentro da função template, recria ID a cada render
const Template = ({ state }) => {
    const onAddTask = bind(...); // render 1 → fn_abc111
                                 // render 2 → fn_abc222 (eventos param!)
                                 // render 3 → fn_abc333 (memory leak!)
    return `<button onclick="${onAddTask}">Adicionar</button>`;
};
```

Por que? `bind()` fora do template roda uma única vez quando o módulo é importado. O ID gerado é sempre o mesmo — os eventos sempre funcionam.

---

### Pilar 4: Two-Way Binding (Sincronização de Inputs)

**O que é?**
Inspirado no Angular — o estado atualiza a view e a view atualiza o estado. Inputs preservam foco e posição do cursor durante re-renders.

**Por que existe?**
Sem two-way binding o input perde o foco toda vez que o usuário digita, porque o diff substitui o elemento. Com two-way binding o foco é salvo antes do render e restaurado depois.

**Código:**
```javascript
const render = (currentState) => {
    // Salva elemento ativo e posição do cursor ANTES do diff
    const activeEl = document.activeElement;
    const activeKey = activeEl?.dataset.bind;
    const cursorPos = activeEl?.selectionStart;

    // diff atualiza o DOM...

    // Restaura foco no input que estava ativo APÓS o diff
    if (activeKey && activeEl?.dataset.bind === activeKey) {
        activeEl.focus();
        if (cursorPos !== undefined) {
            activeEl.setSelectionRange(cursorPos, cursorPos);
        }
    }
};
```

**No HTML — use `data-bind` para identificar o input:**
```html
<input
    data-bind="taskName"
    value="${state.taskName}"
    oninput="${onTaskNameInput}"
/>
```

---

## Erros Reais Encontrados Durante o Desenvolvimento

### Erro 1: `data-onclick` em vez de `onclick` — eventos nunca disparavam

**Sintoma:**
Cliques não faziam nada. Nenhum erro no console. Silêncio total.

**O que estava acontecendo:**
```html
<button data-onclick="window.__dispatch(&quot;fn_abc&quot;, event)">
    Adicionar
</button>

<!-- data-onclick é só um atributo de dado, como data-id ou data-name -->
<!-- O browser NUNCA executa automaticamente atributos data-* -->
<!-- Só onclick="" dispara no clique -->
```

**Correção:**
```javascript
// ANTES — nunca executava
onclick ? `data-onclick='${onclick}'` : ''

// DEPOIS — executa no clique + escapa aspas internas
onclick ? `onclick="${onclick.replace(/"/g, '&quot;')}"` : ''
```

---

### Erro 2: `bind()` dentro do template — eventos quebravam após re-render

**Sintoma:**
Na primeira renderização funcionava. Após qualquer mudança de estado, os eventos paravam de responder.

**O que estava acontecendo:**
```javascript
const Template = ({ state }) => {
    const onAdd = bind(addTask); // render 1 → fn_abc111
                                 // render 2 → fn_abc222 (novo!)
                                 // render 3 → fn_abc333 (novo!)

    return `<button onclick="window.__dispatch(&quot;fn_abc333&quot;, event)">`;
    // O HTML aponta para o ID mais recente
    // mas os cliques anteriores ainda apontam para IDs antigos
    // + o Map acumula entradas infinitamente (memory leak)
};
```

**Correção:**
```javascript
// Criado UMA vez no escopo do módulo
const onAdd = bind(addTask); // fn_abc111 — para sempre

const Template = ({ state }) => `
    <button onclick="window.__dispatch(&quot;fn_abc111&quot;, event)">
        Adicionar
    </button>
`;
```

---

### Erro 3: root não encontrado — erro silencioso

**Sintoma:**
A aplicação não renderizava nada e não aparecia nenhum erro claro no console.

**O que estava acontecendo:**
```javascript
const app = createStore({
    selector: '#meu-app', // HTML tem id="app"
});
// querySelector retorna null
// O render tenta operar em null → falha silenciosa
```

**Correção:**
```javascript
const root = document.querySelector(selector);
if (!root) {
    throw new Error(`createStore: elemento "${selector}" não encontrado no DOM`);
}
```

---

### Erro 4: código morto acumulado — confusão na manutenção

**Sintoma:**
O core tinha funções que nunca eram chamadas: `on()`, `setupEvents()`, `registerComponent()`, `mount()`. API pública com métodos que não faziam nada.

**O que estava acontecendo:**
```javascript
return {
    state: stateReactive,
    on,                // não usado
    setupEvents,       // não usado
    registerComponent, // não usado
    destroy
};

app.registerComponent(Template); // não fazia nada
app.setupEvents();                // não registrava nada
```

**Correção:**
```javascript
return {
    state: stateReactive,
    destroy
};
```

---

### Erro 5: memory leak no `dispacherRegistry`

**Sintoma:**
A cada `destroy()`, os handlers registrados via `bind()` permaneciam no Map global para sempre, acumulando memória.

**O que estava acontecendo:**
```javascript
function destroy() {
    listeners.clear();
    root.innerHTML = '';
    // handlers do bind() ficavam no Map para sempre
}
```

**Correção:**
```javascript
const boundIds = new Set();

function destroy() {
    listeners.clear();
    boundIds.forEach(id => dispacherRegistry.delete(id));
    boundIds.clear();
    root.innerHTML = '';
}
```

---

## O Fluxo Completo

```
1. MÓDULO CARREGA
   bind() cria IDs únicos e registra handlers
   const onAdd = bind((e, state) => { state.tasks = [...] })
   → ID: fn_abc123 salvo no dispacherRegistry

2. PRIMEIRA RENDERIZAÇÃO
   createStore() chama render(state)
   template(state) gera string HTML com IDs nos onclicks
   DOMParser converte string → elemento DOM real
   root.appendChild(newNode)

3. USUÁRIO CLICA
   Browser dispara onclick do botão
   window.__dispatch("fn_abc123", event) é chamado

4. DISPATCH EXECUTA HANDLER
   dispacherRegistry.get("fn_abc123") → encontra a função
   handler(event, stateReactive) → executa
   state.tasks = [...state.tasks, newTask]

5. PROXY INTERCEPTA A MUDANÇA
   set(target, "tasks", novoValor)
   target["tasks"] !== novoValor → mudou!
   listeners.forEach(listener => listener(target))
   → render() é notificado

6. RENDER ATUALIZA O DOM
   template(currentState) → nova string HTML
   DOMParser converte → novo elemento DOM
   diff(root, oldNode, newNode) → compara árvores
   Só o que mudou é atualizado no DOM real
   Foco e cursor preservados (two-way binding)

7. TELA ATUALIZADA
   Nova tarefa aparece na lista
   Ciclo completo.
```

---

## API Pública

```javascript
import { createStore, bind } from '../../core.js';

// bind() — registra handler e retorna string onclick
// Sempre fora da função template
const onAdd = bind((event, state) => {
    state.count++;
});

// createStore() — cria a instância reativa
const app = createStore({
    selector: '#app',                      // seletor CSS do elemento raiz (obrigatório)
    state: {},                             // estado inicial
    template: (state) => `<div>...</div>`  // função que retorna HTML
});

// app.state — acesso ao estado reativo
app.state.count = 5; // dispara render automaticamente

// app.destroy() — limpa tudo antes de trocar de view
app.destroy();
```

---

## Próximos passos

- [ ] Keys em listas — quando a ordem muda, não perder estado de cada item
- [ ] Batching de updates — `requestAnimationFrame` para agrupar múltiplas mudanças em um só render
- [ ] Lifecycle hooks — `beforeMount`, `mounted`, `beforeUpdate`, `updated`
- [ ] Computed properties — valores derivados do estado com caching automático
- [ ] Roteamento — troca de views com `destroy` e `mount` limpos