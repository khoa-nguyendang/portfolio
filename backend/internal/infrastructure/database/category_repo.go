package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// CategoryRepo is a PostgreSQL implementation of repository.CategoryRepository.
type CategoryRepo struct {
	db *sql.DB
}

// NewCategoryRepo creates a new CategoryRepo.
func NewCategoryRepo(db *sql.DB) *CategoryRepo {
	return &CategoryRepo{db: db}
}

// FindByID returns a category by its primary key.
func (r *CategoryRepo) FindByID(ctx context.Context, id string) (*entity.Category, error) {
	c := &entity.Category{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, slug, description, sort_order, created_at, updated_at
		 FROM categories WHERE id = $1`, id,
	).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}
	return c, nil
}

// FindBySlug returns a category by its URL slug.
func (r *CategoryRepo) FindBySlug(ctx context.Context, slug string) (*entity.Category, error) {
	c := &entity.Category{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, slug, description, sort_order, created_at, updated_at
		 FROM categories WHERE slug = $1`, slug,
	).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}
	return c, nil
}

// List returns all categories ordered by sort_order.
func (r *CategoryRepo) List(ctx context.Context) ([]*entity.Category, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, name, slug, description, sort_order, created_at, updated_at
		 FROM categories ORDER BY sort_order ASC, name ASC`,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}
	defer rows.Close()

	var categories []*entity.Category
	for rows.Next() {
		c := &entity.Category{}
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}
	return categories, nil
}

// Create inserts a new category.
func (r *CategoryRepo) Create(ctx context.Context, cat *entity.Category) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO categories (id, name, slug, description, sort_order, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		cat.ID, cat.Name, cat.Slug, cat.Description, cat.SortOrder, cat.CreatedAt, cat.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}
	return nil
}

// Update modifies an existing category.
func (r *CategoryRepo) Update(ctx context.Context, cat *entity.Category) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE categories SET name = $1, slug = $2, description = $3, sort_order = $4, updated_at = $5
		 WHERE id = $6`,
		cat.Name, cat.Slug, cat.Description, cat.SortOrder, cat.UpdatedAt, cat.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}
	return nil
}

// Delete removes a category by ID.
func (r *CategoryRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	return nil
}
