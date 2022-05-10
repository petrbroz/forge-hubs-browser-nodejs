export class ModelPropsFilter {
    constructor(container, options) {
        this.fields = options.fields;
        this.root = this.createRoot();
        container.appendChild(this.root);
    }

    getQuery(el) {
        if (!el) {
            el = this.root.querySelector(':scope > .group');
            return el ? this.getQuery(el) : {};
        }
        const op = el.querySelector(':scope > .inputs > select.op').value;
        if (el.classList.contains('group')) {
            const children = [];
            el.querySelectorAll(':scope > ul > li').forEach(li => children.push(this.getQuery(li.firstChild)));
            if (children.length > 0) {
                return { [op]: children };
            } else {
                return {};
            }
        } else if (el.classList.contains('condition')) {
            const selectedFieldKey = el.querySelector('.field').value;
            const selectedField = this.fields.find(field => field.key === selectedFieldKey);
            const propName = `s.props.${el.querySelector(':scope > .inputs > select.field').value}`;
            switch (selectedField.type) {
                case 'Double':
                    return {
                        [op]: [propName, parseFloat(el.querySelector(':scope > .inputs > input.value').value)]
                    };
                case 'Integer':
                    return {
                        [op]: [propName, parseInt(el.querySelector(':scope > .inputs > input.value').value)]
                    };
                case 'String':
                    return {
                        [op]: [propName, `'${el.querySelector(':scope > .inputs > input.value').value}'`]
                    };
                case 'Boolean':
                    return {
                        [op]: [propName, el.querySelector(':scope > .inputs > input.value').checked]
                    };
            }
        }
    }

    createRoot() {
        const el = document.createElement('div');
        el.classList.add('model-props-filter');
        el.addEventListener('click', (ev) => this.onClick(ev));
        el.appendChild(this.createGroup());
        return el;
    }

    createGroup() {
        const el = document.createElement('div');
        el.classList.add('group');
        el.innerHTML = `
            <div class="inputs">
                <select class="op">
                    <option value="$and">AND</option>
                    <option value="$or">OR</option>
                </select>
                <div class="actions">
                    <button data-filter-action="add-grp">Add group</button>
                    <button data-filter-action="add-cnd">Add condition</button>
                    <button data-filter-action="rmv-grp">Remove</button>
                </div>
            </div>
            <ul></ul>
        `;
        this.addChild(el, this.createCondition());
        return el;
    }

    createCondition() {
        const el = document.createElement('div');
        el.classList.add('condition');
        el.innerHTML = `
            <div class="inputs">
                <select class="field">
                    ${
                        this.fields.map(field => `<option value="${field.key}">${field.name} (${field.type})</option>`).join('\n')
                    }
                </select>
                <select class="op">
                    <option value="$lt">&lt;</option>
                    <option value="$le">&le;</option>
                    <option value="$eq" selected>==</option>
                    <option value="$ne">!=</option>
                    <option value="$ge">&ge;</option>
                    <option value="$gt">&gt;</option>
                    <option value="$like">LIKE</option>
                </select>
                <input type="text" class="value">
                <div class="actions">
                    <button data-filter-action="rmv-cnd">Remove</button>
                </div>
            </div>
        `;
        el.querySelector('.field').onchange = () => this.updateCondition(el);
        this.updateCondition(el);
        return el;
    }

    updateCondition(el) {
        const field = el.querySelector('.field');
        const op = el.querySelector('.op');
        const value = el.querySelector('.value');
        const selectedFieldKey = field.value;
        const selectedField = this.fields.find(field => field.key === selectedFieldKey);
        switch (selectedField.type) {
            // Unknown, Boolean, Integer, Double, Blob, DbKey, String, LocalizableString, DateTime, GeoLocation, Position
            case 'String':
                op.innerHTML = `
                    <option value="$eq" selected>==</option>
                    <option value="$ne">!=</option>
                    <option value="$like">LIKE</option>
                `;
                value.setAttribute('type', 'text');
                value.value = '';
                value.removeAttribute('readonly');
                break;
            case 'Double':
                op.innerHTML = `
                    <option value="$lt">&lt;</option>
                    <option value="$le">&le;</option>
                    <option value="$eq" selected>==</option>
                    <option value="$ne">!=</option>
                    <option value="$ge">&ge;</option>
                    <option value="$gt">&gt;</option>
                `;
                value.setAttribute('type', 'number');
                value.setAttribute('step', '0.01');
                value.value = 0.0;
                value.removeAttribute('readonly');
                break;
            case 'Integer':
                op.innerHTML = `
                    <option value="$lt">&lt;</option>
                    <option value="$le">&le;</option>
                    <option value="$eq" selected>==</option>
                    <option value="$ne">!=</option>
                    <option value="$ge">&ge;</option>
                    <option value="$gt">&gt;</option>
                `;
                value.setAttribute('type', 'number');
                value.setAttribute('step', '1');
                value.value = 0;
                value.removeAttribute('readonly');
                break;
            case 'Boolean':
                op.innerHTML = `
                    <option value="$eq" selected>==</option>
                `;
                value.setAttribute('type', 'checkbox');
                value.value = false;
                value.removeAttribute('readonly');
                break;
            default:
                value.setAttribute('type', 'text');
                value.setAttribute('readonly', 'true');
                value.value = `Field type ${selectedField.type} not supported`;
        }
    }

    addChild(group, child) {
        const li = document.createElement('li');
        li.appendChild(child);
        group.querySelector('ul').appendChild(li);
    }

    removeChild(child) {
        const li = child.closest('li');
        if (li) {
            li.parentElement.removeChild(li);
        }
    }

    onClick(ev) {
        const action = ev.target.getAttribute('data-filter-action');
        switch (action) {
            case 'add-grp':
                this.addChild(ev.target.closest('.group'), this.createGroup());
                break;
            case 'add-cnd':
                this.addChild(ev.target.closest('.group'), this.createCondition());
                break;
            case 'rmv-grp':
                this.removeChild(ev.target.closest('.group'));
                break;
            case 'rmv-cnd':
                this.removeChild(ev.target.closest('.condition'));
                break;
        }
    }
}
