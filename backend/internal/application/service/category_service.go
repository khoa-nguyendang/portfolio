package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
)

var (
	ErrCategoryNotFound = errors.New("category not found")
	ErrCategorySlugTaken = errors.New("category slug already in use")
)

// CategoryService handles category business logic.
type CategoryService struct {
	categoryRepo repository.CategoryRepository
}

// NewCategoryService creates a new CategoryService.
func NewCategoryService(categoryRepo repository.CategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

// CreateCategory creates a new category.
func (s *CategoryService) CreateCategory(ctx context.Context, req dto.CreateCategoryRequest) (*entity.Category, error) {
	existing, _ := s.categoryRepo.FindBySlug(ctx, req.Slug)
	if existing != nil {
		return nil, ErrCategorySlugTaken
	}

	now := time.Now()
	cat := &entity.Category{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		SortOrder:   req.SortOrder,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.categoryRepo.Create(ctx, cat); err != nil {
		return nil, err
	}
	return cat, nil
}

// UpdateCategory updates an existing category.
func (s *CategoryService) UpdateCategory(ctx context.Context, id string, req dto.UpdateCategoryRequest) (*entity.Category, error) {
	cat, err := s.categoryRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	if req.Name != nil {
		cat.Name = *req.Name
	}
	if req.Slug != nil && *req.Slug != cat.Slug {
		existing, _ := s.categoryRepo.FindBySlug(ctx, *req.Slug)
		if existing != nil && existing.ID != id {
			return nil, ErrCategorySlugTaken
		}
		cat.Slug = *req.Slug
	}
	if req.Description != nil {
		cat.Description = *req.Description
	}
	if req.SortOrder != nil {
		cat.SortOrder = *req.SortOrder
	}

	cat.UpdatedAt = time.Now()

	if err := s.categoryRepo.Update(ctx, cat); err != nil {
		return nil, err
	}
	return cat, nil
}

// DeleteCategory removes a category.
func (s *CategoryService) DeleteCategory(ctx context.Context, id string) error {
	_, err := s.categoryRepo.FindByID(ctx, id)
	if err != nil {
		return ErrCategoryNotFound
	}
	return s.categoryRepo.Delete(ctx, id)
}

// GetCategory retrieves a category by ID.
func (s *CategoryService) GetCategory(ctx context.Context, id string) (*entity.Category, error) {
	cat, err := s.categoryRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}
	return cat, nil
}

// ListCategories returns all categories.
func (s *CategoryService) ListCategories(ctx context.Context) ([]*entity.Category, error) {
	return s.categoryRepo.List(ctx)
}
