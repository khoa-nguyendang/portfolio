package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/service"
)

// ContactHandler handles contact-form-related endpoints.
type ContactHandler struct {
	contactService *service.ContactService
}

// NewContactHandler creates a new ContactHandler.
func NewContactHandler(contactService *service.ContactService) *ContactHandler {
	return &ContactHandler{contactService: contactService}
}

// CreateContact submits a new contact form message.
// POST /api/contact
func (h *ContactHandler) CreateContact(c *gin.Context) {
	var req dto.ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	contact, err := h.contactService.CreateContact(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit contact form"})
		return
	}

	c.JSON(http.StatusCreated, dto.ToContactResponse(contact))
}

// ListContacts returns a paginated list of contact messages.
// GET /api/admin/contacts
func (h *ContactHandler) ListContacts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	contacts, total, err := h.contactService.ListContacts(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list contacts"})
		return
	}

	result := make([]dto.ContactResponse, len(contacts))
	for i, contact := range contacts {
		result[i] = dto.ToContactResponse(contact)
	}

	totalPages := total / pageSize
	if total%pageSize > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"contacts": result,
		"pagination": dto.PaginationMeta{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// MarkAsRead marks a contact message as read.
// PUT /api/admin/contacts/:id/read
func (h *ContactHandler) MarkAsRead(c *gin.Context) {
	id := c.Param("id")

	if err := h.contactService.MarkAsRead(c.Request.Context(), id); err != nil {
		if err == service.ErrContactNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark contact as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact marked as read"})
}
