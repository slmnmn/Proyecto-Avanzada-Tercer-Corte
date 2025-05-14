package server

import (
	"backend-avanzada/config"
	"backend-avanzada/logger"
	"backend-avanzada/models"
	"backend-avanzada/repository"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Server struct {
	DB               *gorm.DB
	Config           *config.Config
	Handler          http.Handler
	PeopleRepository *repository.PeopleRepository
	logger           *logger.Logger
}

// NewServer crea una nueva instancia del servidor
func NewServer() *Server {
	s := &Server{
		logger: logger.NewLogger(),
	}
	var config config.Config
	configFile, err := os.ReadFile("config/config.json")
	if err != nil {
		s.logger.Fatal(err)
	}
	err = json.Unmarshal(configFile, &config)
	if err != nil {
		s.logger.Fatal(err)
	}
	s.Config = &config
	return s
}

// StartServer inicia el servidor HTTP
func (s *Server) StartServer() {
	fmt.Println("Inicializando base de datos...")
	s.initDB()
	fmt.Println("Inicializando mux...")
	srv := &http.Server{
		Addr:    s.Config.Address,
		Handler: s.router(),
	}
	fmt.Println("Escuchando en el puerto ", s.Config.Address)
	if err := srv.ListenAndServe(); err != nil {
		s.logger.Fatal(err)
	}
}

// initDB inicializa la conexión a la base de datos
func (s *Server) initDB() {
	switch s.Config.Database {
	case "sqlite":
		db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
		if err != nil {
			s.logger.Fatal(err)
		}
		s.DB = db
	case "postgres":
		// Obtener variables de entorno para la conexión
		host := os.Getenv("POSTGRES_HOST")
		user := os.Getenv("POSTGRES_USER")
		password := os.Getenv("POSTGRES_PASSWORD")
		dbname := os.Getenv("POSTGRES_DB")

		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=require",
			host, user, password, dbname)

		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			s.logger.Fatal(err)
		}
		s.DB = db
	}

	fmt.Println("Aplicando migraciones...")
	s.DB.AutoMigrate(&models.Person{})
	s.PeopleRepository = repository.NewPeopleRepository(s.DB)
}

// scheduleTaskWithDelay programa una tarea para ejecutarse después de un retraso
func (s *Server) scheduleTaskWithDelay(id int, delay time.Duration, task func() error) {
	go func() {
		// Dormir por el tiempo especificado
		time.Sleep(delay)

		// Ejecutar la tarea
		if err := task(); err != nil {
			s.logger.Error(http.StatusInternalServerError, fmt.Sprintf("scheduled task for id %d", id), err)
		}
	}()
}
