package service

import (
	"context"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
)

// PublicConfigKeys are the site config keys that are visible to the public.
var PublicConfigKeys = []string{
	"hero_title",
	"hero_subtitle",
	"about_text",
	"contact_email",
	"social_github",
	"social_linkedin",
}

// SiteConfigService handles site configuration business logic.
type SiteConfigService struct {
	configRepo repository.SiteConfigRepository
}

// NewSiteConfigService creates a new SiteConfigService.
func NewSiteConfigService(configRepo repository.SiteConfigRepository) *SiteConfigService {
	return &SiteConfigService{configRepo: configRepo}
}

// GetConfig retrieves a single config value by key.
func (s *SiteConfigService) GetConfig(ctx context.Context, key string) (*entity.SiteConfig, error) {
	return s.configRepo.Get(ctx, key)
}

// SetConfig creates or updates a config entry.
func (s *SiteConfigService) SetConfig(ctx context.Context, key, value string) error {
	return s.configRepo.Set(ctx, key, value)
}

// GetAllConfigs returns all site configuration entries.
func (s *SiteConfigService) GetAllConfigs(ctx context.Context) ([]*entity.SiteConfig, error) {
	return s.configRepo.GetAll(ctx)
}

// GetPublicConfigs returns only the public-facing configuration entries.
func (s *SiteConfigService) GetPublicConfigs(ctx context.Context) ([]*entity.SiteConfig, error) {
	return s.configRepo.GetByKeys(ctx, PublicConfigKeys)
}

// GetConfigsByKeys returns config entries matching the given keys.
func (s *SiteConfigService) GetConfigsByKeys(ctx context.Context, keys []string) ([]*entity.SiteConfig, error) {
	return s.configRepo.GetByKeys(ctx, keys)
}

// SetConfigs updates multiple config entries at once.
func (s *SiteConfigService) SetConfigs(ctx context.Context, configs map[string]string) error {
	for key, value := range configs {
		if err := s.configRepo.Set(ctx, key, value); err != nil {
			return err
		}
	}
	return nil
}
