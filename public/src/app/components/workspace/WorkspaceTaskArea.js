import EmptyState from '../feedback/EmptyState.js';
import TaskItem from '../tasks/TaskItem/TaskItem.js';

const WorkspaceTaskArea = ({
    tasks = [],
    onOpenCreatePanel
}) => `
    <div class="taskArea">
        ${tasks.length > 0
            ? `
                <ul class="task-list">
                    ${tasks.map(task => TaskItem({ task })).join('')}
                </ul>
            `
            : EmptyState({
                actionOnclick: onOpenCreatePanel
            })
        }
    </div>
`;

export default WorkspaceTaskArea;
