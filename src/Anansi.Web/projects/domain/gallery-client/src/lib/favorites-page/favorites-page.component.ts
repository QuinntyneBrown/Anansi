import { Component, inject, signal, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FavoritesService,
  FavoriteListDto,
  FavoriteItemDto,
  CreateFavoriteListCommand,
  PagedList,
  TranslationService,
} from 'api';
import {
  CardComponent,
  ButtonComponent,
  BadgeComponent,
  SpinnerComponent,
  InputGroupComponent,
  EmptyStateComponent,
} from 'components';

@Component({
  selector: 'lib-favorites-page',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    InputGroupComponent,
    EmptyStateComponent,
  ],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <lib-spinner [size]="32" />
      </div>
    } @else {
      <div class="favorites-page">
        <div class="page-header">
          <h1 class="page-title">{{ i18n.t().favorites.title }}</h1>
          <lib-button variant="outline" (clicked)="toggleCreateForm()">
            {{ showCreateForm() ? i18n.t().favorites.cancel : i18n.t().favorites.newList }}
          </lib-button>
        </div>

        @if (showCreateForm()) {
          <lib-card>
            <form class="create-form" (ngSubmit)="onCreateList()">
              <lib-input-group
                [label]="i18n.t().favorites.listName"
                type="text"
                [placeholder]="i18n.t().favorites.listNamePlaceholder"
                [(ngModel)]="newListName"
                name="newListName"
              />
              <lib-button type="submit" variant="primary" [disabled]="creating() || !newListName.trim()">
                @if (creating()) {
                  <lib-spinner [size]="16" />
                }
                {{ i18n.t().favorites.create }}
              </lib-button>
            </form>
          </lib-card>
        }

        @if (favoriteLists().length === 0 && !showCreateForm()) {
          <lib-empty-state [heading]="i18n.t().favorites.noLists" [description]="i18n.t().favorites.noListsDescription" />
        } @else {
          <div class="lists-container">
            @for (list of favoriteLists(); track list.id) {
              <lib-card>
                <div
                  class="list-row"
                  (click)="onSelectList(list)"
                  (keydown.enter)="onSelectList(list)"
                  tabindex="0"
                >
                  <div class="list-info">
                    <span class="list-name">{{ list.name }}</span>
                    @if (list.clientName) {
                      <span class="list-client">{{ list.clientName }}</span>
                    }
                  </div>
                  <div class="list-meta">
                    <span class="list-count">{{ list.itemCount }} {{ i18n.t().favorites.items }}</span>
                    @if (list.isCompleted) {
                      <lib-badge variant="success">{{ i18n.t().favorites.completed }}</lib-badge>
                    }
                  </div>
                </div>
              </lib-card>
            }
          </div>
        }

        @if (selectedList(); as selected) {
          <div class="items-section">
            <div class="items-header">
              <h2 class="items-title">{{ selected.name }}</h2>
              <lib-button variant="ghost" (clicked)="clearSelectedList()">{{ i18n.t().favorites.close }}</lib-button>
            </div>
            @if (loadingItems()) {
              <div class="loading-container">
                <lib-spinner [size]="24" />
              </div>
            } @else if (selectedItems().length === 0) {
              <lib-empty-state [heading]="i18n.t().favorites.noItems" [description]="i18n.t().favorites.emptyList" />
            } @else {
              <div class="items-grid">
                @for (item of selectedItems(); track item.id) {
                  <lib-card>
                    <div class="item-card">
                      <span class="item-filename">{{ item.mediaFileName || i18n.t().favorites.unknown }}</span>
                      @if (item.comment) {
                        <span class="item-comment">{{ item.comment }}</span>
                      }
                    </div>
                  </lib-card>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px 0;
      background: #1A1A1C;
      min-height: 100vh;
    }

    .favorites-page {
      background: #1A1A1C;
      min-height: 100vh;
      padding: 32px 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .create-form {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .create-form lib-input-group {
      flex: 1;
    }

    lib-card {
      display: block;
      margin-bottom: 12px;
    }

    .lists-container {
      margin-top: 16px;
    }

    .list-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 4px 0;
      transition: opacity 0.15s ease;
    }

    .list-row:hover {
      opacity: 0.85;
    }

    .list-row:focus {
      outline: none;
      opacity: 0.85;
    }

    .list-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .list-name {
      font-family: Inter, sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .list-client {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .list-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .list-count {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
    }

    .items-section {
      margin-top: 32px;
      border-top: 1px solid #3A3A3C;
      padding-top: 24px;
    }

    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .items-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .item-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-filename {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      word-break: break-all;
    }

    .item-comment {
      font-family: Inter, sans-serif;
      font-size: 13px;
      color: #6E6E70;
      font-style: italic;
    }
  `,
})
export class FavoritesPageComponent implements OnInit {
  private readonly favoritesService = inject(FavoritesService);
  readonly i18n = inject(TranslationService);

  readonly collectionId = input.required<string>();
  readonly favoriteLists = signal<FavoriteListDto[]>([]);
  readonly loading = signal(true);
  readonly showCreateForm = signal(false);
  readonly creating = signal(false);
  readonly selectedList = signal<FavoriteListDto | null>(null);
  readonly selectedItems = signal<FavoriteItemDto[]>([]);
  readonly loadingItems = signal(false);

  newListName = '';

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.loading.set(true);
    this.favoritesService.list({ collectionId: this.collectionId() }).subscribe({
      next: (result: PagedList<FavoriteListDto>) => {
        this.favoriteLists.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    if (!this.showCreateForm()) {
      this.newListName = '';
    }
  }

  onCreateList(): void {
    if (this.creating() || !this.newListName.trim()) return;

    this.creating.set(true);
    const command: CreateFavoriteListCommand = {
      collectionId: this.collectionId(),
      name: this.newListName.trim(),
      isPreset: false,
    };

    this.favoritesService.create(command).subscribe({
      next: (created: FavoriteListDto) => {
        this.favoriteLists.set([...this.favoriteLists(), created]);
        this.creating.set(false);
        this.newListName = '';
        this.showCreateForm.set(false);
      },
      error: () => this.creating.set(false),
    });
  }

  onSelectList(list: FavoriteListDto): void {
    this.selectedList.set(list);
    this.loadItems(list.id);
  }

  clearSelectedList(): void {
    this.selectedList.set(null);
    this.selectedItems.set([]);
  }

  private loadItems(listId: string): void {
    this.loadingItems.set(true);
    this.favoritesService.getItems(listId).subscribe({
      next: (items: FavoriteItemDto[]) => {
        this.selectedItems.set(items);
        this.loadingItems.set(false);
      },
      error: () => this.loadingItems.set(false),
    });
  }
}
