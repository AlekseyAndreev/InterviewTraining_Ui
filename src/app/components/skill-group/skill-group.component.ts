import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SkillGroupDto, SkillDto } from '../../models/skill.model';

@Component({
  selector: 'app-skill-group',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="skill-group">
      <div class="skill-group-header" (click)="toggleGroup()">
        <span class="skill-group-icon">{{ isExpanded ? '▼' : '▶' }}</span>
        <span class="skill-group-name">{{ group.name }}</span>
      </div>
      
      @if (isExpanded) {
        <div class="skill-group-content">
          @if (group.skills && group.skills.length > 0) {
            @for (skill of group.skills; track skill.id) {
              <label class="skill-item">
                <input type="checkbox" 
                       [checked]="selectedSkills.has(skill.id)" 
                       (change)="onSkillToggle(skill.id)">
                <span>{{ skill.name }}</span>
              </label>
            }
          }
          
          @if (group.childGroups && group.childGroups.length > 0) {
            @for (childGroup of group.childGroups; track childGroup.id) {
              <app-skill-group 
                [group]="childGroup"
                [selectedSkills]="selectedSkills"
                (skillToggled)="onSkillToggled($event)"
                class="skill-group-child">
              </app-skill-group>
            }
          }
        </div>
      }
    </div>
  `
})
export class SkillGroupComponent {
  @Input() group!: SkillGroupDto;
  @Input() selectedSkills!: Set<string>;
  @Output() skillToggled = new EventEmitter<string>();
  
  isExpanded = false;
  
  toggleGroup(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  onSkillToggle(skillId: string): void {
    this.skillToggled.emit(skillId);
  }
  
  onSkillToggled(skillId: string): void {
    this.skillToggled.emit(skillId);
  }
}
