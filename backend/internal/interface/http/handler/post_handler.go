package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
	"github.com/rs/zerolog/log"
)

// PostHandler handles post-related endpoints.
type PostHandler struct {
	postService  *service.PostService
	frontendURL  string
}

// NewPostHandler creates a new PostHandler.
func NewPostHandler(postService *service.PostService, frontendURL string) *PostHandler {
	return &PostHandler{postService: postService, frontendURL: frontendURL}
}

// ListPosts returns a paginated list of posts.
// GET /api/posts
func (h *PostHandler) ListPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filter := repository.PostFilter{
		Status:     c.Query("status"),
		CategoryID: c.Query("category_id"),
		Tag:        c.Query("tag"),
		Search:     c.Query("search"),
	}

	// Public endpoint: only show published posts unless admin.
	if _, exists := c.Get("user_id"); !exists {
		filter.Status = string(entity.PostStatusPublished)
	}

	result, err := h.postService.ListPosts(c.Request.Context(), filter, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list posts"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetPost returns a single post by slug.
// GET /api/posts/:slug
func (h *PostHandler) GetPost(c *gin.Context) {
	slug := c.Param("slug")

	post, err := h.postService.GetPost(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Public endpoint: only show published posts unless authenticated.
	if _, exists := c.Get("user_id"); !exists {
		if post.Status != entity.PostStatusPublished {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
	}

	c.JSON(http.StatusOK, dto.ToPostResponse(post))
}

// CreatePost creates a new post.
// POST /api/admin/posts
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req dto.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	authorID, _ := c.Get("user_id")

	post, err := h.postService.CreatePost(c.Request.Context(), req, authorID.(string))
	if err != nil {
		if err == service.ErrSlugTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "Slug already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	go h.invalidateCache(post.Slug)
	c.JSON(http.StatusCreated, dto.ToPostResponse(post))
}

// UpdatePost updates an existing post.
// PUT /api/admin/posts/:id
func (h *PostHandler) UpdatePost(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	post, err := h.postService.UpdatePost(c.Request.Context(), id, req)
	if err != nil {
		if err == service.ErrPostNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		if err == service.ErrSlugTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "Slug already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	go h.invalidateCache(post.Slug)
	c.JSON(http.StatusOK, dto.ToPostResponse(post))
}

// DeletePost removes a post.
// DELETE /api/admin/posts/:id
func (h *PostHandler) DeletePost(c *gin.Context) {
	id := c.Param("id")

	if err := h.postService.DeletePost(c.Request.Context(), id); err != nil {
		if err == service.ErrPostNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}

// invalidateCache tells the frontend to clear its cached HTML for a blog post.
func (h *PostHandler) invalidateCache(slug string) {
	if h.frontendURL == "" {
		return
	}
	url := fmt.Sprintf("%s/cache/invalidate?slug=%s", h.frontendURL, slug)
	resp, err := http.Post(url, "application/json", nil)
	if err != nil {
		log.Warn().Err(err).Str("slug", slug).Msg("Failed to invalidate frontend cache")
		return
	}
	resp.Body.Close()
	log.Info().Str("slug", slug).Msg("Frontend cache invalidated")
}
