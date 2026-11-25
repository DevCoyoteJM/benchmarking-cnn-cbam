import { useState } from 'react';
import { BookOpen, Layers, Activity, Scale, TrendingUp } from 'lucide-react';
import SeccionSegmentacionE1 from '../components/interpretacion/SeccionSegmentacionE1';
import SeccionClasificacionE2 from '../components/interpretacion/SeccionClasificacionE2';
import SeccionComparacionTransversalC from '../components/interpretacion/SeccionComparacionTransversalC';
import SeccionConvergenciaD from '../components/interpretacion/SeccionConvergenciaD';
import BadgeProcedencia from '../components/interpretacion/BadgeProcedencia';
import './InterpretacionCientifica.css';

export type PestanaInterpretacion =
  | 'seccion-a'
  | 'seccion-b'
  | 'seccion-c'
  | 'seccion-d';

export default function InterpretacionCientifica() {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaInterpretacion>('seccion-a');

  return (
    <div
      className="interpretacion-page"
      data-testid="pagina-interpretacion-cientifica"
    >
      {/* CABECERA PRINCIPAL DEL MÓDULO */}
      <header className="interpretacion-header">
        <div className="eyebrow">
          <BookOpen size={16} />
          SÍNTESIS CIENTÍFICA & BENCHMARKING RIGUROSO · LIDC-IDRI
        </div>
        <h2>Interpretación Científica</h2>
        <p className="interpretacion-header-desc">
          Análisis crítico e integración metodológica de los resultados experimentales obtenidos por las
          cuatro arquitecturas de aprendizaje profundo (U-Net, U-Net + CBAM, ModCBAM y TransUNet).
          Diferenciación estricta entre entrenamiento, validación y prueba independiente, sin colapsar
          métricas en rankings globales arbitrarios.
        </p>

        {/* RESUMEN INTRODUCTORIO DE LAS DOS ETAPAS EXPERIMENTALES */}
        <div className="intro-etapas-grid" aria-label="Resumen de etapas experimentales">
          <div className="intro-etapa-card card-e1">
            <div>
              <div className="intro-card-top">
                <h3 className="intro-card-titulo">Etapa 1: Segmentación y Detección (E1)</h3>
                <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={762} />
              </div>
              <p className="intro-card-desc">
                Delimitación geométrica de contornos nodulares y detección frente a parénquima sano.
                Evaluada con Dice, IoU, HD95 y F1-det sobre 762 parches axiales 2D independientes.
              </p>
            </div>
            <div className="intro-card-meta">
              <span><strong>Muestra:</strong> 762 parches 2D (96×96)</span>
              <span><strong>Pérdida:</strong> DiceCE + 0.5 Hausdorff</span>
              <span><strong>Convergencia:</strong> Early Stopping (48-106 épocas)</span>
            </div>
          </div>

          <div className="intro-etapa-card card-e2">
            <div>
              <div className="intro-card-top">
                <h3 className="intro-card-titulo">Etapa 2: Clasificación de Malignidad (E2)</h3>
                <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={213} />
              </div>
              <p className="intro-card-desc">
                Diagnóstico patológico de nódulos (Benigno vs Maligno) empleando el encoder convolucional
                congelado de E1. Evaluada con Sensibilidad, Especificidad, AUC-ROC y MCC sobre 213 nódulos.
              </p>
            </div>
            <div className="intro-card-meta">
              <span><strong>Muestra:</strong> 213 nódulos (150B / 63M)</span>
              <span><strong>Encoder:</strong> Congelado (Feature Extractor)</span>
              <span><strong>Convergencia:</strong> 100 épocas completas</span>
            </div>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN INTERNA MEDIANTE PESTAÑAS */}
      <nav
        className="interpretacion-tabs-nav"
        role="tablist"
        aria-label="Secciones del módulo de interpretación"
      >
        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'seccion-a'}
          className={`btn-tab-interp ${pestanaActiva === 'seccion-a' ? 'activo' : ''}`}
          onClick={() => setPestanaActiva('seccion-a')}
          data-testid="tab-seccion-a"
        >
          <Layers size={16} />
          <span>Sección A: Segmentación (E1)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'seccion-b'}
          className={`btn-tab-interp ${pestanaActiva === 'seccion-b' ? 'activo' : ''}`}
          onClick={() => setPestanaActiva('seccion-b')}
          data-testid="tab-seccion-b"
        >
          <Activity size={16} />
          <span>Sección B: Clasificación (E2)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'seccion-c'}
          className={`btn-tab-interp ${pestanaActiva === 'seccion-c' ? 'activo' : ''}`}
          onClick={() => setPestanaActiva('seccion-c')}
          data-testid="tab-seccion-c"
        >
          <Scale size={16} />
          <span>Sección C: Comparación Transversal</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'seccion-d'}
          className={`btn-tab-interp ${pestanaActiva === 'seccion-d' ? 'activo' : ''}`}
          onClick={() => setPestanaActiva('seccion-d')}
          data-testid="tab-seccion-d"
        >
          <TrendingUp size={16} />
          <span>Sección D: Convergencia y Dinámica</span>
        </button>

        {/* INDICADORES DE FASES FUTURAS (SECCIONES E A H) */}
        <button
          type="button"
          disabled
          className="btn-tab-interp tab-deshabilitado"
          title="Fases futuras en hoja de ruta"
        >
          <span>Secciones E a H: Análisis Avanzado</span>
          <span className="badge-tag-proximamente">Próximamente</span>
        </button>
      </nav>

      {/* CONTENIDO ACTIVO */}
      <main className="interpretacion-seccion-activa" role="region" aria-live="polite">
        {pestanaActiva === 'seccion-a' ? (
          <SeccionSegmentacionE1 />
        ) : pestanaActiva === 'seccion-b' ? (
          <SeccionClasificacionE2 />
        ) : pestanaActiva === 'seccion-c' ? (
          <SeccionComparacionTransversalC />
        ) : (
          <SeccionConvergenciaD />
        )}
      </main>
    </div>
  );
}
