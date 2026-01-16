package com.example.cabinet_service.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTService {


    private String secretkey = "w2H8y7f4QkC7l8C80vA8pQ1CfZ8kE9m2qEo4R1j8pOQ=";

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Long extractCabinetId(String token) {
        return extractClaim(token, claims -> claims.get("cabinetId", Long.class));
    }

    public void verifyCabinetAdmin(String authHeader, Integer cabinetId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token manquant");
        }

        String token = authHeader.substring(7);
        String role = extractClaim(token, claims -> claims.get("role", String.class));
        Long tokenCabinetId = extractClaim(token, claims -> claims.get("cabinetId", Long.class));

        if (!"ADMIN_CABINET".equals(role) || !tokenCabinetId.equals(Long.valueOf(cabinetId))) {
            throw new RuntimeException("Accès interdit : admin du cabinet requis");
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
