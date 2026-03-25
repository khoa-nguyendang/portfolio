package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// tokenBucket tracks the token count and last refill time for a single client.
type tokenBucket struct {
	tokens     float64
	lastRefill time.Time
}

// RateLimiter is a simple in-memory token bucket rate limiter keyed by IP address.
type RateLimiter struct {
	mu       sync.Mutex
	buckets  map[string]*tokenBucket
	rate     float64 // tokens per second
	capacity float64 // max burst
}

// NewRateLimiter creates a rate limiter.
// rate is requests-per-second; capacity is the maximum burst size.
func NewRateLimiter(rate float64, capacity float64) *RateLimiter {
	rl := &RateLimiter{
		buckets:  make(map[string]*tokenBucket),
		rate:     rate,
		capacity: capacity,
	}

	// Periodically clean up stale entries.
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	cutoff := time.Now().Add(-10 * time.Minute)
	for key, b := range rl.buckets {
		if b.lastRefill.Before(cutoff) {
			delete(rl.buckets, key)
		}
	}
}

func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.buckets[key]
	if !exists {
		rl.buckets[key] = &tokenBucket{tokens: rl.capacity - 1, lastRefill: now}
		return true
	}

	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens += elapsed * rl.rate
	if b.tokens > rl.capacity {
		b.tokens = rl.capacity
	}
	b.lastRefill = now

	if b.tokens < 1 {
		return false
	}

	b.tokens--
	return true
}

// RateLimitMiddleware returns a gin middleware that rate limits by client IP.
func RateLimitMiddleware(rate float64, capacity float64) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, capacity)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.allow(ip) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			return
		}
		c.Next()
	}
}
