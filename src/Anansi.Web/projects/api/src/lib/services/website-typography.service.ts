import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  ColorPaletteDto,
  CreateCustomColorPaletteCommand,
  UploadCustomFontCommand,
  WebsiteFontDto,
} from '../models/website.models';

@Injectable({ providedIn: 'root' })
export class WebsiteTypographyService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  listFonts(): Observable<WebsiteFontDto[]> {
    return this.http.get<WebsiteFontDto[]>(
      `${this.config.baseUrl}/api/website-typography/fonts`,
    );
  }

  uploadFont(command: UploadCustomFontCommand): Observable<WebsiteFontDto> {
    return this.http.post<WebsiteFontDto>(
      `${this.config.baseUrl}/api/website-typography/fonts`,
      command,
    );
  }

  deleteFont(fontId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/website-typography/fonts/${fontId}`,
    );
  }

  listColorPalettes(): Observable<ColorPaletteDto[]> {
    return this.http.get<ColorPaletteDto[]>(
      `${this.config.baseUrl}/api/website-typography/color-palettes`,
    );
  }

  createColorPalette(command: CreateCustomColorPaletteCommand): Observable<ColorPaletteDto> {
    return this.http.post<ColorPaletteDto>(
      `${this.config.baseUrl}/api/website-typography/color-palettes`,
      command,
    );
  }
}
