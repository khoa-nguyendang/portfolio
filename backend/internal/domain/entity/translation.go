package entity

import "time"

// TranslationStatus represents the state of a translation job.
type TranslationStatus string

const (
	TranslationStatusPending   TranslationStatus = "pending"
	TranslationStatusCompleted TranslationStatus = "completed"
	TranslationStatusFailed    TranslationStatus = "failed"
)

// Translation holds a translated version of a post.
type Translation struct {
	ID        string            `json:"id"`
	PostID    string            `json:"post_id"`
	Language  string            `json:"language"`
	Title     string            `json:"title"`
	Content   string            `json:"content"`
	Excerpt   string            `json:"excerpt"`
	Status    TranslationStatus `json:"status"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}
