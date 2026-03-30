import { Component, signal, input, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDto, ProductVariationDto, ProductType } from 'api';
import {
  ButtonComponent,
  BreadcrumbComponent,
  BreadcrumbItem,
  CardComponent,
  InputGroupComponent,
  TextareaGroupComponent,
} from 'components';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-product-editor-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    BreadcrumbComponent,
    CardComponent,
    InputGroupComponent,
    TextareaGroupComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page">
      <div class="top-bar">
        <lib-breadcrumb
          [items]="breadcrumbs()"
          (navigate)="onBreadcrumbNavigate($event)"
        />
        <lib-button variant="primary" icon="save" (clicked)="onSave()">
          Save Product
        </lib-button>
      </div>

      <div class="editor-layout">
        <div class="left-column">
          <lib-card>
            <div class="form-fields">
              <lib-input-group
                label="Product Name"
                placeholder="Enter product name"
                [(ngModel)]="productName"
                name="productName"
              />

              <div class="select-group">
                <span class="select-label">Product Type</span>
                <select
                  class="select-input"
                  [(ngModel)]="productType"
                  name="productType"
                >
                  @for (opt of productTypeOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>

              <lib-textarea-group
                label="Description"
                placeholder="Describe the product..."
                [(ngModel)]="productDescription"
                name="productDescription"
                [rows]="5"
              />
            </div>
          </lib-card>
        </div>

        <div class="right-column">
          <lib-card>
            <div class="image-upload-area">
              @if (previewImageUrl()) {
                <img
                  class="image-preview"
                  [src]="previewImageUrl()"
                  alt="Product preview"
                />
              } @else {
                <div class="upload-placeholder">
                  <lucide-icon name="upload" [size]="32" color="#6E6E70"></lucide-icon>
                  <span class="upload-text">Upload product image</span>
                </div>
              }
            </div>
          </lib-card>

          <lib-card>
            <div card-header class="variations-header">Pricing Variations</div>
            <div class="variations-table">
              <div class="var-header-row">
                <span class="var-col var-col--size">Size</span>
                <span class="var-col var-col--cost">Cost</span>
                <span class="var-col var-col--markup">Markup</span>
                <span class="var-col var-col--price">Price</span>
              </div>
              @for (v of variations(); track v.id) {
                <div class="var-data-row">
                  <span class="var-col var-col--size">{{ v.name }}</span>
                  <span class="var-col var-col--cost">{{ formatCents(v.costCents) }}</span>
                  <span class="var-col var-col--markup">{{ formatCents(v.markupCents) }}</span>
                  <span class="var-col var-col--price var-price">{{ formatCents(v.priceCents) }}</span>
                </div>
              }
              @if (variations().length === 0) {
                <div class="var-empty">No pricing variations configured.</div>
              }
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
      padding: 24px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .editor-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .left-column {
      flex: 1;
      min-width: 0;
    }

    .right-column {
      width: 460px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .select-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .select-label {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
    }

    .select-input {
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

    .select-input:focus {
      border-color: #C9A962;
    }

    .select-input option {
      background: #242426;
      color: #F5F5F0;
    }

    .image-upload-area {
      height: 300px;
      border-radius: 12px;
      overflow: hidden;
    }

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-placeholder {
      width: 100%;
      height: 100%;
      background: #242426;
      border: 2px dashed #3A3A3C;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .upload-placeholder:hover {
      border-color: #C9A962;
    }

    .upload-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .variations-header {
      font-family: Inter, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .variations-table {
      display: flex;
      flex-direction: column;
    }

    .var-header-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #3A3A3C;
    }

    .var-header-row .var-col {
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .var-data-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid rgba(58, 58, 60, 0.5);
    }

    .var-data-row:last-child {
      border-bottom: none;
    }

    .var-col {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
    }

    .var-col--size { flex: 2; }
    .var-col--cost { flex: 1; }
    .var-col--markup { flex: 1; }
    .var-col--price { flex: 1; text-align: right; }

    .var-price {
      color: #C9A962;
      font-weight: 600;
    }

    .var-empty {
      padding: 24px 0;
      text-align: center;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }
  `,
})
export class ProductEditorPageComponent {
  readonly product = input<ProductDto | null>(null);

  productName = '';
  productType = ProductType.Print;
  productDescription = '';

  readonly productTypeOptions = [
    { label: 'Prints', value: ProductType.Print },
    { label: 'Canvas', value: ProductType.CanvasPrint },
    { label: 'Metal', value: ProductType.MetalPrint },
    { label: 'Albums', value: ProductType.Album },
    { label: 'Digital', value: ProductType.DigitalDownload },
  ];

  readonly previewImageUrl = computed(() => this.product()?.previewImageUrl ?? null);

  readonly variations = computed(() =>
    this.product()?.variations ?? [],
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Store', href: '/store' },
    { label: 'Products', href: '/store/products' },
    { label: this.product()?.name ?? 'New Product' },
  ]);

  onBreadcrumbNavigate(href: string): void {
    // Navigation handled by parent/router
  }

  onSave(): void {
    // Save logic to be implemented by parent
  }

  formatCents(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
