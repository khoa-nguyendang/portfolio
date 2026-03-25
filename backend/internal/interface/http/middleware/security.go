package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SecurityHeaders adds security headers to every response.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate or forward a request ID for traceability.
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)

		// Prevent the page from being embedded in an iframe (clickjacking protection).
		c.Header("X-Frame-Options", "DENY")

		// Prevent MIME type sniffing.
		c.Header("X-Content-Type-Options", "nosniff")

		// Enable XSS filter in older browsers.
		c.Header("X-XSS-Protection", "1; mode=block")

		// Content Security Policy.
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'")

		// Strict Transport Security (only effective over HTTPS).
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		// Referrer policy.
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions policy.
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		c.Next()
	}
}
