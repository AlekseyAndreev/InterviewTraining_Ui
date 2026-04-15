import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AvailabilityType,
  AvailableTimeDto,
  CreateAvailableTimeRequest,
  UpdateAvailableTimeRequest
} from '../../models/available-time.model';

@Component({
  selector: 'app-available-time-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="available-time-form">
      <h4>{{ editingTime ? ('AVAILABLE_TIME.EDIT_TIME' | translate) : ('AVAILABLE_TIME.ADD_TIME' | translate) }}</h4>
      
      <div class="form-section">
        <label class="form-label">{{ 'AVAILABLE_TIME.TYPE' | translate }}</label>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" 
                   name="availabilityType" 
                   [value]="0" 
                   [(ngModel)]="selectedType"
                   (change)="onTypeChange()">
            <span>{{ 'AVAILABLE_TIME.TYPE_ALWAYS' | translate }}</span>
          </label>
          
          <label class="radio-option">
            <input type="radio" 
                   name="availabilityType" 
                   [value]="1" 
                   [(ngModel)]="selectedType"
                   (change)="onTypeChange()">
            <span>{{ 'AVAILABLE_TIME.TYPE_WEEKLY_DAY' | translate }}</span>
          </label>
          
          <label class="radio-option">
            <input type="radio" 
                   name="availabilityType" 
                   [value]="2" 
                   [(ngModel)]="selectedType"
                   (change)="onTypeChange()">
            <span>{{ 'AVAILABLE_TIME.TYPE_WEEKLY_TIME' | translate }}</span>
          </label>
          
          <label class="radio-option">
            <input type="radio" 
                   name="availabilityType" 
                   [value]="3" 
                   [(ngModel)]="selectedType"
                   (change)="onTypeChange()">
            <span>{{ 'AVAILABLE_TIME.TYPE_SPECIFIC' | translate }}</span>
          </label>
        </div>
      </div>

      @if (selectedType === 1 || selectedType === 2) {
        <div class="form-section">
          <label class="form-label">{{ 'AVAILABLE_TIME.DAY_OF_WEEK' | translate }}</label>
          <select class="form-input" [(ngModel)]="formData.dayOfWeek">
            @for (day of daysOfWeek; track day.value) {
              <option [value]="day.value">{{ day.label | translate }}</option>
            }
          </select>
        </div>
      }

      @if (selectedType === 2) {
        <div class="form-row">
          <div class="form-section">
            <label class="form-label">{{ 'AVAILABLE_TIME.TIME' | translate }}</label>
            <input type="time" class="form-input" [(ngModel)]="formData.startTime">
          </div>
          <div class="form-section">
            <label class="form-label">{{ 'AVAILABLE_TIME.END_TIME' | translate }}</label>
            <input type="time" class="form-input" [(ngModel)]="formData.endTime">
          </div>
        </div>
      }

      @if (selectedType === 3) {
        <div class="form-section">
          <label class="form-label">{{ 'AVAILABLE_TIME.DATE' | translate }}</label>
          <input type="date" class="form-input" [(ngModel)]="formData.specificDate">
        </div>
        <div class="form-row">
          <div class="form-section">
            <label class="form-label">{{ 'AVAILABLE_TIME.TIME' | translate }}</label>
            <input type="time" class="form-input" [(ngModel)]="formData.startTime">
          </div>
          <div class="form-section">
            <label class="form-label">{{ 'AVAILABLE_TIME.END_TIME' | translate }}</label>
            <input type="time" class="form-input" [(ngModel)]="formData.endTime">
          </div>
        </div>
      }

      <div class="form-actions">
        <button class="btn-save" (click)="save()" [disabled]="isSaving">
          @if (isSaving) {
            {{ 'AVAILABLE_TIME.SAVING' | translate }}
          } @else if (editingTime) {
            {{ 'AVAILABLE_TIME.UPDATE_TIME' | translate }}
          } @else {
            {{ 'AVAILABLE_TIME.ADD_TIME' | translate }}
          }
        </button>
        <button class="btn-cancel" (click)="cancelEdit()">{{ 'USER_INFO.CANCEL' | translate }}</button>
      </div>
    </div>
  `
})
export class AvailableTimeFormComponent {
  @Input() editingTime: AvailableTimeDto | null = null;
  @Input() isSaving = false;
  @Output() saveTime = new EventEmitter<CreateAvailableTimeRequest>();
  @Output() updateTime = new EventEmitter<{ id: string; request: UpdateAvailableTimeRequest }>();
  @Output() cancel = new EventEmitter<void>();

  private translateService = inject(TranslateService);

  selectedType: AvailabilityType = AvailabilityType.AlwaysAvailable;
  
  formData: CreateAvailableTimeRequest = {
    availabilityType: AvailabilityType.AlwaysAvailable,
    dayOfWeek: null,
    specificDate: null,
    startTime: null,
    endTime: null,
  };

  daysOfWeek = [
    { value: 0, label: 'AVAILABLE_TIME.DAYS.SUNDAY' },
    { value: 1, label: 'AVAILABLE_TIME.DAYS.MONDAY' },
    { value: 2, label: 'AVAILABLE_TIME.DAYS.TUESDAY' },
    { value: 3, label: 'AVAILABLE_TIME.DAYS.WEDNESDAY' },
    { value: 4, label: 'AVAILABLE_TIME.DAYS.THURSDAY' },
    { value: 5, label: 'AVAILABLE_TIME.DAYS.FRIDAY' },
    { value: 6, label: 'AVAILABLE_TIME.DAYS.SATURDAY' }
  ];

  ngOnChanges(): void {
    if (this.editingTime) {
      this.selectedType = this.editingTime.availabilityType;
      this.formData = {
        availabilityType: this.editingTime.availabilityType,
        dayOfWeek: this.editingTime.dayOfWeek,
        specificDate: this.editingTime.specificDate,
        startTime: this.editingTime.startTime,
        endTime: this.editingTime.endTime,
      };
    } else {
      this.resetForm();
    }
  }

  onTypeChange(): void {
    this.formData.availabilityType = this.selectedType;
    
    if (this.selectedType === AvailabilityType.AlwaysAvailable) {
      this.formData.dayOfWeek = null;
      this.formData.specificDate = null;
      this.formData.startTime = null;
      this.formData.endTime = null;
    } else if (this.selectedType === AvailabilityType.WeeklyFullDay) {
      this.formData.specificDate = null;
      this.formData.dayOfWeek = this.formData.dayOfWeek ?? 1;
    } else if (this.selectedType === AvailabilityType.WeeklyWithTime) {
      this.formData.specificDate = null;
      this.formData.dayOfWeek = this.formData.dayOfWeek ?? 1;
    } else if (this.selectedType === AvailabilityType.SpecificDateTime) {
      this.formData.dayOfWeek = null;
    }
  }

  save(): void {
    const request: CreateAvailableTimeRequest = {
      availabilityType: this.selectedType,
    };

    if (this.selectedType === AvailabilityType.WeeklyFullDay) {
      request.dayOfWeek = this.formData.dayOfWeek;
    } else if (this.selectedType === AvailabilityType.WeeklyWithTime) {
      request.dayOfWeek = this.formData.dayOfWeek;
      request.startTime = this.formData.startTime;
      request.endTime = this.formData.endTime;
    } else if (this.selectedType === AvailabilityType.SpecificDateTime) {
      request.specificDate = this.formData.specificDate;
      request.startTime = this.formData.startTime;
      request.endTime = this.formData.endTime;
    }

    if (this.editingTime) {
      this.updateTime.emit({ id: this.editingTime.id, request });
    } else {
      this.saveTime.emit(request);
    }
  }

  cancelEdit(): void {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedType = AvailabilityType.AlwaysAvailable;
    this.formData = {
      availabilityType: AvailabilityType.AlwaysAvailable,
      dayOfWeek: null,
      specificDate: null,
      startTime: null,
      endTime: null,
    };
  }
}
