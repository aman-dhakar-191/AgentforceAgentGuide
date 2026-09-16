/**
 * Invocable service behind the submit_case agent action.
 *
 * with sharing: an agent action runs on behalf of a user, so their sharing
 * rules should apply. Use without sharing only with a documented reason.
 */
public with sharing class CaseSubmissionService {

    @InvocableMethod(
        label='Submit Case'
        description='Creates a support case from structured input and returns the case details'
    )
    public static List<SubmitCaseResponse> submitCase(List<SubmitCaseRequest> requests) {
        List<Case> toInsert = new List<Case>();

        for (SubmitCaseRequest req : requests) {
            CaseInput input = req.case_data;

            if (input == null || String.isBlank(input.subject)) {
                throw new IllegalArgumentException('A case subject is required.');
            }

            toInsert.add(new Case(
                Subject     = input.subject,
                Priority    = String.isBlank(input.priority) ? 'Medium' : input.priority,
                Description = input.description,
                Origin      = 'Agentforce'
            ));
        }

        // DML outside the loop: the invocable signature is bulk-capable.
        insert toInsert;

        Map<Id, Case> created = new Map<Id, Case>([
            SELECT Id, CaseNumber, Subject, Priority, Status, CreatedDate
            FROM Case
            WHERE Id IN :toInsert
        ]);

        List<SubmitCaseResponse> results = new List<SubmitCaseResponse>();

        for (Case c : toInsert) {
            Case row = created.get(c.Id);

            CaseResult result = new CaseResult();
            result.caseNumber        = row.CaseNumber;
            result.subject           = row.Subject;
            result.priority          = row.Priority;
            result.status            = row.Status;
            result.createdDate       = row.CreatedDate;
            result.estimatedResponse = estimateResponse(row.Priority);

            SubmitCaseResponse response = new SubmitCaseResponse();
            response.case_result = result;
            response.case_number = row.CaseNumber;
            results.add(response);
        }

        return results;
    }

    private static String estimateResponse(String priority) {
        if (priority == 'High') {
            return 'Within 4 hours';
        }
        if (priority == 'Low') {
            return 'Within 3 business days';
        }
        return 'Within 1 business day';
    }
}
