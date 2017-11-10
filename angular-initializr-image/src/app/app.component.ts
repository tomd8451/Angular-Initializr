import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  appName = '';
  prefix = '';
  routing = true;
  ngrx = false;
  style = 'css';

  styleOptions = ['scss', 'css', 'sass'];

  onSubmit() {
    if (this.appName !== '') {
      let params = 'appName=' + this.appName;
      params = params + '&routing=' + this.routing;
      params = params + '&ngrx=' + this.ngrx;
      params = params + '&style=' + this.style;
      if (this.prefix !== '') {
        params = params + '&prefix=' + this.prefix;
      }
      window.location.href = '/api?' + params;
    }
  }

  /*
  var appName = req.query.appName;
    var prefix = req.query.prefix;
    var routing = req.query.routingModule;
    var ngrx = req.query.ngrx;
    var style = req.query.style;
  */
}
