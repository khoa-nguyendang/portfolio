package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
)

// SiteConfigHandler handles site configuration endpoints.
type SiteConfigHandler struct {
	configService *service.SiteConfigService
}

// NewSiteConfigHandler creates a new SiteConfigHandler.
func NewSiteConfigHandler(configService *service.SiteConfigService) *SiteConfigHandler {
	return &SiteConfigHandler{configService: configService}
}

// GetPublicConfigs returns publicly visible site config entries.
// GET /api/site-config
func (h *SiteConfigHandler) GetPublicConfigs(c *gin.Context) {
	configs, err := h.configService.GetPublicConfigs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get site config"})
		return
	}

	result := make([]dto.SiteConfigResponse, len(configs))
	for i, cfg := range configs {
		result[i] = dto.SiteConfigResponse{Key: cfg.Key, Value: cfg.Value}
	}

	c.JSON(http.StatusOK, result)
}

// GetAllConfigs returns all site config entries (admin only).
// GET /api/admin/site-config
func (h *SiteConfigHandler) GetAllConfigs(c *gin.Context) {
	configs, err := h.configService.GetAllConfigs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get site config"})
		return
	}

	result := make([]dto.SiteConfigResponse, len(configs))
	for i, cfg := range configs {
		result[i] = dto.SiteConfigResponse{Key: cfg.Key, Value: cfg.Value}
	}

	c.JSON(http.StatusOK, result)
}

// UpdateConfigs updates one or more site config entries.
// PUT /api/admin/site-config
func (h *SiteConfigHandler) UpdateConfigs(c *gin.Context) {
	var req dto.UpdateSiteConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	if err := h.configService.SetConfigs(c.Request.Context(), req.Configs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update site config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Site config updated"})
}
