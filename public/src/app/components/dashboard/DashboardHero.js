import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';

const DashboardHero = ({
    eyebrow = 'Painel',
    title = 'Velto',
    text = 'Menos ruído. Mais foco.',
    actionText = 'Nova tarefa',
    actionHint = 'Abrir',
    actionOnclick
}) => `
    <div class="dashboardHero">
        <span class="dashboardEyebrow">${eyebrow}</span>
        <h1 class="dashboardTitle">${title}</h1>
        <p class="dashboardText">${text}</p>

        ${Button({
            label: `
                <span class="dashboardCreateIconWrap">
                    ${Icon('bx-plus', 'dashboardCreateIcon')}
                </span>
                <span class="dashboardCreateContent">
                    <span class="dashboardCreateTitle">${actionText}</span>
                    <span class="dashboardCreateText">${actionHint}</span>
                </span>
                <span class="dashboardCreateArrow">
                    ${Icon('bx-chevron-right', 'dashboardCreateArrowIcon')}
                </span>
            `,
            className: 'dashboardCreateAction',
            onclick: actionOnclick,
            type: 'button'
        })}
    </div>
`;

export default DashboardHero;
