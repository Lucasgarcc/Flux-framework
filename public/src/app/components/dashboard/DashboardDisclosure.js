import Button from '../ui/Button/Button.js';
import Icon from '../ui/Icon/Icon.js';

const DashboardDisclosure = ({
    isOpen = false,
    label,
    hint,
    badge,
    iconName,
    onToggle,
    content = ''
}) => `
    <section class="dashboardDisclosure ${isOpen ? 'dashboardDisclosureOpen' : ''}">
        ${Button({
            label: `
                <span class="dashboardDisclosureLead">
                    <span class="dashboardDisclosureIconWrap">
                        ${Icon(iconName, 'dashboardDisclosureIcon')}
                    </span>
                    <span class="dashboardDisclosureCopy">
                        <span class="dashboardDisclosureLabel">${label}</span>
                        <span class="dashboardDisclosureHint">${hint}</span>
                    </span>
                </span>
                <span class="dashboardDisclosureMeta">
                    <span class="dashboardDisclosureBadge">${badge}</span>
                    ${Icon('bx-chevron-down', 'dashboardDisclosureChevron')}
                </span>
            `,
            className: 'dashboardDisclosureButton',
            onclick: onToggle,
            type: 'button',
            attrs: {
                'aria-expanded': isOpen ? 'true' : 'false'
            }
        })}

        <div class="dashboardDisclosurePanel">
            ${content}
        </div>
    </section>
`;

export default DashboardDisclosure;
