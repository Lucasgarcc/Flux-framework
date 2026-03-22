/**
 * MOTOR - Mini Framework de Reatividade
 * 
 * Conceitos fundamentais:
 * 1. Proxy: detecta mudanças no estado e dispara render automático
 * 2. Diff: compara DOM atual com novo DOM, atualizando só o necessário
 * 3. Dispatch: eventos inline no HTML chamam handlers via __dispatch
 */

/**
 * Atualiza atributos de um elemento do DOM comparando com novo estado
 * Estratégia: remover antigos, adicionar/atualizar novos (reconciliation)
 * @param {Element} oldNode - Elemento no DOM
 * @param {Element} newNode - Elemento novo gerado pelo template
 */
function patchAttributes(oldNode, newNode) {

    if (oldNode.nodeType !== Node.ELEMENT_NODE) return;

    // Adiciona novos atributos ou atualiza os existentes
    const newAttrs = newNode.attributes;

    for (let i = 0; i < newAttrs.length; i++) {

        const { name, value } = newAttrs[i];

        if (oldNode.getAttribute(name) !== value) {
            oldNode.setAttribute(name, value);
        }
    }

    // Remove atributos que não existem mais
    const oldAttrs = Array.from(oldNode.attributes);
    for (const attr of oldAttrs) {
        if (!newNode.hasAttribute(attr.name)) {
            oldNode.removeAttribute(attr.name);
        }
    }
}

/**
 * Algoritmo de Reconciliação (Virtual DOM Diff)
 * Compara árvore DOM atual com a nova gerada pelo template
 * Strategia: identificar mínimas mudanças e aplicar apenas elas (otimização)
 * @param {Element} parent - Elemento pai
 * @param {Element} oldNode - Node atual no DOM
 * @param {Element} newNode - Node novo gerado pelo template
 */
function diff(parent, oldNode, newNode) {

    // Caso 1: elemento novo, não existia antes
    if (!oldNode) {
        parent.appendChild(newNode);
        return;
    }

    // Caso 2: elemento foi removido
    if (!newNode) {
        parent.removeChild(oldNode);
        return;
    }

    // Caso 3: tipo de elemento mudou (ex: <div> → <span>), substitui
    if (oldNode.nodeName !== newNode.nodeName) {
        parent.replaceChild(newNode, oldNode);
        return;
    }

    // Caso 4: é apenas texto, compara conteúdo
    if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.textContent !== newNode.textContent) {
            oldNode.textContent = newNode.textContent;
        }
        return;
    }

    // Caso 5: elemento continua, mas pode ter mudado atributos/filhos
    patchAttributes(oldNode, newNode);

    // Recursão: compara todos os filhos
    const oldChildren = Array.from(oldNode.childNodes);
    const newChildren = Array.from(newNode.childNodes);
    const max = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < max; i++) {
        diff(oldNode, oldChildren[i], newChildren[i]);
    }
}

// Armazena todos os handlers registrados via bind()
const dispacherRegistry = new Map();

/**
 * bind — registra um handler e retorna a string onclick para uso no HTML
 * 
 * IMPORTANTE: sempre declarar fora da função de template (escopo de módulo)
 * Declarar dentro do template recria o ID a cada render, quebrando os eventos.
 * 
 * @param {Function} fnc - Handler (event, state) => void
 * @returns {string} - String pronta para uso em onclick="..."
 * 
 * @example
 * // correto — fora do template, criado uma única vez
 * const onClick = bind((event, state) => { state.count++ });
 * 
 * // no template
 * const Template = ({ state }) => `<button onclick="${onClick}">+</button>`;
 */
export function bind(fnc) {

    // Cria um id único
    const id = `fn_${Math.random().toString(36).substring(2, 9)}`;

    // Armazena o handler
    dispacherRegistry.set(id, fnc);

    // Retorna a string onclick pronta para o HTML
    return `window.__dispatch(&quot;${id}&quot;, event)`;
}

/**
 * createStore: função principal que cria o motor reativo
 * 
 * Fluxo de funcionamento:
 * 1. bind() registra handlers com IDs únicos no dispacherRegistry
 * 2. Template usa os IDs no HTML: onclick="window.__dispatch(...)"
 * 3. Clique dispara __dispatch → busca handler pelo ID → executa
 * 4. Handler muda o state → Proxy detecta a mudança → render()
 * 5. diff() atualiza só o necessário no DOM
 * 
 * @param {Object} config - Configuração do store
 * @param {Object} config.state - Estado inicial da aplicação
 * @param {Function} config.template - Função que retorna string HTML (recebe state como argumento)
 * @param {String} config.selector - Seletor CSS do elemento raiz (#app, .container, etc)
 * @returns {Object} { state, destroy } - API pública do motor
 */
export function createStore({ state, template, selector }) {

    // Validações iniciais
    if (!selector) {
        throw new Error('createStore: selector é obrigatório (ex: "#app")');
    }

    const root = document.querySelector(selector);
    if (!root) {
        throw new Error(`createStore: elemento "${selector}" não encontrado no DOM`);
    }

    // Listeners internos — render é o principal
    const listeners = new Set();

    // Rastreia os IDs de bind() vinculados a este store
    // Permite que destroy() limpe apenas os handlers deste store
    // sem afetar outros stores ou handlers globais
    const boundIds = new Set();

    /**
     * Expõe o dispatcher globalmente para que os eventos inline do HTML
     * consigam alcançar os handlers registrados no dispacherRegistry
     * Executa o handler passando o evento e o estado reativo
     */
    window.__dispatch = (fncID, event) => {

        // Busca o handler pelo ID
        const handler = dispacherRegistry.get(fncID);

        // Executa passando o evento e o estado reativo
        if (handler) {
            handler(event, stateReactive);
        }
    };

    /**
     * Renderiza a aplicação: gera novo DOM via template, compara com atual, aplica mudanças
     * Preserva foco em inputs (two-way binding)
     * @private
     * @param {Object} currentState - Estado atual (passado pelo Proxy setter)
     */
    const render = (currentState) => {

        // Salva elemento ativo e posição do cursor (UX: preservar foco)
        const activeEl = document.activeElement;
        const activeKey = activeEl?.dataset.bind;
        const cursorPos = activeEl?.selectionStart;

        // Converte template string em elemento DOM real (via parser)
        const parser = new DOMParser();
        const doc = parser.parseFromString(template(currentState), 'text/html');
        const newNode = doc.body.firstElementChild;

        if (!newNode) {
            console.warn('createStore: template retornou HTML inválido');
            return;
        }

        // Primeira renderização: apenas adiciona ao DOM
        if (!root.hasChildNodes()) {
            root.appendChild(newNode);
        } else {
            // Renderizações subsequentes: usa diff para atualizar apenas o necessário
            diff(root, root.firstChild, newNode);
        }

        // Restaura foco no input que estava ativo (two-way binding)
        if (activeKey && activeEl?.dataset.bind === activeKey) {
            activeEl.focus();
            if (cursorPos !== undefined) {
                activeEl.setSelectionRange(cursorPos, cursorPos);
            }
        }
    };

    /**
     * Proxy reativo: monitora mudanças no estado
     * Quando uma propriedade muda, executa o render automaticamente
     * Otimização: ignora se o valor novo é igual ao antigo (shallow comparison)
     */
    const stateReactive = new Proxy(state, {
        set(target, prop, value) {

            // Se valor não mudou, não re-renderiza (otimização)
            if (target[prop] === value) return true;

            target[prop] = value;

            // Notifica todos os listeners (principalmente o render)
            listeners.forEach(listener => listener(target));

            return true;
        }
    });

    /**
     * Limpa toda a aplicação (remove listeners, limpa handlers, limpa DOM)
     * Use antes de destruir a aplicação ou trocar de view
     * @public
     */
    function destroy() {

        // Remove listeners internos
        listeners.clear();

        // Remove do registry global apenas os handlers deste store
        boundIds.forEach(id => dispacherRegistry.delete(id));
        boundIds.clear();

        // Limpa o DOM
        root.innerHTML = '';
    }

    // Inicialização automática
    listeners.add(render); // Adiciona render como listener principal
    render(stateReactive); // Primeira renderização

    return {
        state: stateReactive,
        destroy
    };
}