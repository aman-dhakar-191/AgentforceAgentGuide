/**
 * Request wrapper for the submit_case invocable method.
 *
 * Field names here must match the AgentScript action's input names exactly.
 * A mismatch is silent: the input simply arrives null.
 */
@JsonAccess(serializable='always' deserializable='always')
global class SubmitCaseRequest {
    @AuraEnabled
    @InvocableVariable(
        label='Case Data'
        description='Case details collected from the user'
        required=true
    )
    global CaseInput case_data;
}
