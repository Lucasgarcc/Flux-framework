# Linha do tempo — Core.js

> O core não saiu pronto. Ele evoluiu a partir de decisões reais e erros reais.
> Este documento registra esse processo em duas perspectivas.

---

## Evolução do pensamento

As decisões e aprendizados que moldaram o projeto.

---

**Ponto de partida: render manual**

Sem framework. O render era chamado manualmente a cada mudança de estado. Qualquer alteração exigia lembrar de chamar a função — frágil e repetitivo.

---

**Decisão: Proxy para reatividade**

A pergunta que mudou tudo: *e se o estado avisasse sozinho quando mudasse?*

O Proxy funciona como um secretário que intercepta toda mudança. Quando você faz `state.nome = "João"`, ele detecta e dispara o render automaticamente — sem precisar lembrar de chamar nada.

---

**Decisão: diff em vez de innerHTML**

Substituir `root.innerHTML` a cada render destruía o DOM inteiro — inputs perdiam foco, o scroll resetava, o estado visual sumia.

A solução foi comparar o DOM atual com o novo e aplicar apenas as diferenças mínimas. Como um revisor que corrige só as palavras erradas em vez de reescrever o livro inteiro.

---

**Erro: `data-onclick` não dispara eventos**

Os cliques não faziam nada. Nenhum erro no console. Silêncio total.

O problema: `data-onclick` é um atributo de dado, como `data-id` ou `data-name`. O browser nunca executa atributos `data-*` automaticamente. Só `onclick=""` dispara no clique.

---

**Erro: `bind()` dentro do template**

Na primeira renderização funcionava. Após qualquer mudança de estado, os eventos paravam.

O problema: cada render recriava o `bind()`, gerando um ID novo. O HTML apontava para o ID antigo, que não existia mais no registry. Resultado: eventos quebrados e memory leak acumulando no Map.

A solução foi mover o `bind()` para fora do template — executado uma única vez quando o módulo carrega, ID sempre o mesmo.

---

**Insight: `bind()` + `__dispatch`**

Em vez de registrar handlers fora do componente com `data-*`, o `bind()` inverte a lógica: registra o handler com um ID único e devolve a string pronta para o `onclick`. Handler e elemento ficam juntos no mesmo arquivo. O `app.js` não precisa saber nada sobre o evento.

---

**Resultado: entender frameworks por dentro**

React, Angular e Vue fazem exatamente isso — Proxy (ou equivalente), diff, event delegation. Construir o core do zero torna esses mecanismos visíveis. Você para de usar o framework como caixa preta e começa a ver o que está acontecendo dentro.

---

## Evolução do código

As mudanças técnicas em cada etapa.

---

**v0 — render manual + innerHTML**

```javascript
// estado de partida
root.innerHTML = template(state); // destrói o DOM inteiro
// console.log espalhados
// sem validações
// sem destroy()
// JSDoc incompleto
```

---

**+ Proxy reativo**

```javascript
const stateReactive = new Proxy(state, {
    set(target, prop, value) {
        if (target[prop] === value) return true;
        target[prop] = value;
        listeners.forEach(listener => listener(target));
        return true;
    }
});
```

Qualquer mudança no estado dispara os listeners automaticamente. Render vira consequência, não responsabilidade de quem escreve o código.

---

**+ `diff()` e `patchAttributes()`**

```javascript
function diff(parent, oldNode, newNode) {
    if (!oldNode)                          { parent.appendChild(newNode); return; }
    if (!newNode)                          { parent.removeChild(oldNode); return; }
    if (oldNode.nodeName !== newNode.nodeName) { parent.replaceChild(newNode, oldNode); return; }
    if (oldNode.nodeType === Node.TEXT_NODE)    { oldNode.textContent = newNode.textContent; return; }
    patchAttributes(oldNode, newNode);
    // recursão nos filhos...
}
```

5 casos de reconciliação. Só atualiza o que mudou. Foco e cursor dos inputs são preservados antes e restaurados depois do diff.

---

**+ `app.on()` com `data-*` (fase 1 de eventos)**

```javascript
// template
`<button data-click="addTask">Adicionar</button>`

// app.js
app.on('click', '[data-click=addTask]', (event, state) => {
    state.tasks = [...state.tasks, newTask];
});
```

Event delegation na raiz. Um listener captura tudo e distribui. Funcionava bem para projetos pequenos — mas handlers e componentes ficavam separados conforme o projeto crescia.

---

**- Código morto removido**

```javascript
// removidos — nunca eram chamados de verdade
on()
setupEvents()
registerComponent()
mount()

// API pública antes (confusa)
return { state, on, setupEvents, registerComponent, destroy };
```

Métodos que existiam mas não faziam nada de útil. Removidos para deixar a API limpa e legível.

---

**+ `bind()` + `dispacherRegistry` (fase 2 de eventos)**

```javascript
// fora do template — criado uma única vez
const onAddTask = bind((event, state) => {
    state.tasks = [...state.tasks, newTask];
});

// no template — handler junto ao componente
`<button onclick="${onAddTask}">Adicionar</button>`
```

```javascript
export function bind(fnc) {
    const id = `fn_${Math.random().toString(36).substring(2, 9)}`;
    dispacherRegistry.set(id, fnc);
    return `window.__dispatch(&quot;${id}&quot;, event)`;
}
```

ID único por handler. `onclick` com `__dispatch`. Handler e elemento no mesmo arquivo. `app.js` não precisa saber nada sobre o evento.

---

**+ `destroy()` com `boundIds`**

```javascript
const boundIds = new Set();

function destroy() {
    listeners.clear();
    boundIds.forEach(id => dispacherRegistry.delete(id));
    boundIds.clear();
    root.innerHTML = '';
}
```

Rastreia os IDs criados por este store. Limpa apenas os handlers deste store no `destroy()` — sem afetar outros stores ou handlers globais.

---

**v1 — API pública limpa**

```javascript
// exporta só o necessário
export { createStore, bind }

// retorna só o necessário
return {
    state: stateReactive,
    destroy
};
```

Sem código morto. Sem métodos que não fazem nada. Dois exports, dois retornos. O core faz exatamente o que precisa fazer — nem mais, nem menos.
