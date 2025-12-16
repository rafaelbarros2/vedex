import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for auth endpoints or external assets if needed
    if (req.url.includes('/assets/') || req.url.includes('/auth/')) {
      return next.handle(req);
    }

    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const tenantId = this.authService.getTenantId();

        let headers = req.headers;

        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }

        if (tenantId) {
          headers = headers.set('X-Tenant-ID', tenantId);
        }

        const authReq = req.clone({ headers });
        return next.handle(authReq);
      })
    );
  }
}