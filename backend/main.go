package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"github.com/catbi/go-backend/config"
	"github.com/catbi/go-backend/database"
	"github.com/catbi/go-backend/handlers"
	"github.com/catbi/go-backend/middleware"
	"github.com/catbi/go-backend/models"
)

func main() {
	if err := config.Init(); err != nil {
		log.Fatal("配置初始化失败:", err)
	}

	if err := database.Init(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}

	if err := models.Migrate(database.GetDB()); err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	os.MkdirAll(config.C.UploadDir, os.ModePerm)
	createAdminUser()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	setupRoutes(r)

	port := ":" + config.C.ServerPort
	log.Printf("服务启动在 http://0.0.0.0%s", port)
	if err := r.Run(port); err != nil {
		log.Fatal("服务启动失败:", err)
	}
}

func createAdminUser() {
	db := database.GetDB()
	var user models.User
	result := db.Where("username = ?", config.C.AdminUsername).First(&user)
	if result.Error == nil {
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.C.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Println("密码哈希失败:", err)
		return
	}

	admin := models.User{
		Username: config.C.AdminUsername,
		Password: string(hashedPassword),
	}
	db.Create(&admin)
	log.Println("管理员账号创建成功")
}

func setupRoutes(r *gin.Engine) {
	authHandler := handlers.NewAuthHandler(database.GetDB())
	auth := r.Group("/api")
	{
		auth.POST("/login", authHandler.Login)
		auth.GET("/logout", authHandler.Logout)
		auth.GET("/me", middleware.AuthRequired(), authHandler.GetCurrentUser)
	}

	dsHandler := handlers.NewDataSourceHandler(database.GetDB())
	datasources := r.Group("/api/datasources", middleware.AuthRequired())
	{
		datasources.GET("", dsHandler.ListDataSources)
		datasources.POST("", dsHandler.CreateDataSource)
		datasources.DELETE("/:id", dsHandler.DeleteDataSource)
		datasources.POST("/:id/reanalyze", dsHandler.Reanalyze)
	}

	llmHandler := handlers.NewLLMHandler(database.GetDB())
	settings := r.Group("/api/settings", middleware.AuthRequired())
	{
		settings.GET("/llm", llmHandler.ListConfigs)
		settings.POST("/llm", llmHandler.CreateConfig)
		settings.PUT("/llm/:id", llmHandler.UpdateConfig)
		settings.DELETE("/llm/:id", llmHandler.DeleteConfig)
		settings.POST("/llm/:id/activate", llmHandler.ActivateConfig)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
