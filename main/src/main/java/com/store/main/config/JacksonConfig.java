package com.store.main.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Jackson configuration to handle Hibernate lazy-loaded entities and Java 8 date/time.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        // Create Hibernate6Module and configure it
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        // Force lazy-loaded properties to be included (they will be null if not loaded)
        hibernate6Module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        // Serialize identifier for entities
        hibernate6Module.configure(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS, true);

        // Build ObjectMapper with Hibernate and Java Time modules
        return Jackson2ObjectMapperBuilder.json()
                .modules(hibernate6Module, new JavaTimeModule())
                .build();
    }
}
