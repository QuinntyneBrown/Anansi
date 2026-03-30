import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  ContractsService,
  ContractDto,
  ContractStatus,
  ContactsService,
  ContactDto,
  PagedList,
} from 'api';
import {
  ButtonComponent,
  CardComponent,
  InputGroupComponent,
  ToggleComponent,
  BreadcrumbComponent,
  BreadcrumbItem,
} from 'components';

@Component({
  selector: 'lib-contract-editor-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    InputGroupComponent,
    ToggleComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="page">
      <div class="top-bar">
        <lib-breadcrumb
          [items]="breadcrumbs()"
          (navigate)="onBreadcrumbNavigate($event)"
        />
        <div class="top-bar__actions">
          <lib-button variant="primary" icon="save" (clicked)="onSave()">Save</lib-button>
        </div>
      </div>

      <div class="editor-layout">
        <div class="editor-main">
          <input
            class="title-input"
            type="text"
            placeholder="Contract Title"
            [value]="title()"
            (input)="onTitleInput($event)"
          />

          <div class="variable-toolbar">
            <span class="variable-toolbar__label">Insert Variable:</span>
            @for (variable of variables; track variable.key) {
              <button class="variable-btn" (click)="insertVariable(variable.key)">
                <lucide-icon [name]="variable.icon" [size]="14"></lucide-icon>
                {{ variable.label }}
              </button>
            }
          </div>

          <textarea
            class="content-editor"
            placeholder="Write your contract content here..."
            [value]="content()"
            (input)="onContentInput($event)"
          ></textarea>
        </div>

        <div class="editor-sidebar">
          <lib-card>
            <div card-header>
              <h3 class="card-title">Contract Details</h3>
            </div>
            <div class="card-fields">
              <div class="field-group">
                <label class="field-label">Contact</label>
                <select
                  class="field-select"
                  [value]="selectedContactId()"
                  (change)="onContactChange($event)"
                >
                  <option value="">Select a contact</option>
                  @for (contact of contacts(); track contact.id) {
                    <option [value]="contact.id">{{ contact.firstName }} {{ contact.lastName }}</option>
                  }
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Status</label>
                <select
                  class="field-select"
                  [value]="status()"
                  (change)="onStatusChange($event)"
                >
                  <option [value]="ContractStatus.Draft">Draft</option>
                  <option [value]="ContractStatus.Sent">Sent</option>
                  <option [value]="ContractStatus.Signed">Signed</option>
                </select>
              </div>

              <lib-input-group
                label="Expiry Date"
                type="text"
                placeholder="YYYY-MM-DD"
                [value]="expiryDate()"
                (input)="onExpiryDateInput($event)"
              />
            </div>
          </lib-card>

          <lib-card>
            <div card-header>
              <h3 class="card-title">Signature</h3>
            </div>
            <div class="signature-area">
              <lucide-icon name="pen-tool" [size]="24"></lucide-icon>
              <span class="signature-placeholder-text">Signature will appear here</span>
            </div>
          </lib-card>

          <lib-card>
            <div card-header>
              <h3 class="card-title">E-Signature</h3>
            </div>
            <div class="esign-toggle">
              <lib-toggle
                label="Require e-signature"
                [(checked)]="eSignatureEnabled"
              />
            </div>
          </lib-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page {
      background: #1A1A1C;
      min-height: 100vh;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #3A3A3C;
    }

    .top-bar__actions {
      display: flex;
      gap: 8px;
    }

    .editor-layout {
      display: flex;
      gap: 24px;
      padding: 24px;
    }

    .editor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    .title-input {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #F5F5F0;
      background: transparent;
      border: none;
      border-bottom: 1px solid #3A3A3C;
      padding: 8px 0;
      outline: none;
      width: 100%;
    }

    .title-input::placeholder {
      color: #4A4A4C;
    }

    .title-input:focus {
      border-bottom-color: #C9A962;
    }

    .variable-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .variable-toolbar__label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      white-space: nowrap;
    }

    .variable-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #3A3A3C;
      background: #242426;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .variable-btn:hover {
      border-color: #C9A962;
    }

    .content-editor {
      font-family: Inter, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      color: #F5F5F0;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 24px;
      min-height: 400px;
      resize: vertical;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .content-editor::placeholder {
      color: #4A4A4C;
    }

    .content-editor:focus {
      border-color: #C9A962;
    }

    .editor-sidebar {
      width: 360px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .card-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
    }

    .field-select {
      font-family: Inter, sans-serif;
      font-size: 14px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 12px 16px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      appearance: none;
      cursor: pointer;
    }

    .field-select:focus {
      border-color: #C9A962;
    }

    .signature-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 200px;
      border: 2px dashed #3A3A3C;
      border-radius: 12px;
      color: #6E6E70;
    }

    .signature-placeholder-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .esign-toggle {
      padding: 0;
    }
  `,
})
export class ContractEditorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contractsService = inject(ContractsService);
  private readonly contactsService = inject(ContactsService);

  readonly ContractStatus = ContractStatus;

  readonly title = signal('');
  readonly content = signal('');
  readonly status = signal<ContractStatus>(ContractStatus.Draft);
  readonly selectedContactId = signal('');
  readonly expiryDate = signal('');
  readonly eSignatureEnabled = signal(false);
  readonly contacts = signal<ContactDto[]>([]);
  readonly contractId = signal<string | null>(null);

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Documents', href: '/documents' },
    { label: 'Contracts', href: '/documents/contracts' },
    { label: this.title() || 'New Contract' },
  ]);

  readonly variables = [
    { key: 'client_name', label: 'Client Name', icon: 'user' },
    { key: 'client_email', label: 'Client Email', icon: 'mail' },
    { key: 'phone', label: 'Phone', icon: 'phone' },
    { key: 'date', label: 'Date', icon: 'calendar' },
    { key: 'custom', label: 'Custom', icon: 'plus' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.contractId.set(id);
    this.loadContacts();
    if (id && id !== 'new') {
      this.loadContract(id);
    }
  }

  private loadContract(id: string): void {
    this.contractsService.get(id).subscribe({
      next: (contract: ContractDto) => {
        this.title.set(contract.title);
        this.content.set(contract.content);
        this.status.set(contract.status);
        this.selectedContactId.set(contract.contactId ?? '');
      },
    });
  }

  private loadContacts(): void {
    this.contactsService.list({ pageSize: 100 }).subscribe({
      next: (result: PagedList<ContactDto>) => {
        this.contacts.set(result.items);
      },
    });
  }

  onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  onContentInput(event: Event): void {
    this.content.set((event.target as HTMLTextAreaElement).value);
  }

  onContactChange(event: Event): void {
    this.selectedContactId.set((event.target as HTMLSelectElement).value);
  }

  onStatusChange(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as ContractStatus);
  }

  onExpiryDateInput(event: Event): void {
    this.expiryDate.set((event.target as HTMLInputElement).value);
  }

  insertVariable(key: string): void {
    const variable = `{{${key}}}`;
    this.content.set(this.content() + variable);
  }

  onSave(): void {
    this.contractsService.create({
      title: this.title(),
      content: this.content(),
      contactId: this.selectedContactId() || undefined,
      autoRemindersEnabled: false,
      isTemplate: false,
    }).subscribe({
      next: () => {
        this.router.navigate(['/documents/contracts']);
      },
    });
  }

  onBreadcrumbNavigate(href: string): void {
    this.router.navigate([href]);
  }
}
