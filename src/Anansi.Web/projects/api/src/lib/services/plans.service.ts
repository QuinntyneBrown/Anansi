import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  ChangeSubscriptionRequest,
  CreatePlanRequest,
  CreateSubscriptionRequest,
  FeatureCheckResult,
  PlanDto,
  PlanListParams,
  SubscriptionDto,
  UpdatePlanRequest,
} from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(params?: PlanListParams): Observable<PlanDto[]> {
    let httpParams = new HttpParams();
    if (params?.product != null) {
      httpParams = httpParams.set('product', params.product);
    }
    return this.http.get<PlanDto[]>(
      `${this.config.baseUrl}/api/plans`,
      { params: httpParams },
    );
  }

  create(request: CreatePlanRequest): Observable<PlanDto> {
    return this.http.post<PlanDto>(
      `${this.config.baseUrl}/api/plans`,
      request,
    );
  }

  update(id: string, request: UpdatePlanRequest): Observable<PlanDto> {
    return this.http.put<PlanDto>(
      `${this.config.baseUrl}/api/plans/${id}`,
      request,
    );
  }

  getSubscription(): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(
      `${this.config.baseUrl}/api/plans/subscription`,
    );
  }

  createSubscription(request: CreateSubscriptionRequest): Observable<SubscriptionDto> {
    return this.http.post<SubscriptionDto>(
      `${this.config.baseUrl}/api/plans/subscription`,
      request,
    );
  }

  changeSubscription(request: ChangeSubscriptionRequest): Observable<SubscriptionDto> {
    return this.http.put<SubscriptionDto>(
      `${this.config.baseUrl}/api/plans/subscription`,
      request,
    );
  }

  cancelSubscription(immediate?: boolean): Observable<void> {
    let httpParams = new HttpParams();
    if (immediate != null) {
      httpParams = httpParams.set('immediate', immediate);
    }
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/plans/subscription`,
      { params: httpParams },
    );
  }

  checkFeature(featureKey: string): Observable<FeatureCheckResult> {
    return this.http.get<FeatureCheckResult>(
      `${this.config.baseUrl}/api/plans/features/${featureKey}`,
    );
  }
}
