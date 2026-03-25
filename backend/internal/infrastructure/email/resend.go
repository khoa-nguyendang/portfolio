package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

// ResendClient sends emails through the Resend API.
type ResendClient struct {
	apiKey    string
	fromEmail string
	client    *http.Client
}

// NewResendClient creates a new Resend email client.
func NewResendClient(apiKey, fromEmail string) *ResendClient {
	return &ResendClient{
		apiKey:    apiKey,
		fromEmail: fromEmail,
		client:    &http.Client{Timeout: 10 * time.Second},
	}
}

type resendRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Text    string   `json:"text,omitempty"`
	HTML    string   `json:"html,omitempty"`
}

// SendEmail sends a plain-text email via Resend.
func (r *ResendClient) SendEmail(to, subject, body string) error {
	if r.apiKey == "" {
		log.Warn().Msg("Resend API key not configured, skipping email send")
		return nil
	}

	payload := resendRequest{
		From:    r.fromEmail,
		To:      []string{to},
		Subject: subject,
		Text:    body,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create email request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	log.Info().Str("to", to).Str("subject", subject).Msg("Email sent successfully")
	return nil
}

// SendHTMLEmail sends an HTML email via Resend.
func (r *ResendClient) SendHTMLEmail(to, subject, html string) error {
	if r.apiKey == "" {
		log.Warn().Msg("Resend API key not configured, skipping email send")
		return nil
	}

	payload := resendRequest{
		From:    r.fromEmail,
		To:      []string{to},
		Subject: subject,
		HTML:    html,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create email request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// SendContactNotification sends a notification email when someone submits the contact form.
func (r *ResendClient) SendContactNotification(adminEmail, senderName, senderEmail, subject, message string) error {
	body := fmt.Sprintf(
		"New contact form submission:\n\nFrom: %s (%s)\nSubject: %s\n\nMessage:\n%s",
		senderName, senderEmail, subject, message,
	)
	return r.SendEmail(adminEmail, "New Contact: "+subject, body)
}

// SendWelcomeEmail sends a welcome email to a new user.
func (r *ResendClient) SendWelcomeEmail(to, name string) error {
	subject := "Welcome to Khoa Nguyen Dang's Portfolio"
	body := fmt.Sprintf("Hello %s,\n\nWelcome! Your account has been created successfully.\n\nBest regards,\nKhoa Nguyen Dang", name)
	return r.SendEmail(to, subject, body)
}
