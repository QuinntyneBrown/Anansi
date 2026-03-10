import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'lib-avatar',
  template: `
    <div
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
    >
      @if (src()) {
        <img [src]="src()" [alt]="alt()" class="avatar__img" />
      } @else if (initials()) {
        <span class="avatar__initials" [style.font-size.px]="initialsFontSize()">{{ initials() }}</span>
      } @else {
        <svg
          class="avatar__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6E6E70"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      }
    </div>
  `,
  styles: `
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #3A3A3C;
      overflow: hidden;
    }
    .avatar__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar__initials {
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #6E6E70;
      line-height: 1;
    }
    .avatar__icon {
      display: block;
    }
  `,
})
export class AvatarComponent {
  src = input<string | null>(null);
  initials = input<string | null>(null);
  alt = input<string>('');
  size = input<number>(40);

  initialsFontSize = computed(() => Math.round(this.size() * 0.35));
}
