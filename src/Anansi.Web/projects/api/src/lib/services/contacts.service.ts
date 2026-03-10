import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  ContactDto,
  ContactListParams,
  CreateContactCommand,
  CreateLeadCaptureFormCommand,
  ImportContactsCommand,
  ImportResult,
  LeadCaptureFormDto,
  SubmitLeadCaptureFormCommand,
  UpdateContactCommand,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  create(command: CreateContactCommand): Observable<ContactDto> {
    return this.http.post<ContactDto>(
      `${this.config.baseUrl}/api/contacts`,
      command,
    );
  }

  get(id: string): Observable<ContactDto> {
    return this.http.get<ContactDto>(
      `${this.config.baseUrl}/api/contacts/${id}`,
    );
  }

  list(params?: ContactListParams): Observable<PagedList<ContactDto>> {
    let httpParams = new HttpParams();
    if (params?.type != null) httpParams = httpParams.set('type', params.type);
    if (params?.search != null) httpParams = httpParams.set('search', params.search);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<ContactDto>>(
      `${this.config.baseUrl}/api/contacts`,
      { params: httpParams },
    );
  }

  update(id: string, command: UpdateContactCommand): Observable<ContactDto> {
    return this.http.put<ContactDto>(
      `${this.config.baseUrl}/api/contacts/${id}`,
      command,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/contacts/${id}`,
    );
  }

  import(command: ImportContactsCommand): Observable<ImportResult> {
    return this.http.post<ImportResult>(
      `${this.config.baseUrl}/api/contacts/import`,
      command,
    );
  }

  createLeadForm(command: CreateLeadCaptureFormCommand): Observable<LeadCaptureFormDto> {
    return this.http.post<LeadCaptureFormDto>(
      `${this.config.baseUrl}/api/contacts/lead-capture-forms`,
      command,
    );
  }

  submitLeadForm(slug: string, command: SubmitLeadCaptureFormCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/contacts/lead-capture-forms/${slug}/submit`,
      command,
    );
  }
}
