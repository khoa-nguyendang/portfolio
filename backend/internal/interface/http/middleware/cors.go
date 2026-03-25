package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

// CORSMiddleware returns a gin middleware that handles CORS using rs/cors.
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization", "X-Request-ID"},
		ExposedHeaders:   []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           86400,
	})

	return func(ctx *gin.Context) {
		c.HandlerFunc(ctx.Writer, ctx.Request)
		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}
		ctx.Next()
	}
}
