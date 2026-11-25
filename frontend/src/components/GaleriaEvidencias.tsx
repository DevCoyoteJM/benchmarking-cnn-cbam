import { useEffect, useState, useMemo } from 'react';
import type {
  CategoriaEvidencia,
  EtapaEvidencia,
  RecursoVisualEvidencia,
} from '../types/evidencias';
import {
  cargarIndiceRecursos,
  procesarIndiceRecursos,
  filtrarEvidenciasPorCategoria,
  filtrarEvidenciasPorEtapa,
  filtrarEvidenciasPorArquitectura,
} from '../services/evidenciasService';
import TarjetaEvidencia from './TarjetaEvidencia';
import ModalVisorEvidencia from './ModalVisorEvidencia';
import {
  Filter,
  RotateCcw,
  AlertTriangle,
  Info,
  Loader2,
  Images,
  Cpu,
  Timer,
} from 'lucide-react';

export interface GaleriaEvidenciasProps {
  modeloActivoId?: string;
  nombreModeloActivo?: string;
  organizarPorSubsecciones?: boolean;
  recursosIniciales?: RecursoVisualEvidencia[];
}

interface SubseccionConfig {
  letra: 'A' | 'B' | 'C' | 'D';
  titulo: string;
  categoriaTag: string;
  descripcion: string;
  ids: string[];
}

export const SUBSECCIONES_CONFIG: SubseccionConfig[] = [
  {
    letra: 'A',
    titulo: 'Mapas de Atención e Interpretabilidad',
    categoriaTag: 'Interpretabilidad Visual Post-hoc',
    descripcion:
      'Evaluación de la focalización espacial y saliencia mediante mapas de gradiente y Grad-CAM sobre la última capa convolucional. Son técnicas de interpretabilidad post-hoc aplicadas a las cuatro arquitecturas del estudio, no módulos CBAM nativos.',
    ids: ['EV-06', 'EV-07'],
  },
  {
    letra: 'B',
    titulo: 'Segmentación y Clasificación Visual Directa',
    categoriaTag: 'Validación Clínica Cualitativa',
    descripcion:
      'Comparación visual directa entre corte tomográfico axial, máscara de referencia Ground Truth y contornos de segmentación predichos (E1) junto con el diagnóstico de malignidad clasificado (E2) en pacientes de prueba.',
    ids: ['EV-08'],
  },
  {
    letra: 'C',
    titulo: 'Rendimiento Experimental y Curvas de Aprendizaje',
    categoriaTag: 'Dinámica de Entrenamiento',
    descripcion:
      'Evolución temporal de funciones de pérdida y métricas en validación. En Etapa 1 (Segmentación), el entrenamiento operó con tope de 150 épocas y Early Stopping (paciencia 25 por Dice de validación), registrando épocas efectivas disímiles: U-Net (80), U-Net + CBAM (48), ModCBAM (75) y TransUNet (106). En Etapa 2 (Clasificación), las cuatro redes completaron con exactitud 100 épocas.',
    ids: ['EV-01', 'EV-02'],
  },
  {
    letra: 'D',
    titulo: 'Evaluación Cuantitativa y Concordancia',
    categoriaTag: 'Evaluación en Prueba Ciega',
    descripcion:
      'Métricas consolidadas sobre el conjunto de prueba independiente nunca antes visto: matrices de confusión (N=213 nódulos), curvas ROC con puntajes AUC (N=213) y gráficos de concordancia geométrica de área Bland-Altman (N=762 parches).',
    ids: ['EV-03', 'EV-04', 'EV-05'],
  },
];

export default function GaleriaEvidencias({
  modeloActivoId,
  nombreModeloActivo,
  organizarPorSubsecciones = true,
  recursosIniciales,
}: GaleriaEvidenciasProps) {
  const [recursos, setRecursos] = useState<RecursoVisualEvidencia[]>(recursosIniciales ?? []);
  const [cargando, setCargando] = useState<boolean>(!recursosIniciales);
  const [error, setError] = useState<string | null>(null);

  const [filtroEtapa, setFiltroEtapa] = useState<EtapaEvidencia | 'todas'>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaEvidencia | 'todas'>('todas');
  const [filtroArquitectura, setFiltroArquitectura] = useState<string>('todas');
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<RecursoVisualEvidencia | null>(null);

  const cargarEvidencias = async () => {
    setCargando(true);
    setError(null);

    const resultado = await cargarIndiceRecursos();

    if (resultado.error || !resultado.indice) {
      setError(resultado.error || 'No se pudo cargar el índice de evidencias visuales.');
      setRecursos([]);
    } else {
      const normalizados = procesarIndiceRecursos(resultado.indice);
      setRecursos(normalizados);
    }

    setCargando(false);
  };

  useEffect(() => {
    if (!recursosIniciales) {
      cargarEvidencias();
    }
  }, [recursosIniciales]);

  // Filtrado combinable: etapa Y categoría Y arquitectura
  const recursosFiltrados = useMemo(() => {
    let resultado = [...recursos];

    if (filtroCategoria !== 'todas') {
      resultado = filtrarEvidenciasPorCategoria(resultado, filtroCategoria);
    }

    if (filtroEtapa !== 'todas') {
      resultado = filtrarEvidenciasPorEtapa(resultado, filtroEtapa);
    }

    if (filtroArquitectura !== 'todas') {
      resultado = filtrarEvidenciasPorArquitectura(resultado, filtroArquitectura);
    }

    return resultado;
  }, [recursos, filtroCategoria, filtroEtapa, filtroArquitectura]);

  const hayFiltrosActivos =
    filtroEtapa !== 'todas' ||
    filtroCategoria !== 'todas' ||
    filtroArquitectura !== 'todas';

  const restablecerFiltros = () => {
    setFiltroEtapa('todas');
    setFiltroCategoria('todas');
    setFiltroArquitectura('todas');
  };

  return (
    <section className="galeria-evidencias-seccion" aria-labelledby="titulo-galeria-evidencias">
      <div className="galeria-evidencias-header">
        <div className="galeria-header-texto">
          <div className="galeria-titulo-row">
            <Images size={22} className="galeria-icono-principal" />
            <h3 id="titulo-galeria-evidencias">Galería Visual de Evidencias Experimentales</h3>
          </div>
          <p className="galeria-subtitulo">
            Recursos gráficos de alta resolución extraídos directamente de la ejecución experimental del notebook
            homologado para las cuatro arquitecturas.
          </p>
        </div>

        {/* NOTA METODOLÓGICA OBLIGATORIA */}
        <div className="galeria-nota-metodologica" role="note">
          <Info size={16} className="icono-info-nota" />
          <p>
            <strong>Aviso de Benchmarking Comparativo:</strong> Las 8 evidencias corresponden a evaluaciones
            comparativas simultáneas compartidas entre los cuatro modelos (U-Net, U-Net + CBAM, ModCBAM y TransUNet).
            No representan resultados aislados ni exclusivos de una única arquitectura.
          </p>
        </div>
      </div>

      {/* PANEL DE FILTROS COMBINABLES */}
      <div className="galeria-filtros-container">
        <div className="filtros-grupo-wrapper">
          {/* FILTRO POR ETAPA */}
          <div className="filtro-seccion">
            <span className="filtro-label">
              <Filter size={14} />
              Filtrar por Etapa:
            </span>
            <div className="filtro-pills-row" role="group" aria-label="Filtro por etapa">
              <button
                type="button"
                className={`filtro-pill ${filtroEtapa === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroEtapa('todas')}
              >
                Todas las etapas
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroEtapa === 'E1' ? 'activo' : ''}`}
                onClick={() => setFiltroEtapa('E1')}
              >
                Etapa 1 (Segmentación)
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroEtapa === 'E2' ? 'activo' : ''}`}
                onClick={() => setFiltroEtapa('E2')}
              >
                Etapa 2 (Clasificación)
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroEtapa === 'E1 + E2' ? 'activo' : ''}`}
                onClick={() => setFiltroEtapa('E1 + E2')}
              >
                Etapa Mixta (E1 + E2)
              </button>
            </div>
          </div>

          {/* FILTRO POR CATEGORÍA TEMÁTICA */}
          <div className="filtro-seccion">
            <span className="filtro-label">
              <Filter size={14} />
              Área Temática / Categoría:
            </span>
            <div className="filtro-pills-row" role="group" aria-label="Filtro por categoría temática">
              <button
                type="button"
                className={`filtro-pill ${filtroCategoria === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroCategoria('todas')}
              >
                Todas las áreas
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroCategoria === 'metricas' ? 'activo' : ''}`}
                onClick={() => setFiltroCategoria('metricas')}
              >
                Métricas & Evaluación (5)
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroCategoria === 'atencion' ? 'activo' : ''}`}
                onClick={() => setFiltroCategoria('atencion')}
              >
                Interpretabilidad / Atención (2)
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroCategoria === 'comparaciones' ? 'activo' : ''}`}
                onClick={() => setFiltroCategoria('comparaciones')}
              >
                Comparaciones Clínicas (1)
              </button>
            </div>
          </div>

          {/* FILTRO POR ARQUITECTURA REPRESENTADA */}
          <div className="filtro-seccion">
            <span className="filtro-label">
              <Cpu size={14} />
              Filtrar por Arquitectura:
            </span>
            <div className="filtro-pills-row" role="group" aria-label="Filtro por arquitectura">
              <button
                type="button"
                className={`filtro-pill ${filtroArquitectura === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroArquitectura('todas')}
              >
                Todas las arquitecturas (4)
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroArquitectura === 'unet' ? 'activo' : ''}`}
                onClick={() => setFiltroArquitectura('unet')}
              >
                U-Net
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroArquitectura === 'unet-cbam' ? 'activo' : ''}`}
                onClick={() => setFiltroArquitectura('unet-cbam')}
              >
                U-Net + CBAM
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroArquitectura === 'modcbam' ? 'activo' : ''}`}
                onClick={() => setFiltroArquitectura('modcbam')}
              >
                ModCBAM
              </button>
              <button
                type="button"
                className={`filtro-pill ${filtroArquitectura === 'transunet' ? 'activo' : ''}`}
                onClick={() => setFiltroArquitectura('transunet')}
              >
                TransUNet
              </button>
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIÓN Y CONTADOR */}
        <div className="galeria-filtros-acciones">
          <span className="contador-evidencias">
            Mostrando <strong>{recursosFiltrados.length}</strong> de {recursos.length} evidencias
          </span>

          {hayFiltrosActivos && (
            <button
              type="button"
              className="btn-restablecer-filtros"
              onClick={restablecerFiltros}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={14} />
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* ESTADO: CARGANDO */}
      {cargando && (
        <div className="galeria-estado-cargando" role="status">
          <Loader2 size={32} className="spinner-carga" />
          <p>Cargando galería de evidencias visuales...</p>
        </div>
      )}

      {/* ESTADO: ERROR */}
      {!cargando && error && (
        <div className="galeria-estado-error" role="alert">
          <AlertTriangle size={24} className="icono-error-galeria" />
          <div className="error-texto">
            <h4>No se pudo cargar la galería de evidencias</h4>
            <p>{error}</p>
          </div>
          <button type="button" className="btn-reintentar-carga" onClick={cargarEvidencias}>
            Reintentar carga
          </button>
        </div>
      )}

      {/* ESTADO: AUSENCIA DE RESULTADOS */}
      {!cargando && !error && recursosFiltrados.length === 0 && (
        <div className="galeria-estado-vacio" role="status">
          <Info size={28} />
          <h4>No se encontraron evidencias coincidentes</h4>
          <p>
            No hay recursos que cumplan simultáneamente con los filtros seleccionados (
            {filtroEtapa !== 'todas' ? `Etapa: ${filtroEtapa}` : ''}
            {filtroEtapa !== 'todas' && filtroCategoria !== 'todas' ? ', ' : ''}
            {filtroCategoria !== 'todas' ? `Categoría: ${filtroCategoria}` : ''}
            {filtroArquitectura !== 'todas' ? `, Arquitectura: ${filtroArquitectura}` : ''}
            ).
          </p>
          <button type="button" className="btn-restablecer-filtros" onClick={restablecerFiltros}>
            <RotateCcw size={14} />
            Restablecer filtros
          </button>
        </div>
      )}

      {/* VISTA ORGANIZADA EN 4 SUBSECCIONES O GRID PLANO */}
      {!cargando && !error && recursosFiltrados.length > 0 && (
        organizarPorSubsecciones ? (
          <div className="galeria-subsecciones-contenedor">
            {SUBSECCIONES_CONFIG.map((sub) => {
              const evidenciasSubseccion = recursosFiltrados.filter((ev) =>
                sub.ids.includes(ev.id)
              );

              if (evidenciasSubseccion.length === 0) {
                return null;
              }

              return (
                <section
                  key={sub.letra}
                  className="subseccion-evidencia-bloque"
                  aria-labelledby={`subseccion-titulo-${sub.letra.toLowerCase()}`}
                  data-testid={`subseccion-${sub.letra.toLowerCase()}`}
                >
                  <header className="subseccion-header">
                    <div className="subseccion-cabecera-linea">
                      <span className="subseccion-letra-tag">{`Subsección ${sub.letra}`}</span>
                      <h4
                        id={`subseccion-titulo-${sub.letra.toLowerCase()}`}
                        className="subseccion-titulo-texto"
                      >
                        {sub.titulo}
                      </h4>
                      <span className="subseccion-tag-conteo">
                        {`${evidenciasSubseccion.length} evidencia${evidenciasSubseccion.length > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <p className="subseccion-descripcion-texto">{sub.descripcion}</p>

                    {/* CALLOUT ESTRUCTURADO DE ÉPOCAS EXPERIMENTALES (SUBSECCIÓN C) */}
                    {sub.letra === 'C' && (
                      <div
                        className="subseccion-resumen-epocas-callout"
                        data-testid="callout-epocas-subseccion-c"
                        role="region"
                        aria-label="Resumen metodológico de épocas de entrenamiento"
                      >
                        <div className="callout-epocas-columna">
                          <div className="callout-columna-header">
                            <span className="callout-etapa-badge badge-e1">
                              <Timer size={13} />
                              Etapa 1 — Segmentación
                            </span>
                            <span className="callout-regla-tag">
                              Tope: 150 épocas • Early Stopping: paciencia 25 (Dice)
                            </span>
                          </div>
                          <div className="callout-chips-grid">
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">U-Net:</span>
                              <strong className="chip-valor">80 épocas efectivas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">U-Net + CBAM:</span>
                              <strong className="chip-valor">48 épocas efectivas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">ModCBAM:</span>
                              <strong className="chip-valor">75 épocas efectivas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">TransUNet:</span>
                              <strong className="chip-valor">106 épocas efectivas</strong>
                            </div>
                          </div>
                          <p className="callout-aclaracion-texto">
                            * Las épocas efectivas de E1 dependen de la parada temprana según el Dice de validación. Ningún modelo completó el máximo configurado de 150 épocas.
                          </p>
                        </div>

                        <div className="callout-epocas-columna">
                          <div className="callout-columna-header">
                            <span className="callout-etapa-badge badge-e2">
                              <Timer size={13} />
                              Etapa 2 — Clasificación
                            </span>
                            <span className="callout-regla-tag">
                              Tope: 100 épocas • Encoder congelado
                            </span>
                          </div>
                          <div className="callout-chips-grid">
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">U-Net:</span>
                              <strong className="chip-valor">100 épocas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">U-Net + CBAM:</span>
                              <strong className="chip-valor">100 épocas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">ModCBAM:</span>
                              <strong className="chip-valor">100 épocas</strong>
                            </div>
                            <div className="chip-epoca-item">
                              <span className="chip-modelo">TransUNet:</span>
                              <strong className="chip-valor">100 épocas</strong>
                            </div>
                          </div>
                          <p className="callout-aclaracion-texto">
                            * En Etapa 2, las cuatro arquitecturas completaron íntegramente las 100 épocas programadas sin activar la parada temprana.
                          </p>
                        </div>
                      </div>
                    )}
                  </header>

                  <div className="galeria-evidencias-grid">
                    {evidenciasSubseccion.map((ev) => (
                      <TarjetaEvidencia
                        key={ev.id}
                        evidencia={ev}
                        modeloActivoId={modeloActivoId}
                        nombreModeloActivo={nombreModeloActivo}
                        onAbrirVisor={setEvidenciaSeleccionada}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="galeria-evidencias-grid">
            {recursosFiltrados.map((ev) => (
              <TarjetaEvidencia
                key={ev.id}
                evidencia={ev}
                modeloActivoId={modeloActivoId}
                nombreModeloActivo={nombreModeloActivo}
                onAbrirVisor={setEvidenciaSeleccionada}
              />
            ))}
          </div>
        )
      )}

      {/* MODAL VISOR DE IMÁGENES CIENTÍFICAS EN ALTA RESOLUCIÓN */}
      {evidenciaSeleccionada && (
        <ModalVisorEvidencia
          evidencia={evidenciaSeleccionada}
          evidenciasLista={recursosFiltrados}
          onCerrar={() => setEvidenciaSeleccionada(null)}
          onCambiarEvidencia={setEvidenciaSeleccionada}
          modeloActivoId={modeloActivoId}
          nombreModeloActivo={nombreModeloActivo}
        />
      )}
    </section>
  );
}
