import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';

const EmptyState = ({
    eyebrow = 'Sem tarefas',
    title = 'Nada por aqui.',
    text = 'Adicione sua próxima prioridade e mantenha o foco no que importa.',
    actionLabel = 'Nova tarefa',
    actionOnclick
}) => `
    <div class="emptyState">
        <div class="emptyStateInner">
            <span class="emptyStateBadge">${Icon('bx-list-ul')}</span>
            <span class="emptyStateEyebrow">${eyebrow}</span>
            <h3 class="emptyStateTitle">${title}</h3>
            <p class="emptyStateText">${text}</p>
        </div>
        ${Button({
            label: `${Icon('bx-plus')}<span class="button-labelText">${actionLabel}</span>`,
            className: 'button emptyStateAction',
            onclick: actionOnclick
        })}
    </div>
`;

export default EmptyState;
