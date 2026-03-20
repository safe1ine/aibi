package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort    string
	SecretKey     string
	AdminUsername string
	AdminPassword string
	UploadDir     string
	DatabaseURL   string
}

var C *Config

func Init() error {
	godotenv.Load()

	C = &Config{
		ServerPort:    getEnv("SERVER_PORT", "8100"),
		SecretKey:     getEnv("SECRET_KEY", "dev-secret-key"),
		AdminUsername: getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "changeme"),
		UploadDir:     getEnv("UPLOAD_DIR", "./uploads"),
		DatabaseURL:   getEnv("DATABASE_URL", "./catbi.db"),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
