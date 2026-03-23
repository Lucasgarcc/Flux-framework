const serializeAttributes = (attributes = {}) =>
    Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && value !== false)
        .map(([key, value]) => value === true ? key : `${key}="${value}"`)
        .join(' ');
 
const resolveColor = (value) => {
    if (!value) return '';
    return value.startsWith('--') ? `var(${value})` : value;
};
 
const Button = ({
    label,
    disabled,
    type,
    onclick,
    className,
    dataclick,
    attrs,
    color,
    hoverColor,
    focusColor
}) => {
    const style = [
        color ? `--button-bg: ${resolveColor(color)}` : '',
        color ? `--button-border: ${resolveColor(color)}` : '',
        hoverColor ? `--button-hover-bg: ${resolveColor(hoverColor)}` : '',
        hoverColor ? `--button-hover-border: ${resolveColor(hoverColor)}` : '',
        focusColor ? `--button-focus: ${resolveColor(focusColor)}` : ''
    ].filter(Boolean).join('; ');
 
    
    const onclickAttr = onclick
        ? `onclick="${onclick.replace(/"/g, '&quot;')}"`
        : '';
 
    const buttonAttributes = [
        className ? `class="${className}"` : '',
        `type="${type ?? 'button'}"`,
        onclickAttr,
        disabled ? 'disabled' : '',
        dataclick ? `data-click="${dataclick}"` : '',
        style ? `style="${style}"` : '',
        serializeAttributes(attrs)
    ].filter(Boolean).join(' ');
 
    return `
        <button ${buttonAttributes}>
            ${label ?? ''}
        </button>
    `;
};
 
export default Button;