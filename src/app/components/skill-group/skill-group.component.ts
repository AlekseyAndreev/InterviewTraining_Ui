import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class SkillGroupComponent implements OnInit {
  @Input() group!: SkillGroupDto;
  @Input() selectedSkills!: Set<string>;
  @Output() skillToggled = new EventEmitter<string>();
  
  isExpanded = false;
  
  ngOnInit(): void {
    this.initializeSelectedSkills();
    this.isExpanded = this.hasSelectedItems();
  }
  
  private initializeSelectedSkills(): void {
    if (this.group.skills) {
      this.group.skills.forEach(skill => {
        if (skill.isSelected) {
          this.selectedSkills.add(skill.id);
        }
      });
    }
  }
  
  private hasSelectedItems(): boolean {
    if (this.group.skills) {
      for (const skill of this.group.skills) {
        if (skill.isSelected) {
          return true;
        }
      }
    }
    
    if (this.group.childGroups) {
      for (const childGroup of this.group.childGroups) {
        if (this.hasSelectedItemsInGroup(childGroup)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private hasSelectedItemsInGroup(group: SkillGroupDto): boolean {
    if (group.skills) {
      for (const skill of group.skills) {
        if (skill.isSelected) {
          return true;
        }
      }
    }
    
    if (group.childGroups) {
      for (const childGroup of group.childGroups) {
        if (this.hasSelectedItemsInGroup(childGroup)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
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
