package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

// Config holds all application configuration.
type Config struct {
	ServerPort  string
	DatabaseURL string

	JWTSecret string
	JWTExpiry time.Duration

	ResendAPIKey    string
	ResendFromEmail string

	LLMApiURL string
	LLMApiKey string

	FrontendURL string

	AllowedOrigins []string

	AdminEmail    string
	AdminPassword string
}

// Load reads configuration from environment variables, with an optional .env file.
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, reading config from environment")
	}

	jwtExpiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY", "24"))
	if err != nil {
		jwtExpiryHours = 24
	}

	return &Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/portfolio?sslmode=disable"),

		JWTSecret: getEnv("JWT_SECRET", "change-me-in-production"),
		JWTExpiry: time.Duration(jwtExpiryHours) * time.Hour,

		ResendAPIKey:    getEnv("RESEND_API_KEY", ""),
		ResendFromEmail: getEnv("RESEND_FROM_EMAIL", "noreply@example.com"),

		LLMApiURL: getEnv("LLM_API_URL", ""),
		LLMApiKey: getEnv("LLM_API_KEY", ""),

		FrontendURL: getEnv("FRONTEND_URL", "http://frontend:3000"),

		AllowedOrigins: strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000"), ","),

		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@example.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "changeme"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
