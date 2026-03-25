package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// ContactRepo is a PostgreSQL implementation of repository.ContactRepository.
type ContactRepo struct {
	db *sql.DB
}

// NewContactRepo creates a new ContactRepo.
func NewContactRepo(db *sql.DB) *ContactRepo {
	return &ContactRepo{db: db}
}

// FindByID returns a contact message by its primary key.
func (r *ContactRepo) FindByID(ctx context.Context, id string) (*entity.Contact, error) {
	c := &entity.Contact{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, email, subject, message, is_read, created_at
		 FROM contacts WHERE id = $1`, id,
	).Scan(&c.ID, &c.Name, &c.Email, &c.Subject, &c.Message, &c.IsRead, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("contact not found: %w", err)
	}
	return c, nil
}

// List returns paginated contact messages.
func (r *ContactRepo) List(ctx context.Context, offset, limit int) ([]*entity.Contact, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM contacts").Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count contacts: %w", err)
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT id, name, email, subject, message, is_read, created_at
		 FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list contacts: %w", err)
	}
	defer rows.Close()

	var contacts []*entity.Contact
	for rows.Next() {
		c := &entity.Contact{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Subject, &c.Message, &c.IsRead, &c.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("failed to scan contact: %w", err)
		}
		contacts = append(contacts, c)
	}
	return contacts, total, nil
}

// Create inserts a new contact message.
func (r *ContactRepo) Create(ctx context.Context, c *entity.Contact) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO contacts (id, name, email, subject, message, is_read, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		c.ID, c.Name, c.Email, c.Subject, c.Message, c.IsRead, c.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create contact: %w", err)
	}
	return nil
}

// MarkAsRead sets a contact message as read.
func (r *ContactRepo) MarkAsRead(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE contacts SET is_read = true WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to mark contact as read: %w", err)
	}
	return nil
}

// CountUnread returns the number of unread contact messages.
func (r *ContactRepo) CountUnread(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM contacts WHERE is_read = false").Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread contacts: %w", err)
	}
	return count, nil
}

// Delete removes a contact message by ID.
func (r *ContactRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM contacts WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete contact: %w", err)
	}
	return nil
}
