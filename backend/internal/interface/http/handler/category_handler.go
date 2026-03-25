package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
)

// CategoryHandler handles category-related endpoints.
type CategoryHandler struct {
	categoryService *service.CategoryService
}

// NewCategoryHandler creates a new CategoryHandler.
func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// ListCategories returns all categories.
// GET /api/categories
func (h *CategoryHandler) ListCategories(c *gin.Context) {
	categories, err := h.categoryService.ListCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list categories"})
		return
	}

	result := make([]dto.CategoryResponse, len(categories))
	for i, cat := range categories {
		result[i] = dto.ToCategoryResponse(cat)
	}

	c.JSON(http.StatusOK, result)
}

// CreateCategory creates a new category.
// POST /api/admin/categories
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	cat, err := h.categoryService.CreateCategory(c.Request.Context(), req)
	if err != nil {
		if err == service.ErrCategorySlugTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "Category slug already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, dto.ToCategoryResponse(cat))
}

// UpdateCategory updates an existing category.
// PUT /api/admin/categories/:id
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	cat, err := h.categoryService.UpdateCategory(c.Request.Context(), id, req)
	if err != nil {
		if err == service.ErrCategoryNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}
		if err == service.ErrCategorySlugTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "Category slug already in use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, dto.ToCategoryResponse(cat))
}

// DeleteCategory removes a category.
// DELETE /api/admin/categories/:id
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	if err := h.categoryService.DeleteCategory(c.Request.Context(), id); err != nil {
		if err == service.ErrCategoryNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
