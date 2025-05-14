import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Definir la interfaz para la persona según la estructura de la API
interface Person {
  person_id: number;
  fullName: string;
  age: number;
  photoURL: string;
  createdAt: string;
  status: string;
  deathCause: string;
  deathDetail: string;
  deathTime: string;
}

const Menu = () => {
  // Estado para almacenar las personas recuperadas de la API
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Efecto para cargar los datos desde la API al montar el componente
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        // Realizar la petición GET a la API
        const response = await fetch('http://localhost:8000/people');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setPeople(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  // Función para manejar la eliminación de una persona
  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setModalVisible(true);
  };
  
  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (pendingDeleteId !== null) {
      try {
        const response = await fetch(`http://localhost:8000/people/${pendingDeleteId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Actualizar el estado local para quitar la persona eliminada
          setPeople(people.filter(person => person.person_id !== pendingDeleteId));
        } else {
          throw new Error(`Error al eliminar: ${response.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
        console.error('Error al eliminar la persona:', err);
      } finally {
        // Cerrar el modal independientemente del resultado
        setModalVisible(false);
        setPendingDeleteId(null);
      }
    }
  };

  // Función para cancelar la eliminación
  const cancelDelete = () => {
    setModalVisible(false);
    setPendingDeleteId(null);
  };

  // Función para formatear la fecha de muerte de forma legible
  const formatDeathTime = (deathTime: string): string => {
    if (!deathTime) return 'Pendiente';
    
    try {
      const date = new Date(deathTime);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return deathTime;
    }
  };

  return (
    <>
      {/* Font import */}
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet" />
      
      <div 
        style={{
          background: 'linear-gradient(to bottom, #b0b0b0, #ffffff)',
          position: 'fixed', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          fontFamily: "'Crimson Text', Georgia, serif",
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          height: '100%'
        }}
      >
        {/* Imagen de fondo con baja opacidad */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/img/background.jpg)',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '50px' }}>
          {/* Título de bienvenida */}
          <div className="row">
            <div className="col-12 text-center">
              <h1 
                style={{
                  fontFamily: "'Crimson Text', Georgia, serif",
                  fontWeight: 'bold',
                  color: '#000',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  marginTop: '20px',
                  marginBottom: '30px',
                  letterSpacing: '1px'
                }}
              >
                Death Note - Registro de Víctimas
              </h1>
            </div>
          </div>
          
          {/* Contenedor para botón de volver o agregar nuevo */}
          <div className="row mb-4">
            <div className="col-md-6 ms-auto me-auto d-flex justify-content-center gap-3">
              <Link 
                to="/"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #222',
                  borderRadius: '0.25rem',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  fontFamily: "'Crimson Text', Georgia, serif",
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#666666';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                }}
              >
                Volver al inicio
              </Link>
              
              <Link 
                to="/NuevaVictima"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #222',
                  borderRadius: '0.25rem',
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  fontFamily: "'Crimson Text', Georgia, serif",
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#666666';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                }}
              >
                Agregar nueva víctima
              </Link>
            </div>
          </div>

          {/* Mostrar estado de carga */}
          {loading && (
            <div className="row">
              <div className="col-12 text-center">
                <p>Cargando registros de Death Note...</p>
              </div>
            </div>
          )}

          {/* Mostrar mensaje de error si ocurre */}
          {error && (
            <div className="row">
              <div className="col-12 text-center">
                <div className="alert alert-danger">
                  Error al cargar los datos: {error}
                </div>
              </div>
            </div>
          )}
        
          {/* Tarjetas de personas en la Death Note */}
          {!loading && !error && (
            <div className="row">
              {people.map((person) => (
                <div key={person.person_id} className="col-md-4 mb-4">
                  <div 
                    className="p-4 rounded shadow-lg h-100"
                    style={{
                      background: `url(/img/FONDO-INS.png) no-repeat center center`,
                      backgroundSize: 'cover',
                      color: 'white',
                      fontFamily: "'Crimson Text', Georgia, serif",
                      border: '1px solid #444',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Capa oscura para mejorar legibilidad del texto */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        zIndex: 1,
                        borderRadius: '0.25rem'
                      }}
                    />
                    
                    {/* Contenido de la tarjeta */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 className="text-center mb-3" style={{ 
                        fontWeight: 'bold',
                        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
                      }}>
                        {person.fullName}
                      </h3>

                      {/* Imagen de la persona */}
                      <div className="text-center mb-3">
                        <img 
                          src={person.photoURL} 
                          alt={`Foto de ${person.fullName}`} 
                          style={{
                            maxWidth: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            border: '2px solid #fff',
                            borderRadius: '3px',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                          }}
                        />
                      </div>
                      
                      <div style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.3)', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '10px 0',
                        marginBottom: '10px'
                      }}>
                        <p><strong>Estado:</strong> {person.status}</p>
                        <p>
                          <strong>Causa:</strong> {person.deathCause || "Ataque al corazón"}
                        </p>
                        {person.deathTime && (
                          <p><strong>Hora de muerte:</strong> {formatDeathTime(person.deathTime)}</p>
                        )}
                      </div>
                      
                      {/* Mostrar detalles si existen o indicar si no hay */}
                      <p>
                        <strong>Detalles:</strong> {person.deathDetail || "Sin detalles específicos"}
                      </p>
                      
                      <div className="text-center mt-4">
                        <Link 
                          to={`/detalles/${person.person_id}`}
                          style={{
                            display: 'inline-block',
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '0.25rem 0.75rem',
                            marginRight: '0.5rem',
                            border: '1px solid #222',
                            borderRadius: '0.25rem',
                            fontSize: '0.9rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#666666';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                          }}
                        >
                          Ver detalles
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(person.person_id)}
                          style={{
                            display: 'inline-block',
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '0.25rem 0.75rem',
                            border: '1px solid #222',
                            borderRadius: '0.25rem',
                            fontSize: '0.9rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#666666';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Mensaje cuando no hay personas registradas */}
          {!loading && !error && people.length === 0 && (
            <div className="row">
              <div className="col-12 text-center">
                <div 
                  className="p-4 rounded shadow-lg"
                  style={{
                    background: `url(/img/FONDO-INS.png) no-repeat center center`,
                    backgroundSize: 'cover',
                    color: 'white',
                    fontFamily: "'Crimson Text', Georgia, serif",
                    border: '1px solid #444',
                    maxWidth: '600px',
                    margin: '0 auto',
                    position: 'relative'
                  }}
                >
                  {/* Capa oscura */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      zIndex: 1,
                      borderRadius: '0.25rem'
                    }}
                  />
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h3 className="text-center mb-3" style={{ fontWeight: 'bold' }}>
                      Aún no has escrito ningún nombre
                    </h3>
                    <p className="text-center">
                      La Death Note espera tus inscripciones. ¿A quién elegirás primero?
                    </p>
                    <div className="text-center mt-4">
                      <Link 
                        to="/NuevaVictima"
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'white',
                          color: 'black',
                          padding: '0.5rem 1.5rem',
                          border: '1px solid #222',
                          borderRadius: '0.25rem',
                          fontSize: '0.9rem',
                          fontFamily: "'Crimson Text', Georgia, serif",
                          fontWeight: '600',
                          textDecoration: 'none',
                          boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#666666';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = 'black';
                        }}
                      >
                        Escribe tu primer nombre
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal de confirmación personalizado */}
          {modalVisible && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                width: '300px',
                background: 'linear-gradient(to bottom, #d0d0d0, #f5f5f5)',
                borderRadius: '5px',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
                padding: '20px',
                fontFamily: "'Crimson Text', Georgia, serif",
                border: '1px solid #333',
              }}>
                <h4 style={{
                  textAlign: 'center',
                  margin: '0 0 15px 0',
                  color: '#000',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #555',
                  paddingBottom: '10px',
                }}>Confirmación</h4>
                
                <p style={{
                  textAlign: 'center',
                  color: '#000',
                  marginBottom: '20px',
                }}>
                  ¿Estás seguro de que deseas eliminar esta persona de la Death Note?
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '15px',
                }}>
                  <button
                    onClick={confirmDelete}
                    style={{
                      backgroundColor: '#444',
                      color: 'white',
                      padding: '8px 15px',
                      border: '1px solid #222',
                      borderRadius: '4px',
                      fontFamily: "'Crimson Text', Georgia, serif",
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#222';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#444';
                    }}
                  >
                    Confirmar
                  </button>
                  
                  <button
                    onClick={cancelDelete}
                    style={{
                      backgroundColor: '#aaa',
                      color: 'black',
                      padding: '8px 15px',
                      border: '1px solid #888',
                      borderRadius: '4px',
                      fontFamily: "'Crimson Text', Georgia, serif",
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#999';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#aaa';
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Menu;