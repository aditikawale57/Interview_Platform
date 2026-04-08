package com.interviewPlatform.filters;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.interviewPlatform.repositories.BlackListedTokenRepository;
import com.interviewPlatform.services.Impl.CustomUserDetailsService;
import com.interviewPlatform.services.Impl.JWTService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter{

    @Autowired
    private JWTService jwtService;

    @Autowired
    ApplicationContext context;

    @Autowired
    private BlackListedTokenRepository blackListedTokenRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

                String path = request.getServletPath();

            // Skip JWT filter for public endpoints
            if (path.equals("/login") || path.equals("/register") || path.equals("/refresh") || path.equals("/logout")) {
                filterChain.doFilter(request, response);
                return;
            }

                
       String authHeader=request.getHeader("Authorization");
       String token=null;
       String username=null;

       if(authHeader != null && authHeader.startsWith("Bearer ")){
        token=authHeader.substring(7);

        // 1. Check blacklist FIRST
        if (blackListedTokenRepository.existsByToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token is blacklisted. Please login again.");
            return;
        }
        try {
            username = jwtService.extractUserName(token);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token expired or invalid\"}");
            return;
        }
       }

       if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){

        UserDetails userDetails=context.getBean(CustomUserDetailsService.class).loadUserByUsername(username);

        if(jwtService.validateToken(token,userDetails )){
            UsernamePasswordAuthenticationToken authToken= new UsernamePasswordAuthenticationToken(userDetails, null,userDetails.getAuthorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
       }

       filterChain.doFilter(request, response);

    }

}
