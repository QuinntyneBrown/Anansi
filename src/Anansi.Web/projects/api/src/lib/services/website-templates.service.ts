import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  LandingPageTemplateDto,
  WebsiteTemplateDto,
} from '../models/website.models';
import { TemplateCategory } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class WebsiteTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(category?: TemplateCategory): Observable<WebsiteTemplateDto[]> {
    let httpParams = new HttpParams();
    if (category != null) {
      httpParams = httpParams.set('category', category);
    }
    return this.http.get<WebsiteTemplateDto[]>(
      `${this.config.baseUrl}/api/websitetemplates`,
      { params: httpParams },
    );
  }

  getPreview(id: string): Observable<WebsiteTemplateDto> {
    return this.http.get<WebsiteTemplateDto>(
      `${this.config.baseUrl}/api/websitetemplates/${id}/preview`,
    );
  }

  listLandingPages(): Observable<LandingPageTemplateDto[]> {
    return this.http.get<LandingPageTemplateDto[]>(
      `${this.config.baseUrl}/api/websitetemplates/landing-pages`,
    );
  }
}
