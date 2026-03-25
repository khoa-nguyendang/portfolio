package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// UserRepository defines persistence operations for users.
type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByID(ctx context.Context, id string) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) error
	Update(ctx context.Context, user *entity.User) error
}
