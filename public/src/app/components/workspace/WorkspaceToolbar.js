import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';

const WorkspaceToolbar = ({
    filter,
    total,
    pending,
    completed,
    onFilterAll,
    onFilterActive,
    onFilterCompleted
}) => `
    <div class="workspaceToolbar">
        <div class="filterPills" role="tablist" aria-label="Filtros de tarefas">
            ${Button({
                label: `
                    <span class="filterPillContent">
                        ${Icon('bx-grid-alt', 'filterPillIcon')}
                        <span class="filterPillText">Todas</span>
                    </span>
                    <span class="filterPillCount">${total}</span>
                `,
                className: `filterPill filterPillAll ${filter === 'all' ? 'filterPillActive' : ''}`,
                onclick: onFilterAll,
                type: 'button'
            })}
            ${Button({
                label: `
                    <span class="filterPillContent">
                        ${Icon('bx-time-five', 'filterPillIcon')}
                        <span class="filterPillText">Ativas</span>
                    </span>
                    <span class="filterPillCount">${pending}</span>
                `,
                className: `filterPill filterPillPending ${filter === 'active' ? 'filterPillActive' : ''}`,
                onclick: onFilterActive,
                type: 'button'
            })}
            ${Button({
                label: `
                    <span class="filterPillContent">
                        ${Icon('bx-check-circle', 'filterPillIcon')}
                        <span class="filterPillText">Concluídas</span>
                    </span>
                    <span class="filterPillCount">${completed}</span>
                `,
                className: `filterPill filterPillDone ${filter === 'completed' ? 'filterPillActive' : ''}`,
                onclick: onFilterCompleted,
                type: 'button'
            })}
        </div>
    </div>
`;

export default WorkspaceToolbar;
