package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
)

// DashboardHandler handles dashboard endpoints.
type DashboardHandler struct {
	postRepo    repository.PostRepository
	contactRepo repository.ContactRepository
}

// NewDashboardHandler creates a new DashboardHandler.
func NewDashboardHandler(postRepo repository.PostRepository, contactRepo repository.ContactRepository) *DashboardHandler {
	return &DashboardHandler{postRepo: postRepo, contactRepo: contactRepo}
}

// Stats returns dashboard statistics.
// GET /api/admin/dashboard/stats
func (h *DashboardHandler) Stats(c *gin.Context) {
	ctx := c.Request.Context()

	totalPublished, _ := h.postRepo.CountByStatus(ctx, "published")
	totalDraft, _ := h.postRepo.CountByStatus(ctx, "draft")
	totalArchived, _ := h.postRepo.CountByStatus(ctx, "archived")
	totalPosts := totalPublished + totalDraft + totalArchived

	unreadContacts, _ := h.contactRepo.CountUnread(ctx)

	// Recent posts (last 5).
	recentPosts, _, _ := h.postRepo.List(ctx, repository.PostFilter{}, 0, 5)
	postResponses := make([]dto.PostResponse, len(recentPosts))
	for i, p := range recentPosts {
		postResponses[i] = dto.ToPostResponse(p)
	}

	// Recent contacts (last 5).
	recentContacts, _, _ := h.contactRepo.List(ctx, 0, 5)
	contactResponses := make([]dto.ContactResponse, len(recentContacts))
	for i, ct := range recentContacts {
		contactResponses[i] = dto.ToContactResponse(ct)
	}

	c.JSON(http.StatusOK, gin.H{
		"total_posts":      totalPosts,
		"published_posts":  totalPublished,
		"draft_posts":      totalDraft,
		"unread_contacts":  unreadContacts,
		"recent_posts":     postResponses,
		"recent_contacts":  contactResponses,
	})
}
