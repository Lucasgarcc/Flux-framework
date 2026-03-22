/**
 * EXEMPLO MÍNIMO DE USO - Motor Reativo
 * 
 * Este arquivo mostra como usar o motor.js de forma simples
 * Sem complexidade, apenas os conceitos essenciais
 */

import { createStore } from '../../core.js';

// ============================================
// PASSO 1: Definir Estado Inicial
// ============================================
const initialState = {
  count: 0,
  taskName: '',
  tasks: []
};

// ============================================
// PASSO 2: Definir Template (Função que retorna HTML)
// ============================================
// Nota: template é uma FUNÇÃO que recebe o estado
// Toda vez que estado muda, template é chamado de novo
const template = (state) => `
  <div class="app">
    <h1>Mini App</h1>
    
    <!-- Exemplo 1: Exibir valor -->
    <p>Contador: <strong>${state.count}</strong></p>
    
    <!-- Exemplo 2: Input com two-way binding -->
    <input 
      type="text" 
      id="taskInput"
      data-bind="taskName"
      placeholder="Nome da tarefa"
      value="${state.taskName}"
    />
    
    <!-- Exemplo 3: Botões -->
    <button data-click="increment">+</button>
    <button data-click="decrement">-</button>
    <button data-click="addTask">Adicionar Tarefa</button>
    
    <!-- Exemplo 4: Lista renderizada do estado -->
    <ul id="tasks">
      ${state.tasks.map(task => `
        <li data-task-id="${task.id}">
          ${task.name}
          <button data-click="removeTask" data-id="${task.id}">❌</button>
        </li>
      `).join('')}
    </ul>
  </div>
`;

// ============================================
// PASSO 3: Criar Store (Motor Reativo)
// ============================================
const app = createStore({
  state: initialState,
  template: template,
  selector: '#app'  // Onde renderizar (HTML: <div id="app"></div>)
});

// ============================================
// PASSO 4: Registrar Event Listeners
// ============================================

// Clique no botão "+" → incrementa contador
app.on('click', '[data-click=increment]', (event, state) => {
  state.count++;
  // 🎯 Proxy detecta mudança, chama render() automaticamente!
});

// Clique no botão "-" → decrementa contador
app.on('click', '[data-click=decrement]', (event, state) => {
  state.count--;
});

// Input de tarefa → atualiza state.taskName (two-way binding)
app.on('input', '[data-bind=taskName]', (event, state) => {
  state.taskName = event.target.value;
});

// Clique em "Adicionar Tarefa" → adiciona à lista
app.on('click', '[data-click=addTask]', (event, state) => {
  if (state.taskName.trim().length === 0) {
    alert('Digite um nome para a tarefa');
    return;
  }

  const newTask = {
    id: Date.now(),  // ID único simples (melhorar depois)
    name: state.taskName
  };

  // Cria novo array (imutabilidade)
  state.tasks = [...state.tasks, newTask];
  
  // Limpa input
  state.taskName = '';
});

// Clique em "❌" → remove tarefa
app.on('click', '[data-click=removeTask]', (event, state) => {
  const taskId = parseInt(event.target.dataset.id);
  state.tasks = state.tasks.filter(t => t.id !== taskId);
});

// ============================================
// PASSO 5: Ativar Event Listeners e Renderizar
// ============================================
app.setupEvents();  // 🎯 Ativa todos os listeners registrados
// Note: render() já foi chamado automaticamente durante createStore()

// ============================================
// PASSO 6 (BÔNUS): Limpar quando não usar mais
// ============================================
// Antes de destruir a aplicação:
// app.destroy();

// ============================================
// ENTENDENDO O FLUXO
// ============================================
/*
1. User clica em "+":
   └─> evento dispara em "#app" (root)
   └─> event delegation encontra "[data-click=increment]"
   └─> callback executa: state.count++
   
2. Proxy intercepta state.count = novo valor:
   └─> chama listeners.forEach(f => f(state))
   └─> render(state) é executado!
   
3. render() faz:
   └─> template(state) gera HTML novo
   └─> diff(root, oldNode, newNode) compara
   └─> atualiza apenas o que mudou (o <strong>${state.count}</strong>)
   
4. Browser exibe a tela atualizada ✅

Ciclo completo em milissegundos!
*/

// ============================================
// DICAS IMPORTANTES
// ============================================

// ✅ CORRETO: Atribuição simples (Proxy pega)
state.count = 10;        // Proxy intercepta! ✅
state.taskName = 'Novo'; // Proxy intercepta! ✅

// ✅ CORRETO: Array copy (para imutabilidade)
state.tasks = [...state.tasks, newTask]; // Proxy intercepta! ✅

// ❌ EVITAR: Mutações diretas (Proxy NOT intercepta)
state.tasks.push(newTask);  // Proxy NÃO vê! Array mutou direto.
state.count += 1;           // Pode funcionar, mas use = para ser claro

// ❌ EVITAR: Propriedades que não existem no estado inicial
state.newProp = 'value';    // Proxy criará, mas DOM não conhece

// ============================================
// ESTRUTURA HTML NECESSÁRIA NO index.html
// ============================================
/*
<!DOCTYPE html>
<html>
<head>
  <title>Mini App</title>
</head>
<body>
  <div id="app"></div>  ← Aqui o motor renderiza!
  <script type="module" src="./seu-arquivo-com-este-codigo.js"></script>
</body>
</html>
*/

export default app;
