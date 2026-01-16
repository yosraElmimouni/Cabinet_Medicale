# Analyse Complète du Projet Cabinet Médical

## 📋 Vue d'ensemble

Ce projet est une **plateforme de gestion de cabinet médical** basée sur une architecture de **microservices** avec :
- **Backend** : Spring Boot 3.3.3 avec Java 17
- **Frontend** : Angular 21.0.0
- **Architecture** : Microservices avec API Gateway et Service Discovery (Eureka)
- **Base de données** : MySQL (une base par service)
- **Sécurité** : JWT (JSON Web Tokens)
- **Tracing** : Zipkin pour le monitoring distribué

---

## 🏗️ Architecture des Microservices

### 1. **Discovery Service** (`discovry-service`)
- **Port** : 8761
- **Rôle** : Service Discovery (Eureka Server)
- **Configuration** : 
  - Ne s'enregistre pas lui-même (`register-with-eureka=false`)
  - Ne récupère pas le registre (`fetch-registry=false`)
- **Fichiers principaux** :
  - `application.properties` : Configuration Eureka

### 2. **API Gateway** (`api-gateway`)
- **Port** : 8080 (par défaut)
- **Rôle** : Point d'entrée unique pour tous les microservices
- **Technologies** : Spring Cloud Gateway
- **Fonctionnalités** :
  - Routage vers les microservices
  - Authentification JWT via `AuthenticationFilter`
  - Filtrage des routes sécurisées
  - Intégration avec Eureka pour la découverte de services
- **Routes configurées** :
  - `/api/RendezVous/**` → rendezvous-service
  - `/api/Consultation/**, /api/DossierMedical/**, /api/Facture/**, /api/Patient/**` → patient-medical-service
  - `/files/**` → file-service
  - `/api/cabinet/**` → cabinet-service
  - `/auth/**, /users/**` → auth-service
  - `/eureka/**` → discovery-server
- **Fichiers clés** :
  - `ApiGatewayApplication.java`
  - `security/AuthenticationFilter.java` : Filtre d'authentification JWT
  - `security/JwtUtil.java` : Utilitaire pour la validation JWT
  - `security/RouteValidator.java` : Validation des routes
  - `security/GatewaySecurityConfig.java` : Configuration de sécurité

### 3. **Auth Service** (`auth-service`)
- **Port** : Port dynamique (0) - enregistré via Eureka
- **Base de données** : `auth_db`
- **Rôle** : Gestion de l'authentification et des utilisateurs
- **Fonctionnalités** :
  - Inscription (`/auth/register`) avec upload d'image et signature
  - Connexion (`/auth/login`)
  - Gestion des utilisateurs
  - Génération de tokens JWT
- **Modèles** :
  - `User` : Utilisateur avec rôles (SUPER_ADMIN, ADMIN_CABINET, MEDECIN, SECRETAIRE)
  - `RoleUser` : Enum des rôles
- **Sécurité** :
  - Spring Security
  - JWT (jjwt 0.11.5)
  - `JwtFilter` : Filtre pour valider les tokens
  - `MyUserDetailsService` : Service de détails utilisateur
  - `SecurityConfig` : Configuration de sécurité
- **Fichiers clés** :
  - `conroller/AuthController.java` : Endpoints d'authentification
  - `conroller/UserController.java` : Gestion des utilisateurs
  - `service/AuthService.java` : Logique métier d'authentification
  - `service/UserService.java` : Gestion des utilisateurs
  - `security/JWTService.java` : Service JWT
  - `dto/RegisterRequest.java`, `LoginRequest.java`, `AuthResponse.java`

### 4. **Cabinet Service** (`cabinet-service`)
- **Port** : 8081
- **Base de données** : `cabinet_service`
- **Rôle** : Gestion des cabinets médicaux
- **Fonctionnalités** :
  - Création de cabinet (réservé au SUPER_ADMIN)
  - Mise à jour de cabinet (réservé à l'admin du cabinet)
  - Liste de tous les cabinets
  - Upload de logo
- **Modèles** :
  - `Cabinet` : Informations du cabinet (nom, adresse, email, téléphone, logo, superAdminId)
- **Fichiers clés** :
  - `controller/CabinetController.java` : Endpoints REST
  - `service/CabinetService.java` : Logique métier
  - `repository/CabinetRepository.java` : Accès aux données
  - `security/JWTService.java` : Validation JWT pour les autorisations

### 5. **Patient Medical Service** (`patient-medical-service`)
- **Port** : 8084
- **Base de données** : `patient_medical_db`
- **Rôle** : Gestion des patients, dossiers médicaux, consultations et factures
- **Fonctionnalités** :
  - **Patients** : CRUD complet
  - **Dossiers médicaux** : 
    - Antécédents médicaux/chirurgicaux
    - Allergies
    - Traitements en cours
    - Habitudes
    - Documents médicaux (liste d'URLs)
  - **Consultations** :
    - Type, date, examen clinique
    - Diagnostic, traitement, observations
    - Liée à un dossier médical et un rendez-vous
  - **Factures** : Liées aux consultations
  - **Documents** : Gestion des documents médicaux
- **Modèles** :
  - `Patient` : Informations patient (CIN unique, nom, prénom, sexe, téléphone, mutuelle, date de naissance)
  - `DossierMedical` : Dossier médical complet avec relations
  - `Consultation` : Consultation médicale
  - `Facture` : Facturation
- **Contrôleurs** :
  - `PatientController.java`
  - `DossierMedicalController.java`
  - `ConsultationController.java`
  - `FactureController.java`
  - `DocumentController.java`
- **Services** :
  - `PatientService.java`
  - `DossierMedicalService.java`
  - `ConsultationService.java`
  - `FactureService.java`
  - `DocumentSyncService.java` : Synchronisation avec file-service

### 6. **Rendez-vous Service** (`rendezvous-service`)
- **Port** : 8085
- **Base de données** : `rendezvous_db`
- **Rôle** : Gestion des rendez-vous médicaux
- **Fonctionnalités** :
  - Création, modification, annulation de rendez-vous
  - Gestion des statuts (EN_ATTENTE, CONFIRME, ANNULE, TERMINE)
  - Association avec patient, médecin, secrétaire, consultation
- **Modèles** :
  - `RendezVous` : Rendez-vous avec date, heures, statut, motif, remarque
  - `StatutRendezVous` : Enum des statuts
- **Fichiers clés** :
  - `controller/RendezVousController.java`
  - `service/RendezVousService.java`
  - `repository/RendezVousRepository.java`

### 7. **File Service** (`file-service`)
- **Port** : 8083
- **Base de données** : `file_service`
- **Rôle** : Gestion des fichiers (upload, téléchargement, stockage)
- **Fonctionnalités** :
  - Upload de fichiers (max 20MB)
  - Stockage dans le dossier `uploads`
  - Métadonnées des fichiers en base de données
- **Configuration** :
  - `file.storage.location=uploads` : Dossier de stockage
  - `spring.servlet.multipart.max-file-size=20MB`
  - `spring.servlet.multipart.max-request-size=20MB`

### 8. **Notification Service** (`notification-service`)
- **Rôle** : Service de notifications (configuration minimale actuellement)
- **Note** : Service présent mais peu développé

---

## 🎨 Frontend Angular

### Structure
- **Framework** : Angular 21.0.0
- **Port de développement** : 4200
- **Proxy** : Configuration pour rediriger `/auth` vers `http://localhost:8080`

### Modules et Composants

#### Pages Publiques
- `home` : Page d'accueil
- `login` : Page de connexion
- `medecins` : Liste des médecins
- `service` : Présentation des services
- `rend-rdv` : Prise de rendez-vous

#### Espace Secrétaire (`secritaire/`)
- `secretary-dashboard` : Tableau de bord
- `patient` : Gestion des patients
- `prend-rdv` : Prise de rendez-vous
- `attent` : Liste d'attente
- `facture` : Gestion des factures

#### Espace Médecin (`medecin/`)
- `dashboard` : Tableau de bord
- `agenda` : Calendrier des rendez-vous (FullCalendar)
- `patients` : Liste des patients
- `consultation` : Gestion des consultations
- `prescriptions` : Prescriptions médicales
- `dossier-medical` : Consultation des dossiers médicaux

#### Espace Admin (`Admin/`)
- `admin-dashboard` : Tableau de bord administrateur
- `admin-cabinet` : Gestion des cabinets
- `admin-medecins` : Gestion des médecins
- `admin-secritaires` : Gestion des secrétaires

#### Composants Partagés
- `header` : En-tête principal
- `footer` : Pied de page
- `dossier-medical` : Composant réutilisable pour les dossiers

#### Services Angular
- `auth.ts` : Service d'authentification
- `cabinet.ts` : Service pour les cabinets
- `patient.ts` : Service pour les patients
- `consultation.ts` : Service pour les consultations
- `dossier-medical.ts` : Service pour les dossiers médicaux
- `rendez-vous.ts` : Service pour les rendez-vous

#### Modèles TypeScript
- `patient.model.ts`
- `medecin.model.ts`
- `cabinet.ts`
- `consultation.model.ts`
- `dossier-medical.model.ts`

### Bibliothèques Utilisées
- **FullCalendar** : Calendrier pour l'agenda
- **FontAwesome** : Icônes
- **RxJS** : Programmation réactive
- **Express** : Serveur SSR (Server-Side Rendering)

---

## 🔐 Sécurité

### Authentification JWT
- **Token** : JWT avec informations utilisateur (username, role, cabinetId)
- **Validation** : 
  - Au niveau de l'API Gateway pour toutes les routes sécurisées
  - Au niveau des services pour les autorisations spécifiques
- **Headers** : 
  - `Authorization: Bearer <token>`
  - `X-Auth-User` et `X-Auth-Roles` ajoutés par le Gateway

### Rôles
1. **SUPER_ADMIN** : Accès complet, peut créer des cabinets
2. **ADMIN_CABINET** : Administration d'un cabinet spécifique
3. **MEDECIN** : Accès aux consultations, dossiers médicaux, patients
4. **SECRETAIRE** : Gestion des rendez-vous, patients, factures

### Autorisations
- Création de cabinet : SUPER_ADMIN uniquement
- Modification de cabinet : ADMIN_CABINET du cabinet concerné
- Accès aux données : Basé sur le `cabinetId` de l'utilisateur

---

## 🗄️ Bases de Données

Chaque microservice a sa propre base de données MySQL :

1. **auth_db** : Utilisateurs et authentification
2. **cabinet_service** : Cabinets médicaux
3. **patient_medical_db** : Patients, dossiers médicaux, consultations, factures
4. **rendezvous_db** : Rendez-vous
5. **file_service** : Métadonnées des fichiers

**Configuration commune** :
- **Username** : root
- **Password** : PHW#84#jeor
- **Hibernate** : `ddl-auto=update` (mise à jour automatique du schéma)

---

## 🔄 Communication Inter-Services

### WebClient
Les services utilisent `WebClient` (Spring WebFlux) pour communiquer entre eux :
- `FileClient` : Communication avec file-service
- `FileServiceClient` : Client pour les fichiers dans patient-medical-service

### Service Discovery
- Tous les services s'enregistrent auprès d'Eureka
- L'API Gateway utilise la découverte de services pour router les requêtes
- Format : `lb://service-name` (load balancing)

---

## 📦 Technologies et Dépendances

### Backend
- **Spring Boot** : 3.3.3
- **Spring Cloud** : 2023.0.3
- **Java** : 17
- **MySQL Connector** : Pour la connexion à MySQL
- **Lombok** : Réduction du code boilerplate
- **JWT** : jjwt 0.11.5
- **Spring Security** : Authentification et autorisation
- **Spring Data JPA** : Accès aux données
- **Spring WebFlux** : Communication réactive entre services
- **Zipkin** : Tracing distribué
- **Micrometer** : Métriques

### Frontend
- **Angular** : 21.0.0
- **TypeScript** : 5.9.2
- **RxJS** : 7.8.0
- **FullCalendar** : 6.1.19
- **FontAwesome** : 6.4.0

---

## 📁 Structure des Fichiers

```
cabinet-medical/
├── api-gateway/          # API Gateway
├── auth-service/         # Service d'authentification
├── cabinet-service/      # Service de gestion des cabinets
├── patient-medical-service/  # Service médical principal
├── rendezvous-service/   # Service de rendez-vous
├── file-service/         # Service de fichiers
├── notification-service/ # Service de notifications
├── discovry-service/     # Service Discovery (Eureka)
├── medical-clinic-frontend/ # Application Angular
├── uploads/            # Fichiers uploadés
├── pom.xml             # POM parent Maven
└── README.md           # Documentation (minimale)
```

---

## 🚀 Points d'Entrée

### Backend
1. **Discovery Service** : `http://localhost:8761`
2. **API Gateway** : `http://localhost:8080`
3. **Auth Service** : Via Gateway `/auth/**`
4. **Cabinet Service** : Port 8081 ou via Gateway `/api/cabinet/**`
5. **Patient Medical Service** : Port 8084 ou via Gateway
6. **Rendez-vous Service** : Port 8085 ou via Gateway `/api/RendezVous/**`
7. **File Service** : Port 8083 ou via Gateway `/files/**`

### Frontend
- **Application** : `http://localhost:4200`
- **Proxy** : Redirige `/auth` vers `http://localhost:8080`

---

## ⚠️ Points d'Attention

1. **Sécurité** :
   - Mot de passe MySQL en clair dans les fichiers de configuration
   - Pas de chiffrement des données sensibles
   - Tokens JWT stockés dans localStorage (vulnérable au XSS)

2. **Configuration** :
   - Ports et URLs en dur dans certains endroits
   - Pas de configuration par environnement (dev/prod)

3. **Notification Service** :
   - Service présent mais peu développé

4. **Tests** :
   - Structure de tests présente mais peu de tests implémentés

5. **Documentation** :
   - README minimal
   - Pas de documentation API (Swagger/OpenAPI)

6. **Gestion d'erreurs** :
   - `GlobalExceptionHandler` présent dans auth-service
   - Pas uniformisé dans tous les services

---

## 🔍 Fichiers Clés à Examiner

### Backend
- `api-gateway/src/main/java/org/cabinet/apigateway/security/AuthenticationFilter.java`
- `auth-service/src/main/java/com/example/auth_service/service/AuthService.java`
- `auth-service/src/main/java/com/example/auth_service/security/SecurityConfig.java`
- `patient-medical-service/src/main/java/com/exemple/patient_medical_service/service/DossierMedicalService.java`

### Frontend
- `medical-clinic-frontend/src/app/services/auth.ts`
- `medical-clinic-frontend/src/app/app.routes.ts`
- `medical-clinic-frontend/src/app/medecin/agenda/agenda.ts`

---

## 📊 Statistiques du Projet

- **Microservices** : 8 services
- **Bases de données** : 5 bases MySQL
- **Composants Angular** : ~27 composants
- **Services Angular** : 6 services
- **Contrôleurs REST** : ~10 contrôleurs
- **Modèles JPA** : ~10 entités
- **Technologies principales** : Spring Boot, Angular, MySQL, JWT, Eureka

---

## 🎯 Fonctionnalités Principales

1. ✅ Authentification et autorisation multi-rôles
2. ✅ Gestion des cabinets médicaux
3. ✅ Gestion des patients
4. ✅ Dossiers médicaux complets
5. ✅ Consultations médicales
6. ✅ Rendez-vous avec statuts
7. ✅ Facturation
8. ✅ Upload de fichiers (images, documents)
9. ✅ Interface multi-utilisateurs (Admin, Médecin, Secrétaire)
10. ✅ Agenda médical (FullCalendar)

---

## 📝 Notes de Développement

- Le projet utilise **Lombok** pour réduire le code boilerplate
- **Hibernate** est configuré en mode `update` pour la génération automatique des schémas
- Les services utilisent **WebClient** pour la communication asynchrone
- Le frontend utilise le **lazy loading** pour les routes Angular
- **Zipkin** est configuré pour le tracing distribué (nécessite un serveur Zipkin sur le port 9411)

---

*Analyse effectuée le : $(date)*
*Version du projet : 1.0-SNAPSHOT*

