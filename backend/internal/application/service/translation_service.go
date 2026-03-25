package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
	"github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/llm"
	"github.com/rs/zerolog/log"
)

var ErrTranslationNotFound = errors.New("translation not found")

// TranslationService handles translation business logic.
type TranslationService struct {
	translationRepo repository.TranslationRepository
	postRepo        repository.PostRepository
	llmClient       *llm.Client
}

// NewTranslationService creates a new TranslationService.
func NewTranslationService(
	translationRepo repository.TranslationRepository,
	postRepo repository.PostRepository,
	llmClient *llm.Client,
) *TranslationService {
	return &TranslationService{
		translationRepo: translationRepo,
		postRepo:        postRepo,
		llmClient:       llmClient,
	}
}

// TranslatePost initiates translation of a post to the specified languages.
func (s *TranslationService) TranslatePost(ctx context.Context, postID string, targetLangs []string) ([]*entity.Translation, error) {
	post, err := s.postRepo.FindByID(ctx, postID)
	if err != nil {
		return nil, ErrPostNotFound
	}

	var translations []*entity.Translation
	for _, lang := range targetLangs {
		now := time.Now()
		t := &entity.Translation{
			ID:        uuid.New().String(),
			PostID:    postID,
			Language:  lang,
			Title:     "",
			Content:   "",
			Excerpt:   "",
			Status:    entity.TranslationStatusPending,
			CreatedAt: now,
			UpdatedAt: now,
		}

		// Check if a translation already exists for this post+lang.
		existing, _ := s.translationRepo.FindByPostAndLang(ctx, postID, lang)
		if existing != nil {
			t.ID = existing.ID
			t.Status = entity.TranslationStatusPending
			t.UpdatedAt = now
			if err := s.translationRepo.Update(ctx, t); err != nil {
				log.Error().Err(err).Str("lang", lang).Msg("Failed to reset translation status")
				continue
			}
		} else {
			if err := s.translationRepo.Create(ctx, t); err != nil {
				log.Error().Err(err).Str("lang", lang).Msg("Failed to create translation record")
				continue
			}
		}

		translatedTitle, err := s.llmClient.TranslateText(ctx, post.Title, "en", lang)
		if err != nil {
			log.Error().Err(err).Str("lang", lang).Msg("Failed to translate title")
			t.Status = entity.TranslationStatusFailed
			t.UpdatedAt = time.Now()
			_ = s.translationRepo.Update(ctx, t)
			translations = append(translations, t)
			continue
		}

		translatedContent, err := s.llmClient.TranslateText(ctx, post.Content, "en", lang)
		if err != nil {
			log.Error().Err(err).Str("lang", lang).Msg("Failed to translate content")
			t.Status = entity.TranslationStatusFailed
			t.UpdatedAt = time.Now()
			_ = s.translationRepo.Update(ctx, t)
			translations = append(translations, t)
			continue
		}

		translatedExcerpt := ""
		if post.Excerpt != "" {
			translatedExcerpt, err = s.llmClient.TranslateText(ctx, post.Excerpt, "en", lang)
			if err != nil {
				log.Error().Err(err).Str("lang", lang).Msg("Failed to translate excerpt")
			}
		}

		t.Title = translatedTitle
		t.Content = translatedContent
		t.Excerpt = translatedExcerpt
		t.Status = entity.TranslationStatusCompleted
		t.UpdatedAt = time.Now()

		if err := s.translationRepo.Update(ctx, t); err != nil {
			log.Error().Err(err).Str("lang", lang).Msg("Failed to update translation")
		}

		translations = append(translations, t)
	}

	return translations, nil
}

// GetTranslation retrieves a specific translation.
func (s *TranslationService) GetTranslation(ctx context.Context, postID, lang string) (*entity.Translation, error) {
	t, err := s.translationRepo.FindByPostAndLang(ctx, postID, lang)
	if err != nil {
		return nil, ErrTranslationNotFound
	}
	return t, nil
}

// ListTranslations retrieves all translations for a post.
func (s *TranslationService) ListTranslations(ctx context.Context, postID string) ([]*entity.Translation, error) {
	return s.translationRepo.ListByPost(ctx, postID)
}
