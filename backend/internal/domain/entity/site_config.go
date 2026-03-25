package entity

import "time"

// SiteConfig stores a key-value pair for site-wide settings.
type SiteConfig struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
