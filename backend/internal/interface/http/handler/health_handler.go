package handler

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	infradb "github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/database"
)

// HealthHandler handles health check endpoints.
type HealthHandler struct {
	db *sql.DB
}

// NewHealthHandler creates a new HealthHandler.
func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// Health returns a simple alive check.
// GET /health
func (h *HealthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Ready checks all dependent services are reachable.
// GET /api/health/ready
func (h *HealthHandler) Ready(c *gin.Context) {
	checks := make(map[string]string)
	healthy := true

	// Check database.
	if err := infradb.HealthCheck(h.db); err != nil {
		checks["database"] = "unhealthy: " + err.Error()
		healthy = false
	} else {
		checks["database"] = "healthy"
	}

	status := http.StatusOK
	if !healthy {
		status = http.StatusServiceUnavailable
	}

	c.JSON(status, gin.H{
		"status": map[bool]string{true: "ready", false: "degraded"}[healthy],
		"checks": checks,
	})
}
