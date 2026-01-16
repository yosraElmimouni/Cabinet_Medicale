# Documentation CI/CD et Conteneurisation Docker





Ce document décrit la mise en place du pipeline d'intégration et de livraison continues (CI/CD) et la conteneurisation Docker pour le projet de gestion de cabinet médical.

## 1. Architecture du Projet

Le projet est une application microservices basée sur **Spring Boot** pour le backend et **Angular** pour le frontend.

| Composant | Technologie | Outil de Build | Langage |
| :--- | :--- | :--- | :--- |
| **Backend** | Spring Boot (Microservices) | Maven | Java 17 |
| **Frontend** | Angular | npm | TypeScript/JavaScript |

Le backend est composé des microservices suivants, qui utilisent une base de données **MySQL**:
* `discovry-service` (Eureka Server)
* `api-gateway`
* `auth-service`
* `cabinet-service`
* `patient-medical-service`
* `rendezvous-service`
* `notification-service`
* `file-service`

## 2. Conteneurisation Docker

La conteneurisation permet d'exécuter l'application de manière isolée et reproductible.

### 2.1. Fichiers Dockerfile

*   **Backend (`backend/Dockerfile`)**: Un Dockerfile multi-étapes est utilisé pour construire tous les microservices Spring Boot. L'étape de build utilise Maven pour compiler et empaqueter les JARs, et l'étape finale utilise une image JRE légère pour l'exécution.
*   **Frontend (`frontend/Dockerfile`)**: Un Dockerfile multi-étapes est utilisé pour construire l'application Angular et la servir via un serveur **Nginx** léger.

### 2.2. Orchestration avec Docker Compose

Le fichier `docker-compose.yml` à la racine du projet permet de démarrer l'ensemble de l'environnement de développement local, incluant les services d'application et les dépendances (MySQL, SonarQube).

**Pour démarrer l'application localement:**

1.  Assurez-vous d'être à la racine du projet.
2.  Exécutez la commande:
    ```bash
    docker-compose up --build
    ```

**Services exposés:**

| Service | Port Local | Description |
| :--- | :--- | :--- |
| **MySQL** | `3306` | Base de données relationnelle. |
| **Eureka Server** | `8761` | Serveur de découverte de services. |
| **API Gateway** | `8080` | Point d'entrée unique pour le frontend. |
| **Frontend** | `4200` | Application Angular (servie par Nginx). |
| **SonarQube** | `9000` | Plateforme d'analyse de la qualité du code. |

## 3. Pipeline CI/CD avec GitHub Actions et SonarQube

Deux workflows GitHub Actions ont été créés pour automatiser les tests, l'analyse de la qualité du code (SonarQube) et la construction des images Docker.

### 3.1. Prérequis

Pour que les pipelines fonctionnent, vous devez configurer les **Secrets** suivants dans votre dépôt GitHub:

| Secret | Description |
| :--- | :--- |
| `SONAR_TOKEN` | Jeton d'authentification généré depuis votre instance SonarQube. |
| `SONAR_HOST_URL` | URL de votre instance SonarQube (ex: `https://sonarqube.monentreprise.com` ou `http://localhost:9000`). |

### 3.2. Pipeline Backend (`.github/workflows/backend-ci.yml`)

Ce pipeline est déclenché sur les changements dans le dossier `backend/`.

**Étapes clés:**

1.  **Checkout**: Récupère le code.
2.  **Setup JDK 17**: Configure l'environnement Java.
3.  **Build and Analyze with SonarQube**:
    *   Exécute `mvn verify` pour les tests unitaires et l'empaquetage.
    *   Lance l'analyse SonarQube pour la qualité du code Java.
4.  **Build Docker Images**: Construit les images Docker pour les microservices (cette étape est à adapter pour un push vers un registre d'images).

### 3.3. Pipeline Frontend (`.github/workflows/frontend-ci.yml`)

Ce pipeline est déclenché sur les changements dans le dossier `frontend/`.

**Étapes clés:**

1.  **Setup Node.js**: Configure l'environnement Node.js.
2.  **Install dependencies**: Installe les dépendances npm.
3.  **Run Tests with Coverage**: Exécute les tests Angular et génère un rapport de couverture.
4.  **SonarQube Scan**: Lance l'analyse SonarQube en utilisant le rapport de couverture pour inclure les métriques de test.
5.  **Build Docker Image**: Construit l'image Docker du frontend.

---
*Ce document a été généré par Manus AI.*
