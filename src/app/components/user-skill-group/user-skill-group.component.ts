import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SkillGroupDto, SkillDto } from '../../models/skill.model';

@Component({
  selector: 'app-user-skill-group',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    @if (hasSelectedItems()) {
      <div class="skill-group">
        <div class="skill-group-header" (click)="toggleGroup()">
          <span class="skill-group-icon">{{ isExpanded ? '▼' : '▶' }}</span>
          <span class="skill-group-name">{{ group.name }}</span>
        </div>
        
        @if (isExpanded) {
          <div class="skill-group-content">
            @if (selectedSkills && selectedSkills.length > 0) {
              @for (skill of selectedSkills; track skill.id) {
                <div class="skill-item-readonly">
                  <span class="skill-item-text">{{ skill.name }}</span>
                  @if (skill.isConfirmed) {
                    <span class="skill-confirmed-badge">{{ 'SKILLS.CONFIRMED' | translate }}</span>
                  } @else {
                    <span class="skill-unconfirmed-badge">{{ 'SKILLS.NOT_CONFIRMED' | translate }}</span>
                  }
                </div>
              }
            }
            
            @if (selectedChildGroups && selectedChildGroups.length > 0) {
              @for (childGroup of selectedChildGroups; track childGroup.id) {
                <app-user-skill-group 
                  [group]="childGroup"
                  class="skill-group-child">
                </app-user-skill-group>
              }
            }
          </div>
        }
      </div>
    }
  `
})
export class UserSkillGroupComponent implements OnInit {
  @Input() group!: SkillGroupDto;
  
  isExpanded = true;
  selectedSkills: SkillDto[] = [];
  selectedChildGroups: SkillGroupDto[] = [];
  
  ngOnInit(): void {
    this.filterSelectedItems();
  }
  
  private filterSelectedItems(): void {
    this.selectedSkills = this.group.skills?.filter(skill => skill.isSelected) || [];
    
    if (this.group.childGroups) {
      this.selectedChildGroups = this.group.childGroups.filter(childGroup => 
        this.hasSelectedItemsInGroup(childGroup)
      );
    }
  }
  
  hasSelectedItems(): boolean {
    return this.selectedSkills.length > 0 || (this.selectedChildGroups?.length || 0) > 0;
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
}
