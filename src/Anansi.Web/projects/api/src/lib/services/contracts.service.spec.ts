import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { ContractsService } from './contracts.service';
import { PagedList } from '../models/common';
import { ContractStatus } from '../models/enums';
import {
  ContractDto,
  ContractListParams,
  CreateContractCommand,
  SignContractCommand,
} from '../models/crm.models';

describe('ContractsService', () => {
  let service: ContractsService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(ContractsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockContract: ContractDto = {
    id: 'contract-1',
    title: 'Wedding Photography Contract',
    content: '<p>Contract content here</p>',
    status: ContractStatus.Draft,
    autoRemindersEnabled: true,
    reminderIntervalDays: 7,
    isTemplate: false,
    fields: [],
    signatures: [
      {
        id: 'sig-1',
        signerName: 'Jane Doe',
        signerEmail: 'jane@example.com',
        signerRole: 'Client',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should POST to /api/contracts and return ContractDto', () => {
      const command: CreateContractCommand = {
        title: 'Wedding Photography Contract',
        content: '<p>Contract content here</p>',
        autoRemindersEnabled: true,
        reminderIntervalDays: 7,
        isTemplate: false,
        signatures: [
          {
            signerName: 'Jane Doe',
            signerEmail: 'jane@example.com',
            signerRole: 'Client',
          },
        ],
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockContract);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contracts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockContract);
    });
  });

  describe('get', () => {
    it('should GET /api/contracts/{id} and return ContractDto', () => {
      service.get('contract-1').subscribe((result) => {
        expect(result).toEqual(mockContract);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contracts/contract-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockContract);
    });
  });

  describe('list', () => {
    const mockPagedResponse: PagedList<ContractDto> = {
      items: [mockContract],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    };

    it('should GET /api/contracts without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/contracts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should GET /api/contracts with all query params', () => {
      const params: ContractListParams = {
        isTemplate: true,
        page: 1,
        pageSize: 10,
      };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/contracts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('isTemplate')).toBe('true');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedResponse);
    });

    it('should GET /api/contracts with partial params', () => {
      const params: ContractListParams = { isTemplate: false };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/contracts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('isTemplate')).toBe('false');
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedResponse);
    });
  });

  describe('send', () => {
    it('should POST to /api/contracts/{id}/send with empty body', () => {
      service.send('contract-1').subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/contracts/contract-1/send`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('sign', () => {
    it('should POST to /api/contracts/{contractId}/sign/{signatureId}', () => {
      const command: SignContractCommand = {
        contractId: 'contract-1',
        signatureId: 'sig-1',
        signatureData: 'base64-signature-data',
      };

      service.sign('contract-1', 'sig-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/contracts/contract-1/sign/sig-1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
