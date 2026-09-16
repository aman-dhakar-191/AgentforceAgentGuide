import { LightningElement, api } from 'lwc';

const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' }
];

export default class CaseInputEditor extends LightningElement {
    subject = '';
    priority = 'Medium';
    description = '';

    // The platform passes existing data in through `value`.
    @api
    get value() {
        return {
            subject: this.subject,
            priority: this.priority,
            description: this.description
        };
    }

    set value(data) {
        if (!data) {
            return;
        }
        this.subject = data.subject ?? '';
        this.priority = data.priority ?? 'Medium';
        this.description = data.description ?? '';
    }

    get priorityOptions() {
        return PRIORITY_OPTIONS;
    }

    handleInputChange(event) {
        // Without stopPropagation the inner input's own change event escapes
        // alongside ours and the platform can see conflicting updates.
        event.stopPropagation();

        const { name, value } = event.target;
        this[name] = value;

        this.dispatchEvent(
            new CustomEvent('valuechange', {
                detail: {
                    value: {
                        subject: this.subject,
                        priority: this.priority,
                        description: this.description
                    }
                }
            })
        );
    }
}
