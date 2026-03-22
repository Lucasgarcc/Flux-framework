import CreateTaskPanel from '../components/overlays/CreateTaskPanel.js';
import DashboardDisclosure from '../components/dashboard/DashboardDisclosure.js';
import DashboardFocusSection from '../components/dashboard/DashboardFocusSection.js';
import DashboardHero from '../components/dashboard/DashboardHero.js';
import StatsCard from '../components/dashboard/StatCard.js';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader.js';
import WorkspaceTaskArea from '../components/workspace/WorkspaceTaskArea.js';
import WorkspaceToolbar from '../components/workspace/WorkspaceToolbar.js';
//import { bind } from '../js/motor.js';
import { bind } from '../../../core/core.js';

const initState = {
    taskName: '',
    taskDescription: '',
    tasks: [],
    filter: 'all',
    isCreatePanelOpen: false,
    isDashboardStatsOpen: true,
    isDashboardQuickOpen: false
};
 
// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS — definidos uma única vez fora do Template
// bind() cria o ID e registra no dispacherRegistry apenas no carregamento
// do módulo, não a cada render. Isso corrige o bug de eventos quebrando.
// ─────────────────────────────────────────────────────────────────────────────
 
const onOpenCreatePanel = bind((event, state) => {
    state.isCreatePanelOpen = true;
});
 
const onCloseCreatePanel = bind((event, state) => {
    state.isCreatePanelOpen = false;
});
 
const onFilterAll = bind((event, state) => {
    state.filter = 'all';
});
 
const onFilterActive = bind((event, state) => {
    state.filter = 'active';
});
 
const onFilterCompleted = bind((event, state) => {
    state.filter = 'completed';
});
 
const onToggleDashboardStats = bind((event, state) => {
    state.isDashboardStatsOpen = !state.isDashboardStatsOpen;
});
 
const onToggleDashboardQuick = bind((event, state) => {
    state.isDashboardQuickOpen = !state.isDashboardQuickOpen;
});
 
const onTaskNameInput = bind((event, state) => {
    state.taskName = event.target.value;
});
 
const onTaskDescriptionInput = bind((event, state) => {
    state.taskDescription = event.target.value;
});
 
const onAddTask = bind((event, state) => {
    const title = (state.taskName ?? '').trim();
    const description = (state.taskDescription ?? '').trim();
 
    if (title.length < 3) return;
 
    const taskId = Date.now();
 
    const newTask = {
        id: taskId,
        title,
        description: '',
        completed: false,
        isEditing: false,
        isMenuOpen: false,
        isExpanded: false,
        newSubtask: '',
        subtasks: description
            ? [{ id: `${taskId}-1`, text: description, completed: false }]
            : []
    };
 
    const currentTasks = Array.isArray(state.tasks) ? state.tasks : [];
    state.tasks = [...currentTasks, newTask];
 
    state.taskName = '';
    state.taskDescription = '';
    state.isCreatePanelOpen = false;
});
 
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — função pura de renderização, sem efeitos colaterais
// Recebe state, retorna string HTML. Não cria handlers, apenas os usa.
// ─────────────────────────────────────────────────────────────────────────────
 
const Template = ({ state }) => {
    state = { ...initState, ...state };
 
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
 
    const checklistTotal = tasks.reduce(
        (sum, task) => sum + (Array.isArray(task.subtasks) ? task.subtasks.length : 0),
        0
    );
 
    const checklistDone = tasks.reduce(
        (sum, task) => sum + (Array.isArray(task.subtasks)
            ? task.subtasks.filter(subtask => subtask.completed).length
            : 0),
        0
    );
 
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
 
    const filteredTasks = tasks.filter(task => {
        if (state.filter === 'completed') return task.completed;
        if (state.filter === 'active') return !task.completed;
        return true;
    });
 
    return `
        <div class="content appShell">
            <aside class="dashboardPanel">
                ${DashboardHero({
                    title: 'Flux',
                    actionOnclick: onOpenCreatePanel
                })}
 
                ${DashboardDisclosure({
                    isOpen: state.isDashboardStatsOpen,
                    label: 'Progresso',
                    hint: `${completed}/${total} concluídas`,
                    badge: `${progress}%`,
                    iconName: 'bx-chart-line',
                    onToggle: onToggleDashboardStats,
                    content: StatsCard({
                        total,
                        completed,
                        pending,
                        checklistTotal,
                        checklistDone
                    })
                })}
 
                ${DashboardDisclosure({
                    isOpen: state.isDashboardQuickOpen,
                    label: 'Visão rápida',
                    hint: `${pending} pendentes`,
                    badge: checklistTotal,
                    iconName: 'bx-bolt-circle',
                    onToggle: onToggleDashboardQuick,
                    content: DashboardFocusSection({
                        pending,
                        checklistTotal
                    })
                })}
            </aside>
 
            <section class="workspacePanel">
                ${WorkspaceHeader({
                    onOpenCreatePanel
                })}
 
                ${WorkspaceToolbar({
                    filter: state.filter,
                    total,
                    pending,
                    completed,
                    onFilterAll,
                    onFilterActive,
                    onFilterCompleted
                })}
 
                ${WorkspaceTaskArea({
                    tasks: filteredTasks,
                    onOpenCreatePanel
                })}
 
                ${CreateTaskPanel({
                    isOpen: state.isCreatePanelOpen,
                    taskName: state.taskName,
                    taskDescription: state.taskDescription,
                    onClose: onCloseCreatePanel,
                    onTaskNameInput,
                    onTaskDescriptionInput,
                    onAddTask
                })}
            </section>
        </div>
    `;
};
 
export default Template;