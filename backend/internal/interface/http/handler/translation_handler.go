package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
)

// TranslationHandler handles translation-related endpoints.
type TranslationHandler struct {
	translationService *service.TranslationService
	postService        *service.PostService
}

// NewTranslationHandler creates a new TranslationHandler.
func NewTranslationHandler(translationService *service.TranslationService, postService *service.PostService) *TranslationHandler {
	return &TranslationHandler{
		translationService: translationService,
		postService:        postService,
	}
}

// GetTranslation returns a translation for a post by slug and language.
// GET /api/posts/:slug/translations/:lang
func (h *TranslationHandler) GetTranslation(c *gin.Context) {
	slug := c.Param("slug")
	lang := c.Param("lang")

	post, err := h.postService.GetPost(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	translation, err := h.translationService.GetTranslation(c.Request.Context(), post.ID, lang)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Translation not found"})
		return
	}

	c.JSON(http.StatusOK, dto.ToTranslationResponse(translation))
}

// TranslatePost triggers translation of a post to specified languages.
// POST /api/admin/posts/:id/translate
func (h *TranslationHandler) TranslatePost(c *gin.Context) {
	postID := c.Param("id")

	var req dto.TranslateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Run translation synchronously via the LLM API.
	translations, err := h.translationService.TranslatePost(c.Request.Context(), postID, req.TargetLanguages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	results := make([]dto.TranslationResponse, len(translations))
	for i, t := range translations {
		results[i] = dto.ToTranslationResponse(t)
	}

	c.JSON(http.StatusOK, gin.H{"translations": results})
}

// ListTranslations returns all translations for a post.
// GET /api/admin/posts/:id/translations
func (h *TranslationHandler) ListTranslations(c *gin.Context) {
	postID := c.Param("id")

	translations, err := h.translationService.ListTranslations(c.Request.Context(), postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list translations"})
		return
	}

	result := make([]dto.TranslationResponse, len(translations))
	for i, t := range translations {
		result[i] = dto.ToTranslationResponse(t)
	}

	c.JSON(http.StatusOK, result)
}
