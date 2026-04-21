import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private counter = 0;
  readonly messages = signal<SnackbarMessage[]>([]);

  showError(message: string, duration = 5000): void {
    const id = ++this.counter;
    this.messages.update(msgs => [...msgs, { id, message, type: 'error' }]);
    
    setTimeout(() => this.dismiss(id), duration);
  }

  showSuccess(message: string, duration = 3000): void {
    const id = ++this.counter;
    this.messages.update(msgs => [...msgs, { id, message, type: 'success' }]);
    
    setTimeout(() => this.dismiss(id), duration);
  }

  showInfo(message: string, duration = 3000): void {
    const id = ++this.counter;
    this.messages.update(msgs => [...msgs, { id, message, type: 'info' }]);
    
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.messages.update(msgs => msgs.filter(m => m.id !== id));
  }
}
