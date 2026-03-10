# F24 - Project Pipeline Board

## Overview

This feature provides a visual Kanban board for photographers to manage their workflow pipeline within the Studio Manager. The board displays project cards organized into customizable columns (stages) that represent workflow phases. The default stages are Inquiry, Booked Session, Post-production, and Completed Project, but photographers can fully customize the board by adding, removing, renaming, and reordering stages.

Project cards are the central organizational unit. Each card displays the client name, project name/type, and status indicators at a glance. Cards are draggable between stages via drag-and-drop, with their sort order within each column also adjustable. The card detail view surfaces all associated documents (contracts, invoices, questionnaires), sessions, and payments. Photographers can create new documents or sessions directly from a card, or link existing items to a project.

The pipeline board integrates tightly with the lead capture form system (F23). When a new form submission is received, a project card is automatically created in the first stage (Inquiry) and linked to the auto-created contact. This ensures every inbound lead immediately appears on the pipeline board without manual intervention, giving photographers instant visibility into their business funnel.

**L2 Requirements:** CRM-4.2.1 (Project Board), CRM-4.2.2 (Project Cards), CRM-4.2.3 (Auto-Created Projects)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Project` | Entity | Kanban card representing a project. Stores `PhotographerId`, `ContactId`, `StageId`, `Name`, `ProjectType`, and `SortOrder`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `ProjectStage` | Entity | Column on the Kanban board. Stores `PhotographerId`, `Name`, and `SortOrder`. Implements `ITenantEntity`. Contains navigation to its `Projects`. |
| `ProjectDocument` | Entity | Join table linking a project to a document (contract, invoice, or questionnaire). Stores `ProjectId`, `DocumentId`, `DocumentType`. |
| `DocumentType` | Enum | `Contract`, `Invoice`, `Questionnaire` -- distinguishes linked document types. |
| `ProjectCreatedEvent` | Domain Event | Raised when a project card is created (manual or auto). Carries `ProjectId`, `ContactId`, `StageId`. |
| `ProjectStageChangedEvent` | Domain Event | Raised when a project moves between stages. Carries `ProjectId`, `FromStageId`, `ToStageId`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetPipelineBoardQuery` | Query | Returns all stages with their projects for the authenticated photographer. Includes card summary data (client name, project name, type, status indicators). |
| `CreateProjectCommand` | Command | Creates a new project card in a specified stage. Optionally links to a contact. |
| `UpdateProjectCommand` | Command | Updates project name, type, and other details. |
| `DeleteProjectCommand` | Command | Soft-deletes a project card. |
| `MoveProjectCommand` | Command | Moves a project to a different stage and/or changes its sort order within the stage. Raises `ProjectStageChangedEvent`. |
| `ReorderProjectsCommand` | Command | Batch-updates sort orders of projects within a single stage (after drag-and-drop reorder). |
| `GetProjectDetailQuery` | Query | Returns full project detail: card info, linked documents (contracts/invoices/questionnaires), sessions, and payments. |
| `LinkDocumentToProjectCommand` | Command | Associates an existing document with a project by creating a `ProjectDocument` record. |
| `UnlinkDocumentFromProjectCommand` | Command | Removes the `ProjectDocument` association. |
| `CreateStageCommand` | Command | Adds a new stage to the board at a specified sort order. |
| `UpdateStageCommand` | Command | Renames a stage. |
| `DeleteStageCommand` | Command | Removes a stage. Requires that all projects be moved out first (or optionally moves them to another stage). |
| `ReorderStagesCommand` | Command | Batch-updates sort orders of all stages (after drag-and-drop reorder). |
| `AutoCreateProjectCommand` | Command | Internal command triggered by form submission. Creates a project in the first stage (lowest `SortOrder`), linked to the auto-created contact. |
| `SeedDefaultStagesCommand` | Command | Creates the four default stages for a new photographer account. Called during registration. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetPipelineBoardHandler` | Handler | Queries all `ProjectStage` entities for the photographer, includes projects with contact info, orders by `SortOrder`. |
| `MoveProjectHandler` | Handler | Updates `Project.StageId` and `SortOrder`, raises `ProjectStageChangedEvent`. |
| `AutoCreateProjectHandler` | Handler | Finds the first stage (min `SortOrder`), creates project linked to contact. Called by `FormSubmittedEventHandler`. |
| `GetProjectDetailHandler` | Handler | Loads project with contact, then queries `ProjectDocument` join records to load linked contracts, invoices, questionnaires. Also queries booking records and payment records by `ProjectId`. |
| `SeedDefaultStagesHandler` | Handler | Creates four `ProjectStage` records: Inquiry (0), Booked Session (1), Post-production (2), Completed Project (3). |
| `ProjectConfiguration` | EF Config | Indexes on `(PhotographerId, StageId)` and `(PhotographerId, ContactId)`. |
| `ProjectStageConfiguration` | EF Config | Unique constraint on `(PhotographerId, Name)`. Index on `(PhotographerId, SortOrder)`. |
| `ProjectDocumentConfiguration` | EF Config | Composite key on `(ProjectId, DocumentId, DocumentType)`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PipelineBoardController` | Controller | Board-level endpoints: `GET /api/pipeline` (full board), `POST /api/pipeline/stages` (create stage), `PUT /api/pipeline/stages/{id}` (rename), `DELETE /api/pipeline/stages/{id}` (remove), `PUT /api/pipeline/stages/reorder` (batch reorder). All require `[Authorize]`. |
| `ProjectsController` | Controller | Card-level endpoints: `POST /api/projects` (create), `GET /api/projects/{id}` (detail), `PUT /api/projects/{id}` (update), `DELETE /api/projects/{id}` (delete), `PUT /api/projects/{id}/move` (move to stage), `PUT /api/projects/{id}/reorder` (reorder within stage). All require `[Authorize]`. |
| `ProjectDocumentsController` | Controller | Document linking: `POST /api/projects/{id}/documents` (link), `DELETE /api/projects/{id}/documents/{docId}` (unlink), `GET /api/projects/{id}/documents` (list linked). All require `[Authorize]`. |

---

## Class Diagrams

### Domain Layer -- Pipeline Board Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ProjectStage {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +SortOrder : int
}

class Project {
  +Id : Guid
  +PhotographerId : Guid
  +ContactId : Guid?
  +StageId : Guid
  +Name : string
  +ProjectType : string?
  +SortOrder : int
}

class ProjectDocument {
  +Id : Guid
  +ProjectId : Guid
  +DocumentId : Guid
  +DocumentType : DocumentType
}

class Contact {
  +Id : Guid
  +FirstName : string
  +LastName : string
  +Email : string
  +ContactType : ContactType
}

enum DocumentType {
  Contract
  Invoice
  Questionnaire
}

ProjectStage "1" --> "*" Project : Projects
Project --> "0..1" Contact : Contact
Project "1" --> "*" ProjectDocument : Documents
ProjectDocument ..> DocumentType
@enduml
```

### Application Layer -- Board Queries & Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Pipeline.Queries" {
  class GetPipelineBoardQuery <<record>>

  class PipelineBoardDto <<record>> {
    +Stages : List<StageDto>
  }

  class StageDto <<record>> {
    +Id : Guid
    +Name : string
    +SortOrder : int
    +Projects : List<ProjectCardDto>
  }

  class ProjectCardDto <<record>> {
    +Id : Guid
    +Name : string
    +ProjectType : string?
    +ClientName : string?
    +ClientEmail : string?
    +HasPendingDocuments : bool
    +HasUpcomingSession : bool
    +HasOutstandingPayment : bool
  }

  class GetProjectDetailQuery <<record>> {
    +ProjectId : Guid
  }

  class ProjectDetailDto <<record>> {
    +Project : ProjectCardDto
    +Contracts : List<ContractSummaryDto>
    +Invoices : List<InvoiceSummaryDto>
    +Questionnaires : List<QuestionnaireSummaryDto>
    +Sessions : List<BookingSummaryDto>
    +Payments : List<PaymentSummaryDto>
  }
}

GetPipelineBoardQuery ..> PipelineBoardDto : returns
GetProjectDetailQuery ..> ProjectDetailDto : returns
@enduml
```

### Application Layer -- Stage & Project Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Pipeline.Commands" {
  class CreateStageCommand <<record>> {
    +Name : string
    +SortOrder : int
  }

  class UpdateStageCommand <<record>> {
    +StageId : Guid
    +Name : string
  }

  class DeleteStageCommand <<record>> {
    +StageId : Guid
    +MoveProjectsToStageId : Guid?
  }

  class ReorderStagesCommand <<record>> {
    +StageOrders : List<StageOrderDto>
  }
}

package "Features.Projects.Commands" {
  class CreateProjectCommand <<record>> {
    +StageId : Guid
    +ContactId : Guid?
    +Name : string
    +ProjectType : string?
  }

  class MoveProjectCommand <<record>> {
    +ProjectId : Guid
    +TargetStageId : Guid
    +NewSortOrder : int
  }

  class LinkDocumentToProjectCommand <<record>> {
    +ProjectId : Guid
    +DocumentId : Guid
    +DocumentType : DocumentType
  }

  class AutoCreateProjectCommand <<record>> {
    +ContactId : Guid
    +ProjectName : string
  }
}

@enduml
```

### API Layer -- Pipeline & Project Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PipelineBoardController <<ApiController>> {
  -_mediator : IMediator
  +GetBoard() : IActionResult
  +CreateStage(cmd) : IActionResult
  +UpdateStage(stageId, cmd) : IActionResult
  +DeleteStage(stageId) : IActionResult
  +ReorderStages(cmd) : IActionResult
}

class ProjectsController <<ApiController>> {
  -_mediator : IMediator
  +Create(cmd) : IActionResult
  +GetDetail(projectId) : IActionResult
  +Update(projectId, cmd) : IActionResult
  +Delete(projectId) : IActionResult
  +Move(projectId, cmd) : IActionResult
}

class ProjectDocumentsController <<ApiController>> {
  -_mediator : IMediator
  +LinkDocument(projectId, cmd) : IActionResult
  +UnlinkDocument(projectId, docId) : IActionResult
  +ListDocuments(projectId) : IActionResult
}

PipelineBoardController --> "IMediator" : sends commands/queries
ProjectsController --> "IMediator" : sends commands/queries
ProjectDocumentsController --> "IMediator" : sends commands
@enduml
```

---

## Sequence Diagrams

### Load Pipeline Board

```plantuml
@startuml
actor Photographer as P
participant "PipelineBoardController" as PBC
participant "MediatR" as M
participant "GetPipelineBoardHandler" as BH
participant "ApplicationDbContext" as DB

P -> PBC : GET /api/pipeline
PBC -> M : Send(GetPipelineBoardQuery)
M -> BH : Handle()
BH -> DB : Query ProjectStages\nWHERE PhotographerId\nORDER BY SortOrder\nINCLUDE Projects.Contact
DB --> BH : stages with projects

loop for each project
  BH -> BH : Map to ProjectCardDto\n(clientName, statusIndicators)
end

BH -> BH : Assemble PipelineBoardDto
BH --> M : PipelineBoardDto
M --> PBC : result
PBC --> P : 200 OK {stages: [\n  {name: "Inquiry", projects: [...]},\n  {name: "Booked Session", projects: [...]},\n  ...]}
@enduml
```

### Drag-and-Drop: Move Project Between Stages

```plantuml
@startuml
actor Photographer as P
participant "ProjectsController" as PC
participant "MediatR" as M
participant "MoveProjectHandler" as MH
participant "ApplicationDbContext" as DB

P -> PC : PUT /api/projects/{id}/move\n{targetStageId, newSortOrder: 2}
PC -> M : Send(MoveProjectCommand)
M -> MH : Handle()
MH -> DB : Load Project
DB --> MH : project (StageId = oldStage)
MH -> MH : oldStageId = project.StageId
MH -> DB : project.StageId = targetStageId
MH -> DB : project.SortOrder = 2
MH -> DB : Shift SortOrder of other projects\nin target stage (>= 2) by +1
DB --> MH : saved
MH -> MH : Raise ProjectStageChangedEvent\n{from: oldStage, to: targetStage}
MH --> M : success
M --> PC : result
PC --> P : 200 OK
@enduml
```

### Auto-Create Project on Form Submission

```plantuml
@startuml
participant "FormSubmittedEventHandler" as FEH
participant "MediatR" as M
participant "AutoCreateProjectHandler" as APH
participant "ApplicationDbContext" as DB

FEH -> M : Send(AutoCreateProjectCommand\n{contactId, projectName: "New Inquiry"})
M -> APH : Handle()
APH -> DB : Query ProjectStage\nWHERE PhotographerId\nORDER BY SortOrder ASC\nTAKE 1
DB --> APH : inquiryStage (first stage)
APH -> DB : Count projects in stage
DB --> APH : count = 5
APH -> DB : Create Project\n{contactId, stageId: inquiryStage.Id,\nname: "New Inquiry",\nsortOrder: 5}
DB --> APH : project saved
APH -> APH : Raise ProjectCreatedEvent
APH --> M : ProjectId
M --> FEH : success
@enduml
```

### View Project Detail with Linked Documents

```plantuml
@startuml
actor Photographer as P
participant "ProjectsController" as PC
participant "MediatR" as M
participant "GetProjectDetailHandler" as DH
participant "ApplicationDbContext" as DB

P -> PC : GET /api/projects/{id}
PC -> M : Send(GetProjectDetailQuery)
M -> DH : Handle()
DH -> DB : Load Project with Contact
DB --> DH : project
DH -> DB : Query ProjectDocument\nWHERE ProjectId = {id}
DB --> DH : linkedDocs [{docId, type: Contract},\n{docId, type: Invoice}]

loop for each linked document
  alt DocumentType = Contract
    DH -> DB : Load Contract by DocumentId
    DB --> DH : contract
  else DocumentType = Invoice
    DH -> DB : Load Invoice by DocumentId
    DB --> DH : invoice
  else DocumentType = Questionnaire
    DH -> DB : Load Questionnaire by DocumentId
    DB --> DH : questionnaire
  end
end

DH -> DB : Query BookingRecords\nWHERE ProjectId = {id}
DB --> DH : bookings
DH -> DB : Query PaymentRecords\nWHERE related to project
DB --> DH : payments
DH -> DH : Assemble ProjectDetailDto
DH --> M : ProjectDetailDto
M --> PC : result
PC --> P : 200 OK {project, contracts,\ninvoices, questionnaires,\nsessions, payments}
@enduml
```

### Customize Stages (Add / Rename / Reorder)

```plantuml
@startuml
actor Photographer as P
participant "PipelineBoardController" as PBC
participant "MediatR" as M
participant "ApplicationDbContext" as DB

== Add New Stage ==
P -> PBC : POST /api/pipeline/stages\n{name: "Editing", sortOrder: 2}
PBC -> M : Send(CreateStageCommand)
M -> DB : Shift existing stages >= sortOrder by +1
M -> DB : Insert ProjectStage\n{name: "Editing", sortOrder: 2}
DB --> M : saved
M --> PBC : StageDto
PBC --> P : 201 Created {id, name, sortOrder}

== Rename Stage ==
P -> PBC : PUT /api/pipeline/stages/{id}\n{name: "Color Grading"}
PBC -> M : Send(UpdateStageCommand)
M -> DB : Update ProjectStage.Name
DB --> M : saved
M --> PBC : success
PBC --> P : 200 OK

== Reorder All Stages ==
P -> PBC : PUT /api/pipeline/stages/reorder\n{stageOrders: [{id, sortOrder: 0}, ...]}
PBC -> M : Send(ReorderStagesCommand)
M -> DB : Batch update SortOrder for each stage
DB --> M : saved
M --> PBC : success
PBC --> P : 200 OK
@enduml
```
