package models

import (
	"backend-avanzada/api"
	"time"

	"gorm.io/gorm"
)

type Person struct {
	gorm.Model
	FullName    string
	Age         int
	PhotoURL    string // URL de la foto de la persona
	Status      string // "Vivo" o "Muerto"
	DeathCause  string // Causa de muerte, vacío si es ataque al corazón por defecto
	DeathDetail string // Detalles específicos de la muerte
	DeathTime   *time.Time // Tiempo en el que la persona murió o morirá
}

func (p *Person) ToPersonResponseDto() *api.PersonResponseDto {
	var deathTimeStr string
	if p.DeathTime != nil {
		deathTimeStr = p.DeathTime.String()
	}
	
	return &api.PersonResponseDto{
		ID:            int(p.ID),
		FullName:      p.FullName,
		Age:           p.Age,
		PhotoURL:      p.PhotoURL,
		CreatedAt:     p.CreatedAt.String(),
		Status:        p.Status,
		DeathCause:    p.DeathCause,
		DeathDetail:   p.DeathDetail,
		DeathTime:     deathTimeStr,
	}
}