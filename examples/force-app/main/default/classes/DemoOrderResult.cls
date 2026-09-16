@JsonAccess(
    serializable='always'
    deserializable='always'
)
global class DemoOrderResult {

    @InvocableVariable(
        label='Order Number'
        description='Unique identifier of the customer order.'
    )
    @AuraEnabled
    global String orderNumber;

    @InvocableVariable(
        label='Customer Name'
        description='Name of the customer associated with the order.'
    )
    @AuraEnabled
    global String customerName;

    @InvocableVariable(
        label='Status'
        description='Current status of the order, such as Confirmed, Processing, Shipped, or Delivered.'
    )
    @AuraEnabled
    global String status;

    @InvocableVariable(
        label='Total Amount'
        description='Total monetary amount of the order.'
    )
    @AuraEnabled
    global Decimal totalAmount;

    @InvocableVariable(
        label='Order Date'
        description='Date on which the order was created.'
    )
    @AuraEnabled
    global Date orderDate;

    @InvocableVariable(
        label='Message'
        description='Additional information or message related to the order.'
    )
    @AuraEnabled
    global String message;
}
