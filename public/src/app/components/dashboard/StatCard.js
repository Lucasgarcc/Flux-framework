import SidebarMiniCard from '../shared/SidebarMiniCard.js';

const StatsCard = ({ total, completed, pending, checklistTotal, checklistDone }) => {
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressColor = total === 0
        ? '#9ca3af'
        : progress < 40
            ? '#ef4444'
            : progress < 70
                ? '#d4a017'
                : '#22a06b';

    return `
        <section class="statsCard">
            <div class="statsCardHeader">
                <span class="statsCardEyebrow">Resumo</span>
                <strong class="statsCardValue">${progress}%</strong>
            </div>

            <p class="statsCardTitle">Tarefas</p>
            <p class="statsCardText">
                ${completed} concluídas · ${pending} pendentes${checklistTotal > 0 ? ` · ${checklistDone}/${checklistTotal} subtarefas` : ''}.
            </p>

            <div class="statsCardMeter" aria-hidden="true">
                <div class="statsCardMeterFill" style="width: ${progress}%; background: ${progressColor};"></div>
            </div>

            <div class="statsCardGrid">
                ${SidebarMiniCard({
                    label: 'Total',
                    value: total,
                    iconName: 'bx-grid-alt',
                    accent: 'all'
                })}
                ${SidebarMiniCard({
                    label: 'Pendentes',
                    value: pending,
                    iconName: 'bx-time-five',
                    accent: 'pending'
                })}
                ${SidebarMiniCard({
                    label: 'Concluídas',
                    value: completed,
                    iconName: 'bx-check-circle',
                    accent: 'done',
                    fullWidth: true
                })}
            </div>
        </section>
    `;
};

export default StatsCard;
