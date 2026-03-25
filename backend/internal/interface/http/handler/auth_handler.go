package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
)

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	authService *service.AuthService
	userRepo    repository.UserRepository
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authService *service.AuthService, userRepo repository.UserRepository) *AuthHandler {
	return &AuthHandler{authService: authService, userRepo: userRepo}
}

// Login authenticates a user and returns a JWT token.
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	token, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	user, err := h.userRepo.FindByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	c.JSON(http.StatusOK, dto.TokenResponse{
		Token: token,
		User:  dto.ToUserResponse(user),
	})
}

// ChangePassword updates the authenticated user's password.
// PUT /api/admin/auth/password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	user, err := h.userRepo.FindByID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Verify current password.
	if err := h.authService.ComparePassword(user.PasswordHash, req.CurrentPassword); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash and save new password.
	hash, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	user.PasswordHash = hash
	if err := h.userRepo.Update(c.Request.Context(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// Me returns the currently authenticated user.
// GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, err := h.userRepo.FindByID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, dto.ToUserResponse(user))
}
