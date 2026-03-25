package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// PostFilter holds optional filters for listing posts.
type PostFilter struct {
	Status     string
	CategoryID string
	Tag        string
	Search     string
}

// PostRepository defines persistence operations for posts.
type PostRepository interface {
	FindByID(ctx context.Context, id string) (*entity.Post, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Post, error)
	List(ctx context.Context, filter PostFilter, offset, limit int) ([]*entity.Post, int, error)
	Create(ctx context.Context, post *entity.Post) error
	Update(ctx context.Context, post *entity.Post) error
	Delete(ctx context.Context, id string) error
	CountByStatus(ctx context.Context, status string) (int, error)
}
