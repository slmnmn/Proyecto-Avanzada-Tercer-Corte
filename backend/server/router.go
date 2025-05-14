package server

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func (s *Server) router() http.Handler {
	router := mux.NewRouter()
	router.Use(s.logger.RequestLogger)

	// Rutas para personas (entradas en la Death Note)
	router.HandleFunc("/people", s.HandlePeople).Methods(http.MethodGet, http.MethodPost)
	router.HandleFunc("/people/{id}", s.HandlePeopleWithId).Methods(http.MethodGet, http.MethodPut, http.MethodDelete)

	// Agregar causa de muerte (40 segundos después de registrar)
	router.HandleFunc("/people/{id}/death-cause", s.HandleDeathCause).Methods(http.MethodPost)

	// Agregar detalles específicos (6 minutos y 40 segundos adicionales)
	router.HandleFunc("/people/{id}/death-details", s.HandleDeathDetails).Methods(http.MethodPost)

	// Configurar CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Permite todos los orígenes en desarrollo. En producción, deberías ser más específico
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            false, // Establece a true si necesitas depurar problemas CORS
	})

	// Envuelve el router con el middleware CORS
	handler := c.Handler(router)

	return handler
}
