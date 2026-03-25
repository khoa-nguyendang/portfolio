package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
)

var (
	ErrPostNotFound = errors.New("post not found")
	ErrSlugTaken    = errors.New("slug already in use")
)

// PostService handles post business logic.
type PostService struct {
	postRepo repository.PostRepository
}

// NewPostService creates a new PostService.
func NewPostService(postRepo repository.PostRepository) *PostService {
	return &PostService{postRepo: postRepo}
}

// CreatePost creates a new post.
func (s *PostService) CreatePost(ctx context.Context, req dto.CreatePostRequest, authorID string) (*entity.Post, error) {
	existing, _ := s.postRepo.FindBySlug(ctx, req.Slug)
	if existing != nil {
		return nil, ErrSlugTaken
	}

	now := time.Now()
	post := &entity.Post{
		ID:         uuid.New().String(),
		Title:      req.Title,
		Slug:       req.Slug,
		Content:    req.Content,
		Excerpt:    req.Excerpt,
		CoverImage: req.CoverImage,
		AuthorID:   authorID,
		CategoryID: req.CategoryID,
		Status:     entity.PostStatus(req.Status),
		Tags:       req.Tags,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if post.Status == entity.PostStatusPublished {
		post.PublishedAt = &now
	}

	if post.Tags == nil {
		post.Tags = []string{}
	}

	if err := s.postRepo.Create(ctx, post); err != nil {
		return nil, err
	}

	return post, nil
}

// UpdatePost modifies an existing post.
func (s *PostService) UpdatePost(ctx context.Context, id string, req dto.UpdatePostRequest) (*entity.Post, error) {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrPostNotFound
	}

	if req.Title != nil {
		post.Title = *req.Title
	}
	if req.Slug != nil && *req.Slug != post.Slug {
		existing, _ := s.postRepo.FindBySlug(ctx, *req.Slug)
		if existing != nil && existing.ID != id {
			return nil, ErrSlugTaken
		}
		post.Slug = *req.Slug
	}
	if req.Content != nil {
		post.Content = *req.Content
	}
	if req.Excerpt != nil {
		post.Excerpt = *req.Excerpt
	}
	if req.CoverImage != nil {
		post.CoverImage = *req.CoverImage
	}
	if req.CategoryID != nil {
		post.CategoryID = *req.CategoryID
	}
	if req.Status != nil {
		newStatus := entity.PostStatus(*req.Status)
		if newStatus == entity.PostStatusPublished && post.PublishedAt == nil {
			now := time.Now()
			post.PublishedAt = &now
		}
		post.Status = newStatus
	}
	if req.Tags != nil {
		post.Tags = req.Tags
	}

	post.UpdatedAt = time.Now()

	if err := s.postRepo.Update(ctx, post); err != nil {
		return nil, err
	}

	return post, nil
}

// DeletePost removes a post by ID.
func (s *PostService) DeletePost(ctx context.Context, id string) error {
	_, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return ErrPostNotFound
	}
	return s.postRepo.Delete(ctx, id)
}

// GetPost retrieves a post by slug.
func (s *PostService) GetPost(ctx context.Context, slug string) (*entity.Post, error) {
	post, err := s.postRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, ErrPostNotFound
	}
	return post, nil
}

// GetPostByID retrieves a post by ID.
func (s *PostService) GetPostByID(ctx context.Context, id string) (*entity.Post, error) {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrPostNotFound
	}
	return post, nil
}

// ListPosts returns a paginated list of posts with optional filters.
func (s *PostService) ListPosts(ctx context.Context, filter repository.PostFilter, page, pageSize int) (*dto.PostListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize
	posts, total, err := s.postRepo.List(ctx, filter, offset, pageSize)
	if err != nil {
		return nil, err
	}

	items := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		items[i] = dto.ToPostResponse(p)
	}

	totalPages := total / pageSize
	if total%pageSize > 0 {
		totalPages++
	}

	return &dto.PostListResponse{
		Posts: items,
		Pagination: dto.PaginationMeta{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

// PublishPost sets a post status to published.
func (s *PostService) PublishPost(ctx context.Context, id string) (*entity.Post, error) {
	status := string(entity.PostStatusPublished)
	return s.UpdatePost(ctx, id, dto.UpdatePostRequest{Status: &status})
}

// ArchivePost sets a post status to archived.
func (s *PostService) ArchivePost(ctx context.Context, id string) (*entity.Post, error) {
	status := string(entity.PostStatusArchived)
	return s.UpdatePost(ctx, id, dto.UpdatePostRequest{Status: &status})
}
