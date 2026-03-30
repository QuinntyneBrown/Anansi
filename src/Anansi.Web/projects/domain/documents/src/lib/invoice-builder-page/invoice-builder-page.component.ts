import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  InvoicesService,
  InvoiceDto,
  ContactsService,
  ContactDto,
  PagedList,
} from 'api';
import {
  ButtonComponent,
  CardComponent,
  InputGroupComponent,
  TextareaGroupComponent,
  BreadcrumbComponent,
  BreadcrumbItem,
} from 'components';

interface LineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

interface Installment {
  amountCents: number;
  dueDate: string;
}

@Component({
  selector: 'lib-invoice-builder-page',
  standalone: true,
  imports: [
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    InputGroupComponent,
    TextareaGroupComponent,
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
          <lib-button variant="secondary" icon="save" (clicked)="onSave()">Save</lib-button>
          <lib-button variant="primary" icon="send" (clicked)="onSend()">Send</lib-button>
        </div>
      </div>

      <div class="builder-layout">
        <div class="builder-main">
          <input
            class="title-input"
            type="text"
            placeholder="Invoice Title"
            [value]="title()"
            (input)="onTitleInput($event)"
          />

          <div class="line-items-section">
            <h3 class="section-title">Line Items</h3>
            <div class="line-items-table">
              <div class="table-header">
                <span class="col-desc">Description</span>
                <span class="col-qty">Qty</span>
                <span class="col-price">Unit Price</span>
                <span class="col-total">Total</span>
                <span class="col-action"></span>
              </div>

              @for (item of lineItems(); track $index; let i = $index) {
                <div class="table-row">
                  <input
                    class="table-input col-desc"
                    type="text"
                    placeholder="Item description"
                    [value]="item.description"
                    (input)="onLineItemDescriptionInput(i, $event)"
                  />
                  <input
                    class="table-input col-qty"
                    type="number"
                    min="1"
                    [value]="item.quantity"
                    (input)="onLineItemQuantityInput(i, $event)"
                  />
                  <input
                    class="table-input col-price"
                    type="number"
                    min="0"
                    step="0.01"
                    [value]="(item.unitPriceCents / 100).toFixed(2)"
                    (input)="onLineItemPriceInput(i, $event)"
                  />
                  <span class="col-total table-cell">{{ formatCurrency(item.quantity * item.unitPriceCents) }}</span>
                  <button class="remove-btn col-action" (click)="removeLineItem(i)">
                    <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                  </button>
                </div>
              }
            </div>

            <lib-button variant="ghost" icon="plus" (clicked)="addLineItem()">Add Line Item</lib-button>
          </div>

          <lib-textarea-group
            label="Notes"
            placeholder="Additional notes for the client..."
            [(value)]="notes"
            [rows]="4"
          />

          <div class="summary-row">
            <div class="summary-item">
              <span class="summary-label">Subtotal</span>
              <span class="summary-value">{{ formatCurrency(subtotal()) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tax ({{ taxRate() }}%)</span>
              <span class="summary-value">{{ formatCurrency(taxAmount()) }}</span>
            </div>
            <div class="summary-item summary-item--total">
              <span class="summary-total-label">Total</span>
              <span class="summary-total-value">{{ formatCurrency(total()) }}</span>
            </div>
          </div>
        </div>

        <div class="builder-sidebar">
          <lib-card>
            <div card-header>
              <h3 class="card-title">Invoice Details</h3>
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
                <label class="field-label">Invoice #</label>
                <span class="auto-value">{{ invoiceNumber() }}</span>
              </div>

              <lib-input-group
                label="Issue Date"
                type="text"
                placeholder="YYYY-MM-DD"
                [value]="issueDate()"
                (input)="onIssueDateInput($event)"
              />

              <lib-input-group
                label="Due Date"
                type="text"
                placeholder="YYYY-MM-DD"
                [value]="dueDate()"
                (input)="onDueDateInput($event)"
              />
            </div>
          </lib-card>

          <lib-card>
            <div card-header>
              <h3 class="card-title">Payment Schedule</h3>
            </div>
            <div class="installments">
              @for (installment of installments(); track $index; let i = $index) {
                <div class="installment-row">
                  <input
                    class="installment-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    [value]="(installment.amountCents / 100).toFixed(2)"
                    (input)="onInstallmentAmountInput(i, $event)"
                  />
                  <input
                    class="installment-input"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    [value]="installment.dueDate"
                    (input)="onInstallmentDateInput(i, $event)"
                  />
                  <button class="remove-btn" (click)="removeInstallment(i)">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
              }
              <lib-button variant="ghost" icon="plus" (clicked)="addInstallment()">Add Installment</lib-button>
            </div>
          </lib-card>

          <lib-card>
            <div card-header>
              <h3 class="card-title">Tax</h3>
            </div>
            <div class="card-fields">
              <lib-input-group
                label="Tax Rate (%)"
                type="number"
                placeholder="0"
                [value]="taxRate().toString()"
                (input)="onTaxRateInput($event)"
              />
              <div class="tax-summary">
                <div class="tax-row">
                  <span class="tax-label">Subtotal</span>
                  <span class="tax-value">{{ formatCurrency(subtotal()) }}</span>
                </div>
                <div class="tax-row">
                  <span class="tax-label">Tax</span>
                  <span class="tax-value">{{ formatCurrency(taxAmount()) }}</span>
                </div>
                <div class="tax-row tax-row--total">
                  <span class="tax-label">Total</span>
                  <span class="tax-value tax-value--total">{{ formatCurrency(total()) }}</span>
                </div>
              </div>
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

    .builder-layout {
      display: flex;
      gap: 24px;
      padding: 24px;
    }

    .builder-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 16px 0;
    }

    .line-items-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .line-items-table {
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      overflow: hidden;
    }

    .table-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #6E6E70;
    }

    .table-row {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #3A3A3C;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .col-desc { flex: 3; }
    .col-qty { flex: 1; text-align: center; }
    .col-price { flex: 1.5; text-align: right; }
    .col-total { flex: 1.5; text-align: right; }
    .col-action { width: 40px; flex-shrink: 0; text-align: center; }

    .table-input {
      font-family: Inter, sans-serif;
      font-size: 14px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 8px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .table-input:focus {
      border-color: #3A3A3C;
    }

    .table-input::placeholder {
      color: #4A4A4C;
    }

    .table-cell {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      padding: 8px;
    }

    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #6E6E70;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .remove-btn:hover {
      color: #C94A4A;
    }

    .summary-row {
      display: flex;
      justify-content: flex-end;
      gap: 32px;
      padding: 24px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .summary-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .summary-value {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #F5F5F0;
    }

    .summary-item--total .summary-total-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .summary-total-label {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .summary-total-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #C9A962;
    }

    .builder-sidebar {
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

    .auto-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 12px 16px;
    }

    .installments {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .installment-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .installment-input {
      font-family: Inter, sans-serif;
      font-size: 14px;
      background: #242426;
      border: 1px solid #3A3A3C;
      border-radius: 20px;
      padding: 10px 12px;
      color: #F5F5F0;
      outline: none;
      flex: 1;
      box-sizing: border-box;
    }

    .installment-input::placeholder {
      color: #4A4A4C;
    }

    .installment-input:focus {
      border-color: #C9A962;
    }

    .tax-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid #3A3A3C;
    }

    .tax-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tax-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .tax-value {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }

    .tax-row--total {
      padding-top: 8px;
      border-top: 1px solid #3A3A3C;
    }

    .tax-value--total {
      font-weight: 600;
      color: #C9A962;
    }
  `,
})
export class InvoiceBuilderPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoicesService = inject(InvoicesService);
  private readonly contactsService = inject(ContactsService);

  readonly title = signal('');
  readonly notes = signal('');
  readonly lineItems = signal<LineItem[]>([
    { description: '', quantity: 1, unitPriceCents: 0 },
  ]);
  readonly selectedContactId = signal('');
  readonly invoiceNumber = signal('INV-' + Date.now().toString().slice(-6));
  readonly issueDate = signal('');
  readonly dueDate = signal('');
  readonly taxRate = signal(0);
  readonly installments = signal<Installment[]>([]);
  readonly contacts = signal<ContactDto[]>([]);
  readonly invoiceId = signal<string | null>(null);

  readonly subtotal = computed(() => {
    return this.lineItems().reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0,
    );
  });

  readonly taxAmount = computed(() => {
    return Math.round(this.subtotal() * (this.taxRate() / 100));
  });

  readonly total = computed(() => {
    return this.subtotal() + this.taxAmount();
  });

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Documents', href: '/documents' },
    { label: 'Invoices', href: '/documents/invoices' },
    { label: this.title() || 'New Invoice' },
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.invoiceId.set(id);
    this.loadContacts();
    if (id && id !== 'new') {
      this.loadInvoice(id);
    }
  }

  private loadInvoice(id: string): void {
    this.invoicesService.get(id).subscribe({
      next: (invoice: InvoiceDto) => {
        this.title.set(invoice.title);
        this.invoiceNumber.set(invoice.invoiceNumber);
        this.selectedContactId.set(invoice.contactId ?? '');
        this.dueDate.set(invoice.dueDate ?? '');
        this.taxRate.set(invoice.taxRatePercent);
        this.lineItems.set(
          invoice.lineItems.map((li) => ({
            description: li.name,
            quantity: li.quantity,
            unitPriceCents: li.unitPriceCents,
          })),
        );
        this.installments.set(
          invoice.paymentSchedules.map((ps) => ({
            amountCents: ps.amountCents,
            dueDate: ps.dueDate,
          })),
        );
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

  onContactChange(event: Event): void {
    this.selectedContactId.set((event.target as HTMLSelectElement).value);
  }

  onIssueDateInput(event: Event): void {
    this.issueDate.set((event.target as HTMLInputElement).value);
  }

  onDueDateInput(event: Event): void {
    this.dueDate.set((event.target as HTMLInputElement).value);
  }

  onTaxRateInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.taxRate.set(val);
  }

  onLineItemDescriptionInput(index: number, event: Event): void {
    const items = [...this.lineItems()];
    items[index] = { ...items[index], description: (event.target as HTMLInputElement).value };
    this.lineItems.set(items);
  }

  onLineItemQuantityInput(index: number, event: Event): void {
    const items = [...this.lineItems()];
    items[index] = { ...items[index], quantity: parseInt((event.target as HTMLInputElement).value, 10) || 1 };
    this.lineItems.set(items);
  }

  onLineItemPriceInput(index: number, event: Event): void {
    const items = [...this.lineItems()];
    const dollars = parseFloat((event.target as HTMLInputElement).value) || 0;
    items[index] = { ...items[index], unitPriceCents: Math.round(dollars * 100) };
    this.lineItems.set(items);
  }

  addLineItem(): void {
    this.lineItems.set([
      ...this.lineItems(),
      { description: '', quantity: 1, unitPriceCents: 0 },
    ]);
  }

  removeLineItem(index: number): void {
    const items = [...this.lineItems()];
    items.splice(index, 1);
    this.lineItems.set(items);
  }

  onInstallmentAmountInput(index: number, event: Event): void {
    const items = [...this.installments()];
    const dollars = parseFloat((event.target as HTMLInputElement).value) || 0;
    items[index] = { ...items[index], amountCents: Math.round(dollars * 100) };
    this.installments.set(items);
  }

  onInstallmentDateInput(index: number, event: Event): void {
    const items = [...this.installments()];
    items[index] = { ...items[index], dueDate: (event.target as HTMLInputElement).value };
    this.installments.set(items);
  }

  addInstallment(): void {
    this.installments.set([
      ...this.installments(),
      { amountCents: 0, dueDate: '' },
    ]);
  }

  removeInstallment(index: number): void {
    const items = [...this.installments()];
    items.splice(index, 1);
    this.installments.set(items);
  }

  formatCurrency(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
  }

  onSave(): void {
    this.invoicesService.create({
      title: this.title(),
      contactId: this.selectedContactId() || undefined,
      dueDate: this.dueDate() || undefined,
      taxRatePercent: this.taxRate(),
      discountCents: 0,
      tipsEnabled: false,
      autoRemindersEnabled: false,
      isTemplate: false,
      lineItems: this.lineItems().map((item, i) => ({
        name: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        sortOrder: i,
      })),
      paymentSchedules: this.installments().map((inst, i) => ({
        label: `Installment ${i + 1}`,
        amountCents: inst.amountCents,
        dueDate: inst.dueDate,
        sortOrder: i,
      })),
    }).subscribe({
      next: () => {
        this.router.navigate(['/documents/invoices']);
      },
    });
  }

  onSend(): void {
    this.onSave();
  }

  onBreadcrumbNavigate(href: string): void {
    this.router.navigate([href]);
  }
}
