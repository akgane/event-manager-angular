import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TopPanelComponent } from './components/top-panel/top-panel.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { TableComponent } from './components/table/table.component';
import { TableRowComponent } from './components/table/table-row/table-row.component';
import {EventsService} from './services/events.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DebugPanelComponent } from './components/debug-panel/debug-panel.component';
import { EventModalComponent } from './components/modals/event-modal/event-modal.component';
import { DeleteModalComponent } from './components/modals/delete-modal/delete-modal.component';
import { ModalsComponent } from './components/modals/modals.component';

@NgModule({
  declarations: [
    AppComponent,
    TopPanelComponent,
    MainPanelComponent,
    TableComponent,
    TableRowComponent,
    DebugPanelComponent,
    EventModalComponent,
    DeleteModalComponent,
    ModalsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    EventsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
