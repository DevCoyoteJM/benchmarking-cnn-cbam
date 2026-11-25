import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Scale,
  Target,
  Activity,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import {
  obtenerSeriesConvergenciaE1,
  obtenerSeriesConvergenciaE2,
  obtenerIndicadoresEstabilidadConvergencia,
  obtenerAnalisisBrechasGeneralizacion,
  obtenerSintesisConvergenciaPorArquitectura,
} from '../../services/interpretacionService';
import BadgeProcedencia from './BadgeProcedencia';
import type { IdArquitectura } from '../../types/interpretacion';

export const SeccionConvergenciaD: React.FC = () => {
  // Subvistas y filtros interactivos
  const [subvistaD1, setSubvistaD1] = useState<'perdidas' | 'dice' | 'tabla'>('dice');
  const [arqFiltroD1, setArqFiltroD1] = useState<IdArquitectura | 'todas'>('todas');

  const [subvistaD2, setSubvistaD2] = useState<'perdidas' | 'metricas' | 'tabla'>('metricas');
  const [arqFiltroD2, setArqFiltroD2] = useState<IdArquitectura | 'todas'>('todas');

  const [arqFiltroD5, setArqFiltroD5] = useState<IdArquitectura | 'todas'>('todas');

  // Datos canónicos extraídos del servicio
  const seriesE1 = obtenerSeriesConvergenciaE1();
  const seriesE2 = obtenerSeriesConvergenciaE2();
  const indicadores = obtenerIndicadoresEstabilidadConvergencia();
  const brechas = obtenerAnalisisBrechasGeneralizacion();
  const sintesisModelos = obtenerSintesisConvergenciaPorArquitectura();

  // Filtrado D1 y D2
  const seriesE1Filtradas =
    arqFiltroD1 === 'todas'
      ? seriesE1
      : seriesE1.filter((s) => s.arquitecturaId === arqFiltroD1);

  const seriesE2Filtradas =
    arqFiltroD2 === 'todas'
      ? seriesE2
      : seriesE2.filter((s) => s.arquitecturaId === arqFiltroD2);

  const sintesisFiltradas =
    arqFiltroD5 === 'todas'
      ? sintesisModelos
      : sintesisModelos.filter((s) => s.arquitecturaId === arqFiltroD5);

  // Paleta de colores SVG consistente con el resto del módulo
  const coloresHex: Record<string, string> = {
    unet: '#1d4ed8',
    cbam: '#df9847',
    modcbam: '#059669',
    transunet: '#d34a4a',
  };

  /* =========================================================================
   * GENERADORES DE RUTAS SVG PARA GRÁFICAS DE CONVERGENCIA
   * ========================================================================= */

  // Función auxiliar para mapear coordenadas lineales
  const mapearX = (epoca: number, maxEpocas: number, width = 740, padLeft = 50) => {
    return padLeft + ((epoca - 1) / (maxEpocas - 1)) * (width - padLeft - 20);
  };

  const mapearY = (valor: number, minVal: number, maxVal: number, height = 300, padTop = 25, padBottom = 35) => {
    const alturaUtil = height - padTop - padBottom;
    const norm = (valor - minVal) / (maxVal - minVal);
    return height - padBottom - norm * alturaUtil;
  };

  const construirPath = (
    valores: number[],
    maxEpocas: number,
    minVal: number,
    maxVal: number,
    width = 740,
    height = 300
  ) => {
    if (!valores || valores.length === 0) return '';
    return valores
      .map((val, idx) => {
        const x = mapearX(idx + 1, maxEpocas, width);
        const y = mapearY(val, minVal, maxVal, height);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <section
      className="seccion-convergencia-d"
      data-testid="seccion-convergencia-d"
      aria-label="Sección D: Convergencia y dinámica de entrenamiento"
    >
      {/* ========================================================================= */}
      {/* BANNER DE CONTEXTO METODOLÓGICO DE CONVERGENCIA                            */}
      {/* ========================================================================= */}
      <div className="banner-contexto-metodologico banner-convergencia">
        <div className="banner-contexto-header">
          <div className="banner-contexto-badge-fila">
            <span className="indicador-seccion-tag">Sección D</span>
            <BadgeProcedencia origen="validacion" />
          </div>
          <span className="etiqueta-origen-test">Validación Interna · Dinámica por Época</span>
        </div>
        <p className="banner-contexto-descripcion">
          Análisis de la trayectoria temporal de aprendizaje durante el entrenamiento de{' '}
          <strong>U-Net, U-Net + CBAM, ModCBAM y TransUNet</strong>. Evaluación de velocidad de convergencia,
          estabilidad de gradiente, impacto del <em>Early Stopping</em> en E1 (paciencia 25 sobre val Dice) y
          comportamiento con encoder congelado en E2 (100 épocas).
        </p>

        {/* ALERTA METODOLÓGICA CLAVE */}
        <div className="callout-aviso-ranking-global aviso-convergencia-metodologica" data-testid="aviso-rigor-convergencia">
          <div className="aviso-ranking-icon">
            <Scale size={20} className="icono-balanza-pareto" />
          </div>
          <div className="aviso-ranking-texto">
            <strong>Principio Epistemológico: No Confundir Convergencia con Rendimiento Ciego</strong>
            <p>
              Una convergencia más rápida o una menor pérdida de entrenamiento no garantizan mayor generalización sobre
              pacientes no vistos. Asimismo, las curvas aquí analizadas corresponden al <strong>conjunto de validación
              interna</strong> empleado para paradas tempranas y checkpoints, y no deben equipararse a las métricas del
              conjunto de prueba ciego independiente (N = 762 en E1 y N = 213 en E2).
            </p>
            <div className="aviso-ranking-alternativa">
              <CheckCircle2 size={14} />
              <span>
                La variabilidad entre épocas refleja la dinámica de optimización del algoritmo, no la variabilidad biológica entre pacientes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO D1 — EVOLUCIÓN DEL ENTRENAMIENTO E1 (SEGMENTACIÓN)               */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-d1" data-testid="apartado-d1-convergencia-e1">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado D1</div>
            <h4>Evolución del Entrenamiento en Segmentación (E1)</h4>
            <p className="apartado-subtitulo">
              Trayectorias de train_loss, val_loss y val_dice. Configuración: 150 épocas máximas con Early Stopping (paciencia de 25 épocas).
            </p>
          </div>

          {/* Selectores de subvista D1 */}
          <div className="selectores-grafica-tabs" role="tablist" aria-label="Subvistas de E1">
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD1 === 'dice'}
              className={`btn-subtab ${subvistaD1 === 'dice' ? 'activo' : ''}`}
              onClick={() => setSubvistaD1('dice')}
              data-testid="subtab-d1-dice"
            >
              <Target size={14} />
              <span>Dice de Validación</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD1 === 'perdidas'}
              className={`btn-subtab ${subvistaD1 === 'perdidas' ? 'activo' : ''}`}
              onClick={() => setSubvistaD1('perdidas')}
              data-testid="subtab-d1-perdidas"
            >
              <TrendingUp size={14} />
              <span>Pérdidas (Train vs Val)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD1 === 'tabla'}
              className={`btn-subtab ${subvistaD1 === 'tabla' ? 'activo' : ''}`}
              onClick={() => setSubvistaD1('tabla')}
              data-testid="subtab-d1-tabla"
            >
              <Activity size={14} />
              <span>Tabla Cuantitativa</span>
            </button>
          </div>
        </div>

        {/* Selector de Arquitectura D1 */}
        <div className="filtro-arquitectura-convergencia" role="group" aria-label="Filtrar arquitectura en E1">
          <span className="filtro-label">Arquitectura visualizada:</span>
          <button
            type="button"
            className={`btn-filtro-arq ${arqFiltroD1 === 'todas' ? 'activo' : ''}`}
            onClick={() => setArqFiltroD1('todas')}
          >
            Ver las 4
          </button>
          {seriesE1.map((s) => (
            <button
              key={s.arquitecturaId}
              type="button"
              className={`btn-filtro-arq ${arqFiltroD1 === s.arquitecturaId ? 'activo' : ''}`}
              onClick={() => setArqFiltroD1(s.arquitecturaId)}
            >
              <span className={`indicador-modelo-dot dot-${s.color}`} />
              <span>{`${s.nombre} (${s.epocasEfectivas} ep)`}</span>
            </button>
          ))}
        </div>

        {/* Tarjetas rápidas de métricas clave D1 */}
        <div className="hardware-cards-grid d1-metricas-grid">
          <div className="card-hw-stat">
            <span className="hw-stat-label">Convergencia Más Rápida (Pico Precoz)</span>
            <strong className="hw-stat-val">U-Net + CBAM (Época 23)</strong>
            <span className="hw-stat-sub">Parada a las 48 épocas (Dice pico: 0.8731)</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Mejor Dice de Validación</span>
            <strong className="hw-stat-val">TransUNet (0.8969)</strong>
            <span className="hw-stat-sub">Alcanzado a la época 81 (Parada a la 106)</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Menor Degradación Post-Pico</span>
            <strong className="hw-stat-val">TransUNet (Δ = 0.0056)</strong>
            <span className="hw-stat-sub">ModCBAM: Δ = 0.0077 · U-Net: Δ = 0.0108</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Mecanismo de Parada Temprana</span>
            <strong className="hw-stat-val">Paciencia = 25 Épocas</strong>
            <span className="hw-stat-sub">Los 4 modelos pararon exactamente a: Pico + 25</span>
          </div>
        </div>

        {/* GRÁFICA 1: DICE DE VALIDACIÓN E1 */}
        {subvistaD1 === 'dice' && (
          <div className="grafica-panel" data-testid="grafica-e1-dice">
            <div className="grafica-descripcion-top">
              <h6>Evolución de Coeficiente Dice en Validación (E1) — Comparación por Época</h6>
              <p>
                El marcador de rombo destaca la <strong>mejor época</strong> alcanzada. El círculo con borde
                marca la <strong>última época</strong> donde Early Stopping detuvo el entrenamiento tras 25 épocas sin nuevo máximo.
              </p>
            </div>

            <div className="contenedor-svg-convergencia">
              <svg viewBox="0 0 760 320" className="svg-convergencia" role="img" aria-label="Curvas de Dice en E1">
                {/* Cuadrícula horizontal */}
                {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((val) => {
                  const y = mapearY(val, 0.5, 1.0, 320, 25, 35);
                  return (
                    <g key={val} className="grid-line-group">
                      <line x1={50} y1={y} x2={740} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x={42} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
                        {val.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Ejes y marcas de época en X */}
                {[1, 20, 40, 60, 80, 100, 106].map((ep) => {
                  const x = mapearX(ep, 106, 760, 50);
                  return (
                    <g key={ep} className="grid-x-group">
                      <line x1={x} y1={25} x2={x} y2={285} stroke="#f1f5f9" />
                      <text x={x} y={302} textAnchor="middle" fontSize={11} fill="#64748b">
                        {ep}
                      </text>
                    </g>
                  );
                })}

                {/* Eje X etiqueta */}
                <text x={395} y={317} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569">
                  Época de Entrenamiento (E1: 1 a 106)
                </text>

                {/* Trazos de curvas de Dice para cada arquitectura */}
                {seriesE1Filtradas.map((s) => {
                  const pathStr = construirPath(s.valDice, 106, 0.5, 1.0, 760, 320);
                  const color = coloresHex[s.color] || '#475569';
                  const xPico = mapearX(s.mejorEpocaDice, 106, 760, 50);
                  const yPico = mapearY(s.mejorValDice, 0.5, 1.0, 320, 25, 35);
                  const xFinal = mapearX(s.epocasEfectivas, 106, 760, 50);
                  const yFinal = mapearY(s.ultimoValDice, 0.5, 1.0, 320, 25, 35);

                  return (
                    <g key={s.arquitecturaId} className={`curva-grupo grupo-${s.color}`}>
                      {/* Sombra de ventana de paciencia si está seleccionada individualmente */}
                      {arqFiltroD1 === s.arquitecturaId && (
                        <rect
                          x={xPico}
                          y={25}
                          width={Math.max(2, xFinal - xPico)}
                          height={260}
                          fill={color}
                          opacity={0.12}
                        />
                      )}

                      {/* Línea de Dice de validación */}
                      <path
                        d={pathStr}
                        fill="none"
                        stroke={color}
                        strokeWidth={arqFiltroD1 === s.arquitecturaId ? 3.5 : 2.4}
                        strokeLinecap="round"
                      />

                      {/* Marcador de pico (rombo destacado) */}
                      <polygon
                        points={`${xPico},${yPico - 7} ${xPico + 5.5},${yPico} ${xPico},${yPico + 7} ${xPico - 5.5},${yPico}`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        aria-label={`${s.nombre} - Mejor Dice: ${s.mejorValDice.toFixed(4)} en época ${s.mejorEpocaDice}`}
                        role="graphics-symbol"
                      >
                        <title>{`${s.nombre} - Mejor Dice: ${s.mejorValDice.toFixed(4)} en época ${s.mejorEpocaDice}`}</title>
                      </polygon>

                      {/* Marcador de última época (círculo con borde) */}
                      <circle
                        cx={xFinal}
                        cy={yFinal}
                        r={4.5}
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth={2.5}
                        aria-label={`${s.nombre} - Último Dice: ${s.ultimoValDice.toFixed(4)} en época ${s.epocasEfectivas} (Parada por Early Stopping)`}
                        role="graphics-symbol"
                      >
                        <title>{`${s.nombre} - Último Dice: ${s.ultimoValDice.toFixed(4)} en época ${s.epocasEfectivas} (Parada por Early Stopping)`}</title>
                      </circle>

                      {/* Etiqueta flotante del mejor valor si está individual */}
                      {arqFiltroD1 === s.arquitecturaId && (
                        <g>
                          <rect
                            x={Math.min(640, xPico - 45)}
                            y={Math.max(10, yPico - 28)}
                            width={90}
                            height={20}
                            rx={4}
                            fill="#0f172a"
                            opacity={0.88}
                          />
                          <text
                            x={Math.min(685, xPico)}
                            y={Math.max(24, yPico - 14)}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight="bold"
                            fill="#ffffff"
                          >
                            Pico: {s.mejorValDice.toFixed(4)} (Ep {s.mejorEpocaDice})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Leyenda interactiva */}
            <div className="leyenda-convergencia-grafica">
              {seriesE1.map((s) => (
                <div key={s.arquitecturaId} className="item-leyenda-conv">
                  <span className={`indicador-modelo-dot dot-${s.color}`} />
                  <span className="leyenda-conv-nombre">{s.nombre}:</span>
                  <span className="leyenda-conv-pico">
                    Pico: <strong>{s.mejorValDice.toFixed(4)}</strong> (Ep {s.mejorEpocaDice})
                  </span>
                  <span className="leyenda-conv-cierre">
                    Final: {s.ultimoValDice.toFixed(4)} (Ep {s.epocasEfectivas})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRÁFICA 2: PÉRDIDAS TRAIN VS VAL E1 */}
        {subvistaD1 === 'perdidas' && (
          <div className="grafica-panel" data-testid="grafica-e1-perdidas">
            <div className="grafica-descripcion-top">
              <h6>Evolución de Pérdidas (Pérdida Compuesta BCE + Dice + Hausdorff) — Etapa E1</h6>
              <p>
                Línea discontinua (<span className="linea-muestra-train">---</span>): <strong>Entrenamiento</strong>.
                Línea sólida (—): <strong>Validación</strong>. Muestra la minimización asintótica del coste.
              </p>
            </div>

            <div className="contenedor-svg-convergencia">
              <svg viewBox="0 0 760 320" className="svg-convergencia" role="img" aria-label="Curvas de Pérdidas en E1">
                {/* Cuadrícula horizontal */}
                {[0.0, 0.3, 0.6, 0.9, 1.2, 1.5].map((val) => {
                  const y = mapearY(val, 0.0, 1.55, 320, 25, 35);
                  return (
                    <g key={val} className="grid-line-group">
                      <line x1={50} y1={y} x2={740} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x={42} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Ejes X */}
                {[1, 20, 40, 60, 80, 100, 106].map((ep) => {
                  const x = mapearX(ep, 106, 760, 50);
                  return (
                    <g key={ep} className="grid-x-group">
                      <line x1={x} y1={25} x2={x} y2={285} stroke="#f1f5f9" />
                      <text x={x} y={302} textAnchor="middle" fontSize={11} fill="#64748b">
                        {ep}
                      </text>
                    </g>
                  );
                })}

                <text x={395} y={317} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569">
                  Época de Entrenamiento (E1)
                </text>

                {/* Trazos de pérdidas train y val */}
                {seriesE1Filtradas.map((s) => {
                  const color = coloresHex[s.color] || '#475569';
                  const pathTrain = construirPath(s.trainLoss, 106, 0.0, 1.55, 760, 320);
                  const pathVal = construirPath(s.valLoss, 106, 0.0, 1.55, 760, 320);

                  return (
                    <g key={s.arquitecturaId}>
                      {/* Train Loss (Discontinua) */}
                      <path
                        d={pathTrain}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.8}
                        strokeDasharray="4 3"
                        opacity={0.7}
                      />
                      {/* Val Loss (Sólida) */}
                      <path
                        d={pathVal}
                        fill="none"
                        stroke={color}
                        strokeWidth={2.4}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="leyenda-convergencia-grafica">
              <div className="conv-nota-estilo">
                <span><strong>Convención visual:</strong></span>
                <span className="tag-conv-estilo"><span className="muestra-linea-dash" /> Train Loss (Entrenamiento)</span>
                <span className="tag-conv-estilo"><span className="muestra-linea-solid" /> Val Loss (Validación)</span>
              </div>
            </div>
          </div>
        )}

        {/* TABLA CUANTITATIVA COMPARATIVA E1 */}
        {subvistaD1 === 'tabla' && (
          <div className="contenedor-tabla-responsive" data-testid="tabla-convergencia-e1">
            <table className="tabla-cientifica-comparativa" aria-label="Tabla de convergencia en etapa E1">
              <thead>
                <tr>
                  <th scope="col">Arquitectura</th>
                  <th scope="col">Épocas Registradas</th>
                  <th scope="col">Mejor Época (val_dice)</th>
                  <th scope="col">Dice Máximo</th>
                  <th scope="col">Dice Última Época</th>
                  <th scope="col">Caída Post-Pico (Δ)</th>
                  <th scope="col">Pérdida Inicial → Final</th>
                  <th scope="col">Mínimo val_loss (Época)</th>
                  <th scope="col">Motivo de Parada</th>
                </tr>
              </thead>
              <tbody>
                {seriesE1.map((s) => (
                  <tr key={s.arquitecturaId} className={`fila-modelo fila-${s.arquitecturaId}`}>
                    <td className="col-modelo">
                      <div className="celda-modelo-info">
                        <span className={`indicador-modelo-dot dot-${s.color}`} />
                        <div>
                          <strong>{s.nombre}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="col-metrica">
                      <strong>{s.epocasEfectivas}</strong> / {s.epocasConfiguradas}
                    </td>
                    <td className="col-metrica">
                      <span className="badge-epoca-destacada">Época {s.mejorEpocaDice}</span>
                    </td>
                    <td className="col-metrica">
                      <strong className="valor-dice-destacado">{s.mejorValDice.toFixed(4)}</strong>
                    </td>
                    <td className="col-metrica">{s.ultimoValDice.toFixed(4)}</td>
                    <td className="col-metrica">
                      <span className={`tag-delta ${s.diferenciaDicePicoFinal <= 0.01 ? 'delta-bajo' : 'delta-alto'}`}>
                        {s.diferenciaDicePicoFinal.toFixed(4)}
                      </span>
                    </td>
                    <td className="col-metrica">
                      <span className="tag-loss-trayectoria">
                        {s.trainLossInicial.toFixed(2)} → {s.trainLossFinal.toFixed(4)}
                      </span>
                    </td>
                    <td className="col-metrica">
                      {s.valLossMinimo.toFixed(4)} (Ep {s.epocaValLossMinimo})
                    </td>
                    <td className="col-metrica">
                      <span className="tag-early-stopping">
                        Early Stopping (Paciencia {s.pacienciaEarlyStopping} ep)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* APARTADO D2 — EVOLUCIÓN DEL ENTRENAMIENTO E2 (CLASIFICACIÓN)              */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-d2" data-testid="apartado-d2-convergencia-e2">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado D2</div>
            <h4>Evolución del Entrenamiento en Clasificación (E2)</h4>
            <p className="apartado-subtitulo">
              Curvas de val_mcc, val_f1, train_loss y val_loss. Condición experimental: 100 épocas completas con encoder convolucional congelado.
            </p>
          </div>

          <div className="selectores-grafica-tabs" role="tablist" aria-label="Subvistas de E2">
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD2 === 'metricas'}
              className={`btn-subtab ${subvistaD2 === 'metricas' ? 'activo' : ''}`}
              onClick={() => setSubvistaD2('metricas')}
              data-testid="subtab-d2-metricas"
            >
              <Award size={14} />
              <span>MCC y F1 (Validación)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD2 === 'perdidas'}
              className={`btn-subtab ${subvistaD2 === 'perdidas' ? 'activo' : ''}`}
              onClick={() => setSubvistaD2('perdidas')}
              data-testid="subtab-d2-perdidas"
            >
              <TrendingUp size={14} />
              <span>Pérdidas E2</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subvistaD2 === 'tabla'}
              className={`btn-subtab ${subvistaD2 === 'tabla' ? 'activo' : ''}`}
              onClick={() => setSubvistaD2('tabla')}
              data-testid="subtab-d2-tabla"
            >
              <Activity size={14} />
              <span>Tabla Cuantitativa</span>
            </button>
          </div>
        </div>

        {/* Filtro por arquitectura E2 */}
        <div className="filtro-arquitectura-convergencia" role="group" aria-label="Filtrar arquitectura en E2">
          <span className="filtro-label">Arquitectura visualizada:</span>
          <button
            type="button"
            className={`btn-filtro-arq ${arqFiltroD2 === 'todas' ? 'activo' : ''}`}
            onClick={() => setArqFiltroD2('todas')}
          >
            Ver las 4
          </button>
          {seriesE2.map((s) => (
            <button
              key={s.arquitecturaId}
              type="button"
              className={`btn-filtro-arq ${arqFiltroD2 === s.arquitecturaId ? 'activo' : ''}`}
              onClick={() => setArqFiltroD2(s.arquitecturaId)}
            >
              <span className={`indicador-modelo-dot dot-${s.color}`} />
              <span>{s.nombre}</span>
            </button>
          ))}
        </div>

        {/* Tarjetas resumen E2 */}
        <div className="hardware-cards-grid d2-metricas-grid">
          <div className="card-hw-stat">
            <span className="hw-stat-label">Pico de Validación en MCC</span>
            <strong className="hw-stat-val">ModCBAM (0.7388)</strong>
            <span className="hw-stat-sub">Alcanzado a la época 54 (F1 pico: 0.8691)</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Pico de Validación en U-Net Clásica</span>
            <strong className="hw-stat-val">U-Net (0.7276 MCC)</strong>
            <span className="hw-stat-sub">Alcanzado a la época 72 (F1 pico: 0.8573)</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Régimen de Entrenamiento E2</span>
            <strong className="hw-stat-val">100 Épocas Completas</strong>
            <span className="hw-stat-sub">Sin Early Stopping · Encoder congelado</span>
          </div>
          <div className="card-hw-stat card-hw-vram-alert">
            <span className="hw-stat-label">Inestabilidad de TransUNet</span>
            <strong className="hw-stat-val">Volatilidad = 0.1922</strong>
            <span className="hw-stat-sub">Oscilaciones tempranas (MCC=0.0 en ep 1-20)</span>
          </div>
        </div>

        {/* GRÁFICA 1: MCC Y F1 E2 */}
        {subvistaD2 === 'metricas' && (
          <div className="grafica-panel" data-testid="grafica-e2-metricas">
            <div className="grafica-descripcion-top">
              <h6>Evolución de Coeficiente de Matthews (MCC) y F1-Score en Validación (E2)</h6>
              <p>
                Línea continua (—): <strong>val_mcc</strong>. Línea de trazo corto (- -): <strong>val_f1</strong>.
                Permite observar el punto de mayor equilibrio discriminativo del clasificador denso.
              </p>
            </div>

            <div className="contenedor-svg-convergencia">
              <svg viewBox="0 0 760 320" className="svg-convergencia" role="img" aria-label="Curvas de MCC y F1 en E2">
                {/* Cuadrícula horizontal */}
                {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val) => {
                  const y = mapearY(val, -0.05, 1.0, 320, 25, 35);
                  return (
                    <g key={val} className="grid-line-group">
                      <line x1={50} y1={y} x2={740} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x={42} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Ejes X */}
                {[1, 20, 40, 60, 80, 100].map((ep) => {
                  const x = mapearX(ep, 100, 760, 50);
                  return (
                    <g key={ep} className="grid-x-group">
                      <line x1={x} y1={25} x2={x} y2={285} stroke="#f1f5f9" />
                      <text x={x} y={302} textAnchor="middle" fontSize={11} fill="#64748b">
                        {ep}
                      </text>
                    </g>
                  );
                })}

                <text x={395} y={317} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569">
                  Época de Entrenamiento (E2: 1 a 100)
                </text>

                {/* Trazos de MCC y F1 */}
                {seriesE2Filtradas.map((s) => {
                  const color = coloresHex[s.color] || '#475569';
                  const pathMcc = construirPath(s.valMcc, 100, -0.05, 1.0, 760, 320);
                  const pathF1 = construirPath(s.valF1, 100, -0.05, 1.0, 760, 320);
                  const xPico = mapearX(s.mejorEpocaMcc, 100, 760, 50);
                  const yPico = mapearY(s.mejorValMcc, -0.05, 1.0, 320, 25, 35);

                  return (
                    <g key={s.arquitecturaId}>
                      {/* Trazo F1 (Discontinuo fino) */}
                      <path
                        d={pathF1}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        opacity={0.65}
                      />
                      {/* Trazo MCC (Sólido grueso) */}
                      <path
                        d={pathMcc}
                        fill="none"
                        stroke={color}
                        strokeWidth={arqFiltroD2 === s.arquitecturaId ? 3.2 : 2.2}
                      />
                      {/* Marcador de pico MCC */}
                      <circle
                        cx={xPico}
                        cy={yPico}
                        r={5}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        aria-label={`${s.nombre} - Mejor MCC: ${s.mejorValMcc.toFixed(4)} en época ${s.mejorEpocaMcc}`}
                        role="graphics-symbol"
                      >
                        <title>{`${s.nombre} - Mejor MCC: ${s.mejorValMcc.toFixed(4)} en época ${s.mejorEpocaMcc}`}</title>
                      </circle>

                      {/* Etiqueta flotante de mejor MCC si está individual */}
                      {arqFiltroD2 === s.arquitecturaId && (
                        <g>
                          <rect
                            x={Math.min(640, xPico - 45)}
                            y={Math.max(10, yPico - 28)}
                            width={90}
                            height={20}
                            rx={4}
                            fill="#0f172a"
                            opacity={0.88}
                          />
                          <text
                            x={Math.min(685, xPico)}
                            y={Math.max(24, yPico - 14)}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight="bold"
                            fill="#ffffff"
                          >
                            Pico: {s.mejorValMcc.toFixed(4)} (Ep {s.mejorEpocaMcc})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="leyenda-convergencia-grafica">
              <div className="conv-nota-estilo">
                <span><strong>Líneas:</strong></span>
                <span className="tag-conv-estilo"><span className="muestra-linea-solid" /> val_mcc (Línea continua)</span>
                <span className="tag-conv-estilo"><span className="muestra-linea-dash" /> val_f1 (Línea discontinua)</span>
              </div>
            </div>
          </div>
        )}

        {/* GRÁFICA 2: PÉRDIDAS E2 */}
        {subvistaD2 === 'perdidas' && (
          <div className="grafica-panel" data-testid="grafica-e2-perdidas">
            <div className="grafica-descripcion-top">
              <h6>Evolución de Pérdidas de Clasificación Binaria (Cross-Entropy Loss) — Etapa E2</h6>
              <p>
                Evolución de `train_loss` (discontinua) y `val_loss` (continua) a lo largo de las 100 épocas.
              </p>
            </div>

            <div className="contenedor-svg-convergencia">
              <svg viewBox="0 0 760 320" className="svg-convergencia" role="img" aria-label="Curvas de Pérdidas en E2">
                {[0.0, 0.2, 0.4, 0.6, 0.8].map((val) => {
                  const y = mapearY(val, 0.0, 0.85, 320, 25, 35);
                  return (
                    <g key={val} className="grid-line-group">
                      <line x1={50} y1={y} x2={740} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x={42} y={y + 4} textAnchor="end" fontSize={11} fill="#64748b">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {[1, 20, 40, 60, 80, 100].map((ep) => {
                  const x = mapearX(ep, 100, 760, 50);
                  return (
                    <g key={ep} className="grid-x-group">
                      <line x1={x} y1={25} x2={x} y2={285} stroke="#f1f5f9" />
                      <text x={x} y={302} textAnchor="middle" fontSize={11} fill="#64748b">
                        {ep}
                      </text>
                    </g>
                  );
                })}

                <text x={395} y={317} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#475569">
                  Época de Entrenamiento (E2)
                </text>

                {seriesE2Filtradas.map((s) => {
                  const color = coloresHex[s.color] || '#475569';
                  const pathTrain = construirPath(s.trainLoss, 100, 0.0, 0.85, 760, 320);
                  const pathVal = construirPath(s.valLoss, 100, 0.0, 0.85, 760, 320);

                  return (
                    <g key={s.arquitecturaId}>
                      <path d={pathTrain} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="4 3" opacity={0.7} />
                      <path d={pathVal} fill="none" stroke={color} strokeWidth={2.4} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* TABLA CUANTITATIVA COMPARATIVA E2 */}
        {subvistaD2 === 'tabla' && (
          <div className="contenedor-tabla-responsive" data-testid="tabla-convergencia-e2">
            <table className="tabla-cientifica-comparativa" aria-label="Tabla de convergencia en etapa E2">
              <thead>
                <tr>
                  <th scope="col">Arquitectura</th>
                  <th scope="col">Épocas Registradas</th>
                  <th scope="col">Condición Encoder</th>
                  <th scope="col">Mejor val_mcc (Época)</th>
                  <th scope="col">Último val_mcc</th>
                  <th scope="col">Mejor val_f1 (Época)</th>
                  <th scope="col">Último val_f1</th>
                  <th scope="col">Pérdida Inicial → Final</th>
                </tr>
              </thead>
              <tbody>
                {seriesE2.map((s) => (
                  <tr key={s.arquitecturaId} className={`fila-modelo fila-${s.arquitecturaId}`}>
                    <td className="col-modelo">
                      <div className="celda-modelo-info">
                        <span className={`indicador-modelo-dot dot-${s.color}`} />
                        <div>
                          <strong>{s.nombre}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="col-metrica">
                      <strong>{s.epocasEfectivas}</strong> / {s.epocasConfiguradas}
                    </td>
                    <td className="col-metrica">
                      <span className="tag-encoder-congelado">Congelado (E1)</span>
                    </td>
                    <td className="col-metrica">
                      <strong>{s.mejorValMcc.toFixed(4)}</strong> (Ep {s.mejorEpocaMcc})
                    </td>
                    <td className="col-metrica">{s.ultimoValMcc.toFixed(4)}</td>
                    <td className="col-metrica">
                      <strong>{s.mejorValF1.toFixed(4)}</strong> (Ep {s.mejorEpocaF1})
                    </td>
                    <td className="col-metrica">{s.ultimoValF1.toFixed(4)}</td>
                    <td className="col-metrica">
                      <span className="tag-loss-trayectoria">
                        {s.trainLossInicial.toFixed(2)} → {s.trainLossFinal.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* APARTADO D3 — ESTABILIDAD Y CONVERGENCIA                                  */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-d3" data-testid="apartado-d3-estabilidad">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado D3</div>
            <h4>Indicadores Cuantitativos de Estabilidad y Convergencia</h4>
            <p className="apartado-subtitulo">
              Métricas estadísticas descriptivas para evaluar oscilaciones, mesetas y consistencia temporal sin puntuaciones arbitrarias.
            </p>
          </div>
          <span className="badge-etiqueta-analisis">Fórmulas Matemáticas Documentadas</span>
        </div>

        {/* Tabla de 4 indicadores descriptivos formales */}
        <div className="contenedor-tabla-responsive">
          <table className="tabla-cientifica-comparativa" aria-label="Indicadores formales de estabilidad">
            <thead>
              <tr>
                <th scope="col">Indicador Formal</th>
                <th scope="col">Fórmula Matemática</th>
                <th scope="col">U-Net</th>
                <th scope="col">U-Net + CBAM</th>
                <th scope="col">ModCBAM</th>
                <th scope="col">TransUNet</th>
                <th scope="col">Interpretación Experimental</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.map((ind) => (
                <tr key={ind.id} className="fila-indicador-estabilidad" data-testid={`indicador-${ind.id}`}>
                  <td className="col-modelo">
                    <div className="celda-indicador-titulo">
                      <span className="tag-compromiso-id">{ind.id}</span>
                      <strong>{ind.nombre}</strong>
                    </div>
                    <span className="subtexto-modelo">{ind.descripcionSignificado}</span>
                  </td>
                  <td className="col-formula">
                    <code className="codigo-formula">{ind.formula}</code>
                  </td>
                  <td className="col-metrica">
                    <div>E1: <strong>{ind.valoresE1.unet}</strong></div>
                    <div className="sub-metrica-e2">E2: {ind.valoresE2.unet}</div>
                  </td>
                  <td className="col-metrica">
                    <div>E1: <strong>{ind.valoresE1['unet-cbam']}</strong></div>
                    <div className="sub-metrica-e2">E2: {ind.valoresE2['unet-cbam']}</div>
                  </td>
                  <td className="col-metrica">
                    <div>E1: <strong>{ind.valoresE1.modcbam}</strong></div>
                    <div className="sub-metrica-e2">E2: {ind.valoresE2.modcbam}</div>
                  </td>
                  <td className="col-metrica">
                    <div>E1: <strong>{ind.valoresE1.transunet}</strong></div>
                    <div className="sub-metrica-e2 destacado-inestable">E2: {ind.valoresE2.transunet}</div>
                  </td>
                  <td className="col-interpretacion-ind">
                    <p>{ind.interpretacionCientifica}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota epistemológica sobre variabilidad */}
        <div className="callout-rigor-vram">
          <Info size={16} />
          <p>
            <strong>Distinción Epistemológica Fundamental:</strong> La variabilidad entre épocas (σ(Δy))
            describe exclusivamente la estabilidad numérica de la optimización estocástica por minilotes.
            Bajo ninguna circunstancia debe interpretarse como incertidumbre muestral o estadística sobre la población
            de pacientes o nódulos de LIDC-IDRI.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO D4 — ANÁLISIS DE BRECHAS DE GENERALIZACIÓN                       */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-d4" data-testid="apartado-d4-brechas">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado D4</div>
            <h4>Análisis Riguroso de Brechas de Generalización</h4>
            <p className="apartado-subtitulo">
              Diferenciación estricta entre brecha de pérdida observada, hipótesis de sobreajuste y evidencia empírica real.
            </p>
          </div>
          <span className="badge-etiqueta-analisis">Diferenciación Train vs Validación</span>
        </div>

        <div className="brechas-grid">
          {brechas.map((b, idx) => (
            <div key={`${b.arquitecturaId}-${b.etapa}-${idx}`} className={`tarjeta-brecha-card arq-${b.color}`}>
              <div className="brecha-card-top">
                <div className="brecha-titulo-fila">
                  <span className={`indicador-modelo-dot dot-${b.color}`} />
                  <strong>{b.nombre}</strong>
                  <span className="tag-etapa-badge">{b.etapa}</span>
                </div>
                <span className={`badge-nivel-brecha brecha-${b.nivelBrecha}`}>
                  Gap: {b.brechaPerdida >= 0 ? `+${b.brechaPerdida.toFixed(4)}` : b.brechaPerdida.toFixed(4)}
                </span>
              </div>
              <p className="brecha-hallazgo">{b.hallazgoEmpirico}</p>
              <div className="brecha-alerta">
                <AlertTriangle size={14} className="icono-alerta-ambar" />
                <span>{b.alertaRigor}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="callout-aviso-ranking-global">
          <ShieldAlert size={18} className="icono-escudo-alerta" />
          <div className="aviso-ranking-texto">
            <strong>Precaución Científica sobre TransUNet:</strong>
            <p>
              En E1, TransUNet exhibe la mayor brecha de pérdida final (+0.1531), producto de su capacidad para minimizar
              train_loss hasta 0.0297. No obstante, concluir que existe un sobreajuste patológico sería científicamente
              inválido: su Dice de validación continuó aumentando hasta la época 81 (0.8969) y retuvo 0.8913 al cierre.
              En E2, la aparente ausencia de brecha (-0.0089) no refleja generalización perfecta sino subajuste (<em>underfitting</em>)
              de la cabeza densa con el encoder congelado.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO D5 — SÍNTESIS DE CONVERGENCIA POR ARQUITECTURA                   */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-d5" data-testid="apartado-d5-sintesis">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado D5</div>
            <h4>Síntesis Crítica de Dinámica de Convergencia por Arquitectura</h4>
            <p className="apartado-subtitulo">
              Perfil estructurado diferenciando: comportamiento en E1, comportamiento en E2, estabilidad observada y limitaciones interpretativas.
            </p>
          </div>

          <div className="filtro-arquitectura-selector" role="group" aria-label="Filtrar síntesis por modelo">
            <button
              type="button"
              className={`btn-filtro-arq ${arqFiltroD5 === 'todas' ? 'activo' : ''}`}
              onClick={() => setArqFiltroD5('todas')}
            >
              Ver las 4
            </button>
            {sintesisModelos.map((s) => (
              <button
                key={s.arquitecturaId}
                type="button"
                className={`btn-filtro-arq ${arqFiltroD5 === s.arquitecturaId ? 'activo' : ''}`}
                onClick={() => setArqFiltroD5(s.arquitecturaId)}
              >
                <span className={`indicador-modelo-dot dot-${s.color}`} />
                <span>{s.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de tarjetas de síntesis D5 */}
        <div className="sintesis-modelos-grid">
          {sintesisFiltradas.map((mod) => (
            <article
              key={mod.arquitecturaId}
              className={`tarjeta-sintesis-arquitectura arq-${mod.color}`}
              data-testid={`sintesis-conv-${mod.arquitecturaId}`}
            >
              <div className="sintesis-card-top">
                <div className="sintesis-titulo-bloque">
                  <span className={`indicador-modelo-dot dot-${mod.color}`} />
                  <div>
                    <h5>{mod.nombre}</h5>
                    <span className="categoria-modelo-sub">{mod.categoria}</span>
                  </div>
                </div>
                <div className="complejidad-pills-grupo">
                  <span className="pill-hw">{mod.convergenciaE1.epocas} Ep (E1)</span>
                  <span className="pill-hw">{mod.convergenciaE2.epocas} Ep (E2)</span>
                </div>
              </div>

              <div className="sintesis-card-secciones">
                {/* 1. Comportamiento en E1 */}
                <div className="seccion-sintesis-item">
                  <div className="item-subtitulo">
                    <Layers size={15} className="icono-check-verde" />
                    <strong>1. Dinámica de Convergencia en Segmentación (E1)</strong>
                  </div>
                  <p>{mod.convergenciaE1.dinamicaEarlyStopping}</p>
                  <p className="subtexto-perdidas">{mod.convergenciaE1.perdidas}</p>
                </div>

                {/* 2. Comportamiento en E2 */}
                <div className="seccion-sintesis-item">
                  <div className="item-subtitulo">
                    <Activity size={15} className="icono-hw-azul" />
                    <strong>2. Dinámica de Convergencia en Clasificación (E2)</strong>
                  </div>
                  <p>{mod.convergenciaE2.dinamicaEncoderCongelado}</p>
                  <p className="subtexto-perdidas">{mod.convergenciaE2.perdidas}</p>
                </div>

                {/* 3. Retención post-pico */}
                <div className="seccion-sintesis-item item-hw">
                  <div className="item-subtitulo">
                    <Award size={15} className="icono-alerta-ambar" />
                    <strong>3. Picos de Validación y Retención de Rendimiento</strong>
                  </div>
                  <div className="hw-datos-resumen">
                    <span>
                      <strong>Dice Pico E1:</strong> {mod.convergenciaE1.mejorDice.toFixed(4)} (Ep {mod.convergenciaE1.mejorEpocaDice})
                    </span>
                    <span>
                      <strong>Dice Cierre E1:</strong> {mod.convergenciaE1.ultimoDice.toFixed(4)} (Δ = {mod.convergenciaE1.degradacionPico.toFixed(4)})
                    </span>
                    <span>
                      <strong>MCC Pico E2:</strong> {mod.convergenciaE2.mejorMcc.toFixed(4)} (Ep {mod.convergenciaE2.mejorEpocaMcc})
                    </span>
                    <span>
                      <strong>F1 Pico E2:</strong> {mod.convergenciaE2.mejorF1.toFixed(4)} (Ep {mod.convergenciaE2.mejorEpocaF1})
                    </span>
                  </div>
                </div>

                {/* 4. Estabilidad observada */}
                <div className="seccion-sintesis-item">
                  <div className="item-subtitulo">
                    <Zap size={15} className="icono-escenarios-morado" />
                    <strong>4. Estabilidad y Volatilidad Observadas</strong>
                  </div>
                  <p>{mod.estabilidadObservada.descripcionEstabilidad}</p>
                  <div className="hw-datos-resumen">
                    <span><strong>σ(ΔDice):</strong> {mod.estabilidadObservada.volatilidadDice.toFixed(4)}</span>
                    <span><strong>σ(ΔMCC):</strong> {mod.estabilidadObservada.volatilidadMcc.toFixed(4)}</span>
                    <span><strong>σ(ΔF1):</strong> {mod.estabilidadObservada.volatilidadF1.toFixed(4)}</span>
                  </div>
                </div>

                {/* 5. Limitaciones metodológicas */}
                <div className="seccion-sintesis-item item-advertencias">
                  <div className="item-subtitulo">
                    <AlertTriangle size={15} className="icono-alerta-ambar" />
                    <strong>5. Limitaciones Metodológicas de Interpretación</strong>
                  </div>
                  <ul>
                    {mod.limitacionesMetodologicas.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeccionConvergenciaD;
