# Core.js — Debugging

> Use este guia quando seu app não funcionar ou tiver comportamento estranho.
> Os exemplos mostram primeiro a forma simples com `app.on()`, depois como o core resolve com `bind()`.

---

## Checklist rápido

### App não renderiza nada

**O elemento `#app` existe no HTML?**
```html
<!-- CORRETO -->
<div id="app"></div>

<!-- ERRADO — comentado -->
<!-- <div id="app"></div> -->

<!-- ERRADO — class em vez de id -->
<div class="app"></div>
```

**O seletor no `createStore` bate com o HTML?**
```javascript
// CORRETO
const app = createStore({
    selector: '#app',
    ...
});

// ERRADO — seletor diferente do HTML
const app = createStore({
    selector: '#meu-app', // HTML tem id="app"
    ...
});
// Erro: createStore: elemento "#meu-app" não encontrado no DOM
```

---

### Eventos não funcionam — entendendo o problema

Quando o template gera HTML como string, não é possível passar referências de função diretamente. Então como conectar um clique a uma função?

**Forma simples — `app.on()` + `data-*`:**

A ideia mais simples é marcar os elementos com atributos `data-*` e registrar os handlers separadamente:

```html
<!-- No template: marca o elemento com data-click -->
<button data-click="addTask">Adicionar</button>
```

```javascript
// No app.js: registra o handler para esse seletor
app.on('click', '[data-click=addTask]', (event, state) => {
    state.tasks = [...state.tasks, newTask];
});
```

Essa abordagem funciona bem, mas separa o handler do componente que o usa. Conforme o app cresce, fica difícil rastrear qual handler pertence a qual componente.

**Como o core resolve — `bind()` + `__dispatch`:**

O `bind()` mantém o handler junto ao componente, registra com um ID único e retorna a string pronta para o `onclick`:

```javascript
// No componente — handler e elemento juntos
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

const Template = ({ state }) => `
    <button onclick="${onAddTask}">Adicionar</button>
`;

// Gera no HTML:
// <button onclick="window.__dispatch(&quot;fn_abc123&quot;, event)">
```

---

### Eventos registrados mas não disparam

**Você está usando `onclick` no atributo? (não `data-onclick`)**

`data-onclick` é só um atributo de dado — o browser nunca o executa:

```html
<!-- ERRADO — data-onclick nunca executa -->
<button data-onclick="window.__dispatch(&quot;fn_abc&quot;, event)">
    Adicionar
</button>

<!-- CORRETO — onclick executa no clique -->
<button onclick="window.__dispatch(&quot;fn_abc&quot;, event)">
    Adicionar
</button>
```

**Verifique no DevTools (F12 > Elements) o HTML gerado:**
```html
<!-- Se você ver isso → bug de data-onclick -->
<button data-onclick="...">

<!-- Se você ver isso → correto -->
<button onclick="window.__dispatch(...)">
```

---

### Eventos funcionam na primeira vez mas param após re-render

**Você está criando `bind()` dentro da função template?**

A cada re-render um novo ID é criado, mas o HTML anterior ainda aponta para o ID antigo:

```javascript
// ERRADO — bind() dentro do template
const Template = ({ state }) => {
    // Render 1 → cria fn_abc111
    // Render 2 → cria fn_abc222 (antigo se perde!)
    // Render 3 → cria fn_abc333 (antigo se perde!)
    const onAdd = bind(addTask);

    return `<button onclick="${onAdd}">Adicionar</button>`;
};

// CORRETO — bind() fora do template, criado uma única vez
const onAdd = bind(addTask); // fn_abc111 — para sempre

const Template = ({ state }) => `
    <button onclick="${onAdd}">Adicionar</button>
`;
```

---

### Input perde foco quando digita

**Você está usando `data-bind` no input?**

O core usa `data-bind` para identificar qual input estava ativo antes do diff e restaurar o foco depois:

```html
<!-- CORRETO — com data-bind e value -->
<input
    data-bind="taskName"
    value="${state.taskName}"
    oninput="${onTaskNameInput}"
/>

<!-- ERRADO — sem data-bind -->
<input value="${state.taskName}" oninput="${onTaskNameInput}"/>

<!-- ERRADO — sem value -->
<input data-bind="taskName" oninput="${onTaskNameInput}"/>
```

**Múltiplos inputs com o mesmo `data-bind`?**
```html
<!-- PROBLEMA — core não sabe qual restaurar -->
<input data-bind="name" placeholder="Nome 1">
<input data-bind="name" placeholder="Nome 2">

<!-- SOLUÇÃO — data-bind único por input -->
<input data-bind="taskName" value="${state.taskName}">
<input data-bind="taskDescription" value="${state.taskDescription}">
```

---

### Lista não atualiza quando adiciono itens

**Você está mutando o array diretamente?**

O Proxy só intercepta `state.tasks = novoArray`. Mutações diretas passam despercebidas:

```javascript
// ERRADO — Proxy não detecta mutação direta
state.tasks.push(newTask);
state.tasks[0] = newTask;
state.tasks.splice(0, 1);

// CORRETO — sempre substitui com novo array (imutabilidade)
state.tasks = [...state.tasks, newTask];            // adicionar
state.tasks = state.tasks.filter(t => t.id !== id); // remover
state.tasks = state.tasks.map(t =>                  // atualizar
    t.id === id ? { ...t, completed: true } : t
);
```

---

### App fica lento com o tempo

**Você está criando stores sem destruir os antigos?**

```javascript
// PROBLEMA — app1 ainda vivo, listeners acumulam
const app1 = createStore({...});
const app2 = createStore({...});

// SOLUÇÃO — destrua antes de criar novo
app1.destroy();
const app2 = createStore({...});
```

O `destroy()` limpa listeners internos, handlers registrados via `bind()` no `dispacherRegistry` e o DOM do elemento raiz.

---

## Modo debug — ative logs no core.js

Adicione logs temporários no `core.js` para entender o que está acontecendo:

```javascript
// Em render() — veja quando e com qual estado renderiza
const render = (currentState) => {
    console.log('render chamado:', currentState);
    // ... resto do render
    console.log('DOM atualizado');
};

// No Proxy.set — veja cada mudança de estado
set(target, prop, value) {
    console.log(`estado mudou: ${String(prop)} =`, value);
    if (target[prop] === value) {
        console.log('  valor igual, ignorado');
        return true;
    }
    target[prop] = value;
    listeners.forEach(f => f(target));
    return true;
}

// No __dispatch — veja cada evento disparado
window.__dispatch = (fncID, event) => {
    console.log(`dispatch: ${fncID}`, event.type, event.target);
    const handler = dispacherRegistry.get(fncID);
    if (!handler) {
        console.warn(`handler não encontrado para ${fncID}`);
        return;
    }
    handler(event, stateReactive);
};
```

---

## Investigar via browser DevTools

**Console (F12):**
```javascript
// Ver estado atual da aplicação
console.log(app.state);

// Forçar mudança de estado manualmente (teste)
app.state.isCreatePanelOpen = true;

// Verificar se o dispacherRegistry tem os IDs
// (coloque isso temporariamente no core.js)
console.log('IDs registrados:', [...dispacherRegistry.keys()]);
```

**Elements (Inspector):**
1. Clique em um botão que não funciona
2. Verifique se o atributo é `onclick` (não `data-onclick`)
3. Copie o valor do `onclick` e cole no console para testar manualmente:
```javascript
// Cole no console para testar o dispatch direto
window.__dispatch("fn_abc123", new Event('click'))
```

---

## Fluxograma de debugging rápido

```
App não renderiza nada?
└─ #app existe no HTML com o seletor correto?

Eventos não funcionam?
├─ HTML gerado tem onclick="" (não data-onclick)?
└─ bind() está fora da função template?

Eventos param após re-render?
└─ bind() está sendo criado dentro do template? → mova para fora

Input perde foco ao digitar?
├─ Input tem data-bind="chave"?
├─ Input tem value="${state.chave}"?
└─ Não há outro input com o mesmo data-bind?

Lista não atualiza?
└─ Está usando [...state.lista, novo] em vez de .push()?

App fica lento?
└─ Está chamando destroy() antes de criar novo store?
```

---

## Mensagens de erro comuns

**`createStore: elemento "#app" não encontrado no DOM`**
```
Causa:   seletor não encontra o elemento
Solução: verifique se o id/classe no HTML bate com o selector
```

**`handler não encontrado para fn_abc123`**
```
Causa:   bind() foi chamado dentro do template — ID muda a cada render
Solução: mova todos os bind() para fora da função template
```

**`Cannot read properties of undefined (reading 'map')`**
```
Causa:   state.tasks não é array — provavelmente undefined
Solução: inicialize como array vazio no state inicial
         state: { tasks: [], ... }
```

**`event.target.closest is not a function`**
```
Causa:   navegador antigo sem suporte a closest()
Solução: adicione polyfill ou atualize o ambiente de teste
```

---

## Conceitos para fixar

**Estado !== DOM**
O estado é só dados. O DOM é a representação visual. Mude o estado — o core atualiza o DOM automaticamente. Nunca modifique o DOM diretamente.

**Imutabilidade**
O Proxy só detecta `state.prop = novoValor`. Mutações diretas em objetos e arrays existentes passam invisíveis. Sempre substitua, nunca mute.

**`bind()` uma vez, usa sempre**
O ID gerado pelo `bind()` deve ser estável. Fora do template = criado uma vez = ID fixo = eventos sempre funcionam. Dentro do template = recriado a cada render = ID muda = eventos quebram.

**`data-bind` é para foco, não para eventos**
`data-bind` só existe para o core saber qual input restaurar o foco. Eventos usam `onclick` e `oninput` com `bind()` e `__dispatch`.