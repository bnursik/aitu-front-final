package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type tokenResp struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

var (
	cacheToken   string
	cacheExpires time.Time
	mu           sync.Mutex
)

func snippet(b []byte, n int) string {
	if len(b) > n {
		return string(b[:n]) + "…"
	}
	return string(b)
}

func getAppToken() (string, error) {
	mu.Lock()
	defer mu.Unlock()
	if cacheToken != "" && time.Now().Before(cacheExpires.Add(-30*time.Second)) {
		return cacheToken, nil
	}

	id := os.Getenv("SPOTIFY_CLIENT_ID")
	secret := os.Getenv("SPOTIFY_CLIENT_SECRET")
	if id == "" || secret == "" {
		return "", errors.New("missing client credentials")
	}

	body := []byte("grant_type=client_credentials")
	req, _ := http.NewRequest("POST", "https://accounts.spotify.com/api/token", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(id, secret)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return "", errors.New("token error: " + string(data))
	}

	var tr tokenResp
	if err := json.Unmarshal(data, &tr); err != nil {
		return "", err
	}
	cacheToken = tr.AccessToken
	cacheExpires = time.Now().Add(time.Duration(tr.ExpiresIn) * time.Second)
	return cacheToken, nil
}

func main() {
	_ = godotenv.Load()
	r := gin.Default()
	origin := os.Getenv("CORS_ORIGIN")
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/api/featured", func(c *gin.Context) {
		token, err := getAppToken()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		req, _ := http.NewRequest("GET", "https://api.spotify.com/v1/browse/new-releases?limit=18", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		c.Status(resp.StatusCode)
		io.Copy(c.Writer, resp.Body)
	})

	r.GET("/api/search", func(c *gin.Context) {
		q := c.Query("q")
		if q == "" {
			q = "top"
		}
		limit := c.Query("limit")
		if limit == "" {
			limit = "50"
		}

		token, err := getAppToken()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		url := "https://api.spotify.com/v1/search?type=playlist&q=" + q + "&limit=" + limit
		req, _ := http.NewRequest("GET", url, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		log.Printf("UPSTREAM %s -> %d %s", req.URL.String(), resp.StatusCode, snippet(body, 200))

		c.Status(resp.StatusCode)
		for k, v := range resp.Header {
			if strings.ToLower(k) == "content-length" {
				continue
			}
			c.Writer.Header()[k] = v
		}
		c.Writer.Write(body)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server on :" + port + " (CORS " + origin + ")")
	r.Run(":" + port)
}
