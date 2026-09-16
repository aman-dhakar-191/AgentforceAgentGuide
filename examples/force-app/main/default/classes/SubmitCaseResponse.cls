/**
 * Response wrapper for the submit_case invocable method.
 *
 * Field names here must match the AgentScript action's output names.
 * case_result is rendered by the CLT renderer; case_number is plain text
 * the agent reads back to the user.
 */
@JsonAccess(serializable='always' deserializable='always')
global class SubmitCaseResponse {
    @AuraEnabled
    @InvocableVariable(label='Case Result' description='The created case, for display')
    global CaseResult case_result;

    @AuraEnabled
    @InvocableVariable(label='Case Number' description='The case number assigned to the new case')
    global String case_number;
}
