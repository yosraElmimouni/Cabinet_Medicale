# Solution Temporaire - Sans Eureka


## Modifications effectuées

Pour contourner le problème de service discovery avec Eureka, j'ai configuré une solution temporaire qui permet de tester l'application sans avoir besoin d'Eureka.

### 1. auth-service
- **Port fixe** : `8082` (au lieu de port aléatoire `0`)
- **Eureka désactivé** : Commenté dans `application.properties`

### 2. API Gateway
- **URL directe** : `http://localhost:8082` (au lieu de `lb://auth-service`)
- Plus besoin de résoudre le service via Eureka

## Avantages
- ✅ Fonctionne immédiatement sans configuration Eureka
- ✅ Plus simple pour le développement
- ✅ Pas besoin de démarrer Eureka Discovery Service

## Inconvénients
- ❌ Pas de load balancing (un seul instance)
- ❌ Pas de service discovery automatique
- ❌ Solution temporaire uniquement

## Pour tester

1. **Démarrer auth-service** :
   ```bash
   cd auth-service
   mvn spring-boot:run
   ```
   Vérifier qu'il démarre sur le port **8082**

2. **Démarrer l'API Gateway** :
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```
   Vérifier qu'il démarre sur le port **8080**

3. **Tester la connexion** depuis le frontend Angular

## Pour revenir à Eureka (production)

1. Dans `auth-service/src/main/resources/application.properties` :
   ```properties
   server.port=0
   eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
   ```

2. Dans `api-gateway/src/main/resources/application.properties` :
   ```properties
   spring.cloud.gateway.routes[4].uri=lb://auth-service
   ```

3. Démarrer Eureka Discovery Service en premier
4. Démarrer auth-service
5. Démarrer l'API Gateway

## Vérification

Pour vérifier que auth-service fonctionne directement :
```bash
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admincab03","password":"AdminCab@1234"}'
```

Si cela fonctionne, l'API Gateway devrait aussi fonctionner maintenant.

