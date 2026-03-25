package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
	"github.com/khoa-nguyendang/portfolio/backend/internal/config"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/database"
	"github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/email"
	"github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/llm"
	"github.com/khoa-nguyendang/portfolio/backend/internal/interface/http/router"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Configure zerolog.
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).
		With().Timestamp().Caller().Logger()

	// Load configuration.
	cfg := config.Load()

	// Connect to PostgreSQL.
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	// Run migrations.
	migrationsDir := "migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = "/migrations" // Docker path
	}
	if err := database.RunMigrations(db, migrationsDir); err != nil {
		log.Fatal().Err(err).Msg("Failed to run migrations")
	}

	// Repositories.
	userRepo := database.NewUserRepo(db)
	postRepo := database.NewPostRepo(db)
	translationRepo := database.NewTranslationRepo(db)
	categoryRepo := database.NewCategoryRepo(db)
	contactRepo := database.NewContactRepo(db)
	siteConfigRepo := database.NewSiteConfigRepo(db)

	// Infrastructure clients.
	emailClient := email.NewResendClient(cfg.ResendAPIKey, cfg.ResendFromEmail)
	llmClient := llm.NewClient(cfg.LLMApiURL, cfg.LLMApiKey)

	// Application services.
	authService := service.NewAuthService(userRepo, cfg)
	postService := service.NewPostService(postRepo)
	translationService := service.NewTranslationService(translationRepo, postRepo, llmClient)
	categoryService := service.NewCategoryService(categoryRepo)
	contactService := service.NewContactService(contactRepo, emailClient, cfg.AdminEmail)
	configService := service.NewSiteConfigService(siteConfigRepo)

	// Seed default admin user if not exists.
	seedAdminUser(userRepo, cfg)

	// Setup router.
	r := router.Setup(router.Deps{
		DB:              db,
		AuthService:     authService,
		PostService:     postService,
		TransService:    translationService,
		CategoryService: categoryService,
		ContactService:  contactService,
		ConfigService:   configService,
		PostRepo:        postRepo,
		ContactRepo:     contactRepo,
		UserRepo:        userRepo,
		FrontendURL:     cfg.FrontendURL,
		AllowedOrigins:  cfg.AllowedOrigins,
	})

	// Create HTTP server.
	srv := &http.Server{
		Addr:         ":" + cfg.ServerPort,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine.
	go func() {
		log.Info().Str("port", cfg.ServerPort).Msg("Starting server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failed")
		}
	}()

	// Graceful shutdown.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited cleanly")
}

// seedAdminUser creates the initial admin user from environment variables if not exists.
func seedAdminUser(userRepo *database.UserRepo, cfg *config.Config) {
	ctx := context.Background()
	_, err := userRepo.FindByEmail(ctx, cfg.AdminEmail)
	if err == nil {
		log.Info().Str("email", cfg.AdminEmail).Msg("Admin user already exists")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Error().Err(err).Msg("Failed to hash admin password")
		return
	}

	now := time.Now()
	admin := &entity.User{
		ID:           uuid.New().String(),
		Email:        cfg.AdminEmail,
		PasswordHash: string(hash),
		Name:         "Khoa Nguyen Dang",
		Role:         entity.RoleAdmin,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Error().Err(err).Msg("Failed to create admin user")
		return
	}
	log.Info().Str("email", cfg.AdminEmail).Msg("Default admin user created")
}

func init() {
	_ = fmt.Sprintf
}
