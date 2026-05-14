package com.talentbridge.api;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {

  static {
    // Load .env file at startup
    Dotenv dotenv = Dotenv
      .configure()
      .directory(".")
      .ignoreIfMissing()
      .load();
    
    // Set all env vars from .env into System properties for Spring to access
    dotenv.entries().forEach(entry ->
      System.setProperty(entry.getKey(), entry.getValue())
    );
  }
}
