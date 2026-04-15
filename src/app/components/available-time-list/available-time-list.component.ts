import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AvailableTimeDto } from '../../models/available-time.model';

@Component({
  selector: 'app-available-time-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="available-time-list">
      @if (availableTimes.length === 0) {
        <div class="no-times">
          <p>{{ 'AVAILABLE_TIME.NO_TIMES' | translate }}</p>
        </div>
      } @else {
        <div class="times-list">
          @for (time of availableTimes; track time.id) {
            <div class="time-item">
              <div class="time-info">
                <span class="time-type-badge" [ngClass]="getTypeClass(time.availabilityType)">
                  {{ getTypeLabel(time.availabilityType) }}
                </span>
                <span class="time-display">{{ time.displayTime }}</span>
              </div>
              <div class="time-actions">
                <button class="btn-edit-time" (click)="onEdit(time)">
                  {{ 'AVAILABLE_TIME.EDIT' | translate }}
                </button>
                <button class="btn-delete-time" (click)="onDelete(time)">
                  {{ 'AVAILABLE_TIME.DELETE' | translate }}
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AvailableTimeListComponent {
  @Input() availableTimes: AvailableTimeDto[] = [];
  @Output() edit = new EventEmitter<AvailableTimeDto>();
  @Output() delete = new EventEmitter<AvailableTimeDto>();

  getTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      0: 'ALWAYS',
      1: 'WEEKLY_DAY',
      2: 'WEEKLY_TIME',
      3: 'SPECIFIC'
    };
    return labels[type] || 'UNKNOWN';
  }

  getTypeClass(type: number): string {
    const classes: Record<number, string> = {
      0: 'type-always',
      1: 'type-weekly-day',
      2: 'type-weekly-time',
      3: 'type-specific'
    };
    return classes[type] || 'type-unknown';
  }

  onEdit(time: AvailableTimeDto): void {
    this.edit.emit(time);
  }

  onDelete(time: AvailableTimeDto): void {
    this.delete.emit(time);
  }
}
