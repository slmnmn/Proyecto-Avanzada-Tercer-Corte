package repository

import (
	"backend-avanzada/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

type PeopleRepository struct {
	db *gorm.DB
}

func NewPeopleRepository(db *gorm.DB) *PeopleRepository {
	return &PeopleRepository{
		db: db,
	}
}

func (p *PeopleRepository) FindAll() ([]*models.Person, error) {
	var people []*models.Person
	err := p.db.Find(&people).Error
	if err != nil {
		return nil, err
	}
	return people, nil
}

func (p *PeopleRepository) Save(data *models.Person) (*models.Person, error) {
	err := p.db.Save(data).Error
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (p *PeopleRepository) FindById(id int) (*models.Person, error) {
	var person models.Person
	err := p.db.Where("id = ?", id).First(&person).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &person, nil
}

func (p *PeopleRepository) Delete(data *models.Person) error {
	err := p.db.Delete(data).Error
	if err != nil {
		return err
	}
	return nil
}

func (p *PeopleRepository) UpdateDeathCause(id int, cause string) error {
	return p.db.Model(&models.Person{}).Where("id = ?", id).Update("death_cause", cause).Error
}

func (p *PeopleRepository) UpdateDeathDetail(id int, detail string) error {
	return p.db.Model(&models.Person{}).Where("id = ?", id).Update("death_detail", detail).Error
}

func (p *PeopleRepository) UpdateStatus(id int, status string, deathTime *string) error { // Sigue dando errores
	updates := map[string]interface{}{
		"status": status,
	}
	if deathTime != nil {
		// to a time.Time object
		parsedTime, err := time.Parse(time.RFC3339, *deathTime)
		if err != nil {
			// Si la cadena aún no está en formato RFC3339, intente analizar el formato predeterminado de Go
			parsedTime, err = time.Parse("2006-01-02 15:04:05.999999999 -0700 MST", *deathTime)
			if err != nil {
				// Si me manda error, que use el tiempo que tiene que usar.
				parsedTime = time.Now()
			}
		}
		// Use the time. El objeto time va a ser formateado a lo que es mediante el ORM
		updates["death_time"] = parsedTime
	}
	return p.db.Model(&models.Person{}).Where("id = ?", id).Updates(updates).Error
}
