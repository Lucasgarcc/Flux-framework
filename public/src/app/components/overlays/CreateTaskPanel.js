import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';
import Input from '../ui/Input/Input.js';

const CreateTaskPanel = ({
    isOpen,
    taskName,
    taskDescription,
    onClose,
    onTaskNameInput,
    onTaskDescriptionInput,
    onAddTask
}) => `
    <div class="createPanelLayer ${isOpen ? 'createPanelLayerOpen' : ''}">
        <div class="createPanelBackdrop" data-onclick="${onClose}"></div>
        <section class="createPanel ${isOpen ? 'createPanelOpen' : ''}">
            <div class="createPanelHeader">
                <div>
                    <span class="createPanelEyebrow">Nova tarefa</span>
                    <h2 class="createPanelTitle">Criar nova tarefa</h2>
                </div>

                ${Button({
                    label: `${Icon('bx-x')}<span class="sr-only">Fechar painel</span>`,
                    className: 'button button-icon button-ghost',
                    onclick: onClose
                })}
            </div>

            <div class="createPanelBody">
                ${Input({
                    labeltext: 'Nome da tarefa',
                    id: 'taskIn',
                    databind: 'taskName',
                    value: taskName || '',
                    oninput: onTaskNameInput,
                    placeholder: 'Ex.: Preparar apresentação do projeto'
                })}

                ${Input({
                    labeltext: 'Primeiro item da checklist',
                    id: 'taskDescription',
                    databind: 'taskDescription',
                    value: taskDescription || '',
                    oninput: onTaskDescriptionInput,
                    placeholder: 'Ex.: Revisar tópicos principais'
                })}
            </div>

            <div class="createPanelFooter">
                ${Button({
                    label: `<span class="button-labelText">Cancelar</span>`,
                    className: 'button button-ghost button-cancel',
                    onclick: onClose
                })}
                ${Button({
                    label: `${Icon('bx-save')}<span class="button-labelText">Salvar tarefa</span>`,
                    className: 'button button-secondary',
                    onclick: onAddTask,
                    disabled: (taskName ?? '').trim().length < 3
                })}
            </div>
        </section>
    </div>
`;

export default CreateTaskPanel;
