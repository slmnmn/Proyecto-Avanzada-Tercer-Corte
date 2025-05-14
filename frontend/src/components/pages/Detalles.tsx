import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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

const Detalles = () => {
  // Obtener el ID de la persona desde los parámetros de la URL
  const { id } = useParams<{ id: string }>();
  
  // Estado para almacenar los datos de la persona seleccionada
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar los datos de la persona específica desde la API
  useEffect(() => {
    const fetchPersonDetails = async () => {
      try {
        setLoading(true);
        // Realizar la petición GET a la API para obtener los detalles de una persona específica
        const response = await fetch(`http://localhost:8000/people/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar los detalles:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPersonDetails();
    }
  }, [id]);

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

  // Función para formatear la fecha de creación
  const formatCreatedAt = (createdAt: string): string => {
    if (!createdAt) return 'Desconocido';
    
    try {
      const date = new Date(createdAt);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return createdAt;
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
          {/* Título de la página */}
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
                Detalles de la Víctima
              </h1>
            </div>
          </div>
          
          {/* Botón para volver al menú */}
          <div className="row mb-4">
            <div className="col-md-6 ms-auto me-auto d-flex justify-content-center">
              <Link 
                to="/menu"
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
                Volver al menú
              </Link>
            </div>
          </div>

          {/* Mostrar estado de carga */}
          {loading && (
            <div className="row">
              <div className="col-12 text-center">
                <p>Cargando detalles de la víctima...</p>
              </div>
            </div>
          )}

          {/* Mostrar mensaje de error si ocurre */}
          {error && (
            <div className="row">
              <div className="col-12 text-center">
                <div className="alert alert-danger">
                  Error al cargar los detalles: {error}
                </div>
              </div>
            </div>
          )}
          
          {/* Mostrar detalles de la persona */}
          {!loading && !error && person && (
            <div className="row">
              <div className="col-12">
                <div 
                  className="p-4 rounded shadow-lg"
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
                  {/* Capa oscura para mejorar legibilidad */}
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
                  
                  {/* Contenido de los detalles */}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="row">
                      {/* Lado izquierdo - Foto de la víctima */}
                      <div className="col-md-5 mb-4 mb-md-0 d-flex flex-column align-items-center">
                        <h2 className="text-center mb-3" style={{ 
                          fontWeight: 'bold',
                          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
                        }}>
                          {person.fullName}
                        </h2>
                        
                        <div className="mb-3">
                          <img 
                            src={person.photoURL} 
                            alt={`Foto de ${person.fullName}`} 
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              objectFit: 'cover',
                              border: '3px solid #fff',
                              borderRadius: '5px',
                              boxShadow: '0 0 15px rgba(0,0,0,0.5)'
                            }}
                          />
                        </div>
                        
                        <div className="text-center">
                          <span 
                            style={{
                              display: 'inline-block',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              padding: '0.5rem 1.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              marginTop: '10px'
                            }}
                          >
                            Estado: {person.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lado derecho - Información detallada */}
                      <div className="col-md-7">
                        <div 
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '5px',
                            padding: '20px',
                            height: '100%'
                          }}
                        >
                          <h3 
                            style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                              paddingBottom: '10px',
                              marginBottom: '20px',
                              fontWeight: 'bold',
                              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
                            }}
                          >
                            Información del Death Note
                          </h3>
                          
                          <div style={{ fontSize: '1.1rem' }}>
                            {person.age && (
                              <p><strong>Edad:</strong> {person.age} años</p>
                            )}
                            
                            <p>
                              <strong>Registrado en Death Note:</strong> {formatCreatedAt(person.createdAt)}
                            </p>
                            
                            <p>
                              <strong>Causa de muerte:</strong> {person.deathCause || "Ataque al corazón"}
                            </p>
                            
                            <p>
                              <strong>Hora de muerte:</strong> {formatDeathTime(person.deathTime)}
                            </p>
                            
                            <div style={{ 
                              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                              marginTop: '20px',
                              paddingTop: '20px'
                            }}>
                              <h4 style={{ 
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
                              }}>
                                Detalles de la muerte:
                              </h4>
                              
                              <div 
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  padding: '15px',
                                  borderRadius: '5px',
                                  borderLeft: '3px solid rgba(255, 255, 255, 0.5)',
                                  minHeight: '100px'
                                }}
                              >
                                {person.deathDetail || "Sin detalles específicos registrados. La muerte ocurrió según las reglas normales del Death Note."}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensaje cuando no se encuentra la persona */}
          {!loading && !error && !person && (
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
                      Víctima no encontrada
                    </h3>
                    <p className="text-center">
                      No se ha podido encontrar información sobre esta víctima en el Death Note.
                    </p>
                    <div className="text-center mt-4">
                      <Link 
                        to="/menu"
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
                        Volver al menú
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Reglas en la parte inferior */}
          <div className="row mt-5">
            <div className="col-lg-8 col-md-10 mx-auto">
              <div 
                className="p-4 rounded shadow-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: 'black',
                  fontFamily: "'Crimson Text', Georgia, serif",
                  border: '1px solid #444',
                }}
              >
                <h3 style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>
                  Reglas del Death Note
                </h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                  <li>El humano cuyo nombre sea escrito en este cuaderno morirá.</li>
                  <li>Esta libreta no hará efecto si el escritor no tiene en mente el rostro de la persona mientras escribe el nombre.</li>
                  <li>Si la causa de muerte es escrita en los siguientes 40 segundos de escribir el nombre, esa será la forma en que morirá.</li>
                  <li>Si la causa de muerte no es especificada, la persona simplemente morirá de un ataque al corazón.</li>
                  <li>Luego de escribir la causa, tienes 6 minutos y 40 segundos para escribir los detalles de la muerte.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Detalles;