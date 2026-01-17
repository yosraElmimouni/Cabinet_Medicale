# Étape de build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copier le pom.xml racine
COPY pom.xml .

# Copier tous les modules nécessaires pour le build
COPY auth-service auth-service
COPY cabinet-service cabinet-service
COPY patient-medical-service patient-medical-service
COPY rendezvous-service rendezvous-service
COPY notification-service notification-service
COPY file-service file-service
COPY discovry-service discovry-service
COPY api-gateway api-gateway

# Build de tous les modules
RUN mvn clean package -DskipTests

# Étape finale
FROM eclipse-temurin:17-jre-jammy

# Créer un utilisateur non-root pour la sécurité (SonarQube S6471)
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

WORKDIR /app
ARG SERVICE_NAME

# Copier le jar construit depuis l'étape de build
COPY --from=build --chown=spring:spring /app/${SERVICE_NAME}/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
