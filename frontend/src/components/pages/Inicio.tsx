import { Link } from "react-router-dom";

const Inicio = () => {
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
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 0
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '20px' }}>
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
                  letterSpacing: '1px'
                }}
              >
                Bienvenido a la Death Note 2.0
              </h1>
            </div>
          </div>
        
          <div className="row align-items-center justify-content-center">
            {/* Lado izquierdo - Imagen */}
            <div className="col-md-6 d-flex justify-content-center mb-4 mb-md-0">
              <img
                src="/img/APPLE.png"
                alt="Death Note"
                className="img-fluid"
                style={{
                  maxWidth: '500px',
                  width: '100%'
                }}
              />
            </div>
            
            {/* Lado derecho - Reglas */}
            <div className="col-md-6">
              <div 
                className="p-4 rounded shadow-lg"
                style={{
                  backgroundImage: "/img/FONDO-INS.png",
                  backgroundColor: 'rgba(30, 30, 30, 0.9)',
                  color: 'white',
                  fontFamily: "'Crimson Text', Georgia, serif",
                  border: '1px solid #444',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                <h3 className="text-center mb-4" style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 'bold' }}>
                  INSTRUCCIONES DE LA DEATH NOTE
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '1.05rem' }}>
                  <li className="mb-3">• El humano cuyo nombre sea escrito en este cuaderno morirá.</li>
                  <li className="mb-3">• Debes agregar una foto del rostro de la persona mientras escribes su nombre para que tenga efecto.</li>
                  <li className="mb-3">• Si la causa de muerte es escrita en los siguientes 40 segundos de escribir el nombre, esa será la forma en que morirá.</li>
                  <li className="mb-3">• Si la causa de muerte no es especificada, la persona simplemente morirá de un ataque al corazón.</li>
                  <li className="mb-3">• Luego de escribir la causa, tienes 6 minutos y 40 segundos para escribir los detalles de la muerte.</li>
                </ul>
                
                <div className="text-center mt-4">
                  <Link 
                    to="/Menu"
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'black',
                      color: 'white',
                      padding: '0.5rem 1.5rem',
                      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                      fontFamily: "'Crimson Text', Georgia, serif",
                      textDecoration: 'none',
                      borderRadius: '0.25rem',
                      boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)',
                      transition: 'background-color 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#666666'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'black'}
                  >
                    ¡Vamos a matar el aburrimiento!
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inicio;