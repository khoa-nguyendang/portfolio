package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

// Client communicates with an OpenAI-compatible LLM API.
type Client struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

// NewClient creates a new LLM API client.
func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		baseURL: baseURL,
		apiKey:  apiKey,
		client:  &http.Client{Timeout: 120 * time.Second},
	}
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type chatChoice struct {
	Message chatMessage `json:"message"`
}

type chatResponse struct {
	Choices []chatChoice `json:"choices"`
}

// TranslateText translates text from one language to another using the chat completions endpoint.
func (c *Client) TranslateText(ctx context.Context, text, sourceLang, targetLang string) (string, error) {
	if text == "" {
		return "", nil
	}

	systemPrompt := fmt.Sprintf(
		"You are a professional translator. Translate the following text from %s to %s. "+
			"Preserve all markdown formatting, code blocks, and links. "+
			"Only return the translated text, nothing else.",
		sourceLang, targetLang,
	)

	reqBody := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: text},
		},
		Temperature: 0.3,
		MaxTokens:   4096,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal LLM request: %w", err)
	}

	url := c.baseURL + "/v1/chat/completions"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("failed to create LLM request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("LLM request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("LLM API error (status %d): %s", resp.StatusCode, string(body))
	}

	var chatResp chatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", fmt.Errorf("failed to decode LLM response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("LLM returned no choices")
	}

	log.Debug().
		Str("source", sourceLang).
		Str("target", targetLang).
		Int("text_len", len(text)).
		Msg("Translation completed")

	return chatResp.Choices[0].Message.Content, nil
}
