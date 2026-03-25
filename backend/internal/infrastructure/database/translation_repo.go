package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// TranslationRepo is a PostgreSQL implementation of repository.TranslationRepository.
type TranslationRepo struct {
	db *sql.DB
}

// NewTranslationRepo creates a new TranslationRepo.
func NewTranslationRepo(db *sql.DB) *TranslationRepo {
	return &TranslationRepo{db: db}
}

// FindByPostAndLang returns the translation for a given post and language.
func (r *TranslationRepo) FindByPostAndLang(ctx context.Context, postID, lang string) (*entity.Translation, error) {
	t := &entity.Translation{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, post_id, language, title, content, excerpt, status, created_at, updated_at
		 FROM translations WHERE post_id = $1 AND language = $2`, postID, lang,
	).Scan(&t.ID, &t.PostID, &t.Language, &t.Title, &t.Content, &t.Excerpt, &t.Status, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("translation not found: %w", err)
	}
	return t, nil
}

// ListByPost returns all translations for a post.
func (r *TranslationRepo) ListByPost(ctx context.Context, postID string) ([]*entity.Translation, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, post_id, language, title, content, excerpt, status, created_at, updated_at
		 FROM translations WHERE post_id = $1 ORDER BY language`, postID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list translations: %w", err)
	}
	defer rows.Close()

	var translations []*entity.Translation
	for rows.Next() {
		t := &entity.Translation{}
		if err := rows.Scan(&t.ID, &t.PostID, &t.Language, &t.Title, &t.Content, &t.Excerpt,
			&t.Status, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan translation: %w", err)
		}
		translations = append(translations, t)
	}
	return translations, nil
}

// Create inserts a new translation.
func (r *TranslationRepo) Create(ctx context.Context, t *entity.Translation) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO translations (id, post_id, language, title, content, excerpt, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		t.ID, t.PostID, t.Language, t.Title, t.Content, t.Excerpt, t.Status, t.CreatedAt, t.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create translation: %w", err)
	}
	return nil
}

// Update modifies an existing translation.
func (r *TranslationRepo) Update(ctx context.Context, t *entity.Translation) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE translations SET title = $1, content = $2, excerpt = $3, status = $4, updated_at = $5
		 WHERE id = $6`,
		t.Title, t.Content, t.Excerpt, t.Status, t.UpdatedAt, t.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update translation: %w", err)
	}
	return nil
}

// DeleteByPost removes all translations for a post.
func (r *TranslationRepo) DeleteByPost(ctx context.Context, postID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM translations WHERE post_id = $1", postID)
	if err != nil {
		return fmt.Errorf("failed to delete translations: %w", err)
	}
	return nil
}
