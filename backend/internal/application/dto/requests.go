package dto

// LoginRequest carries credentials for authentication.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// ChangePasswordRequest carries old and new password.
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required,min=6"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}

// CreatePostRequest holds data for creating a new post.
type CreatePostRequest struct {
	Title      string   `json:"title" binding:"required,min=1,max=255"`
	Slug       string   `json:"slug" binding:"required,min=1,max=255"`
	Content    string   `json:"content" binding:"required"`
	Excerpt    string   `json:"excerpt"`
	CoverImage string   `json:"cover_image"`
	CategoryID string   `json:"category_id"`
	Status     string   `json:"status" binding:"required,oneof=draft published archived"`
	Tags       []string `json:"tags"`
}

// UpdatePostRequest holds data for updating an existing post.
type UpdatePostRequest struct {
	Title      *string  `json:"title" binding:"omitempty,min=1,max=255"`
	Slug       *string  `json:"slug" binding:"omitempty,min=1,max=255"`
	Content    *string  `json:"content"`
	Excerpt    *string  `json:"excerpt"`
	CoverImage *string  `json:"cover_image"`
	CategoryID *string  `json:"category_id"`
	Status     *string  `json:"status" binding:"omitempty,oneof=draft published archived"`
	Tags       []string `json:"tags"`
}

// CreateCategoryRequest holds data for creating a category.
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=100"`
	Slug        string `json:"slug" binding:"required,min=1,max=100"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

// ContactRequest holds data from the public contact form.
type ContactRequest struct {
	Name    string `json:"name" binding:"required,min=1,max=100"`
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required,min=1,max=200"`
	Message string `json:"message" binding:"required,min=1,max=5000"`
}

// TranslateRequest specifies target languages for translation.
type TranslateRequest struct {
	TargetLanguages []string `json:"target_languages" binding:"required,min=1"`
}

// UpdateSiteConfigRequest holds key-value pairs to update.
type UpdateSiteConfigRequest struct {
	Configs map[string]string `json:"configs" binding:"required"`
}

// UpdateCategoryRequest holds data for updating a category.
type UpdateCategoryRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=1,max=100"`
	Slug        *string `json:"slug" binding:"omitempty,min=1,max=100"`
	Description *string `json:"description"`
	SortOrder   *int    `json:"sort_order"`
}
