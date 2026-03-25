package dto

import (
	"time"

	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
)

// TokenResponse carries a JWT and user information.
type TokenResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

// UserResponse is the public representation of a user.
type UserResponse struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Role    string `json:"role"`
}

// PaginationMeta describes the pagination state.
type PaginationMeta struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// PostResponse is the public representation of a post.
type PostResponse struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Content     string     `json:"content"`
	Excerpt     string     `json:"excerpt"`
	CoverImage  string     `json:"cover_image"`
	AuthorID    string     `json:"author_id"`
	CategoryID  string     `json:"category_id"`
	Status      string     `json:"status"`
	Tags        []string   `json:"tags"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// PostListResponse wraps a list of posts with pagination metadata.
type PostListResponse struct {
	Posts      []PostResponse `json:"posts"`
	Pagination PaginationMeta `json:"pagination"`
}

// CategoryResponse is the public representation of a category.
type CategoryResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

// ContactResponse is the public representation of a contact message.
type ContactResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

// TranslationResponse is the public representation of a translation.
type TranslationResponse struct {
	ID       string `json:"id"`
	PostID   string `json:"post_id"`
	Language string `json:"language"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Excerpt  string `json:"excerpt"`
	Status   string `json:"status"`
}

// SiteConfigResponse represents a single config entry.
type SiteConfigResponse struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// ---- Converters ----

// ToPostResponse converts a domain Post to a PostResponse DTO.
func ToPostResponse(p *entity.Post) PostResponse {
	tags := p.Tags
	if tags == nil {
		tags = []string{}
	}
	return PostResponse{
		ID:          p.ID,
		Title:       p.Title,
		Slug:        p.Slug,
		Content:     p.Content,
		Excerpt:     p.Excerpt,
		CoverImage:  p.CoverImage,
		AuthorID:    p.AuthorID,
		CategoryID:  p.CategoryID,
		Status:      string(p.Status),
		Tags:        tags,
		PublishedAt: p.PublishedAt,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// ToCategoryResponse converts a domain Category to a CategoryResponse DTO.
func ToCategoryResponse(c *entity.Category) CategoryResponse {
	return CategoryResponse{
		ID:          c.ID,
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		SortOrder:   c.SortOrder,
	}
}

// ToContactResponse converts a domain Contact to a ContactResponse DTO.
func ToContactResponse(c *entity.Contact) ContactResponse {
	return ContactResponse{
		ID:        c.ID,
		Name:      c.Name,
		Email:     c.Email,
		Subject:   c.Subject,
		Message:   c.Message,
		IsRead:    c.IsRead,
		CreatedAt: c.CreatedAt,
	}
}

// ToTranslationResponse converts a domain Translation to a TranslationResponse DTO.
func ToTranslationResponse(t *entity.Translation) TranslationResponse {
	return TranslationResponse{
		ID:       t.ID,
		PostID:   t.PostID,
		Language: t.Language,
		Title:    t.Title,
		Content:  t.Content,
		Excerpt:  t.Excerpt,
		Status:   string(t.Status),
	}
}

// ToUserResponse converts a domain User to a UserResponse DTO.
func ToUserResponse(u *entity.User) UserResponse {
	return UserResponse{
		ID:      u.ID,
		Email:   u.Email,
		Name:    u.Name,
		Role:    string(u.Role),
	}
}
