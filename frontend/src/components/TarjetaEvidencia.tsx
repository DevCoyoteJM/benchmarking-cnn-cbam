import type { RecursoVisualEvidencia } from '../types/evidencias';
import {
  obtenerGuiaVisualModelo,
  obtenerEtiquetaConceptual,
} from '../services/evidenciasService';
import { Layers, CheckCircle2, AlertCircle, Maximize2 } from 'lucide-react';

interface TarjetaEvidenciaProps {
  evidencia: RecursoVisualEvidencia;
  modeloActivoId?: string;
  nombreModeloActivo?: string;
  onAbrirVisor?: (evidencia: RecursoVisualEvidencia) => void;
}

export default function TarjetaEvidencia({
  evidencia,
  modeloActivoId,
  nombreModeloActivo,
  onAbrirVisor,
}: TarjetaEvidenciaProps) {
  const guiaVisual = obtenerGuiaVisualModelo(evidencia.id, modeloActivoId);
  const etiquetaConceptual = obtenerEtiquetaConceptual(evidencia.id);

  const formatTamano = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getCategoriaLabel = (cat: string) => {
    switch (cat) {
      case 'metricas':
        return 'Métricas & Evaluación';
      case 'atencion':
        return 'Interpretabilidad (Atención)';
      case 'comparaciones':
        return 'Comparación Clínica Directa';
      default:
        return cat;
    }
  };

  return (
    <article className="tarjeta-evidencia" data-testid={`tarjeta-evidencia-${evidencia.id.toLowerCase()}`}>
      {/* CABECERA DE LA TARJETA */}
      <header className="tarjeta-evidencia-header">
        <div className="tarjeta-evidencia-top-bar">
          <span className="badge-evidencia-id">{evidencia.id}</span>
          <span className={`badge-evidencia-conjunto badge-conjunto-${evidencia.conjuntoEvaluacion}`}>
            {evidencia.conjuntoEvaluacion === 'validacion' ? 'Validación (Tuning)' : 'Prueba Independiente'}
          </span>
          <span className="badge-evidencia-etapa">{`Etapa ${evidencia.etapa}`}</span>
        </div>

        <h4 className="tarjeta-evidencia-titulo">{evidencia.titulo}</h4>
        <p className="tarjeta-evidencia-resumen-muestral">{evidencia.resumenMuestral}</p>
      </header>

      {/* CONTENEDOR DE LA IMAGEN EN ALTA FIDELIDAD */}
      <div
        className="tarjeta-evidencia-media"
        onClick={() => onAbrirVisor?.(evidencia)}
        title="Clic para examinar en alta resolución"
        tabIndex={0}
        role="button"
        aria-label={`Examinar ${evidencia.id} en alta resolución`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAbrirVisor?.(evidencia);
          }
        }}
      >
        <img
          src={evidencia.rutaResuelta}
          alt={evidencia.titulo}
          loading="lazy"
          className="tarjeta-evidencia-img"
        />
        <div className="tarjeta-evidencia-dimension-overlay">
          <span>{`${evidencia.dimensiones.ancho} × ${evidencia.dimensiones.alto} px`}</span>
        </div>
        <div className="tarjeta-evidencia-hover-action">
          <Maximize2 size={16} />
          <span>Examinar en alta resolución</span>
        </div>
      </div>

      {/* CUERPO Y METADATOS CLÍNICOS */}
      <div className="tarjeta-evidencia-body">
        {/* DISTINCIÓN SEMÁNTICA: COMPARATIVA MULTIARQUITECTURA + COMPARTIDA */}
        <div className="tarjeta-evidencia-badges-semanticos">
          <span className="badge-tipo-semantico badge-comparativa-multi" title="Muestra las 4 arquitecturas de forma simultánea">
            <Layers size={13} />
            Comparativa multiarquitectura
          </span>
          <span className="badge-tipo-semantico badge-compartida-cuatro" title="Asociada a los 4 modelos del estudio">
            <CheckCircle2 size={13} />
            Compartida (4 modelos)
          </span>
          {etiquetaConceptual && (
            <span
              className="badge-tipo-semantico badge-tecnica-conceptual"
              title={`Técnica: ${etiquetaConceptual.nombre}`}
            >
              {etiquetaConceptual.nombre}
            </span>
          )}
          <span className="badge-tipo-semantico badge-categoria-tematica">
            {getCategoriaLabel(evidencia.categoriaPrincipal)}
          </span>
        </div>

        {/* ENFOQUE DOCUMENTADO PARA EL MODELO ACTIVO (SI APLICA) */}
        {modeloActivoId && (
          !guiaVisual || guiaVisual.esNoDocumentada ? (
            <div
              className="tarjeta-evidencia-enfoque-modelo enfoque-no-documentado"
              data-testid="tarjeta-correspondencia-no-documentada"
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
            <div className="tarjeta-evidencia-enfoque-modelo">
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

        {/* DESCRIPCIÓN TÉCNICA */}
        <p className="tarjeta-evidencia-descripcion">{evidencia.descripcion}</p>

        {/* LIMITACIONES METODOLÓGICAS AUDITADAS */}
        {evidencia.limitacionesMetodologicas && evidencia.limitacionesMetodologicas.length > 0 && (
          <div className="tarjeta-evidencia-limitaciones">
            <span className="limitaciones-titulo">
              <AlertCircle size={13} />
              Notas metodológicas verificadas:
            </span>
            <ul className="limitaciones-lista">
              {evidencia.limitacionesMetodologicas.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* PIE TÉCNICO */}
      <footer className="tarjeta-evidencia-footer">
        <span title={`Generado en Celda ${evidencia.celdaOrigen} del notebook`}>
          Celda {evidencia.celdaOrigen}
        </span>
        <span>•</span>
        <span>{evidencia.formatoOriginal} ({evidencia.modoColor})</span>
        <span>•</span>
        <span>{formatTamano(evidencia.tamanoBytes)}</span>
      </footer>
    </article>
  );
}
