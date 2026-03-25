package router

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
	"github.com/khoa-nguyendang/portfolio/backend/internal/interface/http/handler"
	"github.com/khoa-nguyendang/portfolio/backend/internal/interface/http/middleware"
)

// Deps groups the dependencies needed to set up routing.
type Deps struct {
	DB              *sql.DB
	AuthService     *service.AuthService
	PostService     *service.PostService
	TransService    *service.TranslationService
	CategoryService *service.CategoryService
	ContactService  *service.ContactService
	ConfigService   *service.SiteConfigService
	PostRepo        repository.PostRepository
	ContactRepo     repository.ContactRepository
	UserRepo        repository.UserRepository
	FrontendURL     string
	AllowedOrigins  []string
}

// Setup configures and returns a gin.Engine with all routes and middleware.
func Setup(deps Deps) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Global middleware.
	r.Use(gin.Recovery())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORSMiddleware(deps.AllowedOrigins))

	// Handlers.
	authHandler := handler.NewAuthHandler(deps.AuthService, deps.UserRepo)
	postHandler := handler.NewPostHandler(deps.PostService, deps.FrontendURL)
	translationHandler := handler.NewTranslationHandler(deps.TransService, deps.PostService)
	categoryHandler := handler.NewCategoryHandler(deps.CategoryService)
	contactHandler := handler.NewContactHandler(deps.ContactService)
	configHandler := handler.NewSiteConfigHandler(deps.ConfigService)
	dashboardHandler := handler.NewDashboardHandler(deps.PostRepo, deps.ContactRepo)
	healthHandler := handler.NewHealthHandler(deps.DB)

	// Health endpoints.
	r.GET("/health", healthHandler.Health)

	api := r.Group("/api")
	{
		// Health readiness.
		api.GET("/health/ready", healthHandler.Ready)

		// Auth.
		// Login rate limited: 5 attempts per minute per IP.
		api.POST("/auth/login", middleware.RateLimitMiddleware(0.083, 5), authHandler.Login)
		api.GET("/auth/me", middleware.AuthMiddleware(deps.AuthService), authHandler.Me)

		// Public posts (optional auth to allow admins to see draft posts).
		api.GET("/posts", middleware.OptionalAuthMiddleware(deps.AuthService), postHandler.ListPosts)
		api.GET("/posts/:slug", middleware.OptionalAuthMiddleware(deps.AuthService), postHandler.GetPost)
		api.GET("/posts/:slug/translations/:lang", translationHandler.GetTranslation)

		// Public categories.
		api.GET("/categories", categoryHandler.ListCategories)

		// Public contact form (rate limited: 2 requests per minute per IP).
		api.POST("/contact", middleware.RateLimitMiddleware(0.033, 2), contactHandler.CreateContact)

		// Public site config.
		api.GET("/site-config", configHandler.GetPublicConfigs)

		// Admin routes (all require authentication).
		admin := api.Group("/admin", middleware.AuthMiddleware(deps.AuthService))
		{
			// Dashboard.
			admin.GET("/dashboard/stats", dashboardHandler.Stats)

			// Auth.
			admin.PUT("/auth/password", authHandler.ChangePassword)

			// Posts.
			admin.POST("/posts", postHandler.CreatePost)
			admin.PUT("/posts/:id", postHandler.UpdatePost)
			admin.DELETE("/posts/:id", postHandler.DeletePost)

			// Translations.
			admin.POST("/posts/:id/translate", translationHandler.TranslatePost)
			admin.GET("/posts/:id/translations", translationHandler.ListTranslations)

			// Categories.
			admin.POST("/categories", categoryHandler.CreateCategory)
			admin.PUT("/categories/:id", categoryHandler.UpdateCategory)
			admin.DELETE("/categories/:id", categoryHandler.DeleteCategory)

			// Contacts.
			admin.GET("/contacts", contactHandler.ListContacts)
			admin.PUT("/contacts/:id/read", contactHandler.MarkAsRead)

			// Site config.
			admin.GET("/site-config", configHandler.GetAllConfigs)
			admin.PUT("/site-config", configHandler.UpdateConfigs)
		}
	}

	return r
}
