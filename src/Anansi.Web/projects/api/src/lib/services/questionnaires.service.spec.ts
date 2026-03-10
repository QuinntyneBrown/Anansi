import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnaireStatus, QuestionType } from '../models/enums';
import {
  CreateQuestionnaireCommand,
  QuestionnaireDto,
  SubmitQuestionnaireResponseCommand,
} from '../models/crm.models';

describe('QuestionnairesService', () => {
  let service: QuestionnairesService;
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
    service = TestBed.inject(QuestionnairesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const mockQuestionnaire: QuestionnaireDto = {
    id: 'questionnaire-1',
    title: 'Wedding Details Questionnaire',
    description: 'Please fill in the details for your wedding day',
    contactId: 'contact-1',
    contactName: 'Jane Doe',
    status: QuestionnaireStatus.Draft,
    allowMultipleSubmissions: false,
    expiryDays: 30,
    autoRemindersEnabled: true,
    isTemplate: false,
    questions: [
      {
        id: 'q-1',
        label: 'Wedding Date',
        questionType: QuestionType.Date,
        isRequired: true,
        sortOrder: 1,
      },
      {
        id: 'q-2',
        label: 'Venue Name',
        questionType: QuestionType.ShortText,
        isRequired: true,
        sortOrder: 2,
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should POST to /api/questionnaires and return QuestionnaireDto', () => {
      const command: CreateQuestionnaireCommand = {
        title: 'Wedding Details Questionnaire',
        description: 'Please fill in the details for your wedding day',
        contactId: 'contact-1',
        allowMultipleSubmissions: false,
        expiryDays: 30,
        autoRemindersEnabled: true,
        isTemplate: false,
        questions: [
          {
            label: 'Wedding Date',
            questionType: QuestionType.Date,
            isRequired: true,
            sortOrder: 1,
          },
          {
            label: 'Venue Name',
            questionType: QuestionType.ShortText,
            isRequired: true,
            sortOrder: 2,
          },
        ],
      };

      service.create(command).subscribe((result) => {
        expect(result).toEqual(mockQuestionnaire);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/questionnaires`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockQuestionnaire);
    });
  });

  describe('get', () => {
    it('should GET /api/questionnaires/{id} and return QuestionnaireDto', () => {
      service.get('questionnaire-1').subscribe((result) => {
        expect(result).toEqual(mockQuestionnaire);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/questionnaires/questionnaire-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockQuestionnaire);
    });
  });

  describe('submitResponse', () => {
    it('should POST to /api/questionnaires/{id}/responses', () => {
      const command: SubmitQuestionnaireResponseCommand = {
        questionnaireId: 'questionnaire-1',
        respondentEmail: 'jane@example.com',
        respondentName: 'Jane Doe',
        answersJson: JSON.stringify({
          'q-1': '2026-06-15',
          'q-2': 'Grand Ballroom',
        }),
      };

      service.submitResponse('questionnaire-1', command).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/questionnaires/questionnaire-1/responses`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(null);
    });
  });
});
