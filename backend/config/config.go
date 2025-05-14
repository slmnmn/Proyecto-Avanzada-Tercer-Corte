package config

type Config struct {
	Address                 string `json:"address"`
	Database                string `json:"database"`
	DeathNoteDelay          int    `json:"death_note_delay"`           // 40 segundos para especificar causa
	DeathDetailDelay        int    `json:"death_detail_delay"`         // 6 minutos y 40 segundos para detalles
	DeathWithCauseDelay     int    `json:"death_with_cause_delay"`     // 40 segundos después de detalles
	DefaultHeartAttackDelay int    `json:"default_heart_attack_delay"` // Cuando no se especifica causa
}
