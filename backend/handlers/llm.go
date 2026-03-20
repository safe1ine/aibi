package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/catbi/go-backend/models"
)

type LLMHandler struct {
	db *gorm.DB
}

func NewLLMHandler(db *gorm.DB) *LLMHandler {
	return &LLMHandler{db: db}
}

type LLMConfigRequest struct {
	Name     string `json:"name" binding:"required"`
	Provider string `json:"provider" binding:"required"`
	BaseURL  string `json:"base_url" binding:"required"`
	APIKey   string `json:"api_key"`
	Model    string `json:"model" binding:"required"`
}

func (h *LLMHandler) ListConfigs(c *gin.Context) {
	var configs []models.LLMConfig
	if err := h.db.Order("created_at DESC").Find(&configs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "查询失败"})
		return
	}
	c.JSON(http.StatusOK, configs)
}

func (h *LLMHandler) CreateConfig(c *gin.Context) {
	var req LLMConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	config := models.LLMConfig{
		Name:     req.Name,
		Provider: req.Provider,
		BaseURL:  req.BaseURL,
		APIKey:   req.APIKey,
		Model:    req.Model,
	}

	var count int64
	h.db.Model(&models.LLMConfig{}).Count(&count)
	if count == 0 {
		config.IsActive = true
	}

	if err := h.db.Create(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "创建失败"})
		return
	}
	c.JSON(http.StatusOK, config)
}

func (h *LLMHandler) UpdateConfig(c *gin.Context) {
	id := c.Param("id")
	var config models.LLMConfig
	if err := h.db.First(&config, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "配置不存在"})
		return
	}

	var req LLMConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	config.Name = req.Name
	config.Provider = req.Provider
	config.BaseURL = req.BaseURL
	if req.APIKey != "" {
		config.APIKey = req.APIKey
	}
	config.Model = req.Model

	h.db.Save(&config)
	c.JSON(http.StatusOK, config)
}

func (h *LLMHandler) DeleteConfig(c *gin.Context) {
	id := c.Param("id")
	var config models.LLMConfig
	if err := h.db.First(&config, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "配置不存在"})
		return
	}
	h.db.Delete(&config)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *LLMHandler) ActivateConfig(c *gin.Context) {
	id := c.Param("id")
	var config models.LLMConfig
	if err := h.db.First(&config, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "配置不存在"})
		return
	}

	h.db.Model(&models.LLMConfig{}).Where("id != ?", id).Update("is_active", false)
	config.IsActive = true
	h.db.Save(&config)
	c.JSON(http.StatusOK, config)
}
