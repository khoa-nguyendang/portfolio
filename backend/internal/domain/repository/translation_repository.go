package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// TranslationRepository defines persistence operations for translations.
type TranslationRepository interface {
	FindByPostAndLang(ctx context.Context, postID, lang string) (*entity.Translation, error)
	ListByPost(ctx context.Context, postID string) ([]*entity.Translation, error)
	Create(ctx context.Context, t *entity.Translation) error
	Update(ctx context.Context, t *entity.Translation) error
	DeleteByPost(ctx context.Context, postID string) error
}
