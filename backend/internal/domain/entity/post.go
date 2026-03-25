package entity

import "time"

// PostStatus represents the publication state of a post.
type PostStatus string

const (
	PostStatusDraft     PostStatus = "draft"
	PostStatusPublished PostStatus = "published"
	PostStatusArchived  PostStatus = "archived"
)

// Post represents a blog post or content entry.
type Post struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Content     string     `json:"content"`
	Excerpt     string     `json:"excerpt"`
	CoverImage  string     `json:"cover_image"`
	AuthorID    string     `json:"author_id"`
	CategoryID  string     `json:"category_id"`
	Status      PostStatus `json:"status"`
	Tags        []string   `json:"tags"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
