package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/catbi/go-backend/config"
)

var DB *gorm.DB

func Init() error {
	var err error
	DB, err = gorm.Open(sqlite.Open(config.C.DatabaseURL), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
