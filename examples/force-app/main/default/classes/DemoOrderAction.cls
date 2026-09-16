global with sharing class DemoOrderAction {

    global class DemoOrderRequest {

        @InvocableVariable(
            label='Order Number'
            description='Order number used to retrieve the corresponding demo order details.'
            required=false
        )
        global String orderNumber;
    }

    global class DemoOrderResponse {

        @InvocableVariable(
            label='Order Result'
            description='Complete demo order information returned by the action.'
        )
        global DemoOrderResult orderResult;
    }

    @InvocableMethod(
        label='Get Demo Order'
        description='Returns demo order information for Custom Lightning Type demonstration.'
    )
    global static List<DemoOrderResponse> getDemoOrder(
        List<DemoOrderRequest> requests
    ) {
        List<DemoOrderResponse> responses =
            new List<DemoOrderResponse>();

        for (DemoOrderRequest request : requests) {

            DemoOrderResult result = new DemoOrderResult();

            result.orderNumber = String.isBlank(request.orderNumber)
                ? 'ORD-10001'
                : request.orderNumber;

            result.customerName = 'Aman Technologies';
            result.status = 'Confirmed';
            result.totalAmount = 2499.00;
            result.orderDate = Date.today();
            result.message = 'Your order has been successfully processed.';

            DemoOrderResponse response = new DemoOrderResponse();
            response.orderResult = result;

            responses.add(response);
        }

        return responses;
    }
}
