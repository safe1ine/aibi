package models

import (
	"time"

	"gorm.io/gorm"
)

type DataSourceStatus string

const (
	DataSourceStatusPending   DataSourceStatus = "pending"
	DataSourceStatusAnalyzing DataSourceStatus = "analyzing"
	DataSourceStatusReady     DataSourceStatus = "ready"
	DataSourceStatusError     DataSourceStatus = "error"
)

type DataSource struct {
	ID             uint             `gorm:"primaryKey"`
	Name           string           `gorm:"not null"`
	Description    string           `gorm:"type:text"`
	ConnectionInfo string           `gorm:"type:text"`
	SchemaDoc      string           `gorm:"type:text"`
	Status         DataSourceStatus `gorm:"default:'pending'"`
	ErrorMessage   string           `gorm:"type:text"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type LLMConfig struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"not null"`
	Provider  string `gorm:"not null"`
	BaseURL   string `gorm:"not null"`
	APIKey    string `gorm:"not null"`
	Model     string `gorm:"not null"`
	IsActive  bool   `gorm:"default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Username  string `gorm:"uniqueIndex;not null"`
	Password  string `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&DataSource{}, &LLMConfig{}, &User{})
}
