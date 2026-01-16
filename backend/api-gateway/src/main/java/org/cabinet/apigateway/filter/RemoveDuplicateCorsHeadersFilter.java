package org.cabinet.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Filtre pour supprimer les headers CORS en double des services en aval
 * car l'API Gateway gère déjà CORS
 */
@Component
public class RemoveDuplicateCorsHeadersFilter extends AbstractGatewayFilterFactory<RemoveDuplicateCorsHeadersFilter.Config> {

    public RemoveDuplicateCorsHeadersFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                var response = exchange.getResponse();
                HttpHeaders headers = response.getHeaders();
                
                // Supprimer les headers CORS des services en aval
                // L'API Gateway gère déjà CORS via CorsWebFilter
                headers.remove("Access-Control-Allow-Origin");
                headers.remove("Access-Control-Allow-Methods");
                headers.remove("Access-Control-Allow-Headers");
                headers.remove("Access-Control-Allow-Credentials");
                headers.remove("Access-Control-Expose-Headers");
                headers.remove("Access-Control-Max-Age");
            }));
        };
    }

    public static class Config {
            public Config() {
            // Constructeur par défaut explicite pour éviter l'erreur implicite explicitement
            super();
        }
    }
}

