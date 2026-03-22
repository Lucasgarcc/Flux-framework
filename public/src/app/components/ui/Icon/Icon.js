const Icon = (name, className = '') =>
    `<i class="bx ${name}${className ? ` ${className}` : ''}" aria-hidden="true"></i>`;

export default Icon;
