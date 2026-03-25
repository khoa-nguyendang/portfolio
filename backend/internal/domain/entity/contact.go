package entity

import "time"

// Contact represents a message submitted through the contact form.
type Contact struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
