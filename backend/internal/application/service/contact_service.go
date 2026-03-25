package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/khoa-nguyendang/portfolio/backend/internal/application/dto"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/entity"
	"github.com/khoa-nguyendang/portfolio/backend/internal/domain/repository"
	"github.com/khoa-nguyendang/portfolio/backend/internal/infrastructure/email"
	"github.com/rs/zerolog/log"
)

var ErrContactNotFound = errors.New("contact not found")

// ContactService handles contact form business logic.
type ContactService struct {
	contactRepo repository.ContactRepository
	emailClient *email.ResendClient
	adminEmail  string
}

// NewContactService creates a new ContactService.
func NewContactService(contactRepo repository.ContactRepository, emailClient *email.ResendClient, adminEmail string) *ContactService {
	return &ContactService{
		contactRepo: contactRepo,
		emailClient: emailClient,
		adminEmail:  adminEmail,
	}
}

// CreateContact persists a contact message and sends an email notification.
func (s *ContactService) CreateContact(ctx context.Context, req dto.ContactRequest) (*entity.Contact, error) {
	c := &entity.Contact{
		ID:        uuid.New().String(),
		Name:      req.Name,
		Email:     req.Email,
		Subject:   req.Subject,
		Message:   req.Message,
		IsRead:    false,
		CreatedAt: time.Now(),
	}

	if err := s.contactRepo.Create(ctx, c); err != nil {
		return nil, err
	}

	// Send email notification to admin (non-blocking).
	go func() {
		subject := "New Contact Form Submission: " + req.Subject
		body := "Name: " + req.Name + "\nEmail: " + req.Email + "\n\nMessage:\n" + req.Message
		if err := s.emailClient.SendEmail(s.adminEmail, subject, body); err != nil {
			log.Error().Err(err).Msg("Failed to send contact notification email")
		}
	}()

	return c, nil
}

// ListContacts returns a paginated list of contact messages.
func (s *ContactService) ListContacts(ctx context.Context, page, pageSize int) ([]*entity.Contact, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	return s.contactRepo.List(ctx, offset, pageSize)
}

// MarkAsRead marks a contact message as read.
func (s *ContactService) MarkAsRead(ctx context.Context, id string) error {
	_, err := s.contactRepo.FindByID(ctx, id)
	if err != nil {
		return ErrContactNotFound
	}
	return s.contactRepo.MarkAsRead(ctx, id)
}
