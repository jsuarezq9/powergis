import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { ListElementsComponent } from './components/list-elements/list-elements.component';
import { HeaderComponent } from './components/header/header.component';
import { BodyComponent } from './components/body/body.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ModulebaseComponent } from './components/modulebase/modulebase.component';
import { ModulehidroComponent } from './components/modulehidro/modulehidro.component';
import { ModuleprecipitationComponent } from './components/moduleprecipitation/moduleprecipitation.component';
import { LayerNamePipe } from './pipes/layer-name.pipe';
import { HttpClientModule } from '@angular/common/http';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { ModulehidroPopupComponent } from './components/modulehidro-popup/modulehidro-popup.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ListElementsComponent,
    HeaderComponent,
    BodyComponent,
    SidebarComponent,
    ModulebaseComponent,
    ModulehidroComponent,
    ModuleprecipitationComponent,
    LayerNamePipe,
    CapitalizePipe,
    ModulehidroPopupComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    HttpClientModule,
    GoogleChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
