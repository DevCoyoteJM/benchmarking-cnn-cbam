import { useEffect, useState, useRef, useCallback } from 'react';
import type { RecursoVisualEvidencia } from '../types/evidencias';
import {
  obtenerGuiaVisualModelo,
  obtenerEtiquetaConceptual,
  obtenerEsquemaEvidencia,
} from '../services/evidenciasService';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  Maximize,
  Timer,
  AlertTriangle,
} from 'lucide-react';

export interface ModalVisorEvidenciaProps {
  evidencia: RecursoVisualEvidencia;
  evidenciasLista: RecursoVisualEvidencia[];
  onCerrar: () => void;
  onCambiarEvidencia: (evidencia: RecursoVisualEvidencia) => void;
  modeloActivoId?: string;
  nombreModeloActivo?: string;
}

export default function ModalVisorEvidencia({
  evidencia,
  evidenciasLista,
  onCerrar,
  onCambiarEvidencia,
  modeloActivoId,
  nombreModeloActivo,
}: ModalVisorEvidenciaProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Estados de transformación y visualización
  const [zoom, setZoom] = useState<number>(1.0);
  const [modoAjustado, setModoAjustado] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState<boolean>(false);
  const [posicionInicio, setPosicionInicio] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panInicio, setPanInicio] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pantallaCompleta, setPantallaCompleta] = useState<boolean>(false);
  const [panelInfoVisible, setPanelInfoVisible] = useState<boolean>(true);

  // Guía visual contextual del modelo y rigor conceptual
  const guiaVisual = obtenerGuiaVisualModelo(evidencia.id, modeloActivoId);
  const etiquetaConceptual = obtenerEtiquetaConceptual(evidencia.id);
  const esquemaColumnas = guiaVisual?.esquemaColumnas || obtenerEsquemaEvidencia(evidencia.id);

  // Navegación dentro del conjunto filtrado
  const indiceActual = evidenciasLista.findIndex((item) => item.id === evidencia.id);
  const tieneAnterior = indiceActual > 0;
  const tieneSiguiente = indiceActual >= 0 && indiceActual < evidenciasLista.length - 1;

  // Restablecer zoom y pan al cambiar de imagen
  const restablecerVista = useCallback(() => {
    setZoom(1.0);
    setModoAjustado(true);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    restablecerVista();
  }, [evidencia.id, restablecerVista]);

  // Bloquear scroll de la página mientras el modal está abierto
  useEffect(() => {
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, []);

  // Navegación
  const irAnterior = useCallback(() => {
    if (tieneAnterior) {
      onCambiarEvidencia(evidenciasLista[indiceActual - 1]);
    }
  }, [tieneAnterior, evidenciasLista, indiceActual, onCambiarEvidencia]);

  const irSiguiente = useCallback(() => {
    if (tieneSiguiente) {
      onCambiarEvidencia(evidenciasLista[indiceActual + 1]);
    }
  }, [tieneSiguiente, evidenciasLista, indiceActual, onCambiarEvidencia]);

  // Controles de zoom con límites seguros (25% a 500%)
  const aplicarZoom = useCallback((nuevoZoom: number) => {
    const limitado = Math.max(0.25, Math.min(5.0, Number(nuevoZoom.toFixed(2))));
    setZoom(limitado);
    setModoAjustado(false);
  }, []);

  const zoomIn = useCallback(() => {
    aplicarZoom(zoom + 0.25);
  }, [zoom, aplicarZoom]);

  const zoomOut = useCallback(() => {
    aplicarZoom(zoom - 0.25);
  }, [zoom, aplicarZoom]);

  const escala100 = useCallback(() => {
    setZoom(1.0);
    setModoAjustado(false);
    setPan({ x: 0, y: 0 });
  }, []);

  const ajustarAlContenedor = useCallback(() => {
    restablecerVista();
  }, [restablecerVista]);

  // Rueda del ratón para zoom sobre el viewport de la imagen
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.15 : -0.15;
    aplicarZoom(zoom + factor);
  };

  // Manejadores de arrastre (Pan) con ratón
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    e.preventDefault();
    setArrastrando(true);
    setPosicionInicio({ x: e.clientX, y: e.clientY });
    setPanInicio({ ...pan });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arrastrando) return;
    const dx = e.clientX - posicionInicio.x;
    const dy = e.clientY - posicionInicio.y;
    setPan({ x: panInicio.x + dx, y: panInicio.y + dy });
  };

  const handleMouseUp = () => {
    setArrastrando(false);
  };

  // Manejadores táctiles para dispositivos móviles
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setArrastrando(true);
      setPosicionInicio({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanInicio({ ...pan });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!arrastrando || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - posicionInicio.x;
    const dy = e.touches[0].clientY - posicionInicio.y;
    setPan({ x: panInicio.x + dx, y: panInicio.y + dy });
  };

  const handleTouchEnd = () => {
    setArrastrando(false);
  };

  // Pantalla completa (Fullscreen API)
  const togglePantallaCompleta = async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalRef.current?.requestFullscreen) {
          await modalRef.current.requestFullscreen();
          setPantallaCompleta(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setPantallaCompleta(false);
        }
      }
    } catch {
      // Ignorar si el navegador restringe Fullscreen en sandboxes
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setPantallaCompleta(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Atajos de teclado: Escape, Flechas, +, -, 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No capturar atajos si el foco está en un input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onCerrar();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          irAnterior();
          break;
        case 'ArrowRight':
          e.preventDefault();
          irSiguiente();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          ajustarAlContenedor();
          break;
        case '1':
          e.preventDefault();
          escala100();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCerrar, irAnterior, irSiguiente, zoomIn, zoomOut, ajustarAlContenedor, escala100]);

  const formatoTamano = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div
      ref={modalRef}
      className="modal-visor-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de alta resolución: ${evidencia.titulo}`}
      onClick={onCerrar}
      data-testid="modal-visor-evidencia"
    >
      <div
        className={`modal-visor-contenedor ${panelInfoVisible ? 'con-panel' : 'sin-panel'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRA SUPERIOR DE CABECERA Y NAVEGACIÓN */}
        <header className="modal-visor-header">
          <div className="visor-header-info">
            <span className="badge-visor-id">{evidencia.id}</span>
            <div className="visor-header-titulos">
              <h3 id="titulo-visor-evidencia" className="visor-titulo-principal">
                {evidencia.titulo}
              </h3>
              <div className="visor-header-subtitulos">
                <span className="visor-posicion-indicador">
                  {`Recurso ${indiceActual + 1} de ${evidenciasLista.length}`}
                </span>
                <span>•</span>
                <span className="badge-visor-etapa">{`Etapa ${evidencia.etapa}`}</span>
                <span>•</span>
                <span className={`badge-visor-conjunto badge-conjunto-${evidencia.conjuntoEvaluacion}`}>
                  {evidencia.conjuntoEvaluacion === 'validacion'
                    ? 'Validación (Tuning)'
                    : 'Prueba Independiente'}
                </span>
              </div>
            </div>
          </div>

          <div className="visor-header-acciones">
            <button
              type="button"
              className="btn-visor-accion"
              onClick={() => setPanelInfoVisible(!panelInfoVisible)}
              title={panelInfoVisible ? 'Ocultar panel científico' : 'Mostrar panel científico'}
              aria-label={panelInfoVisible ? 'Ocultar panel científico' : 'Mostrar panel científico'}
            >
              <Info size={18} />
              <span className="btn-texto-responsive">
                {panelInfoVisible ? 'Ocultar datos' : 'Ver datos'}
              </span>
            </button>

            <button
              type="button"
              className="btn-visor-accion"
              onClick={togglePantallaCompleta}
              title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
              aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {pantallaCompleta ? <Minimize2 size={18} /> : <Maximize size={18} />}
            </button>

            <button
              type="button"
              className="btn-visor-cerrar"
              onClick={onCerrar}
              title="Cerrar visor (Escape)"
              aria-label="Cerrar visor"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        {/* ÁREA CENTRAL: VIEWPORT DE IMAGEN + CONTROLES FLOTANTES */}
        <div className="modal-visor-cuerpo">
          <div className="visor-area-visual">
            {/* BARRA SUPERIOR DE CORRESPONDENCIA DE COLUMNAS / PANELES */}
            {modeloActivoId && (!guiaVisual || guiaVisual.esNoDocumentada) ? (
              <div
                className="visor-barra-correspondencia barra-no-documentada"
                data-testid="visor-indicador-columnas"
                role="status"
              >
                <div className="indicador-no-doc-content" data-testid="correspondencia-no-documentada">
                  <AlertCircle size={15} className="icono-no-doc" />
                  <span>
                    <strong>Correspondencia no documentada</strong> para {nombreModeloActivo || 'modelo activo'} en este recurso.
                  </span>
                </div>
              </div>
            ) : esquemaColumnas && esquemaColumnas.length > 0 ? (
              <div
                className="visor-barra-correspondencia"
                data-testid="visor-indicador-columnas"
                role="region"
                aria-label="Correspondencia de columnas y modelos"
              >
                <div className="barra-correspondencia-etiqueta">
                  <Layers size={13} />
                  <span>
                    {guiaVisual?.tipoDisposicion === 'curvas' ? 'Trazados / Curvas:' : 'Disposición de Columnas:'}
                  </span>
                </div>
                <div className="barra-correspondencia-items">
                  {esquemaColumnas.map((col) => {
                    const esActivo =
                      Boolean(guiaVisual && !guiaVisual.esNoDocumentada) &&
                      (guiaVisual?.columnaIndice !== undefined
                        ? col.indice === guiaVisual.columnaIndice
                        : col.color !== undefined && col.color === guiaVisual?.color);

                    return (
                      <div
                        key={col.indice}
                        className={`correspondencia-col-chip ${
                          col.esReferencia ? 'chip-referencia' : 'chip-modelo'
                        } ${esActivo ? 'chip-activo' : ''}`}
                        data-testid={`col-chip-${col.indice}`}
                      >
                        {col.color && (
                          <span
                            className="chip-color-dot"
                            style={{ backgroundColor: col.color }}
                            aria-hidden="true"
                          />
                        )}
                        <span className="chip-nombre-col">{col.etiqueta}</span>
                        {col.esReferencia && <span className="chip-badge-ref">Referencia</span>}
                        {esActivo && (
                          <span
                            className="chip-badge-activo"
                            title={`Modelo resaltado: ${nombreModeloActivo || 'Activo'}`}
                          >
                            {`★ ${nombreModeloActivo || 'Seleccionado'}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div
              ref={viewportRef}
              className={`visor-viewport-imagen ${arrastrando ? 'en-arrastre' : ''} ${
                !modoAjustado && zoom > 1 ? 'con-pan' : ''
              }`}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Área de imagen ampliada"
            >
            {/* FLECHA NAVEGACIÓN ANTERIOR */}
            {tieneAnterior && (
              <button
                type="button"
                className="btn-visor-nav btn-visor-nav-prev"
                onClick={irAnterior}
                title="Evidencia anterior (Flecha Izquierda)"
                aria-label="Evidencia anterior"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* FLECHA NAVEGACIÓN SIGUIENTE */}
            {tieneSiguiente && (
              <button
                type="button"
                className="btn-visor-nav btn-visor-nav-next"
                onClick={irSiguiente}
                title="Evidencia siguiente (Flecha Derecha)"
                aria-label="Evidencia siguiente"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* IMAGEN CIENTÍFICA EN ALTA RESOLUCIÓN */}
            <div
              className="visor-transform-wrapper"
              style={{
                transform: modoAjustado
                  ? 'none'
                  : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: arrastrando ? 'none' : 'transform 0.12s ease-out',
              }}
            >
              <img
                src={evidencia.rutaResuelta}
                alt={evidencia.titulo}
                className={`visor-img-elemento ${modoAjustado ? 'modo-ajustado' : 'modo-zoom'}`}
                draggable={false}
              />
            </div>

            {/* BARRA FLOTANTE DE CONTROLES DE ZOOM Y ESCALA */}
            <nav className="visor-barra-zoom" aria-label="Controles de zoom de imagen">
              <button
                type="button"
                className="btn-zoom-control"
                onClick={zoomOut}
                disabled={zoom <= 0.25}
                title="Reducir zoom (-)"
                aria-label="Reducir zoom"
              >
                <ZoomOut size={16} />
              </button>

              <span className="indicador-nivel-zoom" title="Nivel de zoom actual">
                {modoAjustado ? 'Ajustado' : `${Math.round(zoom * 100)}%`}
              </span>

              <button
                type="button"
                className="btn-zoom-control"
                onClick={zoomIn}
                disabled={zoom >= 5.0}
                title="Aumentar zoom (+)"
                aria-label="Aumentar zoom"
              >
                <ZoomIn size={16} />
              </button>

              <div className="separador-controles-zoom" />

              <button
                type="button"
                className={`btn-zoom-control btn-modo-zoom ${modoAjustado ? 'activo' : ''}`}
                onClick={ajustarAlContenedor}
                title="Ajustar al espacio disponible (0)"
                aria-label="Ajustar al contenedor"
              >
                <RotateCcw size={14} />
                <span className="btn-zoom-texto">Ajustar</span>
              </button>

              <button
                type="button"
                className={`btn-zoom-control btn-modo-zoom ${!modoAjustado && zoom === 1.0 ? 'activo' : ''}`}
                onClick={escala100}
                title="Escala original 100% (1)"
                aria-label="Escala original 100%"
              >
                <Maximize2 size={14} />
                <span className="btn-zoom-texto">100%</span>
              </button>
            </nav>
          </div>
          </div>

          {/* PANEL LATERAL DE INFORMACIÓN CIENTÍFICA Y CONTEXTO EXPERIMENTAL */}
          {panelInfoVisible && (
            <aside className="modal-visor-sidebar" aria-label="Información científica del recurso">
              <div className="visor-sidebar-scroll">
                {/* INSIGNIAS SEMÁNTICAS OBLIGATORIAS */}
                <div className="visor-sidebar-badges">
                  <span className="badge-tipo-semantico badge-comparativa-multi">
                    <Layers size={13} />
                    Comparativa multiarquitectura
                  </span>
                  <span className="badge-tipo-semantico badge-compartida-cuatro">
                    <CheckCircle2 size={13} />
                    Compartida (4 modelos)
                  </span>
                </div>

                {/* GUÍA DE CORRESPONDENCIA PARA EL MODELO ACTIVO */}
                {modeloActivoId && (
                  !guiaVisual || guiaVisual.esNoDocumentada ? (
                    <div
                      className="visor-enfoque-modelo enfoque-no-documentado"
                      data-testid="correspondencia-no-documentada"
                    >
                      <div className="enfoque-modelo-header">
                        <span className="enfoque-modelo-etiqueta">
                          {`Correspondencia para ${nombreModeloActivo || 'modelo activo'}:`}
                        </span>
                        <span className="enfoque-modelo-posicion posicion-no-documentada">
                          Correspondencia no documentada
                        </span>
                      </div>
                      <p className="enfoque-modelo-detalle">
                        No existe correspondencia visual verificable ni documentada para la arquitectura seleccionada en este recurso.
                      </p>
                    </div>
                  ) : (
                    <div className="visor-enfoque-modelo">
                      <div className="enfoque-modelo-header">
                        <span className="enfoque-modelo-etiqueta">
                          {`Correspondencia para ${nombreModeloActivo || 'modelo activo'}:`}
                        </span>
                        <span className="enfoque-modelo-posicion">
                          {guiaVisual.color && (
                            <span
                              className="indicador-color-muestral"
                              style={{ backgroundColor: guiaVisual.color }}
                            />
                          )}
                          {guiaVisual.posicion}
                        </span>
                      </div>
                      <p className="enfoque-modelo-detalle">{guiaVisual.detalle}</p>
                    </div>
                  )
                )}

                {/* RIGOR CONCEPTUAL Y METODOLOGÍA (EV-06, EV-07, EV-08) */}
                {etiquetaConceptual && (
                  <div
                    className="visor-sidebar-seccion visor-seccion-conceptual"
                    data-testid="visor-seccion-conceptual"
                  >
                    <div className="visor-conceptual-header">
                      <AlertTriangle size={15} className="icono-conceptual-header" />
                      <h4 className="visor-seccion-titulo">Rigor Conceptual & Interpretabilidad</h4>
                    </div>

                    <div className="visor-ficha-datos">
                      <div className="visor-dato-fila">
                        <span className="visor-dato-clave">Técnica:</span>
                        <span className="visor-dato-valor">
                          <strong className="conceptual-nombre-tag">{etiquetaConceptual.nombre}</strong>
                        </span>
                      </div>
                      <div className="visor-dato-fila">
                        <span className="visor-dato-clave">Descripción:</span>
                        <span className="visor-dato-valor">{etiquetaConceptual.descripcion}</span>
                      </div>
                    </div>

                    <div className="visor-aclaracion-conceptual">
                      <span className="aclaracion-etiqueta">Aclaración metodológica verificada:</span>
                      <p className="aclaracion-texto">{etiquetaConceptual.aclaracion}</p>
                    </div>

                    {etiquetaConceptual.advertenciaNormalizacion && (
                      <div
                        className="visor-aviso-normalizacion"
                        role="note"
                        data-testid="advertencia-normalizacion"
                      >
                        <div className="aviso-normalizacion-titulo">
                          <AlertCircle size={14} className="icono-aviso-normalizacion" />
                          <strong>Advertencia metodológica sobre normalización cromática:</strong>
                        </div>
                        <p className="aviso-normalizacion-texto">
                          {etiquetaConceptual.advertenciaNormalizacion}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* DESCRIPCIÓN TÉCNICA Y CLÍNICA */}
                <div className="visor-sidebar-seccion">
                  <h4 className="visor-seccion-titulo">Descripción Documental</h4>
                  <p className="visor-seccion-texto">{evidencia.descripcion}</p>
                </div>

                {/* CONTEXTO DE EVALUACIÓN Y TAMAÑO MUESTRAL */}
                <div className="visor-sidebar-seccion">
                  <h4 className="visor-seccion-titulo">Muestra y Validación</h4>
                  <div className="visor-ficha-datos">
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">Conjunto:</span>
                      <span className="visor-dato-valor">
                        {evidencia.conjuntoEvaluacion === 'validacion'
                          ? 'Validación Interna (Tuning de hiperparámetros)'
                          : 'Prueba Independiente (Blind Test)'}
                      </span>
                    </div>
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">Resumen Muestral:</span>
                      <span className="visor-dato-valor">{evidencia.resumenMuestral}</span>
                    </div>
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">Arquitecturas:</span>
                      <span className="visor-dato-valor">
                        {evidencia.arquitecturasRepresentadas.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DINÁMICA EXPERIMENTAL Y ÉPOCAS DE ENTRENAMIENTO (SOLO EV-01 Y EV-02) */}
                {evidencia.metadatosEntrenamiento && (
                  <div
                    className="visor-sidebar-seccion visor-seccion-entrenamiento"
                    data-testid="visor-seccion-entrenamiento"
                  >
                    <h4 className="visor-seccion-titulo visor-titulo-entrenamiento">
                      <Timer size={14} />
                      {`Dinámica de Épocas (${evidencia.metadatosEntrenamiento.etapa})`}
                    </h4>

                    <div className="visor-aviso-contextual-entrenamiento" role="note">
                      <Info size={13} className="icono-aviso-info" />
                      <span>
                        Contexto metodológico del notebook original. No corresponde a una medición directa sobre la imagen.
                      </span>
                    </div>

                    <div className="visor-ficha-datos">
                      <div className="visor-dato-fila">
                        <span className="visor-dato-clave">Tope configurado:</span>
                        <span className="visor-dato-valor">
                          <strong>{evidencia.metadatosEntrenamiento.epocasMaximasConfiguradas} épocas</strong>
                        </span>
                      </div>
                      <div className="visor-dato-fila">
                        <span className="visor-dato-clave">Criterio parada:</span>
                        <span className="visor-dato-valor">
                          {evidencia.metadatosEntrenamiento.criterioParadaGeneral}
                        </span>
                      </div>
                      {evidencia.metadatosEntrenamiento.pacienciaGeneral !== undefined && (
                        <div className="visor-dato-fila">
                          <span className="visor-dato-clave">Paciencia:</span>
                          <span className="visor-dato-valor">
                            {`${evidencia.metadatosEntrenamiento.pacienciaGeneral} épocas`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="visor-tabla-epocas-efectivas">
                      <div className="tabla-epocas-cabecera">
                        <span>Arquitectura</span>
                        <span>Épocas Efectivas</span>
                      </div>
                      {evidencia.metadatosEntrenamiento.arquitecturas.map((arq) => (
                        <div key={arq.arquitectura} className="tabla-epocas-fila-item">
                          <span className="nombre-modelo-arq">{arq.arquitectura}</span>
                          <div className="valor-epocas-col">
                            <span className="epocas-badge-efectivas">
                              <strong>{arq.epocasEfectivas}</strong> / {arq.epocasMaximasConfiguradas}
                            </span>
                            <small className="criterio-resumen" title={arq.criterioParada}>
                              {arq.criterioParada}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    {evidencia.metadatosEntrenamiento.notaMetodologica && (
                      <p className="visor-nota-entrenamiento-texto">
                        {evidencia.metadatosEntrenamiento.notaMetodologica}
                      </p>
                    )}
                  </div>
                )}

                {/* METADATOS TÉCNICOS DEL ARCHIVO ORIGINAL */}
                <div className="visor-sidebar-seccion">
                  <h4 className="visor-seccion-titulo">Metadatos del Recurso</h4>
                  <div className="visor-ficha-datos">
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">
                        <Maximize2 size={12} /> Dimensiones:
                      </span>
                      <span className="visor-dato-valor">
                        {`${evidencia.dimensiones.ancho} × ${evidencia.dimensiones.alto} px`}
                      </span>
                    </div>
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">
                        <HardDrive size={12} /> Peso de archivo:
                      </span>
                      <span className="visor-dato-valor">{formatoTamano(evidencia.tamanoBytes)}</span>
                    </div>
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">
                        <FileCode size={12} /> Celda Notebook:
                      </span>
                      <span className="visor-dato-valor">{`Celda ${evidencia.celdaOrigen} (Salida #${evidencia.indiceSalida})`}</span>
                    </div>
                    <div className="visor-dato-fila">
                      <span className="visor-dato-clave">Formato:</span>
                      <span className="visor-dato-valor">{`${evidencia.formatoOriginal} (${evidencia.modoColor})`}</span>
                    </div>
                    <div className="visor-dato-fila visor-fila-sha">
                      <span className="visor-dato-clave">SHA-256:</span>
                      <code className="visor-sha-codigo" title={evidencia.sha256}>
                        {evidencia.sha256.substring(0, 16)}...
                      </code>
                    </div>
                  </div>
                </div>

                {/* LIMITACIONES METODOLÓGICAS AUDITADAS */}
                {evidencia.limitacionesMetodologicas &&
                  evidencia.limitacionesMetodologicas.length > 0 && (
                    <div className="visor-sidebar-seccion visor-seccion-limitaciones">
                      <h4 className="visor-seccion-titulo limitaciones-alerta">
                        <AlertCircle size={14} /> Notas Metodológicas Verificadas
                      </h4>
                      <ul className="visor-limitaciones-lista">
                        {evidencia.limitacionesMetodologicas.map((nota, i) => (
                          <li key={i}>{nota}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
