import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileLightboxComponent, MobileLightboxPhoto } from './mobile-lightbox.component';
import { ComponentRef } from '@angular/core';

describe('MobileLightboxComponent', () => {
  let component: MobileLightboxComponent;
  let componentRef: ComponentRef<MobileLightboxComponent>;
  let fixture: ComponentFixture<MobileLightboxComponent>;

  const mockPhotos: MobileLightboxPhoto[] = [
    { id: '1', url: '/photo1.jpg', fileName: 'photo1.jpg' },
    { id: '2', url: '/photo2.jpg', fileName: 'photo2.jpg' },
    { id: '3', url: '/photo3.jpg', fileName: 'photo3.jpg' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileLightboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileLightboxComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('photos', mockPhotos);
    componentRef.setInput('currentIndex', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct counter text', () => {
    const counter = fixture.nativeElement.querySelector('.lightbox__counter');
    expect(counter.textContent.trim()).toBe('1 / 3');
  });

  it('should emit close on close button click', () => {
    const closeSpy = jest.fn();
    component.close.subscribe(closeSpy);
    const closeBtn = fixture.nativeElement.querySelector('.lightbox__close');
    closeBtn.click();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should navigate to next photo on onNext', () => {
    const indexSpy = jest.fn();
    component.indexChange.subscribe(indexSpy);
    component.onNext();
    expect(indexSpy).toHaveBeenCalledWith(1);
  });

  it('should not navigate before first photo', () => {
    const indexSpy = jest.fn();
    component.indexChange.subscribe(indexSpy);
    component.onPrev();
    expect(indexSpy).not.toHaveBeenCalled();
  });

  it('should emit favorite with current photo', () => {
    const favSpy = jest.fn();
    component.favorite.subscribe(favSpy);
    component.onFavorite();
    expect(favSpy).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('should emit download with current photo', () => {
    const dlSpy = jest.fn();
    component.download.subscribe(dlSpy);
    component.onDownload();
    expect(dlSpy).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('should emit share with current photo', () => {
    const shareSpy = jest.fn();
    component.share.subscribe(shareSpy);
    component.onShare();
    expect(shareSpy).toHaveBeenCalledWith(mockPhotos[0]);
  });
});
