import { Component, EventEmitter, Output } from '@angular/core';
import { AllowedApps } from '../shared/app-common-types.model';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.css'
})
export class MenuComponent {
  @Output() activeApp: EventEmitter<AllowedApps> = new EventEmitter();

  ngOnInit() {
    this.activeApp.emit('radio1');
  }

  onSelectApp(app: AllowedApps) {
    this.activeApp.emit(app);
  }
}
