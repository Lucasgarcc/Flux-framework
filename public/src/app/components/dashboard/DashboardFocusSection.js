import SidebarMiniCard from '../shared/SidebarMiniCard.js';

const DashboardFocusSection = ({
    pending,
    checklistTotal
}) => `
    <section class="dashboardSection">
        <div class="dashboardSectionHeader">
            <span class="dashboardSectionEyebrow">Hoje</span>
            <h2 class="dashboardSectionTitle">Foco</h2>
        </div>

        <div class="dashboardHighlights">
            ${SidebarMiniCard({
                label: 'Pendentes',
                value: pending,
                text: 'Aguardam ação.',
                iconName: 'bx-time-five',
                accent: 'pending'
            })}
            ${SidebarMiniCard({
                label: 'Checklist',
                value: checklistTotal,
                text: 'Itens da checklist.',
                iconName: 'bx-list-ul',
                accent: 'all'
            })}
        </div>
    </section>
`;

export default DashboardFocusSection;
