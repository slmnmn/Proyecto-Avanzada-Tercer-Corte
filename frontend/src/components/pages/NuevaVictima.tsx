import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust based on your backend URL

// Define types for better TypeScript support
interface FormEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault(): void;
}

const NuevaVictima = () => {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [nombre, setNombre] = useState<string>('');
  const [foto, setFoto] = useState<string>('');
  const [causaMuerte, setCausaMuerte] = useState<string>('');
  const [causaPersonalizada, setCausaPersonalizada] = useState<string>('');
  const [detalles, setDetalles] = useState<string>('');
  
  // Estado para controlar la visibilidad del campo personalizado
  const [mostrarCampoPersonalizado, setMostrarCampoPersonalizado] = useState<boolean>(false);
  
  // Estado para manejar el tiempo y etapas
  const [personaRegistrada, setPersonaRegistrada] = useState<boolean>(false);
  const [personaId, setPersonaId] = useState<number | null>(null);
  const [causaRegistrada, setCausaRegistrada] = useState<boolean>(false);
  const [tiempoParaCausa, setTiempoParaCausa] = useState<number>(40);
  const [tiempoParaDetalles, setTiempoParaDetalles] = useState<number>(400);
  const [mostrarFormCausa, setMostrarFormCausa] = useState<boolean>(false);
  const [mostrarFormDetalles, setMostrarFormDetalles] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Referencias para los intervalos
  const timerCausaRef = useRef<number | null>(null);
  const timerDetallesRef = useRef<number | null>(null);
  
  // Estado para determinar si los botones de cancelar y volver deberían ser visibles
  const [botonesCancelarVisibles, setBotonesCancelarVisibles] = useState<boolean>(true);
  
  // Nueva función para registrar muerte por defecto (ataque al corazón)
  const registrarMuertePorDefecto = async (id: number) => {
    try {
      // Registrar causa de muerte como ataque al corazón
      await axios.post(`${API_URL}/people/${id}/death-cause`, {
        cause: 'Ataque al corazón'
      });

      // Registrar estado de muerte con fecha 40 segundos en el futuro
      await axios.post(`${API_URL}/people/${id}/death-status`, {
        isDead: true,
        deathDate: new Date(Date.now() + 40000).toISOString() // 40 segundos en el futuro
      });
    } catch (error) {
      console.error('Error al registrar muerte por defecto:', error);
    }
  };
  
  // Función para manejar la salida prematura (botones "Cancelar" y "Volver al menú")
  const handleSalirPrematuramente = async () => {
    // Si la persona ha sido registrada pero no la causa, registrar la muerte por defecto
    if (personaRegistrada && personaId && !causaRegistrada) {
      await registrarMuertePorDefecto(personaId);
      alert('La víctima morirá de un ataque al corazón en 40 segundos.');
    }
    
    // Navegar al menú
    navigate('/menu');
  };
  
  // Efecto para mostrar/ocultar el campo personalizado según la selección
  useEffect(() => {
    setMostrarCampoPersonalizado(causaMuerte === 'Personalizada');
  }, [causaMuerte]);
  
  // Efecto para actualizar la visibilidad de los botones de cancelación
  useEffect(() => {
    // Ocultar botones cuando las barras de tiempo están activas
    if ((personaRegistrada && !causaRegistrada && tiempoParaCausa > 0) || 
        (causaRegistrada && tiempoParaDetalles > 0)) {
      setBotonesCancelarVisibles(false);
    } else {
      setBotonesCancelarVisibles(true);
    }
  }, [personaRegistrada, causaRegistrada, tiempoParaCausa, tiempoParaDetalles]);
  
  // Efecto para manejar el temporizador de causa de muerte (40 segundos)
  useEffect(() => {
    if (personaRegistrada && !causaRegistrada && tiempoParaCausa > 0) {
      setMostrarFormCausa(true);
      
      timerCausaRef.current = setInterval(() => {
        setTiempoParaCausa((prevTime) => {
          if (prevTime <= 1) {
            if (timerCausaRef.current!== null) {
              clearInterval(timerCausaRef.current);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerCausaRef.current!== null) {
        clearInterval(timerCausaRef.current);
      }
    };
  }, [personaRegistrada, causaRegistrada]);
  
  // Efecto para manejar el temporizador de detalles (6 min 40 seg)
  useEffect(() => {
    if (causaRegistrada && tiempoParaDetalles > 0) {
      setMostrarFormDetalles(true);
      
      timerDetallesRef.current = setInterval(() => {
        setTiempoParaDetalles((prevTime) => {
          if (prevTime <= 1) {
            if (timerDetallesRef.current) {
              clearInterval(timerDetallesRef.current);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerDetallesRef.current) {
        clearInterval(timerDetallesRef.current);
      }
    };
  }, [causaRegistrada]);
  
  // Efecto para ocultar formulario de causa cuando se acaba el tiempo
  useEffect(() => {
    if (tiempoParaCausa === 0 && !causaRegistrada && personaId) {
      setMostrarFormCausa(false);
      
      // Si se acabó el tiempo y no se registró causa, registrar muerte por defecto
      const registrarAtaquePorDefecto = async () => {
        await registrarMuertePorDefecto(personaId);
      };
      
      registrarAtaquePorDefecto();
      
      // Mostrar mensaje
      alert('Tiempo agotado. La víctima morirá de un ataque al corazón.');
      
      // Redireccionar al menú después de 2 segundos
      setTimeout(() => {
        navigate('/menu');
      }, 2000);
    }
  }, [tiempoParaCausa, causaRegistrada, navigate, personaId]);
  
  // Efecto para ocultar formulario de detalles cuando se acaba el tiempo
  useEffect(() => {
    if (tiempoParaDetalles === 0 && causaRegistrada && personaId) {
      setMostrarFormDetalles(false);
      
      // Si se acabó el tiempo y no se registraron detalles, registrar muerte sin detalles
      const registrarMuerteSinDetalles = async () => {
        try {
          await axios.post(`${API_URL}/people/${personaId}/death-status`, {
            isDead: true,
            deathDate: new Date(Date.now() + 40000).toISOString() // 40 segundos en el futuro
          });
        } catch (error) {
          console.error('Error al registrar estado de muerte:', error);
        }
      };
      
      registrarMuerteSinDetalles();
      
      // Mostrar mensaje
      alert('Tiempo agotado para añadir detalles. La víctima morirá en 40 segundos.');
      
      // Redireccionar al menú después de 2 segundos
      setTimeout(() => {
        navigate('/menu');
      }, 2000);
    }
  }, [tiempoParaDetalles, causaRegistrada, navigate, personaId]);
  
  // Función para manejar el registro de la persona
  const handleRegistrarPersona = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !foto) {
      alert('El nombre completo y una foto son obligatorios para registrar en la Death Note.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Llamada a la API para guardar la nueva persona
      const response = await axios.post(`${API_URL}/people`, {
        fullName: nombre,
        age: 0, // Este campo es opcional según tu API
        photoURL: foto
      });
      
      if (response.data && response.data.person_id) {
        setPersonaId(response.data.person_id);
        setPersonaRegistrada(true);
        
        // Iniciar contador de 40 segundos para causa de muerte
        setTiempoParaCausa(40);
      } else {
        throw new Error('No se pudo registrar la persona');
      }
    } catch (error) {
      console.error('Error al registrar persona:', error);
      alert('Error al registrar a la víctima en la Death Note.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Función para manejar el registro de la causa de muerte
  const handleRegistrarCausa = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!personaId) {
      alert('Primero debes registrar a la persona.');
      return;
    }
    
    let causaFinal = causaMuerte;
    if (causaMuerte === 'Personalizada' && causaPersonalizada) {
      causaFinal = causaPersonalizada;
    }
    
    setSubmitting(true);
    
    try {
      // Llamada a la API para registrar causa de muerte
      const response = await axios.post(`${API_URL}/people/${personaId}/death-cause`, {
        cause: causaFinal
      });
      
      if (response.status === 200) {
        setCausaRegistrada(true);
        
        // Limpiar temporizador de causa
        if (timerCausaRef.current!== null) {
          clearInterval(timerCausaRef.current);
        }
        
        // Iniciar contador de 6 min 40 seg para detalles
        setTiempoParaDetalles(400);
        
        // Si no se eligió una causa personalizada, mostrar mensaje y redirigir
        if (!causaFinal) {
          alert('La víctima morirá de un ataque al corazón en 40 segundos.');
          setTimeout(() => {
            navigate('/menu');
          }, 2000);
          await axios.post(`${API_URL}/people/${personaId}/death-status`, {
            isDead: true,
            deathDate: new Date(Date.now() + 40000).toISOString()
          });
        }
      } else {
        throw new Error('No se pudo registrar la causa de muerte');
      }
    } catch (error) {
      console.error('Error al registrar causa de muerte:', error);
      
    } finally {
      setSubmitting(false);
    }
  };
  
  // Función para manejar el registro de detalles
  const handleRegistrarDetalles = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!personaId || !causaRegistrada) {
      alert('Primero debes registrar a la persona y la causa de muerte.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Llamada a la API para registrar detalles
      const response = await axios.post(`${API_URL}/people/${personaId}/death-details`, {
        detail: detalles
      });
      
      if (response.status === 200) {
        // Limpiar temporizador de detalles
        if (timerDetallesRef.current) {
          clearInterval(timerDetallesRef.current);
        }
        
        alert('Detalles registrados. La víctima morirá en 40 segundos según lo especificado.');
        
        // Redireccionar al menú
        setTimeout(() => {
          navigate('/menu');
        }, 2000);
        await axios.post(`${API_URL}/people/${personaId}/death-status`, {
          isDead: true,
          deathDate: new Date(Date.now() + 40000).toISOString()
        });
      } else {
        throw new Error('No se pudieron registrar los detalles');
      }
    } catch (error) {
      console.error('Error al registrar detalles:', error);
      
    } finally {
      setSubmitting(false);
    }
  };
  
  // Función para formatear tiempo (segundos a MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Función para calcular porcentaje de tiempo restante
  const calculateTimePercentage = (current: number, total: number): number => {
    return (current / total) * 100;
  };
  
  // Porcentajes para las barras de progreso
  const causaTimePercentage = calculateTimePercentage(tiempoParaCausa, 40);
  const detallesTimePercentage = calculateTimePercentage(tiempoParaDetalles, 400);

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
        {/* Imagen de fondo con baja opacidad - FIJADA durante scroll */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/img/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
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
                Añadir nueva víctima
              </h1>
            </div>
          </div>
          
          {/* Botón para volver al menú - Visible solo cuando no hay contadores activos */}
          {botonesCancelarVisibles && (
            <div className="row mb-4">
              <div className="col-md-6 ms-auto me-auto d-flex justify-content-center">
                <button 
                  onClick={handleSalirPrematuramente}
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
                </button>
              </div>
            </div>
          )}
          
          {/* Formulario para añadir nueva víctima */}
          <div className="row">
            <div className="col-lg-8 col-md-10 mx-auto">
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
                
                {/* Contenido del formulario */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {/* Primera etapa: Registro de nombre y foto */}
                  {!personaRegistrada && (
                    <form onSubmit={handleRegistrarPersona}>
                      {/* Campo: Nombre completo */}
                      <div className="mb-4">
                        <label 
                          htmlFor="nombre" 
                          className="form-label"
                          style={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            fontSize: '1.1rem'
                          }}
                        >
                          Nombre completo
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="nombre" 
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #444',
                            padding: '0.7rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontSize: '1.1rem'
                          }}
                        />
                        <small className="form-text" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Recuerda escribir el nombre completo y visualizar el rostro
                        </small>
                      </div>
                      
                      {/* Campo: Foto de la víctima */}
                      <div className="mb-4">
                        <label 
                          htmlFor="foto" 
                          className="form-label"
                          style={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            fontSize: '1.1rem'
                          }}
                        >
                          Foto de la víctima (URL)
                        </label>
                        <input 
                          type="url" 
                          className="form-control" 
                          id="foto" 
                          value={foto}
                          onChange={(e) => setFoto(e.target.value)}
                          required
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #444',
                            padding: '0.7rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontSize: '1.1rem'
                          }}
                        />
                      </div>
                      
                      {/* Botones de acción para la primera etapa */}
                      <div className="d-flex justify-content-center gap-3 mt-5">
                        {botonesCancelarVisibles && (
                          <button 
                            type="button" 
                            className="btn"
                            onClick={handleSalirPrematuramente}
                            style={{
                              backgroundColor: 'white',
                              color: 'black',
                              padding: '0.5rem 1.5rem',
                              border: '1px solid #222',
                              borderRadius: '0.25rem',
                              fontSize: '1.1rem',
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
                            disabled={submitting}
                          >
                            Cancelar
                          </button>
                        )}
                        
                        <button 
                          type="submit" 
                          style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '0.5rem 1.5rem',
                            border: '1px solid #222',
                            borderRadius: '0.25rem',
                            fontSize: '1.1rem',
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
                          disabled={submitting}
                        >
                          {submitting ? 'Registrando...' : 'Registrar en Death Note'}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Segunda etapa: Causa de muerte (aparece después de registrar el nombre) */}
                  {personaRegistrada && mostrarFormCausa && !causaRegistrada && (
                    <form onSubmit={handleRegistrarCausa}>
                      <div className="text-center mb-4">
                        <h3 style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                          Tiempo restante para especificar causa de muerte
                        </h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                          {formatTime(tiempoParaCausa)}
                        </div>
                        
                        {/* Barra de progreso para el tiempo */}
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '12px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            margin: '0 auto 20px'
                          }}
                        >
                          <div 
                            style={{ 
                              width: `${causaTimePercentage}%`, 
                              height: '100%', 
                              backgroundColor: causaTimePercentage < 25 ? '#ff3b30' : '#4cd964',
                              transition: 'width 1s linear'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Campo: Forma de morir */}
                      <div className="mb-4">
                        <label 
                          htmlFor="causaMuerte" 
                          className="form-label"
                          style={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            fontSize: '1.1rem'
                          }}
                        >
                          Forma de morir
                        </label>
                        <select 
                          className="form-select" 
                          id="causaMuerte"
                          value={causaMuerte}
                          onChange={(e) => setCausaMuerte(e.target.value)}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #444',
                            padding: '0.7rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontSize: '1.1rem'
                          }}
                        >
                          <option value="" disabled>Selecciona una causa</option>
                          <option value="Ataque al corazón">Ataque al corazón</option>
                          <option value="Accidente">Accidente</option>
                          <option value="Suicidio">Suicidio</option>
                          <option value="Enfermedad">Enfermedad</option>
                          <option value="Personalizada">Personalizada</option>
                        </select>
                        <small className="form-text" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Si no se especifica, ocurrirá por ataque al corazón
                        </small>
                      </div>
                      
                      {/* Campo: Causa de muerte personalizada (condicional) */}
                      {mostrarCampoPersonalizado && (
                        <div className="mb-4">
                          <label 
                            htmlFor="causaPersonalizada" 
                            className="form-label"
                            style={{ 
                              fontWeight: 'bold',
                              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                              fontSize: '1.1rem'
                            }}
                          >
                            Especificar causa de muerte
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="causaPersonalizada" 
                            value={causaPersonalizada}
                            onChange={(e) => setCausaPersonalizada(e.target.value)}
                            required={causaMuerte === 'Personalizada'}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #444',
                              padding: '0.7rem',
                              fontFamily: "'Crimson Text', Georgia, serif",
                              fontSize: '1.1rem'
                            }}
                            placeholder="Describe la causa específica de muerte..."
                          />
                        </div>
                      )}
                      
                      {/* Botones de acción para la segunda etapa - No se muestran los botones de cancelar */}
                      <div className="d-flex justify-content-center gap-3 mt-5">
                        <button 
                          type="submit" 
                          style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '0.5rem 1.5rem',
                            border: '1px solid #222',
                            borderRadius: '0.25rem',
                            fontSize: '1.1rem',
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
                          disabled={submitting}
                        >
                          {submitting ? 'Registrando...' : 'Registrar causa de muerte'}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Tercera etapa: Detalles de la muerte (aparece después de registrar la causa) */}
                  {causaRegistrada && mostrarFormDetalles && (
                    <form onSubmit={handleRegistrarDetalles}>
                      <div className="text-center mb-4">
                        <h3 style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                          Tiempo restante para agregar detalles
                        </h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                          {formatTime(tiempoParaDetalles)}
                        </div>
                        
                        {/* Barra de progreso para el tiempo de detalles */}
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '12px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            margin: '0 auto 20px'
                          }}
                        >
                          <div 
                            style={{ 
                              width: `${detallesTimePercentage}%`, 
                              height: '100%', 
                              backgroundColor: detallesTimePercentage < 25 ? '#ff3b30' : '#4cd964',
                              transition: 'width 1s linear'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Campo: Detalles de la muerte */}
                      <div className="mb-4">
                        <label 
                          htmlFor="detalles" 
                          className="form-label"
                          style={{ 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            fontSize: '1.1rem'
                          }}
                        >
                          Detalles de la muerte (opcional)
                        </label>
                        <textarea 
                          className="form-control" 
                          id="detalles"
                          value={detalles}
                          onChange={(e) => setDetalles(e.target.value)}
                          rows={5}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #444',
                            padding: '0.7rem',
                            fontFamily: "'Crimson Text', Georgia, serif",
                            fontSize: '1.1rem'
                          }}
                          placeholder="Describe los detalles específicos de la muerte..."
                        />
                        <small className="form-text" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Puedes especificar circunstancias, hora, lugar y otros detalles
                        </small>
                      </div>
                      
                      {/* Botones de acción para la tercera etapa - Sin botones de cancelar cuando el timer está activo */}
                      <div className="d-flex justify-content-center gap-3 mt-5">
                        {botonesCancelarVisibles && (
                          <button 
                            type="button" 
                            className="btn"
                            onClick={handleSalirPrematuramente}
                            style={{
                              backgroundColor: 'white',
                              color: 'black',
                              padding: '0.5rem 1.5rem',
                              border: '1px solid #222',
                              borderRadius: '0.25rem',
                              fontSize: '1.1rem',
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
                            disabled={submitting}
                          >
                            Omitir detalles
                          </button>
                        )}
                        
                        <button 
                          type="submit" 
                          style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '0.5rem 1.5rem',
                            border: '1px solid #222',
                            borderRadius: '0.25rem',
                            fontSize: '1.1rem',
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
                          disabled={submitting}
                        >
                          {submitting ? 'Registrando...' : 'Registrar detalles'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NuevaVictima;