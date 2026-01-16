import { Routes } from '@angular/router';



 export const routes: Routes = [

   {
     path: '',
     loadComponent: () => import('./pages/home/home').then(m => m.Home)
   },

   {
     path: 'home',
     loadComponent: () => import('./pages/home/home').then(m => m.Home)
   },

   {
     path: 'login',
     loadComponent: () => import('./pages/login/login').then(m => m.Login)
   },

   {
     path: 'rend-rdv',
     loadComponent: () => import('./pages/rend-rdv/rend-rdv').then(m => m.RendRDV)
   },

   {
     path: 'doctors',
     loadComponent: () => import('./pages/medecinns/medecins').then(m => m.Medecins)
   },

   {
     path: 'service',
     loadComponent: () => import('./pages/service/service').then(m => m.Service)
   },

   // ================= SECRETAIRE =================
   {
     path: 'secritaire/secretary-dashboard',
     loadComponent: () =>
       import('./secritaire/secretary-dashboard/secretary-dashboard')
         .then(m => m.SecretaryDashboard)
   },

   {
     path: 'secritaire/patient',
     loadComponent: () =>
       import('./secritaire/patient/patient')
         .then(m => m.PatientComponent)
   },

   {
     path: 'secritaire/prend-rdv',
     loadComponent: () =>
       import('./secritaire/prend-rdv/prend-rdv')
         .then(m => m.PrendreRDVComponent)
   },

   {
     path: 'secritaire/attent',
     loadComponent: () =>
       import('./secritaire/attent/attent')
         .then(m => m.Attent)
   },

   {
     path: 'secritaire/facture',
     loadComponent: () =>
       import('./secritaire/facture/facture')
         .then(m => m.FactureComponent)
   },

   // ================= MEDECIN =================
   {
     path: 'medecin/dashboard',
     loadComponent: () =>
       import('./medecin/dashboard/dashboard')
         .then(m => m.Dashboard)
   },

   {
     path: 'medecin/agenda',
     loadComponent: () =>
       import('./medecin/agenda/agenda')
         .then(m => m.Agenda)
   },

   {
     path: 'medecin/patients',
     loadComponent: () =>
       import('./medecin/patients/patients')
         .then(m => m.PatientsComponent)
   },

   {
     path: 'medecin/Consultation',
     loadComponent: () =>
       import('./medecin/consultation/consultation')
         .then(m => m.ConsultationComponent)
   },

   {
     path: 'medecin/prescriptions',
     loadComponent: () =>
       import('./medecin/prescriptions/prescriptions')
         .then(m => m.PrescriptionsComponent)
   },

   {
     path: 'medecin/dossiers',
     loadComponent: () =>
       import('./medecin/dossier-medical/dossier-medical')
         .then(m => m.DossierMedicalComponent)
   },

   // ================= ADMIN =================
  {
    path: 'Admin',
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./Admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'medes',
        loadComponent: () => import('./Admin/admin-medecins/admin-medecins').then(m => m.AdminMedecins)
      },
      {
        path: 'sec',
        loadComponent: () => import('./Admin/admin-secritaires/admin-secritaires').then(m => m.AdminSecritaires)
      },
      {
        path: 'cabinet',
        loadComponent: () => import('./Admin/admin-cabinet/admin-cabinet').then(m => m.AdminCabinet)
      }
    ]
  },
  {
      path: 'AdminSup',
      data: { role: 'SUPER_ADMIN' },
      children: [
        {
          path: 'cabinet',
          loadComponent: () => import('./AdminSup/admin-sup-cabinet/admin-sup-cabinet').then(m => m.AdminSupCabinet)
        }
      ]
    },


   // ================= WILDCARD =================
   {
     path: '**',
     redirectTo: ''
   }
 ];
