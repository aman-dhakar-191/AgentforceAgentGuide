import { LightningElement, api } from 'lwc';

/**
 * Renders the DemoOrderResultV2 Custom Lightning Type.
 *
 * The action output arrives through `value`, shaped by the Apex class
 * DemoOrderResult. Only its @AuraEnabled fields are projected into the
 * Lightning type schema, so only those are readable here.
 */
export default class OrderDetailsRenderer extends LightningElement {
    @api value;

    get orderNumber() {
        return this.value?.orderNumber;
    }

    get customerName() {
        return this.value?.customerName;
    }

    get status() {
        return this.value?.status;
    }

    get totalAmount() {
        return this.value?.totalAmount;
    }

    get orderDate() {
        return this.value?.orderDate;
    }

    get message() {
        return this.value?.message;
    }

    get statusVariant() {
        switch (this.value?.status) {
            case 'Delivered':
                return 'success';
            case 'Shipped':
                return 'inverse';
            default:
                return 'default';
        }
    }
}
