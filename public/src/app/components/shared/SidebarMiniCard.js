import Icon from '../ui/Icon/Icon.js';

const accentClassByType = {
    all: 'sidebarMiniCardAll',
    pending: 'sidebarMiniCardPending',
    done: 'sidebarMiniCardDone'
};

const SidebarMiniCard = ({
    label,
    value,
    text = '',
    iconName,
    accent = 'all',
    fullWidth = false
}) => {
    const classes = [
        'sidebarMiniCard',
        accentClassByType[accent] ?? accentClassByType.all,
        fullWidth ? 'sidebarMiniCardFull' : ''
    ].filter(Boolean).join(' ');

    return `
        <article class="${classes}">
            <span class="sidebarMiniCardLabel">
                ${iconName ? `${Icon(iconName, 'sidebarMiniCardIcon')}` : ''}
                ${label}
            </span>
            <strong class="sidebarMiniCardValue">${value}</strong>
            ${text ? `<p class="sidebarMiniCardText">${text}</p>` : ''}
        </article>
    `;
};

export default SidebarMiniCard;
