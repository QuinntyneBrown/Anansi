import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { BookingsService } from './bookings.service';
import { PagedList } from '../models/common';
import { BookingStatus, CouponType, SessionVisibility } from '../models/enums';
import {
  BookingCouponDto,
  BookingListParams,
  BookingRecordDto,
  ConfirmBookingCommand,
  CreateBookingCommand,
  CreateBookingCouponCommand,
  CreateSessionTypeCommand,
  SessionTypeDto,
} from '../models/crm.models';

describe('BookingsService', () => {
  let service: BookingsService;
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
    service = TestBed.inject(BookingsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockSessionType: SessionTypeDto = {
    id: 'session-type-1',
    name: 'Wedding Photography',
    description: 'Full day wedding coverage',
    durationMinutes: 480,
    priceCents: 350000,
    location: 'On location',
    visibility: SessionVisibility.Public,
    sortOrder: 1,
    bufferBeforeMinutes: 30,
    bufferAfterMinutes: 30,
    requireManualConfirmation: true,
    isMiniSession: false,
    miniSessionGapMinutes: 0,
    miniSessionSpotsPerSlot: 0,
    requirePayment: true,
    depositAmountCents: 100000,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockBooking: BookingRecordDto = {
    id: 'booking-1',
    sessionTypeId: 'session-type-1',
    sessionTypeName: 'Wedding Photography',
    contactId: 'contact-1',
    clientFirstName: 'Jane',
    clientLastName: 'Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '555-1234',
    startTime: '2026-06-15T10:00:00Z',
    endTime: '2026-06-15T18:00:00Z',
    status: BookingStatus.Pending,
    location: 'Grand Ballroom',
    amountPaidCents: 100000,
    discountCents: 0,
    notes: 'Looking forward to the event',
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('createSessionType', () => {
    it('should POST to /api/bookings/session-types and return SessionTypeDto', () => {
      const command: CreateSessionTypeCommand = {
        name: 'Wedding Photography',
        description: 'Full day wedding coverage',
        durationMinutes: 480,
        priceCents: 350000,
        location: 'On location',
        visibility: SessionVisibility.Public,
        sortOrder: 1,
        bufferBeforeMinutes: 30,
        bufferAfterMinutes: 30,
        requireManualConfirmation: true,
        isMiniSession: false,
        miniSessionGapMinutes: 0,
        miniSessionSpotsPerSlot: 0,
        requirePayment: true,
        depositAmountCents: 100000,
      };

      service.createSessionType(command).subscribe((result) => {
        expect(result).toEqual(mockSessionType);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings/session-types`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockSessionType);
    });
  });

  describe('listSessionTypes', () => {
    it('should GET /api/bookings/session-types and return SessionTypeDto[]', () => {
      const mockResponse: SessionTypeDto[] = [mockSessionType];

      service.listSessionTypes().subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings/session-types`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should POST to /api/bookings and return BookingRecordDto', () => {
      const command: CreateBookingCommand = {
        sessionTypeId: 'session-type-1',
        contactId: 'contact-1',
        clientFirstName: 'Jane',
        clientLastName: 'Doe',
        clientEmail: 'jane@example.com',
        clientPhone: '555-1234',
        startTime: '2026-06-15T10:00:00Z',
        endTime: '2026-06-15T18:00:00Z',
        location: 'Grand Ballroom',
        notes: 'Looking forward to the event',
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockBooking);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockBooking);
    });
  });

  describe('confirm', () => {
    it('should PUT to /api/bookings/{id}/confirm', () => {
      const command: ConfirmBookingCommand = {
        id: 'booking-1',
        videoCallLink: 'https://zoom.us/j/123456',
      };

      service.confirm('booking-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings/booking-1/confirm`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });

  describe('list', () => {
    const mockPagedResponse: PagedList<BookingRecordDto> = {
      items: [mockBooking],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    };

    it('should GET /api/bookings without params', () => {
      service.list().subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockPagedResponse);
    });

    it('should GET /api/bookings with all query params', () => {
      const params: BookingListParams = {
        status: BookingStatus.Confirmed,
        from: '2026-01-01',
        to: '2026-12-31',
        page: 1,
        pageSize: 10,
      };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(BookingStatus.Confirmed);
      expect(req.request.params.get('from')).toBe('2026-01-01');
      expect(req.request.params.get('to')).toBe('2026-12-31');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockPagedResponse);
    });

    it('should GET /api/bookings with partial params', () => {
      const params: BookingListParams = { status: BookingStatus.Pending };

      service.list(params).subscribe((result) => {
        expect(result).toEqual(mockPagedResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${baseUrl}/api/bookings`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(BookingStatus.Pending);
      expect(req.request.params.has('from')).toBe(false);
      expect(req.request.params.has('to')).toBe(false);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('pageSize')).toBe(false);
      req.flush(mockPagedResponse);
    });
  });

  describe('createCoupon', () => {
    it('should POST to /api/bookings/coupons and return BookingCouponDto', () => {
      const command: CreateBookingCouponCommand = {
        code: 'SUMMER20',
        couponType: CouponType.PercentageOff,
        percentageValue: 20,
        expirationDate: '2026-09-01T00:00:00Z',
        usageLimit: 50,
      };
      const mockResponse: BookingCouponDto = {
        id: 'coupon-1',
        code: 'SUMMER20',
        couponType: CouponType.PercentageOff,
        percentageValue: 20,
        expirationDate: '2026-09-01T00:00:00Z',
        usageLimit: 50,
        timesUsed: 0,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
      };

      service.createCoupon(command).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/bookings/coupons`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockResponse);
    });
  });
});
