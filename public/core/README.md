# Core.js — Mini Framework Reativo

> JavaScript puro. Sem dependências. Feito para entender como frameworks funcionam por baixo.

---

## O que é isso?

Um motor reativo construído do zero com três pilares fundamentais:

- **Proxy** — detecta mudanças no estado e dispara o render automaticamente
- **Diff** — compara o DOM atual com o novo e atualiza só o que mudou
- **Dispatch** — conecta eventos do HTML a handlers JavaScript via IDs únicos

Não é um framework para produção. É um laboratório — feito para quebrar, estudar e reconstruir.

---

## Estrutura

```
core/
  core.js                          ← o motor reativo
  docs/
    instructions/
      CORE-INSTRUCTIONS.md         ← como o motor funciona (4 pilares + erros reais)
    exemple/
      EXEMPLE-MIN.js               ← exemplo mínimo funcional
    debugging/
      DEBUGGING.md                 ← checklist e troubleshooting
```

---

## Como usar

```javascript
import { createStore, bind } from '../core/core.js';

// 1. Registrar handlers — sempre fora do template
const onIncrement = bind((event, state) => {
    state.count++;
});

// 2. Criar o store
const app = createStore({
    selector: '#app',
    state: { count: 0 },
    template: (state) => `
        <div>
            <p>${state.count}</p>
            <button onclick="${onIncrement}">+1</button>
        </div>
    `
});

// 3. Quando sair da view
app.destroy();
```

---

## Os 4 Pilares

| Pilar | O que faz |
|-------|-----------|
| **Proxy** | Intercepta mudanças no estado e chama o render automaticamente |
| **Diff** | Compara DOM antigo com novo e aplica só as mudanças mínimas |
| **Dispatch** | Conecta `onclick` do HTML a funções JS via `bind()` + `__dispatch` |
| **Two-Way Binding** | Preserva foco e cursor de inputs durante re-renders |

Leia `docs/instructions/CORE-INSTRUCTIONS.md` para entender cada pilar em profundidade, com analogias e erros reais encontrados durante o desenvolvimento.

---

## Regra crítica — `bind()` fora do template

```javascript
// ✅ Correto — criado uma única vez, ID sempre o mesmo
const onAdd = bind((event, state) => { ... });
const Template = (state) => `<button onclick="${onAdd}">+</button>`;

// ❌ Errado — cria ID novo a cada render, eventos quebram
const Template = (state) => {
    const onAdd = bind((event, state) => { ... }); // novo ID a cada render!
    return `<button onclick="${onAdd}">+</button>`;
};
```

---

## API pública

```javascript
// bind(fn) → string onclick
const handler = bind((event, state) => { ... });

// createStore({ selector, state, template }) → { state, destroy }
const app = createStore({ selector, state, template });

// app.state → estado reativo (qualquer mudança dispara render)
app.state.count = 5;

// app.destroy() → limpa listeners, handlers e DOM
app.destroy();
```

---

## Próximos passos

- [ ] Keys em listas — preservar estado de cada item quando a ordem muda
- [ ] Batching de updates — agrupar múltiplos renders com `requestAnimationFrame`
- [ ] Lifecycle hooks — `beforeMount`, `mounted`, `beforeUpdate`, `updated`
- [ ] Computed properties — valores derivados com caching automático