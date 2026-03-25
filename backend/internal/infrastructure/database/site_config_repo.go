package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// SiteConfigRepo is a PostgreSQL implementation of repository.SiteConfigRepository.
type SiteConfigRepo struct {
	db *sql.DB
}

// NewSiteConfigRepo creates a new SiteConfigRepo.
func NewSiteConfigRepo(db *sql.DB) *SiteConfigRepo {
	return &SiteConfigRepo{db: db}
}

// Get returns a single site config entry by key.
func (r *SiteConfigRepo) Get(ctx context.Context, key string) (*entity.SiteConfig, error) {
	c := &entity.SiteConfig{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, key, value, updated_at FROM site_configs WHERE key = $1`, key,
	).Scan(&c.ID, &c.Key, &c.Value, &c.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("site config not found: %w", err)
	}
	return c, nil
}

// Set creates or updates a site config entry.
func (r *SiteConfigRepo) Set(ctx context.Context, key, value string) error {
	now := time.Now()
	result, err := r.db.ExecContext(ctx,
		`UPDATE site_configs SET value = $1, updated_at = $2 WHERE key = $3`,
		value, now, key,
	)
	if err != nil {
		return fmt.Errorf("failed to update site config: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		_, err = r.db.ExecContext(ctx,
			`INSERT INTO site_configs (id, key, value, updated_at) VALUES ($1, $2, $3, $4)`,
			uuid.New().String(), key, value, now,
		)
		if err != nil {
			return fmt.Errorf("failed to insert site config: %w", err)
		}
	}
	return nil
}

// GetAll returns all site config entries.
func (r *SiteConfigRepo) GetAll(ctx context.Context) ([]*entity.SiteConfig, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, key, value, updated_at FROM site_configs ORDER BY key`,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list site configs: %w", err)
	}
	defer rows.Close()

	var configs []*entity.SiteConfig
	for rows.Next() {
		c := &entity.SiteConfig{}
		if err := rows.Scan(&c.ID, &c.Key, &c.Value, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan site config: %w", err)
		}
		configs = append(configs, c)
	}
	return configs, nil
}

// GetByKeys returns site config entries matching any of the given keys.
func (r *SiteConfigRepo) GetByKeys(ctx context.Context, keys []string) ([]*entity.SiteConfig, error) {
	if len(keys) == 0 {
		return nil, nil
	}

	placeholders := make([]string, len(keys))
	args := make([]interface{}, len(keys))
	for i, k := range keys {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = k
	}

	query := fmt.Sprintf(
		`SELECT id, key, value, updated_at FROM site_configs WHERE key IN (%s) ORDER BY key`,
		strings.Join(placeholders, ", "),
	)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get site configs by keys: %w", err)
	}
	defer rows.Close()

	var configs []*entity.SiteConfig
	for rows.Next() {
		c := &entity.SiteConfig{}
		if err := rows.Scan(&c.ID, &c.Key, &c.Value, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan site config: %w", err)
		}
		configs = append(configs, c)
	}
	return configs, nil
}
