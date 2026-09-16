/**
 * A plain Apex agent action — no Custom Lightning Types.
 *
 * Without a CLT, inputs are collected conversationally and outputs are
 * reported as text, so the request/response wrappers can be simple inner
 * classes. The stricter top-level/global/@AuraEnabled rules only apply once
 * a Lightning type projects a schema from the class.
 */
public with sharing class SimpleCaseService {

    public class SubmitCaseRequest {
        @InvocableVariable(
            label='Subject'
            description='Short summary of the problem'
            required=true
        )
        public String subject;

        @InvocableVariable(label='Priority' description='Case priority: Low, Medium, or High')
        public String priority;

        @InvocableVariable(label='Description' description='Full detail of the problem')
        public String description;
    }

    public class SubmitCaseResponse {
        @InvocableVariable(label='Case Number' description='The case number assigned to the new case')
        public String case_number;

        @InvocableVariable(label='Status' description='The status of the newly created case')
        public String status;
    }

    @InvocableMethod(
        label='Submit Case (Simple)'
        description='Creates a support case and returns its case number'
    )
    public static List<SubmitCaseResponse> submitCase(List<SubmitCaseRequest> requests) {
        List<Case> toInsert = new List<Case>();

        for (SubmitCaseRequest req : requests) {
            toInsert.add(new Case(
                Subject     = req.subject,
                Priority    = String.isBlank(req.priority) ? 'Medium' : req.priority,
                Description = req.description,
                Origin      = 'Agentforce'
            ));
        }

        // DML outside the loop: the invocable signature is bulk-capable.
        insert toInsert;

        Map<Id, Case> created = new Map<Id, Case>([
            SELECT Id, CaseNumber, Status FROM Case WHERE Id IN :toInsert
        ]);

        List<SubmitCaseResponse> results = new List<SubmitCaseResponse>();

        for (Case c : toInsert) {
            Case row = created.get(c.Id);
            SubmitCaseResponse res = new SubmitCaseResponse();
            res.case_number = row.CaseNumber;
            res.status      = row.Status;
            results.add(res);
        }

        return results;
    }
}
