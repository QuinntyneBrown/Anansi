import { Component, signal, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent, TabBarComponent, TabItem } from 'components';
import { FormsModule } from '@angular/forms';

type Viewport = 'desktop' | 'tablet' | 'mobile';
type PropertiesTab = 'Style' | 'Layout' | 'Content';

interface PageItem {
  name: string;
  icon: string;
}

interface ElementItem {
  name: string;
  icon: string;
}

@Component({
  selector: 'lib-flex-editor-page',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, TabBarComponent, FormsModule],
  template: `
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__left">
        <button class="icon-btn" title="Undo" (click)="undo()">
          <lucide-icon name="undo-2" [size]="18"></lucide-icon>
        </button>
        <button class="icon-btn" title="Redo" (click)="redo()">
          <lucide-icon name="redo-2" [size]="18"></lucide-icon>
        </button>

        <span class="toolbar__divider"></span>

        <button
          class="icon-btn"
          [class.icon-btn--active]="viewport() === 'desktop'"
          title="Desktop"
          (click)="viewport.set('desktop')"
        >
          <lucide-icon name="monitor" [size]="18"></lucide-icon>
        </button>
        <button
          class="icon-btn"
          [class.icon-btn--active]="viewport() === 'tablet'"
          title="Tablet"
          (click)="viewport.set('tablet')"
        >
          <lucide-icon name="tablet" [size]="18"></lucide-icon>
        </button>
        <button
          class="icon-btn"
          [class.icon-btn--active]="viewport() === 'mobile'"
          title="Mobile"
          (click)="viewport.set('mobile')"
        >
          <lucide-icon name="smartphone" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="toolbar__right">
        <lib-button variant="outline" icon="chevron-down" (clicked)="onDraft()">Draft</lib-button>
        <lib-button variant="primary" icon="globe" (clicked)="onPublish()">Publish</lib-button>
      </div>
    </div>

    <!-- Body -->
    <div class="editor-body">
      <!-- Left Panel -->
      <aside class="panel panel--left">
        <!-- Pages Section -->
        <div class="panel-section">
          <h3 class="panel-section__header">Pages</h3>
          <ul class="page-list">
            @for (page of pages; track page.name) {
              <li
                class="page-list__item"
                [class.page-list__item--active]="activePage() === page.name"
                (click)="activePage.set(page.name)"
              >
                <lucide-icon [name]="page.icon" [size]="16"></lucide-icon>
                <span>{{ page.name }}</span>
              </li>
            }
          </ul>
          <button class="add-page-btn" (click)="onAddPage()">
            <lucide-icon name="plus" [size]="14"></lucide-icon>
            Add Page
          </button>
        </div>

        <hr class="panel-divider" />

        <!-- Elements Section -->
        <div class="panel-section">
          <h3 class="panel-section__header">Elements</h3>
          <div class="element-grid">
            @for (element of elements; track element.name) {
              <button class="element-cell" (click)="onElementDrag(element)">
                <lucide-icon [name]="element.icon" [size]="24"></lucide-icon>
                <span class="element-cell__label">{{ element.name }}</span>
              </button>
            }
          </div>
        </div>
      </aside>

      <!-- Center Canvas -->
      <main class="canvas-area">
        <div class="canvas-wrapper" [style.max-width]="canvasWidth()">
          <!-- Placeholder website preview -->
          <div class="preview-header">
            <div class="preview-logo">Studio</div>
            <nav class="preview-nav">
              <span>Home</span>
              <span>Portfolio</span>
              <span>About</span>
              <span>Contact</span>
            </nav>
          </div>

          <div class="preview-hero">
            <h1 class="preview-hero__title">Welcome to My Studio</h1>
            <p class="preview-hero__subtitle">Capturing moments that last forever</p>
            <div class="preview-hero__cta">View Portfolio</div>
          </div>

          <div class="preview-content">
            <div class="preview-block">
              <div class="preview-block__image"></div>
              <div class="preview-block__text">
                <div class="preview-block__line preview-block__line--wide"></div>
                <div class="preview-block__line preview-block__line--medium"></div>
                <div class="preview-block__line preview-block__line--narrow"></div>
              </div>
            </div>
            <div class="preview-block">
              <div class="preview-block__text">
                <div class="preview-block__line preview-block__line--wide"></div>
                <div class="preview-block__line preview-block__line--medium"></div>
                <div class="preview-block__line preview-block__line--narrow"></div>
              </div>
              <div class="preview-block__image"></div>
            </div>
          </div>

          <div class="preview-gallery">
            <div class="preview-gallery__item"></div>
            <div class="preview-gallery__item"></div>
            <div class="preview-gallery__item"></div>
          </div>
        </div>
      </main>

      <!-- Right Panel -->
      <aside class="panel panel--right">
        <h3 class="panel__title">Properties</h3>

        <lib-tab-bar
          [tabs]="propertyTabs"
          [activeTab]="activeTab()"
          (tabChange)="activeTab.set($event)"
        />

        @if (activeElement() === null) {
          <div class="panel-empty">
            <lucide-icon name="mouse-pointer-2" [size]="32" class="panel-empty__icon"></lucide-icon>
            <p class="panel-empty__text">Select an element on the canvas to edit its properties</p>
          </div>
        } @else {
          <div class="properties-content">
            @if (activeTab() === 'Style') {
              <!-- Fill Color -->
              <div class="prop-group">
                <label class="prop-label">Fill Color</label>
                <div class="color-input">
                  <span
                    class="color-swatch"
                    [style.background]="fillColor()"
                  ></span>
                  <input
                    class="prop-text-input"
                    type="text"
                    [ngModel]="fillColor()"
                    (ngModelChange)="fillColor.set($event)"
                  />
                </div>
              </div>

              <!-- Border -->
              <div class="prop-group">
                <label class="prop-label">Border</label>
                <select class="prop-select" [ngModel]="borderStyle()" (ngModelChange)="borderStyle.set($event)">
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <!-- Border Radius -->
              <div class="prop-group">
                <label class="prop-label">Radius</label>
                <div class="number-input">
                  <input
                    class="prop-text-input prop-text-input--number"
                    type="number"
                    [ngModel]="borderRadius()"
                    (ngModelChange)="borderRadius.set($event)"
                    min="0"
                  />
                  <span class="number-suffix">px</span>
                </div>
              </div>

              <!-- Opacity -->
              <div class="prop-group">
                <label class="prop-label">Opacity</label>
                <div class="slider-group">
                  <input
                    class="prop-range"
                    type="range"
                    min="0"
                    max="100"
                    [ngModel]="opacity()"
                    (ngModelChange)="opacity.set($event)"
                  />
                  <span class="slider-value">{{ opacity() }}%</span>
                </div>
              </div>
            }

            @if (activeTab() === 'Layout') {
              <div class="prop-group">
                <label class="prop-label">Width</label>
                <div class="number-input">
                  <input class="prop-text-input prop-text-input--number" type="number" value="100" min="0" />
                  <span class="number-suffix">%</span>
                </div>
              </div>
              <div class="prop-group">
                <label class="prop-label">Height</label>
                <div class="number-input">
                  <input class="prop-text-input prop-text-input--number" type="number" value="auto" />
                  <span class="number-suffix">px</span>
                </div>
              </div>
              <div class="prop-group">
                <label class="prop-label">Padding</label>
                <div class="number-input">
                  <input class="prop-text-input prop-text-input--number" type="number" value="16" min="0" />
                  <span class="number-suffix">px</span>
                </div>
              </div>
              <div class="prop-group">
                <label class="prop-label">Margin</label>
                <div class="number-input">
                  <input class="prop-text-input prop-text-input--number" type="number" value="0" min="0" />
                  <span class="number-suffix">px</span>
                </div>
              </div>
            }

            @if (activeTab() === 'Content') {
              <div class="prop-group">
                <label class="prop-label">Text</label>
                <textarea class="prop-textarea" rows="4" placeholder="Enter text content..."></textarea>
              </div>
              <div class="prop-group">
                <label class="prop-label">Link URL</label>
                <input class="prop-text-input" type="text" placeholder="https://" />
              </div>
              <div class="prop-group">
                <label class="prop-label">Alt Text</label>
                <input class="prop-text-input" type="text" placeholder="Image description" />
              </div>
            }
          </div>
        }
      </aside>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #1A1A1C;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 52px;
      min-height: 52px;
      padding: 0 16px;
      background: #242426;
      border-bottom: 1px solid #3A3A3C;
    }

    .toolbar__left,
    .toolbar__right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar__right {
      gap: 8px;
    }

    .toolbar__divider {
      display: inline-block;
      width: 1px;
      height: 24px;
      background: #3A3A3C;
      margin: 0 8px;
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #F5F5F0;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .icon-btn--active {
      color: #C9A962;
    }

    /* ── Body layout ── */
    .editor-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Panels ── */
    .panel {
      background: #242426;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .panel--left {
      width: 280px;
      border-right: 1px solid #3A3A3C;
    }

    .panel--right {
      width: 300px;
      border-left: 1px solid #3A3A3C;
    }

    .panel__title {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F5F5F0;
      padding: 16px;
      margin: 0;
    }

    .panel-section__header {
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6E6E70;
      padding: 16px;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .panel-divider {
      border: none;
      border-top: 1px solid #3A3A3C;
      margin: 0;
    }

    /* ── Page list ── */
    .page-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .page-list__item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .page-list__item:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .page-list__item--active {
      color: #C9A962;
    }

    .add-page-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #C9A962;
      background: none;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: background 0.15s ease;
    }

    .add-page-btn:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    /* ── Element grid ── */
    .element-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0 8px 16px;
      gap: 4px;
    }

    .element-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      aspect-ratio: 1;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #F5F5F0;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .element-cell:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .element-cell__label {
      font-family: Inter, sans-serif;
      font-size: 11px;
      color: #B8B8BC;
    }

    /* ── Canvas ── */
    .canvas-area {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 24px;
      overflow: auto;
      background:
        linear-gradient(rgba(58, 58, 60, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(58, 58, 60, 0.15) 1px, transparent 1px);
      background-size: 20px 20px;
      background-color: #1A1A1C;
    }

    .canvas-wrapper {
      width: 100%;
      min-height: 600px;
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      transition: max-width 0.3s ease;
      align-self: flex-start;
    }

    /* ── Preview content inside canvas ── */
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      border-bottom: 1px solid #E8E8E8;
    }

    .preview-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      color: #1A1A1C;
    }

    .preview-nav {
      display: flex;
      gap: 24px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .preview-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 32px;
      background: linear-gradient(135deg, #F5F5F0 0%, #E8E4DC 100%);
      text-align: center;
    }

    .preview-hero__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #1A1A1C;
      margin: 0 0 12px;
    }

    .preview-hero__subtitle {
      font-family: Inter, sans-serif;
      font-size: 16px;
      color: #6E6E70;
      margin: 0 0 24px;
    }

    .preview-hero__cta {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 20px;
      background: #1A1A1C;
      color: #F5F5F0;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
    }

    .preview-content {
      padding: 48px 32px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .preview-block {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .preview-block__image {
      width: 200px;
      height: 140px;
      border-radius: 8px;
      background: #E8E4DC;
      flex-shrink: 0;
    }

    .preview-block__text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .preview-block__line {
      height: 10px;
      border-radius: 5px;
      background: #E0E0E0;
    }

    .preview-block__line--wide {
      width: 100%;
    }

    .preview-block__line--medium {
      width: 75%;
    }

    .preview-block__line--narrow {
      width: 50%;
    }

    .preview-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 0 32px 48px;
    }

    .preview-gallery__item {
      aspect-ratio: 4 / 3;
      border-radius: 8px;
      background: #E8E4DC;
    }

    /* ── Properties panel ── */
    .panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      text-align: center;
    }

    .panel-empty__icon {
      color: #3A3A3C;
    }

    .panel-empty__text {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      margin: 0;
      line-height: 1.5;
    }

    .properties-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .prop-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .prop-label {
      font-family: Inter, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #6E6E70;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .color-input {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #3A3A3C;
      flex-shrink: 0;
    }

    .prop-text-input {
      font-family: Inter, sans-serif;
      font-size: 13px;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px 12px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .prop-text-input:focus {
      border-color: #C9A962;
    }

    .prop-text-input--number {
      width: auto;
      flex: 1;
    }

    .number-input {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .number-suffix {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #6E6E70;
      flex-shrink: 0;
    }

    .prop-select {
      font-family: Inter, sans-serif;
      font-size: 13px;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px 12px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .prop-select:focus {
      border-color: #C9A962;
    }

    .slider-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .prop-range {
      flex: 1;
      accent-color: #C9A962;
      height: 4px;
    }

    .slider-value {
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #F5F5F0;
      min-width: 36px;
      text-align: right;
    }

    .prop-textarea {
      font-family: Inter, sans-serif;
      font-size: 13px;
      background: #1A1A1C;
      border: 1px solid #3A3A3C;
      border-radius: 8px;
      padding: 8px 12px;
      color: #F5F5F0;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
    }

    .prop-textarea:focus {
      border-color: #C9A962;
    }
  `,
})
export class FlexEditorPageComponent {
  /** Responsive viewport toggle */
  readonly viewport = signal<Viewport>('desktop');

  /** Currently selected page in the left panel */
  readonly activePage = signal<string>('Home');

  /** Currently selected element on the canvas (null = nothing selected) */
  readonly activeElement = signal<string | null>(null);

  /** Properties panel tab */
  readonly activeTab = signal<string>('Style');

  /** Style property signals */
  readonly fillColor = signal('#FFFFFF');
  readonly borderStyle = signal('none');
  readonly borderRadius = signal(0);
  readonly opacity = signal(100);

  /** Canvas width computed from viewport mode */
  readonly canvasWidth = computed(() => {
    switch (this.viewport()) {
      case 'tablet':
        return '768px';
      case 'mobile':
        return '402px';
      default:
        return '1200px';
    }
  });

  /** Page list entries */
  readonly pages: PageItem[] = [
    { name: 'Home', icon: 'home' },
    { name: 'About', icon: 'user' },
    { name: 'Portfolio', icon: 'image' },
    { name: 'Contact', icon: 'mail' },
    { name: 'Blog', icon: 'file-text' },
  ];

  /** Element palette entries */
  readonly elements: ElementItem[] = [
    { name: 'Text', icon: 'type' },
    { name: 'Image', icon: 'image' },
    { name: 'Button', icon: 'square' },
    { name: 'Video', icon: 'play' },
    { name: 'Shape', icon: 'pentagon' },
    { name: 'Slider', icon: 'gallery-horizontal' },
    { name: 'Grid', icon: 'layout-grid' },
    { name: 'Columns', icon: 'columns-2' },
  ];

  /** Properties panel tabs */
  readonly propertyTabs: TabItem[] = [
    { label: 'Style', value: 'Style' },
    { label: 'Layout', value: 'Layout' },
    { label: 'Content', value: 'Content' },
  ];

  undo(): void {
    // Placeholder for undo functionality
  }

  redo(): void {
    // Placeholder for redo functionality
  }

  onDraft(): void {
    // Placeholder for draft save
  }

  onPublish(): void {
    // Placeholder for publish action
  }

  onAddPage(): void {
    // Placeholder for add page action
  }

  onElementDrag(element: ElementItem): void {
    // Select the element so properties panel becomes active
    this.activeElement.set(element.name);
  }
}
