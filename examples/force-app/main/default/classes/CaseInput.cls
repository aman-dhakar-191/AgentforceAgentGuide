/**
 * Data shape collected by the CLT editor for the submit_case action.
 *
 * Top-level and global, per the Lightning Types Apex class requirements.
 * @AuraEnabled drives schema projection; @InvocableVariable drives the
 * action's input binding. Fields used by both need both annotations.
 */
@JsonAccess(serializable='always' deserializable='always')
global class CaseInput {
    @AuraEnabled
    @InvocableVariable(
        label='Subject'
        description='Short summary of the problem'
        required=true
    )
    global String subject;

    @AuraEnabled
    @InvocableVariable(label='Priority' description='Case priority: Low, Medium, or High')
    global String priority;

    @AuraEnabled
    @InvocableVariable(label='Description' description='Full detail of the problem')
    global String description;
}
