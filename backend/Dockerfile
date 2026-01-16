# Étape de build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Copier tous les modules
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

# Étape finale (Exemple pour un service générique, sera surchargé par docker-compose)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
