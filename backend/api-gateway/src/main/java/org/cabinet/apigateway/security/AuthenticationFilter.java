package org.cabinet.apigateway.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator routeValidator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
        // Ajoutez des propriétés de configuration si nécessaire
        
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Ignorer les requêtes OPTIONS (preflight CORS)
            if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
                return chain.filter(exchange);
            }

            // Si la route est sécurisée
            if (routeValidator.isSecured.test(exchange.getRequest())) {

                // Vérifier que le header Authorization existe
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return unauthorized(exchange);
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

                // Vérifier que c'est un Bearer token
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return unauthorized(exchange);
                }

                String token = authHeader.substring(7);

                try {
                    // Validation du JWT
                    jwtUtil.validateToken(token);
                    
                    // Extraire les informations pour les passer aux microservices
                    String username = jwtUtil.getClaims(token).getSubject();
                    String role = jwtUtil.getRole(token);
                    Long userId = jwtUtil.getUserId(token);
                    System.out.println("GATEWAY role = " + role);
                    System.out.println("GATEWAY userId = " + userId);
                    
                    // Ajouter les headers pour les services en aval
                    ServerWebExchange mutatedExchange = exchange.mutate()
                            .request(exchange.getRequest().mutate()
                                    .header("X-Auth-User", username)
                                    .header("X-Auth-Roles", role)
                                    .header("X-Auth-UserId", String.valueOf(userId))
                                    .build())
                            .build();
                    return chain.filter(mutatedExchange);
                            
                } catch (Exception e) {
                    return unauthorized(exchange);
                }
            } else {
                return chain.filter(exchange);
            }
        };
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
