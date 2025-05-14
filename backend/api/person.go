package api

type PersonRequestDto struct {
	FullName string `json:"fullName"`
	Age      int    `json:"age"`
	PhotoURL string `json:"photoURL"`
}

type PersonResponseDto struct {
	ID          int    `json:"person_id"`
	FullName    string `json:"fullName"`
	Age         int    `json:"age"`
	PhotoURL    string `json:"photoURL"`
	CreatedAt   string `json:"createdAt"`
	Status      string `json:"status"`
	DeathCause  string `json:"deathCause,omitempty"`
	DeathDetail string `json:"deathDetail,omitempty"`
	DeathTime   string `json:"deathTime,omitempty"`
}

type ErrorResponse struct {
	Status      int    `json:"status"`
	Description string `json:"description"`
	Message     string `json:"message"`
}

// DTO para agregar la causa de muerte
type DeathCauseRequestDto struct {
	Cause string `json:"cause"`
}

// DTO para agregar detalles específicos de la muerte
type DeathDetailRequestDto struct {
	Detail string `json:"detail"`
}
