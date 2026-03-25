package entity

import "time"

// UserRole represents the role of a user in the system.
type UserRole string

const (
	RoleAdmin  UserRole = "admin"
	RoleEditor UserRole = "editor"
)

// User represents an authenticated user of the CMS.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         UserRole  `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
