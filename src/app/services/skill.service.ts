import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetSkillsTreeResponse } from '../models/skill.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getSkillsTree(): Observable<GetSkillsTreeResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/skills/tree`;
    return this.http.get<GetSkillsTreeResponse>(apiUrl);
  }

  addSkills(skillIds: string[]): Observable<void> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-skills`;
    return this.http.post<void>(apiUrl, skillIds);
  }
}
