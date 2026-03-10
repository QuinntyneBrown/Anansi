import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import { PagedList } from '../models/common';
import {
  ContractDto,
  ContractListParams,
  CreateContractCommand,
  SignContractCommand,
} from '../models/crm.models';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  create(command: CreateContractCommand): Observable<ContractDto> {
    return this.http.post<ContractDto>(
      `${this.config.baseUrl}/api/contracts`,
      command,
    );
  }

  get(id: string): Observable<ContractDto> {
    return this.http.get<ContractDto>(
      `${this.config.baseUrl}/api/contracts/${id}`,
    );
  }

  list(params?: ContractListParams): Observable<PagedList<ContractDto>> {
    let httpParams = new HttpParams();
    if (params?.isTemplate != null) httpParams = httpParams.set('isTemplate', params.isTemplate);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<PagedList<ContractDto>>(
      `${this.config.baseUrl}/api/contracts`,
      { params: httpParams },
    );
  }

  send(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/contracts/${id}/send`,
      {},
    );
  }

  sign(contractId: string, signatureId: string, command: SignContractCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/contracts/${contractId}/sign/${signatureId}`,
      command,
    );
  }
}
