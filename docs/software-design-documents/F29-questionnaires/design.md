# F29 - Questionnaires

## Overview

This feature provides photographers with a flexible questionnaire builder for collecting information from clients. Questionnaires support multiple question types (short text, long text, multiple choice, checkboxes, date, email), each with a required toggle and custom label. Questions are individually editable and reorderable via drag-and-drop. The builder stores question configurations including labels, types, options (for choice-based types), and required status.

Questionnaire delivery is multi-modal: questionnaires can be sent directly to a specific client from Studio Manager, attached as booking intake documents, or shared publicly via a unique URL that allows multiple submissions (useful for event planning scenarios like gathering guest preferences). Clients complete questionnaires on any device, with required field enforcement before submission. Responses are stored as structured JSON with respondent identification.

Templates let photographers save and reuse questionnaire configurations, with at least six sample templates for common photography scenarios (e.g., wedding day details, portrait session preferences, event logistics, family session info, newborn session prep, engagement session planning). Templates are fully customizable with add/remove/reorder capabilities. Document expiry auto-cancels incomplete questionnaires past a deadline, and automatic reminder emails nudge clients to complete them (both available on upgraded plans).

**L2 Requirements:** QST-4.7.1 (Question Builder), QST-4.7.2 (Questionnaire Templates), QST-4.7.3 (Questionnaire Delivery), QST-4.7.4 (Document Expiry & Reminders)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Questionnaire` | Entity | Questionnaire with questions, status lifecycle, public sharing, expiry, reminders, and template support. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `QuestionnaireQuestion` | Entity | Individual question with label, type, required toggle, sort order, and JSON options for choice-based types. |
| `QuestionnaireResponse` | Entity | A completed submission containing respondent identification and JSON-serialized answers. |
| `QuestionnaireStatus` | Enum | `Draft`, `Sent`, `Viewed`, `Completed`, `Expired`, `Cancelled`. |
| `QuestionType` | Enum | `ShortText`, `LongText`, `MultipleChoice`, `Checkboxes`, `Date`, `Email`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateQuestionnaireCommand` | Command | Creates a questionnaire with title, description, questions, and contact/project linkage. Returns questionnaire ID. |
| `UpdateQuestionnaireCommand` | Command | Updates title, description, questions (add/remove/reorder), expiry, and reminder settings on a draft questionnaire. |
| `DeleteQuestionnaireCommand` | Command | Soft-deletes a questionnaire. |
| `SendQuestionnaireCommand` | Command | Sends questionnaire to a specific client. Transitions to `Sent`, sends email with link. |
| `ShareQuestionnairePubliclyCommand` | Command | Generates a public slug for the questionnaire, enabling multiple submissions without authentication. |
| `SubmitQuestionnaireResponseCommand` | Command | Records a client's answers. Validates required fields. If not public/multi-submit, transitions to `Completed` and notifies photographer. |
| `ViewQuestionnaireQuery` | Query | Returns full questionnaire detail. Transitions to `Viewed` if currently `Sent`. |
| `ListQuestionnairesQuery` | Query | Paginated list filterable by status and contact. |
| `GetQuestionnaireByTokenQuery` | Query | Client-facing view via secure token (single-submission mode). |
| `GetQuestionnaireBySlugQuery` | Query | Public view via slug (multi-submission mode). |
| `ListQuestionnaireResponsesQuery` | Query | Returns all responses for a questionnaire. |
| `GetQuestionnaireResponseQuery` | Query | Returns a single response detail. |
| `SaveQuestionnaireTemplateCommand` | Command | Saves questionnaire as a reusable template. |
| `ListQuestionnaireTemplatesQuery` | Query | Lists all questionnaire templates. |
| `ApplyQuestionnaireTemplateCommand` | Command | Creates a new questionnaire from a template, copying questions. |
| `CancelQuestionnaireCommand` | Command | Manually cancels a sent questionnaire. |
| `ProcessQuestionnaireExpiryCommand` | Command | Background job: finds expired questionnaires, transitions to `Expired`. |
| `SendQuestionnaireRemindersCommand` | Command | Background job: sends reminder emails for incomplete questionnaires. |
| `QuestionnaireDto` | DTO | Questionnaire summary for list views. |
| `QuestionnaireDetailDto` | DTO | Full detail with questions. |
| `QuestionnaireResponseDto` | DTO | Response summary with answers. |
| `QuestionnaireTemplateDto` | DTO | Template summary. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateQuestionnaireCommandHandler` | Handler | Creates `Questionnaire` + `QuestionnaireQuestion` entities, persists. |
| `SendQuestionnaireCommandHandler` | Handler | Generates secure client token, sends email, updates status. |
| `SubmitQuestionnaireResponseHandler` | Handler | Validates required fields against question definitions, creates `QuestionnaireResponse`, transitions status for single-submission questionnaires. |
| `ShareQuestionnairePubliclyHandler` | Handler | Generates unique slug, sets `AllowMultipleSubmissions = true`, persists. |
| `ProcessQuestionnaireExpiryHandler` | Handler | Queries expired questionnaires, updates status, sends notification. |
| `SendQuestionnaireRemindersHandler` | Handler | Queries questionnaires due for reminder, validates plan, sends emails. |
| `QuestionnaireExpiryJob` | Background Job | Recurring job dispatching `ProcessQuestionnaireExpiryCommand`. |
| `QuestionnaireReminderJob` | Background Job | Recurring job dispatching `SendQuestionnaireRemindersCommand`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `QuestionnairesController` | Controller | Authenticated endpoints: `POST` (create), `PUT /{id}` (update), `DELETE /{id}`, `POST /{id}/send`, `POST /{id}/share` (make public), `POST /{id}/cancel`, `GET` (list), `GET /{id}` (detail), `GET /{id}/responses` (list responses), `GET /{id}/responses/{responseId}` (response detail). |
| `QuestionnaireTemplatesController` | Controller | Authenticated endpoints: `POST` (save template), `GET` (list templates), `POST /{id}/apply` (create from template). |
| `QuestionnairePublicController` | Controller | Anonymous endpoints: `GET /questionnaires/view/{token}` (client view, single), `GET /questionnaires/public/{slug}` (public view, multi), `POST /questionnaires/submit/{token}` (single submit), `POST /questionnaires/submit/public/{slug}` (public submit). |

---

## Class Diagrams

### Domain Layer -- Questionnaire Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Questionnaire {
  +Id : Guid
  +PhotographerId : Guid
  +ContactId : Guid?
  +ProjectId : Guid?
  +Title : string
  +Description : string?
  +Status : QuestionnaireStatus
  +SentAt : DateTime?
  +CompletedAt : DateTime?
  +AllowMultipleSubmissions : bool
  +PublicSlug : string?
  +ExpiryDays : int?
  +ExpiresAt : DateTime?
  +AutoRemindersEnabled : bool
  +ReminderIntervalDays : int?
  +LastReminderSentAt : DateTime?
  +IsTemplate : bool
  +TemplateName : string?
  +IsDeleted : bool
  +DeletedAt : DateTime?
  +CreatedBy : string?
  +UpdatedBy : string?
}

class QuestionnaireQuestion {
  +Id : Guid
  +QuestionnaireId : Guid
  +Label : string
  +QuestionType : QuestionType
  +IsRequired : bool
  +SortOrder : int
  +Options : string?
}

class QuestionnaireResponse {
  +Id : Guid
  +QuestionnaireId : Guid
  +ContactId : Guid?
  +RespondentEmail : string?
  +RespondentName : string?
  +AnswersJson : string
  +SubmittedAt : DateTime
}

enum QuestionnaireStatus {
  Draft
  Sent
  Viewed
  Completed
  Expired
  Cancelled
}

enum QuestionType {
  ShortText
  LongText
  MultipleChoice
  Checkboxes
  Date
  Email
}

Questionnaire "1" --> "*" QuestionnaireQuestion : Questions
Questionnaire "1" --> "*" QuestionnaireResponse : Responses
Questionnaire --> QuestionnaireStatus : uses
QuestionnaireQuestion --> QuestionType : uses
@enduml
```

### Application Layer -- Questionnaire Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Questionnaires.Commands" {
  class CreateQuestionnaireCommand <<record>> {
    +Title : string
    +Description : string?
    +ContactId : Guid?
    +ProjectId : Guid?
    +Questions : List<QuestionInput>
  }

  class UpdateQuestionnaireCommand <<record>> {
    +QuestionnaireId : Guid
    +Title : string
    +Description : string?
    +ExpiryDays : int?
    +AutoRemindersEnabled : bool
    +ReminderIntervalDays : int?
    +Questions : List<QuestionInput>
  }

  class SendQuestionnaireCommand <<record>> {
    +QuestionnaireId : Guid
  }

  class ShareQuestionnairePubliclyCommand <<record>> {
    +QuestionnaireId : Guid
  }

  class SubmitQuestionnaireResponseCommand <<record>> {
    +Token : string?
    +Slug : string?
    +RespondentName : string?
    +RespondentEmail : string?
    +Answers : List<AnswerInput>
  }

  class CancelQuestionnaireCommand <<record>> {
    +QuestionnaireId : Guid
  }

  class DeleteQuestionnaireCommand <<record>> {
    +QuestionnaireId : Guid
  }
}

class QuestionInput <<record>> {
  +Label : string
  +QuestionType : QuestionType
  +IsRequired : bool
  +Options : List<string>?
  +SortOrder : int
}

class AnswerInput <<record>> {
  +QuestionId : Guid
  +Value : string
}
@enduml
```

### Application Layer -- Questionnaire Queries & Templates

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Questionnaires.Queries" {
  class ViewQuestionnaireQuery <<record>> {
    +QuestionnaireId : Guid
  }

  class ListQuestionnairesQuery <<record>> {
    +Status : QuestionnaireStatus?
    +ContactId : Guid?
    +Page : int
    +PageSize : int
  }

  class GetQuestionnaireByTokenQuery <<record>> {
    +Token : string
  }

  class GetQuestionnaireBySlugQuery <<record>> {
    +Slug : string
  }

  class ListQuestionnaireResponsesQuery <<record>> {
    +QuestionnaireId : Guid
    +Page : int
    +PageSize : int
  }

  class GetQuestionnaireResponseQuery <<record>> {
    +QuestionnaireId : Guid
    +ResponseId : Guid
  }
}

package "Features.Questionnaires.Templates" {
  class SaveQuestionnaireTemplateCommand <<record>> {
    +QuestionnaireId : Guid
    +TemplateName : string
  }

  class ListQuestionnaireTemplatesQuery <<record>>

  class ApplyQuestionnaireTemplateCommand <<record>> {
    +TemplateId : Guid
    +ContactId : Guid?
    +ProjectId : Guid?
  }
}

package "Features.Questionnaires.BackgroundJobs" {
  class ProcessQuestionnaireExpiryCommand <<record>>
  class SendQuestionnaireRemindersCommand <<record>>
}

class QuestionnaireDto <<record>> {
  +Id : Guid
  +Title : string
  +Status : QuestionnaireStatus
  +QuestionCount : int
  +ResponseCount : int
  +ContactName : string?
  +SentAt : DateTime?
}

class QuestionnaireDetailDto <<record>> {
  +Id : Guid
  +Title : string
  +Description : string?
  +Status : QuestionnaireStatus
  +Questions : List<QuestionDto>
  +ResponseCount : int
  +PublicSlug : string?
  +ExpiresAt : DateTime?
}
@enduml
```

### API Layer -- Questionnaire Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class QuestionnairesController <<ApiController>> {
  -_mediator : IMediator
  +Create(CreateQuestionnaireCommand) : IActionResult
  +Update(Guid, UpdateQuestionnaireCommand) : IActionResult
  +Delete(Guid) : IActionResult
  +Send(Guid) : IActionResult
  +SharePublicly(Guid) : IActionResult
  +Cancel(Guid) : IActionResult
  +List(ListQuestionnairesQuery) : IActionResult
  +Get(Guid) : IActionResult
  +ListResponses(Guid) : IActionResult
  +GetResponse(Guid, Guid) : IActionResult
}

class QuestionnaireTemplatesController <<ApiController>> {
  -_mediator : IMediator
  +SaveTemplate(SaveQuestionnaireTemplateCommand) : IActionResult
  +ListTemplates() : IActionResult
  +ApplyTemplate(Guid, ApplyQuestionnaireTemplateCommand) : IActionResult
}

class QuestionnairePublicController <<ApiController>> {
  -_mediator : IMediator
  +ViewByToken(string token) : IActionResult
  +ViewBySlug(string slug) : IActionResult
  +SubmitByToken(string token, SubmitRequest) : IActionResult
  +SubmitBySlug(string slug, SubmitRequest) : IActionResult
}

QuestionnairesController --> "IMediator" : sends commands/queries
QuestionnaireTemplatesController --> "IMediator" : sends commands/queries
QuestionnairePublicController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Create Questionnaire with Questions

```plantuml
@startuml
actor Photographer as P
participant "QuestionnairesController" as QC
participant "MediatR" as M
participant "CreateQuestionnaireHandler" as CH
participant "ApplicationDbContext" as DB

P -> QC : POST /api/questionnaires\n{title, description,\ncontactId, questions[]}
QC -> M : Send(CreateQuestionnaireCommand)
M -> CH : Handle(command)

CH -> CH : Validate (FluentValidation)\n- At least one question\n- Valid question types\n- Options required for\n  MultipleChoice/Checkboxes

alt validation fails
  CH --> M : Result.Failure(errors)
  M --> QC : Result.Failure
  QC --> P : 400 Bad Request
end

CH -> DB : Questionnaires.Add(questionnaire)
CH -> DB : QuestionnaireQuestions.AddRange(\nquestions with SortOrder)
CH -> DB : SaveChangesAsync()
CH --> M : Result.Success(questionnaireId)
M --> QC : Result.Success
QC --> P : 201 Created {questionnaireId}
@enduml
```

### Send Questionnaire to Client

```plantuml
@startuml
actor Photographer as P
participant "QuestionnairesController" as QC
participant "MediatR" as M
participant "SendQuestionnaireHandler" as SH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

P -> QC : POST /api/questionnaires/{id}/send
QC -> M : Send(SendQuestionnaireCommand)
M -> SH : Handle(command)

SH -> DB : Load Questionnaire with Contact

alt not in Draft status
  SH --> M : Result.Failure("Only drafts can be sent")
  M --> QC : Result.Failure
  QC --> P : 400 Bad Request
end

SH -> SH : Generate secure access token

SH -> DB : questionnaire.Status = Sent\nquestionnaire.SentAt = UtcNow
alt expiryDays configured
  SH -> DB : questionnaire.ExpiresAt =\nSentAt + ExpiryDays
end
SH -> DB : SaveChangesAsync()

SH -> ES : SendTemplatedAsync(\nclient.Email,\n"Questionnaire from {businessName}",\nquestionnaireLink)

SH --> M : Result.Success
M --> QC : Result.Success
QC --> P : 200 OK
@enduml
```

### Client Submits Questionnaire Response

```plantuml
@startuml
actor Client as C
participant "QuestionnairePublicController" as QPC
participant "MediatR" as M
participant "SubmitResponseHandler" as SRH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

C -> QPC : POST /api/questionnaires/submit/{token}\n{respondentName, respondentEmail,\nanswers[{questionId, value}]}
QPC -> M : Send(SubmitQuestionnaireResponseCommand)
M -> SRH : Handle(command)

SRH -> DB : Load Questionnaire\nwith Questions

alt questionnaire expired or cancelled
  SRH --> M : Result.Failure("No longer accepting responses")
  M --> QPC : Result.Failure
  QPC --> C : 410 Gone
end

SRH -> SRH : Validate required fields:\ncheck each IsRequired question\nhas a non-empty answer

alt required field missing
  SRH --> M : Result.Failure("Required fields incomplete")
  M --> QPC : Result.Failure
  QPC --> C : 400 Bad Request
end

SRH -> SRH : Serialize answers to JSON

SRH -> DB : QuestionnaireResponses.Add(\nresponse with AnswersJson,\nRespondentName, RespondentEmail,\nSubmittedAt = UtcNow)

alt single-submission mode
  SRH -> DB : questionnaire.Status = Completed\nquestionnaire.CompletedAt = UtcNow
end

SRH -> DB : SaveChangesAsync()

SRH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Questionnaire Completed",\nquestionnaireTitle,\nrespondentName)

SRH --> M : Result.Success(responseId)
M --> QPC : Result.Success
QPC --> C : 200 OK
@enduml
```

### Share Questionnaire Publicly

```plantuml
@startuml
actor Photographer as P
participant "QuestionnairesController" as QC
participant "MediatR" as M
participant "SharePubliclyHandler" as SPH
participant "ApplicationDbContext" as DB

P -> QC : POST /api/questionnaires/{id}/share
QC -> M : Send(ShareQuestionnairePubliclyCommand)
M -> SPH : Handle(command)

SPH -> DB : Load Questionnaire

alt not in Draft or Sent status
  SPH --> M : Result.Failure("Cannot share in current status")
  M --> QC : Result.Failure
  QC --> P : 400 Bad Request
end

SPH -> SPH : Generate unique URL slug\n(e.g., "wedding-details-a1b2c3")

SPH -> DB : questionnaire.PublicSlug = slug\nquestionnaire.AllowMultipleSubmissions = true
alt currently Draft
  SPH -> DB : questionnaire.Status = Sent\nquestionnaire.SentAt = UtcNow
end
SPH -> DB : SaveChangesAsync()

SPH --> M : Result.Success(publicUrl)
M --> QC : Result.Success
QC --> P : 200 OK {publicUrl}
@enduml
```

### Questionnaire Expiry Background Job

```plantuml
@startuml
participant "QuestionnaireExpiryJob" as JOB
participant "MediatR" as M
participant "ProcessExpiryHandler" as PEH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

JOB -> M : Send(ProcessQuestionnaireExpiryCommand)
M -> PEH : Handle(command)

PEH -> DB : Query Questionnaires WHERE\nExpiresAt < UtcNow\nAND Status IN (Sent, Viewed)

loop each expired questionnaire
  PEH -> DB : questionnaire.Status = Expired
  PEH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Questionnaire Expired",\nquestionnaireTitle)
end

PEH -> DB : SaveChangesAsync()
PEH --> M : Result.Success(expiredCount)
@enduml
```

### Questionnaire Reminder Background Job

```plantuml
@startuml
participant "QuestionnaireReminderJob" as JOB
participant "MediatR" as M
participant "SendRemindersHandler" as SRH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

JOB -> M : Send(SendQuestionnaireRemindersCommand)
M -> SRH : Handle(command)

SRH -> DB : Query Questionnaires WHERE\nStatus IN (Sent, Viewed)\nAND AutoRemindersEnabled = true\nAND AllowMultipleSubmissions = false\nAND (LastReminderSentAt is null\n  OR LastReminderSentAt +\n  ReminderIntervalDays < UtcNow)

SRH -> DB : Join Photographer to verify\nplan supports reminders

loop each questionnaire due for reminder
  SRH -> ES : SendTemplatedAsync(\nclient.Email,\n"Reminder: Please Complete\nYour Questionnaire",\nquestionnaireLink)
  SRH -> DB : questionnaire.LastReminderSentAt\n= UtcNow
end

SRH -> DB : SaveChangesAsync()
SRH --> M : Result.Success(reminderCount)
@enduml
```

### Apply Questionnaire Template

```plantuml
@startuml
actor Photographer as P
participant "QuestionnaireTemplatesController" as QTC
participant "MediatR" as M
participant "ApplyTemplateHandler" as ATH
participant "ApplicationDbContext" as DB

P -> QTC : POST /api/questionnaire-templates/{id}/apply\n{contactId, projectId}
QTC -> M : Send(ApplyQuestionnaireTemplateCommand)
M -> ATH : Handle(command)

ATH -> DB : Load template Questionnaire\nwith Questions (IsTemplate = true)

alt template not found
  ATH --> M : Result.Failure("Template not found")
  M --> QTC : Result.Failure
  QTC --> P : 404 Not Found
end

ATH -> ATH : Clone questionnaire entity\n(new Id, Status = Draft,\nassign contactId/projectId)

ATH -> ATH : Clone all Questions\nwith new IDs, preserving\nlabels, types, options,\nrequired status, sort order

ATH -> DB : Questionnaires.Add(newQuestionnaire)
ATH -> DB : QuestionnaireQuestions.AddRange(questions)
ATH -> DB : SaveChangesAsync()

ATH --> M : Result.Success(newQuestionnaireId)
M --> QTC : Result.Success
QTC --> P : 201 Created {questionnaireId}
@enduml
```
