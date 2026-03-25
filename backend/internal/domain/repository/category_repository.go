package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// CategoryRepository defines persistence operations for categories.
type CategoryRepository interface {
	FindByID(ctx context.Context, id string) (*entity.Category, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Category, error)
	List(ctx context.Context) ([]*entity.Category, error)
	Create(ctx context.Context, cat *entity.Category) error
	Update(ctx context.Context, cat *entity.Category) error
	Delete(ctx context.Context, id string) error
}
