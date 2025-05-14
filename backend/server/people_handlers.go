package server

import (
	"backend-avanzada/api"
	"backend-avanzada/models"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

func (s *Server) HandlePeople(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleGetAllPeople(w, r)
		return
	case http.MethodPost:
		s.handleCreatePerson(w, r)
		return
	}
}

func (s *Server) HandlePeopleWithId(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleGetPersonById(w, r)
		return
	case http.MethodPut:
		s.handleEditPerson(w, r)
		return
	case http.MethodDelete:
		s.handleDeletePerson(w, r)
		return
	}
}

// HandleDeathCause maneja la adición de causa de muerte (debe ser dentro de 40 segundos)
func (s *Server) HandleDeathCause(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 32)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	var deathCauseReq api.DeathCauseRequestDto
	err = json.NewDecoder(r.Body).Decode(&deathCauseReq)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	person, err := s.PeopleRepository.FindById(int(id))
	if person == nil || err != nil {
		s.HandleError(w, http.StatusNotFound, r.URL.Path, fmt.Errorf("person with id %d not found", id))
		return
	}

	// Verificar si aún estamos dentro del período de 40 segundos
	timeElapsed := time.Since(person.CreatedAt)
	if timeElapsed.Seconds() > float64(s.Config.DeathNoteDelay) {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, fmt.Errorf("time limit of %d seconds exceeded", s.Config.DeathNoteDelay))
		return
	}

	err = s.PeopleRepository.UpdateDeathCause(int(id), deathCauseReq.Cause)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	// Programar la muerte con la causa especificada después del retraso apropiado
	// Solo si no hay detalles específicos, de lo contrario esperamos los detalles
	if deathCauseReq.Cause != "" {
		// El usuario tiene 6 minutos y 40 segundos adicionales para detalles
		s.scheduleTaskWithDelay(int(id), time.Duration(s.Config.DeathDetailDelay)*time.Second, func() error {
			person, err := s.PeopleRepository.FindById(int(id))
			if err != nil {
				return err
			}

			// Si los detalles no fueron especificados, marcar como muerto por la causa base
			if person.DeathDetail == "" {
				deathTime := time.Now()
				deathTimeStr := deathTime.Format(time.RFC3339)
				err = s.PeopleRepository.UpdateStatus(int(id), "Muerto por infarto", &deathTimeStr)
				if err != nil {
					return err
				}
			}
			return nil
		})
	} else {
		// Si no se especificó causa, programar ataque al corazón
		deathTime := time.Now().Add(time.Duration(s.Config.DefaultHeartAttackDelay) * time.Second)
		deathTimeStr := deathTime.Format(time.RFC3339) // "2025-05-13T02:21:59Z"
		s.scheduleTaskWithDelay(int(id), time.Duration(s.Config.DefaultHeartAttackDelay)*time.Second, func() error {
			return s.PeopleRepository.UpdateStatus(int(id), "Muerto", &deathTimeStr)
		})
	}

	// Devolver la persona actualizada
	person, _ = s.PeopleRepository.FindById(int(id))
	response, err := json.Marshal(person.ToPersonResponseDto())
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
	s.logger.Info(http.StatusOK, r.URL.Path, start)
}

// HandleDeathDetails maneja la adición de detalles específicos de muerte
func (s *Server) HandleDeathDetails(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 32)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	var detailReq api.DeathDetailRequestDto
	err = json.NewDecoder(r.Body).Decode(&detailReq)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	person, err := s.PeopleRepository.FindById(int(id))
	if person == nil || err != nil {
		s.HandleError(w, http.StatusNotFound, r.URL.Path, fmt.Errorf("person with id %d not found", id))
		return
	}

	// Verificar si tenemos una causa de muerte primero
	if person.DeathCause == "" {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, fmt.Errorf("must specify death cause before details"))
		return
	}

	// Verificar si aún estamos dentro del período para detalles (6 min 40 seg = 400 seg)
	timeElapsed := time.Since(person.CreatedAt)
	if timeElapsed.Seconds() > float64(s.Config.DeathNoteDelay+s.Config.DeathDetailDelay) {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, fmt.Errorf("time limit for details exceeded"))
		return
	}

	err = s.PeopleRepository.UpdateDeathDetail(int(id), detailReq.Detail)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	// Programar la muerte después de 40 segundos
	deathTime := time.Now().Add(time.Duration(s.Config.DeathWithCauseDelay) * time.Second)
	deathTimeStr := deathTime.String()
	s.scheduleTaskWithDelay(int(id), time.Duration(s.Config.DeathWithCauseDelay)*time.Second, func() error {
		return s.PeopleRepository.UpdateStatus(int(id), "Muerto", &deathTimeStr)
	})

	// Devolver la persona actualizada
	person, _ = s.PeopleRepository.FindById(int(id))
	response, err := json.Marshal(person.ToPersonResponseDto())
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
	s.logger.Info(http.StatusOK, r.URL.Path, start)
}

func (s *Server) handleGetAllPeople(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	people, err := s.PeopleRepository.FindAll()
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	result := []*api.PersonResponseDto{}
	for _, person := range people {
		result = append(result, person.ToPersonResponseDto())
	}

	response, err := json.Marshal(result)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
	s.logger.Info(http.StatusOK, r.URL.Path, start)
}

func (s *Server) handleGetPersonById(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 32)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	person, err := s.PeopleRepository.FindById(int(id))
	if person == nil && err == nil {
		s.HandleError(w, http.StatusNotFound, r.URL.Path, fmt.Errorf("person with id %d not found", id))
		return
	}
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	response, err := json.Marshal(person.ToPersonResponseDto())
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
	s.logger.Info(http.StatusOK, r.URL.Path, start)
}

func (s *Server) handleCreatePerson(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	var p api.PersonRequestDto
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	// Validar que se proporcione una URL de foto
	if p.PhotoURL == "" {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, fmt.Errorf("photo URL is required"))
		return
	}

	// Crear la nueva persona en la Death Note
	person := &models.Person{
		FullName: p.FullName,
		Age:      p.Age,
		PhotoURL: p.PhotoURL,
		Status:   "Vivo", // Inicialmente viva
	}

	person, err = s.PeopleRepository.Save(person)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	// Por defecto, programar un ataque al corazón después de 40 segundos
	// si no se especifica una causa de muerte
	s.scheduleTaskWithDelay(int(person.ID), time.Duration(s.Config.DefaultHeartAttackDelay)*time.Second, func() error {
		// Verificar si ya se especificó una causa
		p, err := s.PeopleRepository.FindById(int(person.ID))
		if err != nil {
			return err
		}

		// Si no se ha especificado una causa, matar por ataque al corazón
		if p.DeathCause == "" {
			deathTime := time.Now()
			deathTimeStr := deathTime.String()
			return s.PeopleRepository.UpdateStatus(int(person.ID), "Muerto", &deathTimeStr)
		}
		return nil
	})

	response, err := json.Marshal(person.ToPersonResponseDto())
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(response)
	s.logger.Info(http.StatusCreated, r.URL.Path, start)
}

func (s *Server) handleEditPerson(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 32)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	var p api.PersonRequestDto
	err = json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	person, err := s.PeopleRepository.FindById(int(id))
	if person == nil && err == nil {
		s.HandleError(w, http.StatusNotFound, r.URL.Path, fmt.Errorf("person with id %d not found", id))
		return
	}
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	// Solo permitir ediciones si la persona aún está viva
	if person.Status == "Muerto" {
		s.HandleError(w, http.StatusConflict, r.URL.Path, fmt.Errorf("cannot edit a dead person"))
		return
	}

	person.FullName = p.FullName
	person.Age = p.Age
	if p.PhotoURL != "" {
		person.PhotoURL = p.PhotoURL
	}

	person, err = s.PeopleRepository.Save(person)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	response, err := json.Marshal(person.ToPersonResponseDto())
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	w.Write(response)
	s.logger.Info(http.StatusAccepted, r.URL.Path, start)
}

func (s *Server) handleDeletePerson(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 32)
	if err != nil {
		s.HandleError(w, http.StatusBadRequest, r.URL.Path, err)
		return
	}

	person, err := s.PeopleRepository.FindById(int(id))
	if person == nil && err == nil {
		s.HandleError(w, http.StatusNotFound, r.URL.Path, fmt.Errorf("person with id %d not found", id))
		return
	}
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	err = s.PeopleRepository.Delete(person)
	if err != nil {
		s.HandleError(w, http.StatusInternalServerError, r.URL.Path, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
	s.logger.Info(http.StatusNoContent, r.URL.Path, start)
}
