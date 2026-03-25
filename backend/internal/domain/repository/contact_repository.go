package repository

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// ContactRepository defines persistence operations for contact messages.
type ContactRepository interface {
	FindByID(ctx context.Context, id string) (*entity.Contact, error)
	List(ctx context.Context, offset, limit int) ([]*entity.Contact, int, error)
	Create(ctx context.Context, c *entity.Contact) error
	MarkAsRead(ctx context.Context, id string) error
	Delete(ctx context.Context, id string) error
	CountUnread(ctx context.Context) (int, error)
}
