import { LightningElement, api } from 'lwc';

export default class CaseResultRenderer extends LightningElement {
    // The action output arrives through `value`, shaped by CaseResult.
    @api value;

    get caseNumber() {
        return this.value?.caseNumber;
    }

    get subject() {
        return this.value?.subject;
    }

    get status() {
        return this.value?.status;
    }

    get createdDate() {
        return this.value?.createdDate;
    }

    get estimatedResponse() {
        return this.value?.estimatedResponse;
    }

    get priorityVariant() {
        if (this.value?.priority === 'High') {
            return 'inverse';
        }
        return 'default';
    }

    get priority() {
        return this.value?.priority;
    }
}
