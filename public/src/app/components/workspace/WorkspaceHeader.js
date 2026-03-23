import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';

const WorkspaceHeader = ({
    eyebrow = 'Minhas tarefas',
    title = 'Área de execução',
    onOpenCreatePanel
}) => `
    <div class="workspaceHeader">
        <div>
            <span class="workspaceEyebrow">${eyebrow}</span>
            <h2 class="workspaceTitle">${title}</h2>
        </div>

        ${Button({
            label: `${Icon('bx-plus')}<span class="sr-only">Criar tarefa</span>`,
            className: 'button button-icon workspaceCreateButton',
            onclick: onOpenCreatePanel
        })}
    </div>
`;

export default WorkspaceHeader;
