import { Component, inject, signal, output, OnInit } from '@angular/core';
import { PlansService, PlanDto } from 'api';
import { CardComponent, ButtonComponent, BadgeComponent, SpinnerComponent } from 'components';

@Component({
  selector: 'lib-plan-selection',
  standalone: true,
  imports: [CardComponent, ButtonComponent, BadgeComponent, SpinnerComponent],
  template: `
    <div class="plan-selection">
      <div class="plan-selection__progress">
        <span class="plan-selection__step plan-selection__step--active">1. Choose Plan</span>
        <span class="plan-selection__arrow">&rarr;</span>
        <span class="plan-selection__step">2. Business Info</span>
        <span class="plan-selection__arrow">&rarr;</span>
        <span class="plan-selection__step">3. Get Started</span>
      </div>

      @if (loading()) {
        <div class="plan-selection__loading">
          <lib-spinner [size]="32" />
        </div>
      } @else if (error()) {
        <div class="plan-selection__error">
          <p class="plan-selection__error-text">Failed to load plans. Please try again.</p>
        </div>
      } @else {
        <div class="plan-selection__grid">
          @for (plan of plans(); track plan.id) {
            <lib-card>
              <div
                class="plan-card"
                [class.plan-card--featured]="isFeatured(plan)"
              >
                @if (isFeatured(plan)) {
                  <div class="plan-card__badge">
                    <lib-badge variant="warning">Most Popular</lib-badge>
                  </div>
                }
                <h3 class="plan-card__tier">{{ plan.tier }}</h3>
                <p class="plan-card__price">
                  <span class="plan-card__amount">\${{ formatPrice(plan.monthlyPriceCents) }}</span>
                  <span class="plan-card__period">/mo</span>
                </p>
                @if (plan.description) {
                  <p class="plan-card__description">{{ plan.description }}</p>
                }
                <ul class="plan-card__features">
                  @for (gate of plan.featureGates; track gate.id) {
                    <li class="plan-card__feature">
                      <span class="plan-card__check">&#10003;</span>
                      {{ gate.description ?? gate.featureKey }}
                    </li>
                  }
                </ul>
                <lib-button
                  [variant]="isFeatured(plan) ? 'primary' : 'outline'"
                  (clicked)="onSelectPlan(plan)"
                >
                  Select
                </lib-button>
              </div>
            </lib-card>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .plan-selection {
      min-height: 100vh;
      background: #1A1A1C;
      padding: 48px 24px;
    }

    .plan-selection__progress {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 48px;
    }

    .plan-selection__step {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .plan-selection__step--active {
      color: #C9A962;
      font-weight: 600;
    }

    .plan-selection__arrow {
      color: #3A3A3C;
      font-size: 14px;
    }

    .plan-selection__loading {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .plan-selection__error {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .plan-selection__error-text {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #C94A4A;
    }

    .plan-selection__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 960px;
      margin: 0 auto;
    }

    .plan-card {
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .plan-card--featured {
      border: 2px solid #C9A962;
      border-radius: 16px;
      margin: -2px;
      padding: 10px;
    }

    .plan-card__badge {
      margin-bottom: 16px;
    }

    .plan-card__tier {
      font-family: Inter, sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #F5F5F0;
      margin: 0 0 12px;
      text-transform: capitalize;
    }

    .plan-card__price {
      margin: 0 0 16px;
    }

    .plan-card__amount {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #F5F5F0;
    }

    .plan-card__period {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
    }

    .plan-card__description {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #6E6E70;
      margin: 0 0 16px;
      line-height: 1.5;
    }

    .plan-card__features {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
      width: 100%;
      text-align: left;
    }

    .plan-card__feature {
      font-family: Inter, sans-serif;
      font-size: 14px;
      color: #F5F5F0;
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .plan-card__check {
      color: #6E9E6E;
      font-size: 14px;
      flex-shrink: 0;
    }

    .plan-card lib-button {
      width: 100%;
    }

    .plan-card lib-button ::ng-deep .btn {
      width: 100%;
      justify-content: center;
    }
  `,
})
export class PlanSelectionComponent implements OnInit {
  private readonly plansService = inject(PlansService);

  readonly plans = signal<PlanDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly planSelected = output<PlanDto>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.plansService.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  isFeatured(plan: PlanDto): boolean {
    return plan.tier.toLowerCase() === 'pro';
  }

  formatPrice(cents: number): string {
    return Math.floor(cents / 100).toString();
  }

  onSelectPlan(plan: PlanDto): void {
    this.planSelected.emit(plan);
  }
}
