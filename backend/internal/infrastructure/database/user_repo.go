package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// UserRepo is a PostgreSQL implementation of repository.UserRepository.
type UserRepo struct {
	db *sql.DB
}

// NewUserRepo creates a new UserRepo.
func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

// FindByEmail returns the user matching the given email.
func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	u := &entity.User{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, password_hash, name, role, created_at, updated_at
		 FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return u, nil
}

// FindByID returns the user matching the given ID.
func (r *UserRepo) FindByID(ctx context.Context, id string) (*entity.User, error) {
	u := &entity.User{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, password_hash, name, role, created_at, updated_at
		 FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return u, nil
}

// Create inserts a new user.
func (r *UserRepo) Create(ctx context.Context, user *entity.User) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		user.ID, user.Email, user.PasswordHash, user.Name, user.Role, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// Update modifies an existing user.
func (r *UserRepo) Update(ctx context.Context, user *entity.User) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET email = $1, password_hash = $2, name = $3, role = $4, updated_at = $5
		 WHERE id = $6`,
		user.Email, user.PasswordHash, user.Name, user.Role, user.UpdatedAt, user.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}
