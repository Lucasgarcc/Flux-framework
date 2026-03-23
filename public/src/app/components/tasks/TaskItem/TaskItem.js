import Button from '../../ui/Button/Button.js';
import { bind } from '../../../../../core/core.js';
import Icon from '../../ui/Icon/Icon.js';
import Input from '../../ui/Input/Input.js';

const TaskItem = ({ task }) => {
    const resolveSubtasks = (currentTask) => {
        if (Array.isArray(currentTask.subtasks)) {
            return currentTask.subtasks;
        }

        const seededText = (currentTask.description ?? '').trim();
        return seededText
            ? [{ id: `${currentTask.id}-seed`, text: seededText, completed: false }]
            : [];
    };

    const subtasks = resolveSubtasks(task);
    const isExpanded = Boolean(task.isExpanded || task.isEditing);
    const checklistCount = subtasks.length;
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const subtaskDraft = task.newSubtask ?? '';

    // ── Handlers da task ────────────────────────────────────────────────────

    const onToggle = (e, state) => {
        state.tasks = state.tasks.map(t =>
            t.id === task.id
                ? {
                    ...t,
                    completed: !t.completed,
                    isMenuOpen: false,
                    subtasks: resolveSubtasks(t).map(subtask => ({
                        ...subtask,
                        completed: !t.completed
                    }))
                }
                : t
        );
    };

    const onDelete = (e, state) => {
        state.tasks = state.tasks.filter(t => t.id !== task.id);
    };

    const onEdited = (e, state) => {
        state.tasks = state.tasks.map(t =>
            t.id === task.id
                ? { ...t, isEditing: !t.isEditing, isMenuOpen: false, isExpanded: true }
                : { ...t, isMenuOpen: false }
        );
    };

    const onSave = (e, state) => {
        state.tasks = state.tasks.map(t =>
            t.id === task.id
                ? { ...t, isEditing: false, isMenuOpen: false, isExpanded: true }
                : t
        );
    };

    const handleUpdate = (e, state, field) => {
        state.tasks = state.tasks.map(t =>
            t.id === task.id ? { ...t, [field]: e.target.value } : t
        );
    };

    const handleSubtaskDraftUpdate = (e, state) => {
        state.tasks = state.tasks.map(t =>
            t.id === task.id ? { ...t, newSubtask: e.target.value } : t
        );
    };

    const addSubtask = (e, state) => {
        e.preventDefault();
        const value = (task.newSubtask ?? '').trim();
        if (!value) return;

        state.tasks = state.tasks.map(t => {
            if (t.id !== task.id) return t;

            const currentSubtasks = resolveSubtasks(t);
            return {
                ...t,
                subtasks: [
                    ...currentSubtasks,
                    {
                        id: `${t.id}-${Date.now()}`,
                        text: value,
                        completed: false
                    }
                ],
                newSubtask: '',
                isExpanded: true
            };
        });
    };

    const toggleSubtask = (subtaskId) => (e, state) => {
        state.tasks = state.tasks.map(t => {
            if (t.id !== task.id) return t;

            const nextSubtasks = resolveSubtasks(t).map(subtask =>
                subtask.id === subtaskId
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
            );

            return {
                ...t,
                subtasks: nextSubtasks,
                completed: nextSubtasks.length > 0 && nextSubtasks.every(s => s.completed)
            };
        });
    };

    // ── Handlers de edição de subtask ────────────────────────────────────────

    const editSubtask = (subtaskId) => (e, state) => {
        state.tasks = state.tasks.map(t => {
            if (t.id !== task.id) return t;
            return {
                ...t,
                subtasks: resolveSubtasks(t).map(subtask =>
                    subtask.id === subtaskId
                        ? { ...subtask, text: e.target.value }
                        : subtask
                )
            };
        });
    };

    const deleteSubtask = (subtaskId) => (e, state) => {
        state.tasks = state.tasks.map(t => {
            if (t.id !== task.id) return t;
            return {
                ...t,
                subtasks: resolveSubtasks(t).filter(subtask => subtask.id !== subtaskId)
            };
        });
    };

    // ── Handlers de UI ───────────────────────────────────────────────────────

    const toggleMenu = (e, state) => {
        e.stopPropagation();
        state.tasks = state.tasks.map(t =>
            t.id === task.id
                ? { ...t, isMenuOpen: !t.isMenuOpen }
                : { ...t, isMenuOpen: false }
        );
    };

    const toggleExpand = (e, state) => {
        e.stopPropagation();
        state.tasks = state.tasks.map(t =>
            t.id === task.id
                ? { ...t, isExpanded: !t.isExpanded, isMenuOpen: false }
                : { ...t, isMenuOpen: false }
        );
    };

    // ── bind() — fora da função de template, criados uma única vez ───────────

    const onTitleInput        = bind((e, s) => handleUpdate(e, s, 'title'));
    const onToggleAction      = bind(onToggle);
    const onDeleteAction      = bind(onDelete);
    const onEditAction        = bind(onEdited);
    const onSaveAction        = bind(onSave);
    const onMenuToggle        = bind(toggleMenu);
    const onExpandToggle      = bind(toggleExpand);
    const onSubtaskDraftInput = bind(handleSubtaskDraftUpdate);
    const onAddSubtask        = bind(addSubtask);

    // bind por subtask — cada subtask precisa do seu próprio handler com o id correto
    const subtaskBinds = subtasks.map(subtask => ({
        id: subtask.id,
        onEdit:   bind(editSubtask(subtask.id)),
        onDelete: bind(deleteSubtask(subtask.id)),
        onToggle: bind(toggleSubtask(subtask.id))
    }));

    // ── Helpers ───────────────────────────────────────────────────────────────

    const toggleClasses = [
        'actionsToggle',
        task.isMenuOpen ? 'actionsToggleActive' : ''
    ].filter(Boolean).join(' ');

    // ── Render ────────────────────────────────────────────────────────────────

    return `
        <li class="task-item ${task.completed ? 'is-done' : ''} ${task.isEditing ? 'is-editing' : ''} ${isExpanded ? 'is-expanded' : ''} ${task.isMenuOpen ? 'is-menu-open' : ''}">
            <div class="task-row">
                <div class="task-status">
                    ${Button({
                        label: `${Icon('bx-check')}<span class="sr-only">${task.completed ? 'Marcar tarefa como pendente' : 'Concluir tarefa'}</span>`,
                        className: `taskCheck ${task.completed ? 'taskCheckDone' : ''}`,
                        onclick: onToggleAction,
                        type: 'button',
                    })}
                </div>

                <div class="task-main">
                    <div class="task-titleRow">
                        ${Button({
                            label: `${Icon('bx-chevron-down')}<span class="sr-only">${isExpanded ? 'Recolher checklist' : 'Expandir checklist'}</span>`,
                            className: `taskExpand ${isExpanded ? 'taskExpandOpen' : ''}`,
                            onclick: onExpandToggle,
                            type: 'button',
                        })}
                        <div class="task-heading">
                            <h3 class="task-title">${task.title}</h3>
                            <span class="taskPreview">
                                ${checklistCount > 0
                                    ? `${completedSubtasks}/${checklistCount} itens da checklist`
                                    : 'Adicione subitens a esta tarefa'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="actions">
                    ${Button({
                        label: `${Icon(task.isMenuOpen ? 'bx-x' : 'bx-dots-vertical')}<span class="sr-only">${task.isMenuOpen ? 'Fechar menu de ações' : 'Abrir menu de ações'}</span>`,
                        className: toggleClasses,
                        onclick: onMenuToggle,
                    })}

                    <div class="task-actions ${task.isMenuOpen ? 'task-actions-open' : ''}">
                        ${!task.isEditing
                            ? `
                                ${Button({
                                    label: `${Icon(task.completed ? 'bx-radio-circle' : 'bx-check-circle', 'taskActionIcon')}<span class="button-labelText">${task.completed ? 'Marcar como pendente' : 'Concluir tarefa'}</span>`,
                                    className: 'taskAction taskActionPrimary',
                                    onclick: onToggleAction,
                                })}
                                ${Button({
                                    label: `${Icon('bx-edit', 'taskActionIcon')}<span class="button-labelText">Editar tarefa</span>`,
                                    className: 'taskAction',
                                    onclick: onEditAction,
                                })}
                                ${Button({
                                    label: `${Icon('bx-trash', 'taskActionIcon')}<span class="button-labelText">Excluir tarefa</span>`,
                                    className: 'taskAction taskActionDanger',
                                    onclick: onDeleteAction,
                                })}
                            `
                            : `
                                ${Button({
                                    label: `${Icon('bx-save', 'taskActionIcon')}<span class="button-labelText">Salvar alterações</span>`,
                                    className: 'taskAction taskActionPrimary',
                                    onclick: onSaveAction,
                                })}
                            `
                        }
                    </div>
                </div>
            </div>

            <div class="task-details ${isExpanded ? 'task-details-open' : ''}">
                <div class="task-detailsInner">
                    ${task.isEditing
                        ? `
                            <div class="task-editor">

                                ${Input({
                                    name: 'taskName',
                                    id: `taskName-${task.id}`,
                                    labeltext: 'Nome da tarefa',
                                    value: task.title,
                                    oninput: onTitleInput,
                                })}

                                <div class="task-sublist task-sublist-editing">
                                    ${subtasks.length > 0
                                        ? subtasks.map(subtask => {
                                            const binds = subtaskBinds.find(b => b.id === subtask.id);
                                            return `
                                                <div class="task-subitem-editor ${subtask.completed ? 'is-complete' : ''}">
                                                    <input
                                                        class="taskSubInput"
                                                        type="text"
                                                        value="${subtask.text}"
                                                        placeholder="Texto do subitem"
                                                        oninput="${binds.onEdit}"
                                                    />
                                                    ${Button({
                                                        label: `${Icon('bx-trash')}<span class="sr-only">Remover subitem</span>`,
                                                        className: 'taskSubDelete',
                                                        onclick: binds.onDelete,
                                                        type: 'button',
                                                    })}
                                                </div>
                                            `;
                                        }).join('')
                                        : `<p class="task-subempty">Nenhum subitem ainda.</p>`
                                    }

                                    <div class="task-subComposer">
                                        <input
                                            class="taskSubInput"
                                            type="text"
                                            value="${subtaskDraft}"
                                            placeholder="Adicionar novo subitem"
                                            oninput="${onSubtaskDraftInput}"
                                        />
                                        ${Button({
                                            label: `${Icon('bx-plus')}<span class="sr-only">Adicionar subitem</span>`,
                                            className: 'taskSubAdd',
                                            onclick: onAddSubtask,
                                            type: 'button',
                                            disabled: subtaskDraft.trim().length === 0
                                        })}
                                    </div>
                                </div>

                            </div>
                        `
                        : `
                            <div class="task-sublist">
                                ${subtasks.length > 0
                                    ? subtasks.map(subtask => {
                                        const binds = subtaskBinds.find(b => b.id === subtask.id);
                                        return `
                                            <div class="task-subitem ${subtask.completed ? 'is-complete' : ''}">
                                                ${Button({
                                                    label: `${Icon('bx-check')}<span class="sr-only">${subtask.completed ? 'Marcar subitem como pendente' : 'Concluir subitem'}</span>`,
                                                    className: `taskSubToggle ${subtask.completed ? 'taskSubToggleDone' : ''}`,
                                                    onclick: binds.onToggle,
                                                    type: 'button',
                                                })}
                                                <span class="task-subtext">${subtask.text}</span>
                                            </div>
                                        `;
                                    }).join('')
                                    : `
                                        <div class="task-subempty">
                                            Adicione detalhes para transformar esta tarefa em checklist.
                                        </div>
                                    `
                                }

                                <div class="task-subComposer">
                                    <input
                                        class="taskSubInput"
                                        type="text"
                                        value="${subtaskDraft}"
                                        placeholder="Adicionar novo subitem"
                                        oninput="${onSubtaskDraftInput}"
                                    />
                                    ${Button({
                                        label: `${Icon('bx-plus')}<span class="sr-only">Adicionar subitem</span>`,
                                        className: 'taskSubAdd',
                                        onclick: onAddSubtask,
                                        type: 'button',
                                        disabled: subtaskDraft.trim().length === 0
                                    })}
                                </div>
                            </div>
                        `
                    }
                </div>
            </div>
        </li>
    `;
};

export default TaskItem;