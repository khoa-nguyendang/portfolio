package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// SiteConfigRepository defines persistence operations for site configuration.
type SiteConfigRepository interface {
	Get(ctx context.Context, key string) (*entity.SiteConfig, error)
	Set(ctx context.Context, key, value string) error
	GetAll(ctx context.Context) ([]*entity.SiteConfig, error)
	GetByKeys(ctx context.Context, keys []string) ([]*entity.SiteConfig, error)
}
