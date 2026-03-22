
const Input = ({ 
    name,
    labeltext, 
    id, databind, 
    value, 
    oninput,
    autocomplete,
    placeholder  }) => {
    const onInputAttribute = oninput ? `oninput="${oninput}"` : '';
    const dataBindAttribute = databind ? `data-bind="${databind}"` : '';

    return `
        <div class="field-group">
            <label for="${id}">${labeltext}</label>
            <input 
                name="${name ?? ''}"
                id="${id}" 
                type="text" 
                ${onInputAttribute}
                autocomplete="${autocomplete ? 'on' : 'off'}"
                ${dataBindAttribute}
                placeholder="${placeholder ?? ''}"
                value="${value ?? ''}"
            />
        </div>
    `;
};

export default Input;
