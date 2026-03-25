package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
	"github.com/lib/pq"
)

// PostRepo is a PostgreSQL implementation of repository.PostRepository.
type PostRepo struct {
	db *sql.DB
}

// NewPostRepo creates a new PostRepo.
func NewPostRepo(db *sql.DB) *PostRepo {
	return &PostRepo{db: db}
}

// FindByID returns a post by its primary key.
func (r *PostRepo) FindByID(ctx context.Context, id string) (*entity.Post, error) {
	p := &entity.Post{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, title, slug, content, excerpt, cover_image, author_id, category_id,
		        status, tags, published_at, created_at, updated_at
		 FROM posts WHERE id = $1`, id,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Content, &p.Excerpt, &p.CoverImage,
		&p.AuthorID, &p.CategoryID, &p.Status, pq.Array(&p.Tags), &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("post not found: %w", err)
	}
	return p, nil
}

// FindBySlug returns a post by its URL slug.
func (r *PostRepo) FindBySlug(ctx context.Context, slug string) (*entity.Post, error) {
	p := &entity.Post{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, title, slug, content, excerpt, cover_image, author_id, category_id,
		        status, tags, published_at, created_at, updated_at
		 FROM posts WHERE slug = $1`, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Content, &p.Excerpt, &p.CoverImage,
		&p.AuthorID, &p.CategoryID, &p.Status, pq.Array(&p.Tags), &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("post not found: %w", err)
	}
	return p, nil
}

// List returns paginated posts with optional filtering.
func (r *PostRepo) List(ctx context.Context, filter repository.PostFilter, offset, limit int) ([]*entity.Post, int, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.CategoryID != "" {
		conditions = append(conditions, fmt.Sprintf("category_id = $%d", argIdx))
		args = append(args, filter.CategoryID)
		argIdx++
	}
	if filter.Tag != "" {
		conditions = append(conditions, fmt.Sprintf("$%d = ANY(tags)", argIdx))
		args = append(args, filter.Tag)
		argIdx++
	}
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(title ILIKE $%d OR content ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total.
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM posts %s", where)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count posts: %w", err)
	}

	// Fetch page.
	query := fmt.Sprintf(
		`SELECT id, title, slug, content, excerpt, cover_image, author_id, category_id,
		        status, tags, published_at, created_at, updated_at
		 FROM posts %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`,
		where, argIdx, argIdx+1,
	)
	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list posts: %w", err)
	}
	defer rows.Close()

	var posts []*entity.Post
	for rows.Next() {
		p := &entity.Post{}
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Content, &p.Excerpt, &p.CoverImage,
			&p.AuthorID, &p.CategoryID, &p.Status, pq.Array(&p.Tags), &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("failed to scan post: %w", err)
		}
		posts = append(posts, p)
	}

	return posts, total, nil
}

// Create inserts a new post.
func (r *PostRepo) Create(ctx context.Context, post *entity.Post) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO posts (id, title, slug, content, excerpt, cover_image, author_id, category_id,
		                     status, tags, published_at, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		post.ID, post.Title, post.Slug, post.Content, post.Excerpt, post.CoverImage,
		post.AuthorID, post.CategoryID, post.Status, pq.Array(post.Tags), post.PublishedAt,
		post.CreatedAt, post.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create post: %w", err)
	}
	return nil
}

// Update modifies an existing post.
func (r *PostRepo) Update(ctx context.Context, post *entity.Post) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, cover_image = $5,
		                  category_id = $6, status = $7, tags = $8, published_at = $9, updated_at = $10
		 WHERE id = $11`,
		post.Title, post.Slug, post.Content, post.Excerpt, post.CoverImage,
		post.CategoryID, post.Status, pq.Array(post.Tags), post.PublishedAt, post.UpdatedAt, post.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}
	return nil
}

// Delete removes a post by ID.
func (r *PostRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM posts WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}
	return nil
}

// CountByStatus returns the number of posts with a given status.
func (r *PostRepo) CountByStatus(ctx context.Context, status string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM posts WHERE status = $1", status).Scan(&count)
	return count, err
}
