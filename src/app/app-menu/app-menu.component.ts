import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { AllowedApps } from '../shared/app-common-types.model';
import { AppSelectService } from '../shared/app-select-service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
  @Output() activeApp: EventEmitter<AllowedApps> = new EventEmitter();

  private appSelectService = inject(AppSelectService);
  private appSelectSubscription!: Subscription;

  private LOG_PREFIX: string = '[MENU_COMPONENT] ';

  ngOnInit() {
    this.activeApp.emit('radio1');
    this.appSelectService.setSelectedApp('radio1');

    this.appSelectSubscription = this.appSelectService.selectedApp$.subscribe({
      next: (app) => {
        try {
          console.log(this.LOG_PREFIX + 'Received message:', app);
          this.onSelectApp(app);

        } catch (e) {
          console.error(this.LOG_PREFIX + 'Error processing next value from AppSelectService: ' + e);
        }
      },
      error: (err) => {
        console.error(this.LOG_PREFIX + 'Error in communication with AppSelectService: ' + err);
      },
      complete: () => {
        console.log(this.LOG_PREFIX + 'AppSelectService closed.');
      }
    });
  }

  ngOnDestroy() {
    this.appSelectSubscription.unsubscribe();
  }

  onSelectApp(app: AllowedApps) {
    this.activeApp.emit(app);
    this.appSelectService.setSelectedApp(app);
  }
}
