/**
 * Data shape handed to the CLT renderer after a case is created.
 *
 * Only @AuraEnabled fields are projected into the Lightning type schema,
 * so anything the renderer needs to display must carry the annotation.
 */
@JsonAccess(serializable='always' deserializable='always')
global class CaseResult {
    @AuraEnabled global String caseNumber;
    @AuraEnabled global String subject;
    @AuraEnabled global String priority;
    @AuraEnabled global String status;
    @AuraEnabled global Datetime createdDate;
    @AuraEnabled global String estimatedResponse;
}
