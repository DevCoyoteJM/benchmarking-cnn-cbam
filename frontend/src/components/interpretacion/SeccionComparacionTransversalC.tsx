import { useMemo, useState } from 'react';
import {
  Layers,
  Activity,
  Cpu,
  Scale,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Gauge,
  Sliders,
} from 'lucide-react';
import {
  obtenerResultadosE1,
  obtenerResultadosE2,
  obtenerDatosComplejidadHardware,
  obtenerCompromisosTransversales,
  obtenerSintesisTransversalArquitecturas,
  explicarInvalidezRankingGlobal,
} from '../../services/interpretacionService';
import BadgeProcedencia from './BadgeProcedencia';
import type { IdArquitectura } from '../../types/interpretacion';

export const SeccionComparacionTransversalC: React.FC = () => {
  // Datos tipados canónicos de los servicios de interpretación
  const resultadosE1 = useMemo(() => obtenerResultadosE1(false), []);
  const resultadosE2 = useMemo(() => obtenerResultadosE2(false), []);
  const datosHardware = useMemo(() => obtenerDatosComplejidadHardware(false), []);
  const compromisos = useMemo(() => obtenerCompromisosTransversales(), []);
  const sintesisArquitecturas = useMemo(() => obtenerSintesisTransversalArquitecturas(false), []);
  const explicacionRanking = useMemo(() => explicarInvalidezRankingGlobal(), []);

  // Estados interactivos
  const [etapaRendimiento, setEtapaRendimiento] = useState<'E1' | 'E2'>('E1');
  const [graficaActiva, setGraficaActiva] = useState<'sens-vs-espec' | 'params-vs-perf' | 'latencia-vs-fps'>('sens-vs-espec');
  const [arquitecturaFiltro, setArquitecturaFiltro] = useState<IdArquitectura | 'todas'>('todas');

  const obtenerColorClase = (id: string): string => {
    switch (id) {
      case 'unet':
        return 'unet';
      case 'unet-cbam':
        return 'cbam';
      case 'modcbam':
        return 'modcbam';
      case 'transunet':
        return 'transunet';
      default:
        return 'ref-3d';
    }
  };

  const arquitecturasFiltradas = useMemo(() => {
    if (arquitecturaFiltro === 'todas') return sintesisArquitecturas;
    return sintesisArquitecturas.filter((s) => s.id === arquitecturaFiltro);
  }, [sintesisArquitecturas, arquitecturaFiltro]);

  return (
    <section
      className="seccion-interpretacion seccion-transversal-c"
      aria-label="Sección C: Comparación transversal de arquitecturas"
      data-testid="seccion-comparacion-transversal-c"
    >
      {/* CABECERA Y BANNER METODOLÓGICO: PROHIBICIÓN DE RANKING GLOBAL */}
      <div className="banner-contexto-muestral banner-transversal">
        <div className="banner-contexto-top">
          <div className="banner-titulo-grupo">
            <span className="badge-etapa-etiqueta etapa-transversal-tag">Sección C</span>
            <h3>Comparación Transversal Multi-Criterio de Arquitecturas</h3>
          </div>
          <span className="etiqueta-origen-test">4 Arquitecturas Propias 2D · Evaluación Pareada</span>
        </div>
        <p className="banner-contexto-descripcion">
          Análisis comparativo riguroso entre <strong>U-Net, U-Net + CBAM, ModCBAM y TransUNet</strong> evaluando
          rendimiento en segmentación (E1, N=762), clasificación de malignidad (E2, N=213), eficiencia computacional
          (RTX 5060 Ti) y los compromisos experimentales derivados.
        </p>

        {/* ALERTA CIENTÍFICA: AUSENCIA DE RANKING GLOBAL */}
        <div className="callout-aviso-ranking-global" data-testid="aviso-ausencia-ranking-global">
          <div className="aviso-ranking-icon">
            <Scale size={20} className="icono-balanza-pareto" />
          </div>
          <div className="aviso-ranking-texto">
            <strong>Principio Epistemológico: Ausencia de Ranking Global Arbitrario</strong>
            <p>{explicacionRanking.razonMetodologica}</p>
            <div className="aviso-ranking-alternativa">
              <CheckCircle2 size={14} />
              <span>{explicacionRanking.alternativaCientifica}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO C1 — COMPARACIÓN DE RENDIMIENTO E1 Y E2                           */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-c1" data-testid="apartado-c1-rendimiento">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado C1</div>
            <h4>Comparación de Rendimiento Experimental en E1 y E2</h4>
            <p className="apartado-subtitulo">
              Diferenciación estricta entre tareas. Métricas evaluadas sobre conjuntos de prueba ciegos e independientes.
            </p>
          </div>

          {/* Selector de Etapa E1 / E2 */}
          <div className="selector-etapa-c1-tabs" role="tablist" aria-label="Selector de Etapa para C1">
            <button
              type="button"
              role="tab"
              aria-selected={etapaRendimiento === 'E1'}
              className={`btn-tab-subetapa ${etapaRendimiento === 'E1' ? 'activo' : ''}`}
              onClick={() => setEtapaRendimiento('E1')}
              data-testid="tab-c1-e1"
            >
              <Layers size={15} />
              <span>Etapa 1: Segmentación (N=762)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={etapaRendimiento === 'E2'}
              className={`btn-tab-subetapa ${etapaRendimiento === 'E2' ? 'activo' : ''}`}
              onClick={() => setEtapaRendimiento('E2')}
              data-testid="tab-c1-e2"
            >
              <Activity size={15} />
              <span>Etapa 2: Clasificación (N=213)</span>
            </button>
          </div>
        </div>

        {/* Tabla E1 */}
        {etapaRendimiento === 'E1' ? (
          <div className="tabla-transversal-contenedor" data-testid="tabla-rendimiento-e1">
            <div className="tabla-meta-contexto">
              <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={762} />
              <span className="meta-info-texto">
                Unidad: Parches axiales 2D (96×96) · Partición paciente-disjunta · Celda 34 del Notebook
              </span>
            </div>

            <div className="contenedor-tabla-responsive">
              <table className="tabla-cientifica-comparativa" aria-label="Rendimiento E1 de las cuatro arquitecturas">
                <thead>
                  <tr>
                    <th scope="col">Arquitectura</th>
                    <th scope="col">
                      Dice
                      <span className="direccion-metrica metrica-mayor-mejor" title="Mayor valor indica mejor solapamiento">
                        (↑ Mayor es mejor)
                      </span>
                    </th>
                    <th scope="col">
                      IoU
                      <span className="direccion-metrica metrica-mayor-mejor" title="Mayor valor indica mejor intersección">
                        (↑ Mayor es mejor)
                      </span>
                    </th>
                    <th scope="col">
                      HD95
                      <span className="direccion-metrica metrica-menor-mejor" title="Menor distancia indica contorno más fiel">
                        (↓ Menor es mejor)
                      </span>
                    </th>
                    <th scope="col">
                      F1-det
                      <span className="direccion-metrica metrica-mayor-mejor" title="Mayor F1 indica mejor detección de lesiones">
                        (↑ Mayor es mejor)
                      </span>
                    </th>
                    <th scope="col">Ventaja Específica Observada</th>
                    <th scope="col">Limitación E1</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosE1.map((item) => {
                    const esLiderDice = item.metricas.dice === 0.893;
                    const esLiderIoU = item.metricas.iou === 0.846;
                    const esLiderHD95 = item.metricas.hd95Mm === 1.57;
                    const esLiderF1Det = item.metricas.f1Det === 0.973;

                    return (
                      <tr key={item.arquitecturaId} className={`fila-modelo fila-${item.arquitecturaId}`}>
                        <td className="col-modelo">
                          <div className="celda-modelo-info">
                            <span className={`indicador-modelo-dot dot-${obtenerColorClase(item.arquitecturaId)}`} />
                            <div>
                              <strong>{item.nombre}</strong>
                              <span className="subtexto-modelo">{item.categoria}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`col-metrica ${esLiderDice ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.dice.toFixed(3)}</strong>
                          {esLiderDice && <span className="marca-lider">★ Líder</span>}
                        </td>
                        <td className={`col-metrica ${esLiderIoU ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.iou.toFixed(3)}</strong>
                          {esLiderIoU && <span className="marca-lider">★ Líder</span>}
                        </td>
                        <td className={`col-metrica ${esLiderHD95 ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.hd95Mm ? `${item.metricas.hd95Mm.toFixed(2)} mm` : 'No disponible'}</strong>
                          {esLiderHD95 && <span className="marca-lider">★ Líder (Menor error)</span>}
                        </td>
                        <td className={`col-metrica ${esLiderF1Det ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.f1Det?.toFixed(3) ?? 'No disponible'}</strong>
                          {esLiderF1Det && <span className="marca-lider">★ Co-líder</span>}
                        </td>
                        <td className="col-analisis-cualitativo ventaja-celda">
                          {item.arquitecturaId === 'modcbam' && 'Solapamiento volumétrico óptimo (+2.0% Dice vs base).'}
                          {item.arquitecturaId === 'unet' && 'Contornos periféricos regulares en bordes nítidos (1.57 mm).'}
                          {item.arquitecturaId === 'unet-cbam' && 'Alta sensibilidad periférica en nódulos pequeños (0.973).'}
                          {item.arquitecturaId === 'transunet' && 'Menor pérdida de entrenamiento (train loss = 0.1257).'}
                        </td>
                        <td className="col-analisis-cualitativo limitacion-celda">
                          {item.arquitecturaId === 'modcbam' && 'Distancia HD95 ligeramente mayor que U-Net pura (1.72 vs 1.57 mm).'}
                          {item.arquitecturaId === 'unet' && 'Menor detección en lesiones tenues/pequeñas (F1-det = 0.937).'}
                          {item.arquitecturaId === 'unet-cbam' && 'Parada temprana a 48 épocas por criterio de Early Stopping.'}
                          {item.arquitecturaId === 'transunet' && 'Mayor dispersión de borde (HD95 = 1.83 mm) en parches 96×96.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="nota-pie-tabla">
              Nota metodológica: Para HD95, valores menores denotan distancias perimétricas más reducidas y contornos más fieles.
              Ninguna diferencia porcentual debe asumirse como estadísticamente significativa sin pruebas pareadas formales de Wilcoxon/t-Student.
            </p>
          </div>
        ) : (
          /* Tabla E2 */
          <div className="tabla-transversal-contenedor" data-testid="tabla-rendimiento-e2">
            <div className="tabla-meta-contexto">
              <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={213} />
              <span className="meta-info-texto">
                Unidad: Nódulos 2D patológicos (150 Benignos / 63 Malignos) · Desbalance 70/30 · Umbral Canónico 0.50
              </span>
            </div>

            <div className="contenedor-tabla-responsive">
              <table className="tabla-cientifica-comparativa" aria-label="Rendimiento E2 de las cuatro arquitecturas">
                <thead>
                  <tr>
                    <th scope="col">Arquitectura</th>
                    <th scope="col">
                      Sensibilidad
                      <span className="direccion-metrica metrica-mayor-mejor">(↑ Prioridad clínica)</span>
                    </th>
                    <th scope="col">
                      Especificidad
                      <span className="direccion-metrica metrica-mayor-mejor">(↑ Benignos)</span>
                    </th>
                    <th scope="col">
                      AUC-ROC
                      <span className="direccion-metrica metrica-mayor-mejor">(↑ Discriminación continua)</span>
                    </th>
                    <th scope="col">
                      MCC
                      <span className="direccion-metrica metrica-mayor-mejor">(↑ Balance de Matthews)</span>
                    </th>
                    <th scope="col">
                      F1-Macro
                      <span className="direccion-metrica metrica-mayor-mejor">(↑ Armónico)</span>
                    </th>
                    <th scope="col">Exactitud</th>
                    <th scope="col">Falsos Negativos (Riesgo)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosE2.map((item) => {
                    const esLiderSens = item.metricas.sensibilidad === 0.762;
                    const esLiderEspec = item.metricas.especificidad === 0.947;
                    const esLiderAUC = item.metricas.rocAuc === 0.914;
                    const esLiderMCC = item.metricas.mcc === 0.71;

                    return (
                      <tr key={item.arquitecturaId} className={`fila-modelo fila-${item.arquitecturaId}`}>
                        <td className="col-modelo">
                          <div className="celda-modelo-info">
                            <span className={`indicador-modelo-dot dot-${obtenerColorClase(item.arquitecturaId)}`} />
                            <div>
                              <strong>{item.nombre}</strong>
                              <span className="subtexto-modelo">{item.categoria}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`col-metrica ${esLiderSens ? 'celda-lider' : ''}`}>
                          <strong>{(item.metricas.sensibilidad * 100).toFixed(1)}%</strong>
                          <span className="submetrica-valor">({item.metricas.sensibilidad.toFixed(3)})</span>
                          {esLiderSens && <span className="marca-lider">★ Líder Clínico</span>}
                        </td>
                        <td className={`col-metrica ${esLiderEspec ? 'celda-lider' : ''}`}>
                          <strong>{(item.metricas.especificidad * 100).toFixed(1)}%</strong>
                          <span className="submetrica-valor">({item.metricas.especificidad.toFixed(3)})</span>
                          {esLiderEspec && <span className="marca-lider">★ Líder</span>}
                        </td>
                        <td className={`col-metrica ${esLiderAUC ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.rocAuc.toFixed(3)}</strong>
                          {esLiderAUC && <span className="marca-lider">★ Líder</span>}
                        </td>
                        <td className={`col-metrica ${esLiderMCC ? 'celda-lider' : ''}`}>
                          <strong>{item.metricas.mcc.toFixed(3)}</strong>
                          {esLiderMCC && <span className="marca-lider">★ Líder</span>}
                        </td>
                        <td className="col-metrica">
                          <strong>{item.metricas.f1Macro.toFixed(3)}</strong>
                        </td>
                        <td className="col-metrica">
                          <strong>{(item.metricas.accuracy * 100).toFixed(1)}%</strong>
                        </td>
                        <td className="col-fn-conteo">
                          {item.arquitecturaId === 'modcbam' && <span className="fn-tag fn-min">15 FN (48/63 VP)</span>}
                          {item.arquitecturaId === 'unet' && <span className="fn-tag fn-med">17 FN (46/63 VP)</span>}
                          {item.arquitecturaId === 'transunet' && <span className="fn-tag fn-med">22 FN (41/63 VP)</span>}
                          {item.arquitecturaId === 'unet-cbam' && <span className="fn-tag fn-max">26 FN (37/63 VP)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="nota-pie-tabla">
              Nota metodológica: En E2 todas las métricas operan bajo la premisa de mayor es mejor (↑). La Exactitud está fuertemente
              ponderada por el 70.4% de nódulos benignos; por ello, la Sensibilidad y el MCC proporcionan una visión clínica más rigurosa.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* APARTADO C2 — COMPLEJIDAD COMPUTACIONAL Y EFICIENCIA EN HARDWARE           */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-c2" data-testid="apartado-c2-complejidad">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado C2</div>
            <h4>Complejidad Computacional y Rendimiento en Hardware</h4>
            <p className="apartado-subtitulo">
              Mediciones empíricas auditadas en GPU NVIDIA GeForce RTX 5060 Ti con lote unitario (Batch size = 1).
            </p>
          </div>

          <div className="badge-hardware-oficial">
            <Cpu size={16} />
            <span>NVIDIA GeForce RTX 5060 Ti · Batch=1 · Float32</span>
          </div>
        </div>

        {/* Tarjetas resumen de hardware */}
        <div className="hardware-cards-grid">
          <div className="card-hw-stat">
            <span className="hw-stat-label">Arquitectura Más Rápida</span>
            <strong className="hw-stat-val">U-Net (140.5 FPS)</strong>
            <span className="hw-stat-sub">Latencia mínima: 7.12 ms/imagen</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Sobrecosto de Atención (CBAM/ModCBAM)</span>
            <strong className="hw-stat-val">+0.04 M Parámetros (+0.13%)</strong>
            <span className="hw-stat-sub">90.6 - 97.2 FPS (Referencia operativa de 30 FPS para contextualizar velocidad)</span>
          </div>
          <div className="card-hw-stat">
            <span className="hw-stat-label">Mayor Complejidad Paramétrica</span>
            <strong className="hw-stat-val">TransUNet (64.90 M)</strong>
            <span className="hw-stat-sub">+107% parámetros frente a U-Net</span>
          </div>
          <div className="card-hw-stat card-hw-vram-alert">
            <span className="hw-stat-label">Consumo de Memoria VRAM</span>
            <strong className="hw-stat-val vram-no-disponible">No disponible</strong>
            <span className="hw-stat-sub">No fue instrumentada formalmente en notebook</span>
          </div>
        </div>

        {/* Tabla formal de hardware */}
        <div className="contenedor-tabla-responsive">
          <table className="tabla-cientifica-comparativa" aria-label="Mediciones de complejidad computacional">
            <thead>
              <tr>
                <th scope="col">Arquitectura</th>
                <th scope="col">Parámetros (M)</th>
                <th scope="col">Latencia de Inferencia (ms)</th>
                <th scope="col">Rendimiento (FPS)</th>
                <th scope="col">Memoria VRAM</th>
                <th scope="col">Hardware & Condiciones</th>
                <th scope="col">Contextualización Operativa (Ref. 30 FPS)</th>
              </tr>
            </thead>
            <tbody>
              {datosHardware.map((hw) => (
                <tr key={hw.arquitecturaId} className={`fila-modelo fila-${hw.arquitecturaId}`}>
                  <td className="col-modelo">
                    <div className="celda-modelo-info">
                      <span className={`indicador-modelo-dot dot-${hw.color}`} />
                      <div>
                        <strong>{hw.nombre}</strong>
                        <span className="subtexto-modelo">{hw.categoria}</span>
                      </div>
                    </div>
                  </td>
                  <td className="col-metrica">
                    <strong>{`${hw.parametrosMillones.toFixed(2)} M`}</strong>
                  </td>
                  <td className="col-metrica">
                    <strong>{`${hw.latenciaMs.toFixed(2)} ms`}</strong>
                  </td>
                  <td className="col-metrica">
                    <strong>{`${hw.fps.toFixed(1)} FPS`}</strong>
                  </td>
                  <td className="col-vram-celda">
                    <span className="tag-vram-no-disp" title="El notebook original no ejecutó torch.cuda.max_memory_allocated()">
                      <HelpCircle size={13} />
                      {hw.vram}
                    </span>
                  </td>
                  <td className="col-condiciones-hw">
                    <span className="tag-condiciones">
                      {hw.hardware} · B={hw.batchSize} · {hw.precision} · 96×96
                    </span>
                  </td>
                  <td className="col-evaluacion-tiempo-real">
                    <span className="badge-tiempo-real apto">
                      <CheckCircle2 size={13} />
                      <span>{hw.fps >= 30 ? '≥ 30 FPS (Referencia operativa)' : '< 30 FPS'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Callout de rigurosidad sobre VRAM y reproducibilidad */}
        <div className="callout-rigor-vram">
          <Info size={16} />
          <p>
            <strong>Transparencia Científica:</strong> La memoria VRAM no fue medida formalmente mediante perfiles de CUDA en el notebook.
            Siguiendo el principio de veracidad experimental, se reporta explícitamente como <em>«No disponible»</em> en lugar de suministrar
            estimaciones no documentadas. Asimismo, las mediciones de latencia y FPS corresponden al hardware reportado (RTX 5060 Ti) y
            pueden variar según el entorno operativo y los controladores instalados.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO C3 — ANÁLISIS DE COMPROMISOS EXPERIMENTALES (TRADE-OFFS)          */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-c3" data-testid="apartado-c3-tradeoffs">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado C3</div>
            <h4>Análisis de Compromisos Multidimensionales (Trade-offs)</h4>
            <p className="apartado-subtitulo">
              Examen analítico de tensiones entre métricas donde ninguna arquitectura domina globalmente a las demás.
            </p>
          </div>
          <span className="badge-etiqueta-analisis">Análisis Visual de Compromisos Multidimensionales · 4 Ejes de Tensión</span>
        </div>

        {/* Tarjetas descriptivas de los 4 compromisos */}
        <div className="compromisos-grid">
          {compromisos.map((t) => (
            <div key={t.id} className="tarjeta-compromiso-card" data-testid={`compromiso-${t.id}`}>
              <div className="compromiso-top">
                <span className="tag-compromiso-id">{t.id}</span>
                <div className="compromiso-dimensiones">
                  <span>{t.dimensiones[0]}</span>
                  <span className="separador-vs">vs</span>
                  <span>{t.dimensiones[1]}</span>
                </div>
              </div>
              <h5 className="compromiso-titulo">{t.titulo}</h5>
              <p className="compromiso-desc">{t.descripcion}</p>

              <div className="compromiso-hallazgo-box">
                <strong className="hallazgo-label">Hallazgo empírico auditado:</strong>
                <p>{t.hallazgoEmpirico}</p>
              </div>

              <div className="compromiso-implicacion-box">
                <strong className="implicacion-label">Implicación clínica y operativa:</strong>
                <p>{t.implicacionClinica}</p>
              </div>
            </div>
          ))}
        </div>

        {/* VISUALIZACIONES INTERACTIVAS DE TRADE-OFFS */}
        <div className="bloque-visualizaciones-transversales" data-testid="visualizaciones-transversales">
          <div className="viz-header-fila">
            <div>
              <h5>Visualizaciones del Espacio de Compromisos</h5>
              <p>Representaciones gráficas sin puntuaciones agregadas artificiales.</p>
            </div>

            <div className="selector-grafica-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={graficaActiva === 'sens-vs-espec'}
                className={`btn-tab-grafica ${graficaActiva === 'sens-vs-espec' ? 'activo' : ''}`}
                onClick={() => setGraficaActiva('sens-vs-espec')}
                data-testid="tab-grafica-roc"
              >
                <Sliders size={14} />
                <span>Sensibilidad vs Especificidad (E2)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={graficaActiva === 'params-vs-perf'}
                className={`btn-tab-grafica ${graficaActiva === 'params-vs-perf' ? 'activo' : ''}`}
                onClick={() => setGraficaActiva('params-vs-perf')}
                data-testid="tab-grafica-params"
              >
                <Gauge size={14} />
                <span>Parámetros vs Rendimiento</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={graficaActiva === 'latencia-vs-fps'}
                className={`btn-tab-grafica ${graficaActiva === 'latencia-vs-fps' ? 'activo' : ''}`}
                onClick={() => setGraficaActiva('latencia-vs-fps')}
                data-testid="tab-grafica-latencia"
              >
                <Clock size={14} />
                <span>Velocidad (FPS) vs Latencia (ms)</span>
              </button>
            </div>
          </div>

          <div className="viz-cuerpo-contenedor">
            {/* Gráfica 1: Sensibilidad vs Especificidad */}
            {graficaActiva === 'sens-vs-espec' && (
              <div className="grafica-panel" data-testid="grafica-sens-vs-espec">
                <div className="grafica-descripcion-top">
                  <h6>Plano Operativo Diagnóstico: Sensibilidad vs Especificidad (N=213)</h6>
                  <p>
                    Eje X: Especificidad (Benignos descartados) | Eje Y: Sensibilidad (Malignos detectados).
                    ModCBAM lidera en el eje vertical (menor riesgo oncológico); U-Net en el horizontal (menos falsos positivos).
                  </p>
                </div>

                <div className="grafica-scatter-diagrama">
                  {/* Coordenadas normalizadas para el plano 90-96% Espec vs 55-80% Sens */}
                  <div className="scatter-canvas">
                    {/* Ejes y referencias */}
                    <div className="scatter-eje-y-label">Sensibilidad (Malignidad) → Mayor es mejor</div>
                    <div className="scatter-eje-x-label">Especificidad (Benignidad) → Mayor es mejor</div>

                    {/* Líneas de cuadrícula */}
                    <div className="scatter-grid-lines">
                      <div className="grid-line horizontal" style={{ bottom: '75%' }}><span>75%</span></div>
                      <div className="grid-line horizontal" style={{ bottom: '50%' }}><span>65%</span></div>
                      <div className="grid-line horizontal" style={{ bottom: '25%' }}><span>55%</span></div>
                      <div className="grid-line vertical" style={{ left: '33%' }}><span>92%</span></div>
                      <div className="grid-line vertical" style={{ left: '66%' }}><span>94%</span></div>
                    </div>

                    {/* Puntos de datos */}
                    {/* ModCBAM: Sens 76.2%, Espec 92.7% */}
                    <div
                      className="scatter-punto punto-modcbam"
                      style={{ bottom: '78%', left: '42%' }}
                      title="ModCBAM: Sens=76.2%, Espec=92.7% (15 FN / 11 FP)"
                    >
                      <span className="scatter-dot dot-modcbam" />
                      <div className="scatter-etiqueta">
                        <strong>ModCBAM</strong>
                        <span>76.2% Sens / 92.7% Espec</span>
                      </div>
                    </div>

                    {/* U-Net: Sens 73.0%, Espec 94.7% */}
                    <div
                      className="scatter-punto punto-unet"
                      style={{ bottom: '68%', left: '88%' }}
                      title="U-Net: Sens=73.0%, Espec=94.7% (17 FN / 8 FP)"
                    >
                      <span className="scatter-dot dot-unet" />
                      <div className="scatter-etiqueta">
                        <strong>U-Net</strong>
                        <span>73.0% Sens / 94.7% Espec</span>
                      </div>
                    </div>

                    {/* TransUNet: Sens 65.1%, Espec 93.3% */}
                    <div
                      className="scatter-punto punto-transunet"
                      style={{ bottom: '48%', left: '55%' }}
                      title="TransUNet: Sens=65.1%, Espec=93.3% (22 FN / 10 FP)"
                    >
                      <span className="scatter-dot dot-transunet" />
                      <div className="scatter-etiqueta">
                        <strong>TransUNet</strong>
                        <span>65.1% Sens / 93.3% Espec</span>
                      </div>
                    </div>

                    {/* U-Net + CBAM: Sens 58.7%, Espec 92.7% */}
                    <div
                      className="scatter-punto punto-cbam"
                      style={{ bottom: '28%', left: '42%' }}
                      title="U-Net + CBAM: Sens=58.7%, Espec=92.7% (26 FN / 11 FP)"
                    >
                      <span className="scatter-dot dot-cbam" />
                      <div className="scatter-etiqueta">
                        <strong>U-Net + CBAM</strong>
                        <span>58.7% Sens / 92.7% Espec</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="leyenda-scatter">
                  <span className="leyenda-item"><span className="dot dot-modcbam" /> ModCBAM (Líder Clínico Sensibilidad)</span>
                  <span className="leyenda-item"><span className="dot dot-unet" /> U-Net (Líder Especificidad)</span>
                  <span className="leyenda-item"><span className="dot dot-transunet" /> TransUNet (Híbrido)</span>
                  <span className="leyenda-item"><span className="dot dot-cbam" /> U-Net + CBAM (Atención estándar)</span>
                </div>
              </div>
            )}

            {/* Gráfica 2: Parámetros vs Rendimiento */}
            {graficaActiva === 'params-vs-perf' && (
              <div className="grafica-panel" data-testid="grafica-params-vs-perf">
                <div className="grafica-descripcion-top">
                  <h6>Costo-Efectividad Paramétrica: Volumen de Parámetros frente a Rendimiento</h6>
                  <p>
                    Compara el costo paramétrico (M) frente al coeficiente Dice en E1 (solapamiento) y el AUC en E2 (discriminabilidad).
                  </p>
                </div>

                <div className="barras-costo-param-grid">
                  {datosHardware.map((item) => {
                    const e1 = resultadosE1.find((r) => r.arquitecturaId === item.arquitecturaId);
                    const e2 = resultadosE2.find((r) => r.arquitecturaId === item.arquitecturaId);
                    const dice = e1?.metricas.dice ?? 0;
                    const auc = e2?.metricas.rocAuc ?? 0;
                    const paramNorm = (item.parametrosMillones / 70) * 100; // Escalado a max 70M

                    return (
                      <div key={item.arquitecturaId} className="tarjeta-costo-modelo">
                        <div className="modelo-top-fila">
                          <span className={`indicador-modelo-dot dot-${item.color}`} />
                          <strong>{item.nombre}</strong>
                        </div>

                        <div className="indicadores-comparados-col">
                          <div className="medicion-fila">
                            <span className="medicion-nombre">Parámetros de Red:</span>
                            <strong>{item.parametrosMillones.toFixed(2)} M</strong>
                          </div>
                          <div className="barra-pista mini">
                            <div className={`barra-progreso color-${item.color}`} style={{ width: `${paramNorm}%` }} />
                          </div>

                          <div className="medicion-fila">
                            <span className="medicion-nombre">Dice en Test (E1):</span>
                            <strong>{dice.toFixed(3)}</strong>
                          </div>
                          <div className="barra-pista mini">
                            <div className={`barra-progreso color-${item.color} opacidad-media`} style={{ width: `${dice * 100}%` }} />
                          </div>

                          <div className="medicion-fila">
                            <span className="medicion-nombre">AUC en Test (E2):</span>
                            <strong>{auc.toFixed(3)}</strong>
                          </div>
                          <div className="barra-pista mini">
                            <div className={`barra-progreso color-${item.color} opacidad-suave`} style={{ width: `${auc * 100}%` }} />
                          </div>
                        </div>

                        <div className="veredicto-costo">
                          {item.arquitecturaId === 'transunet' ? (
                            <span className="tag-costo alto">Sobrecosto Paramétrico (+107%)</span>
                          ) : item.arquitecturaId === 'modcbam' ? (
                            <span className="tag-costo optimo">Costo-Efectividad Óptima</span>
                          ) : item.arquitecturaId === 'unet' ? (
                            <span className="tag-costo eficiente">Eficiente & Compacta</span>
                          ) : (
                            <span className="tag-costo moderado">Atención Ligera</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gráfica 3: Latencia vs FPS */}
            {graficaActiva === 'latencia-vs-fps' && (
              <div className="grafica-panel" data-testid="grafica-latencia-vs-fps">
                <div className="grafica-descripcion-top">
                  <h6>Velocidad de Inferencia en GPU RTX 5060 Ti: Latencia (ms) frente a Cuadros por Segundo (FPS)</h6>
                  <p>
                    Referencia operativa de 30 FPS utilizada para contextualizar la velocidad de inferencia interactiva. Todas las arquitecturas evaluadas superan ampliamente este valor.
                  </p>
                </div>

                <div className="grafica-barras-hw-contenedor">
                  {datosHardware.map((hw) => {
                    const fpsPorcentaje = (hw.fps / 160) * 100; // Escalado a max 160 FPS

                    return (
                      <div key={hw.arquitecturaId} className="hw-barra-fila">
                        <div className="hw-modelo-col">
                          <span className={`indicador-modelo-dot dot-${hw.color}`} />
                          <strong>{hw.nombre}</strong>
                        </div>

                        <div className="hw-visual-col">
                          <div className="hw-numeros-fila">
                            <span>FPS: <strong>{hw.fps.toFixed(1)}</strong></span>
                            <span>Latencia: <strong>{hw.latenciaMs.toFixed(2)} ms</strong></span>
                          </div>
                          <div className="barra-pista">
                            <div className={`barra-progreso color-${hw.color}`} style={{ width: `${fpsPorcentaje}%` }} />
                          </div>
                        </div>

                        <div className="hw-tag-col">
                          <span className="badge-umbral-tiempo-real">
                            <CheckCircle2 size={12} />
                            {(hw.fps / 30).toFixed(1)}x Ref. Operativa 30 FPS
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="nota-umbral-fps">
                  <Clock size={14} />
                  <span>Estimación de referencia operativa: Un estudio de TC pulmonar de 300 cortes tomaría entre 2.14 segundos (U-Net) y 3.31 segundos (ModCBAM) en la GPU evaluada (inferencia 2D corte a corte).</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APARTADO C4 — SÍNTESIS TRANSVERSAL POR ARQUITECTURA                         */}
      {/* ========================================================================= */}
      <div className="bloque-apartado-c apartado-c4" data-testid="apartado-c4-sintesis">
        <div className="apartado-header-fila">
          <div className="apartado-titulo-col">
            <div className="apartado-numero-tag">Apartado C4</div>
            <h4>Síntesis Crítica Individualizada por Arquitectura</h4>
            <p className="apartado-subtitulo">
              Perfil estructurado diferenciando estrictamente: hallazgos experimentales observados, interpretación de limitaciones, complejidad computacional y posibles aplicaciones futuras no validadas clínicamente.
            </p>
          </div>

          {/* Filtro interactivo de modelo */}
          <div className="filtro-arquitectura-selector" role="group" aria-label="Filtrar por arquitectura">
            <button
              type="button"
              className={`btn-filtro-arq ${arquitecturaFiltro === 'todas' ? 'activo' : ''}`}
              onClick={() => setArquitecturaFiltro('todas')}
            >
              Ver las 4
            </button>
            {sintesisArquitecturas.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`btn-filtro-arq ${arquitecturaFiltro === s.id ? 'activo' : ''}`}
                onClick={() => setArquitecturaFiltro(s.id)}
              >
                <span className={`indicador-modelo-dot dot-${s.color}`} />
                <span>{s.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de 4 tarjetas de síntesis */}
        <div className="sintesis-modelos-grid">
          {arquitecturasFiltradas.map((mod) => (
            <article
              key={mod.id}
              className={`tarjeta-sintesis-arquitectura arq-${mod.color}`}
              data-testid={`sintesis-${mod.id}`}
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
                  <span className="pill-hw">{mod.complejidadComputacional.parametrosMillones} M Params</span>
                  <span className="pill-hw">{mod.complejidadComputacional.fps} FPS</span>
                </div>
              </div>

              {/* Cuerpo de fortalezas y limitaciones */}
              <div className="sintesis-card-secciones">
                {/* Fortalezas E1 */}
                <div className="seccion-sintesis-item">
                  <div className="item-subtitulo">
                    <CheckCircle2 size={15} className="icono-check-verde" />
                    <strong>1. Hallazgos Experimentales Observados en Segmentación (E1)</strong>
                  </div>
                  <ul>
                    {mod.fortalezasE1.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Fortalezas E2 */}
                <div className="seccion-sintesis-item">
                  <div className="item-subtitulo">
                    <CheckCircle2 size={15} className="icono-check-verde" />
                    <strong>2. Hallazgos Experimentales Observados en Clasificación (E2)</strong>
                  </div>
                  <ul>
                    {mod.fortalezasE2.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Limitaciones Observadas */}
                <div className="seccion-sintesis-item item-limitaciones">
                  <div className="item-subtitulo">
                    <XCircle size={15} className="icono-cruz-roja" />
                    <strong>3. Interpretación de Limitaciones Empíricas</strong>
                  </div>
                  <ul>
                    {mod.limitacionesObservadas.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>

                {/* Complejidad Computacional Verificada */}
                <div className="seccion-sintesis-item item-hw">
                  <div className="item-subtitulo">
                    <Cpu size={15} className="icono-hw-azul" />
                    <strong>4. Complejidad Computacional (GPU RTX 5060 Ti)</strong>
                  </div>
                  <div className="hw-datos-resumen">
                    <span><strong>Parámetros:</strong> {mod.complejidadComputacional.parametrosMillones} M</span>
                    <span><strong>Latencia:</strong> {mod.complejidadComputacional.latenciaMs} ms</span>
                    <span><strong>Rendimiento:</strong> {mod.complejidadComputacional.fps} FPS</span>
                    <span><strong>VRAM:</strong> <em>{mod.complejidadComputacional.vram}</em></span>
                    <span className="hw-disp-nota">{mod.complejidadComputacional.dispositivo}</span>
                  </div>
                </div>

                {/* Escenarios Recomendados */}
                <div className="seccion-sintesis-item item-escenarios">
                  <div className="item-subtitulo">
                    <Sparkles size={15} className="icono-escenarios-morado" />
                    <strong>5. Posibles Aplicaciones Futuras (Hipotéticas, No Validadas Clínicamente)</strong>
                  </div>
                  <ul>
                    {mod.escenariosRecomendados.map((esc, i) => (
                      <li key={i}>{esc}</li>
                    ))}
                  </ul>
                </div>

                {/* Advertencias de Interpretación */}
                <div className="seccion-sintesis-item item-advertencias">
                  <div className="item-subtitulo">
                    <AlertTriangle size={15} className="icono-alerta-ambar" />
                    <strong>6. Advertencias Metodológicas de Interpretación</strong>
                  </div>
                  <ul>
                    {mod.advertenciasInterpretacion.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* SEGREGACIÓN DE REFERENCIA EXTERNA BIBLIOGRÁFICA 3D */}
      <div className="bloque-referencia-externa-3d aviso-transversal-3d" data-testid="referencia-externa-3d-transversal">
        <div className="referencia-externa-header">
          <div className="referencia-externa-titulo-fila">
            <span className="indicador-modelo-dot dot-ref-3d" />
            <h5>Referencia Externa Bibliográfica (Tesis 3D — Swin UNETR + KAN)</h5>
          </div>
          <BadgeProcedencia origen="referencia_3d" />
        </div>
        <div className="aviso-falta-comparabilidad">
          <p>
            <strong>Aviso de Segregación Metodológica:</strong> Swin UNETR + KAN constituye una <em>Referencia bibliográfica externa 3D, no directamente comparable con el benchmark experimental 2D</em> (42.1M parámetros, 20.6 FPS, Dice=0.882, Sens=0.806 en tesis).
            No forma parte del benchmarking experimental pareado de las cuatro arquitecturas 2D sobre parches axiales de 96×96
            y se segrega deliberadamente para evitar inferencias transversales no homogéneas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SeccionComparacionTransversalC;
