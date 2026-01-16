import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import{ HeaderMed} from'./medecin/header-med/header-med';
import{HeaderSec}from'./secritaire/header-sec/header-sec';

// IMPORT AJOUTÉ
import{AdminHeader}from'../app/Admin/admin-header/admin-header';
import { AdminSupHeader } from './AdminSup/admin-sup-header/admin-sup-header';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, HeaderMed,HeaderSec,AdminHeader,AdminSupHeader], // HEADERMED AJOUTÉ ICI
  templateUrl: './app.html',
  styleUrls: []
})
export class AppComponent {
  title = 'medical-clinic-frontend';

  constructor(private router: Router) {}

  // Vérifier si on est sur une route secrétaire]
  isSecretaryRoute(): boolean {
    return this.router.url.includes('/secritaire');
  }

  // Vérifier si on est sur une route médecin
  isDoctorRoute(): boolean {
    return this.router.url.includes('/medecin');
  }

    isAdminRoute(): boolean {
    return this.router.url.includes('/Admin/') && !this.router.url.includes('/AdminSup/');
  }
   isAdminSupRoute(): boolean{
    return this.router.url.includes('/AdminSup');
  }


  // Vérifier si c'est une route publique (ni secrétaire ni médecin)
  isPublicRoute(): boolean {
    return !this.isSecretaryRoute() && !this.isDoctorRoute();
  }
}
