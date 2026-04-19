export interface SkillDto {
  id: string;
  name: string;
  isSelected: boolean;
  isConfirmed: boolean;
}

export interface SkillGroupDto {
  id: string;
  name: string;
  childGroups: SkillGroupDto[];
  skills: SkillDto[];
}

export interface GetSkillsTreeResponse {
  groups: SkillGroupDto[];
}
