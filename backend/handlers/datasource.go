package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/catbi/go-backend/config"
	"github.com/catbi/go-backend/models"
)

type DataSourceHandler struct {
	db *gorm.DB
}

func NewDataSourceHandler(db *gorm.DB) *DataSourceHandler {
	return &DataSourceHandler{db: db}
}

func (h *DataSourceHandler) ListDataSources(c *gin.Context) {
	var sources []models.DataSource
	if err := h.db.Order("created_at DESC").Find(&sources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "查询失败"})
		return
	}
	c.JSON(http.StatusOK, sources)
}

func (h *DataSourceHandler) CreateDataSource(c *gin.Context) {
	name := c.PostForm("name")
	description := c.PostForm("description")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "名称不能为空"})
		return
	}

	var savedPaths []string
	uploadDir := config.C.UploadDir
	os.MkdirAll(uploadDir, os.ModePerm)

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "无效的表单数据"})
		return
	}
	files := form.File["files"]
	for _, fileHeader := range files {
		filename := filepath.Base(fileHeader.Filename)
		destPath := filepath.Join(uploadDir, filename)

		if err := c.SaveUploadedFile(fileHeader, destPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"detail": "保存文件失败：" + err.Error()})
			return
		}
		savedPaths = append(savedPaths, destPath)
	}

	var connectionInfo string
	if len(savedPaths) > 0 {
		infoBytes, _ := json.Marshal(map[string]interface{}{"files": savedPaths})
		connectionInfo = string(infoBytes)
	}

	ds := models.DataSource{
		Name:           name,
		Description:    description,
		ConnectionInfo: connectionInfo,
		Status:         models.DataSourceStatusAnalyzing,
	}

	if err := h.db.Create(&ds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "创建失败"})
		return
	}

	go analyzeDataSource(h.db, ds.ID)
	c.JSON(http.StatusOK, ds)
}

func (h *DataSourceHandler) DeleteDataSource(c *gin.Context) {
	id := c.Param("id")
	var ds models.DataSource
	if err := h.db.First(&ds, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "数据源不存在"})
		return
	}

	if ds.ConnectionInfo != "" {
		var info map[string]interface{}
		if err := json.Unmarshal([]byte(ds.ConnectionInfo), &info); err == nil {
			if files, ok := info["files"].([]interface{}); ok {
				for _, f := range files {
					if path, ok := f.(string); ok {
						os.Remove(path)
					}
				}
			}
		}
	}

	h.db.Delete(&ds)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *DataSourceHandler) Reanalyze(c *gin.Context) {
	id := c.Param("id")
	var ds models.DataSource
	if err := h.db.First(&ds, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "数据源不存在"})
		return
	}

	ds.Status = models.DataSourceStatusAnalyzing
	ds.ErrorMessage = ""
	h.db.Save(&ds)
	go analyzeDataSource(h.db, ds.ID)

	c.JSON(http.StatusOK, gin.H{"status": "analyzing"})
}

func analyzeDataSource(db *gorm.DB, dsID uint) {
	var ds models.DataSource
	if err := db.First(&ds, dsID).Error; err != nil {
		return
	}

	defer func() {
		if r := recover(); r != nil {
			ds.Status = models.DataSourceStatusError
			ds.ErrorMessage = "分析失败：" + string(r.(string))
			db.Save(&ds)
		}
	}()

	var connInfo map[string]interface{}
	if ds.ConnectionInfo != "" {
		json.Unmarshal([]byte(ds.ConnectionInfo), &connInfo)
	}

	hasFiles := false
	if files, ok := connInfo["files"].([]interface{}); ok && len(files) > 0 {
		hasFiles = true
	}

	if hasFiles {
		analyzeFiles(db, &ds, connInfo)
	} else {
		if err := analyzeDatabase(db, &ds); err != nil {
			analyzeText(db, &ds)
		}
	}

	ds.Status = models.DataSourceStatusReady
	db.Save(&ds)
}

func analyzeFiles(db *gorm.DB, ds *models.DataSource, connInfo map[string]interface{}) {
	ds.SchemaDoc = "文件分析功能待实现"
}

func analyzeDatabase(db *gorm.DB, ds *models.DataSource) error {
	ds.SchemaDoc = "数据库分析功能待实现"
	return nil
}

func analyzeText(db *gorm.DB, ds *models.DataSource) {
	if ds.ConnectionInfo == "" {
		ds.ConnectionInfo = `{"type": "text"}`
	}
	ds.SchemaDoc = "纯文本数据源：" + ds.Description
}
