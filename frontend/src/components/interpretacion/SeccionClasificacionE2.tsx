import { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import {
  obtenerResultadosE2,
  obtenerMetadatosMuestra,
  obtenerAdvertenciasMetodologicas,
} from '../../services/interpretacionService';
import TarjetaMetricaInterpretacion from './TarjetaMetricaInterpretacion';
import BadgeProcedencia from './BadgeProcedencia';
import AvisoCientifico from './AvisoCientifico';

// Datos exactos auditados de las matrices de confusión (Celda 36 y Celda 38, N=213)
// Benignos reales: 150 | Malignos reales: 63
const MATRICES_CONFUSION_AUDITADAS = {
  unet: {
    nombre: 'U-Net',
    tp: 46, // 46 / 63 = 73.0% Sensibilidad
    fn: 17,
    tn: 142, // 142 / 150 = 94.7% Especificidad
    fp: 8,
    accuracy: 0.883,
    sensibilidad: 0.73,
    especificidad: 0.947,
  },
  'unet-cbam': {
    nombre: 'U-Net + CBAM',
    tp: 37, // 37 / 63 = 58.7% Sensibilidad
    fn: 26,
    tn: 139, // 139 / 150 = 92.7% Especificidad
    fp: 11,
    accuracy: 0.826,
    sensibilidad: 0.587,
    especificidad: 0.927,
  },
  modcbam: {
    nombre: 'ModCBAM',
    tp: 48, // 48 / 63 = 76.2% Sensibilidad (Líder en detección de lesiones malignas)
    fn: 15,
    tn: 139, // 139 / 150 = 92.7% Especificidad
    fp: 11,
    accuracy: 0.878,
    sensibilidad: 0.762,
    especificidad: 0.927,
  },
  transunet: {
    nombre: 'TransUNet',
    tp: 41, // 41 / 63 = 65.1% Sensibilidad
    fn: 22,
    tn: 140, // 140 / 150 = 93.3% Especificidad
    fp: 10,
    accuracy: 0.85,
    sensibilidad: 0.651,
    especificidad: 0.933,
  },
};

export const SeccionClasificacionE2: React.FC = () => {
  const resultadosE2 = useMemo(() => obtenerResultadosE2(true), []);
  const muestraE2 = useMemo(() => obtenerMetadatosMuestra('E2'), []);
  const advertencias = useMemo(() => obtenerAdvertenciasMetodologicas(), []);

  const [matrizSeleccionada, setMatrizSeleccionada] = useState<string>('modcbam');

  const modelos2D = useMemo(
    () => resultadosE2.filter((r) => r.arquitecturaId !== 'swin-unetr-kan-3d'),
    [resultadosE2]
  );
  const referencia3D = useMemo(
    () => resultadosE2.find((r) => r.arquitecturaId === 'swin-unetr-kan-3d'),
    [resultadosE2]
  );

  const advE2 = useMemo(
    () => advertencias.filter((a) => a.afectaEtapa === 'E2' || a.id === 'ADV-03'),
    [advertencias]
  );

  const obtenerColor = (id: string): string => {
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

  const matrizActiva =
    MATRICES_CONFUSION_AUDITADAS[matrizSeleccionada as keyof typeof MATRICES_CONFUSION_AUDITADAS] ||
    MATRICES_CONFUSION_AUDITADAS.modcbam;

  return (
    <section
      className="seccion-interpretacion seccion-e2"
      aria-label="Resultados de Clasificación de Malignidad (Etapa E2)"
      data-testid="seccion-clasificacion-e2"
    >
      {/* BANNER DE CONTEXTO MUESTRAL */}
      <div className="banner-contexto-muestral">
        <div className="banner-contexto-top">
          <div className="banner-titulo-grupo">
            <span className="badge-etapa-etiqueta etapa-e2-tag">Etapa E2</span>
            <h3>Clasificación de Malignidad (Benigno vs Maligno)</h3>
          </div>
          <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={muestraE2.tamanoMuestra} />
        </div>
        <p className="banner-contexto-descripcion">
          Evaluación sobre <strong>{`${muestraE2.tamanoMuestra} nódulos 2D patológicos`}</strong> con
          encoder congelado tras 100 épocas. Desglose real: <strong>150 benignos (70.42%)</strong> y{' '}
          <strong>63 malignos (29.58%)</strong>. Partición paciente-disjunta (Semilla 42).
        </p>
      </div>

      {/* TARJETAS DE LÍDERES MULTI-CRITERIO 2D */}
      <div className="metricas-resumen-grid" aria-label="Líderes por métrica en E2">
        <TarjetaMetricaInterpretacion
          titulo="Máxima Sensibilidad Diagnóstica"
          valor={0.762}
          formatoValor="76.2%"
          arquitectura="ModCBAM"
          colorArquitectura="modcbam"
          etapa="E2"
          origen="prueba_independiente"
          tamanoMuestra={213}
          esOptimo={true}
          etiquetaOptimo="Menos Falsos Negativos (15 FN)"
          descripcionCientifica="Detecta 48 de 63 nódulos malignos, superando a U-Net (46/63) e identificando correctamente 11 nódulos malignos adicionales frente a CBAM estándar (37/63)."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mayor AUC-ROC Global"
          valor={0.914}
          arquitectura="U-Net"
          colorArquitectura="unet"
          etapa="E2"
          origen="prueba_independiente"
          tamanoMuestra={213}
          esOptimo={true}
          etiquetaOptimo="Discriminabilidad Continua Óptima"
          descripcionCientifica="Mayor área bajo la curva en todos los umbrales operativos (0.914 vs 0.900 en ModCBAM)."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mayor Coeficiente MCC"
          valor={0.71}
          arquitectura="U-Net"
          colorArquitectura="unet"
          etapa="E2"
          origen="prueba_independiente"
          tamanoMuestra={213}
          esOptimo={true}
          etiquetaOptimo="Balance Matthews Óptimo"
          descripcionCientifica="Coeficiente de correlación de Matthews más robusto frente al desbalance poblacional (0.710 vs 0.702 en ModCBAM)."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mayor Especificidad (Benignos)"
          valor={0.947}
          formatoValor="94.7%"
          arquitectura="U-Net"
          colorArquitectura="unet"
          etapa="E2"
          origen="prueba_independiente"
          tamanoMuestra={213}
          esOptimo={true}
          etiquetaOptimo="Solo 8 Falsos Positivos"
          descripcionCientifica="Descarta 142 de 150 lesiones benignas, evitando biopsias y procedimientos invasivos innecesarios."
        />
      </div>

      {/* TABLA COMPARATIVA CANÓNICA HOMOLOGADA */}
      <div className="bloque-tabla-comparativa">
        <div className="tabla-encabezado-fila">
          <div>
            <h4 className="tabla-titulo">Tabla Comparativa de Clasificación en Conjunto de Prueba (Test Ciego)</h4>
            <p className="tabla-subtitulo">
              Evaluación imparcial sobre los 213 nódulos patológicos independientes (Celda 34).
            </p>
          </div>
          <span className="etiqueta-origen-test">Encoder Congelado · 100 Épocas Efectivas</span>
        </div>

        <div className="contenedor-tabla-responsive">
          <table className="tabla-cientifica-comparativa" aria-label="Tabla de métricas E2">
            <thead>
              <tr>
                <th scope="col">Arquitectura</th>
                <th scope="col" title="Tasa de detección de malignidad (Recall)">Sens. (Maligno)</th>
                <th scope="col" title="Tasa de acierto en nódulos benignos">Espec. (Benigno)</th>
                <th scope="col" title="Área bajo la curva ROC">AUC-ROC</th>
                <th scope="col" title="Coeficiente de correlación de Matthews">MCC</th>
                <th scope="col" title="F1-Score macro equilibrado">F1-Macro</th>
                <th scope="col" title="Exactitud global">Exactitud</th>
                <th scope="col">Procedencia</th>
              </tr>
            </thead>
            <tbody>
              {modelos2D.map((item) => {
                const esMejorSens = item.metricas.sensibilidad === 0.762;
                const esMejorEspec = item.metricas.especificidad === 0.947;
                const esMejorAUC = item.metricas.rocAuc === 0.914;
                const esMejorMCC = item.metricas.mcc === 0.71;
                const esMejorF1 = item.metricas.f1Macro === 0.853;
                const esMejorAcc = item.metricas.accuracy === 0.883;

                return (
                  <tr key={item.arquitecturaId} className={`fila-modelo fila-${item.arquitecturaId}`}>
                    <td className="col-modelo">
                      <div className="celda-modelo-info">
                        <span className={`indicador-modelo-dot dot-${obtenerColor(item.arquitecturaId)}`} />
                        <div>
                          <strong>{item.nombre}</strong>
                          <span className="subtexto-modelo">{item.categoria}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`col-metrica ${esMejorSens ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.sensibilidad.toFixed(3)}</strong>
                      {esMejorSens && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorEspec ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.especificidad.toFixed(3)}</strong>
                      {esMejorEspec && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorAUC ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.rocAuc.toFixed(3)}</strong>
                      {esMejorAUC && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorMCC ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.mcc.toFixed(3)}</strong>
                      {esMejorMCC && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorF1 ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.f1Macro.toFixed(3)}</strong>
                      {esMejorF1 && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorAcc ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.accuracy.toFixed(3)}</strong>
                      {esMejorAcc && <span className="marca-lider">★</span>}
                    </td>
                    <td className="col-procedencia">
                      <BadgeProcedencia origen={item.origen} tamanoMuestra={213} />
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
        <p className="nota-pie-tabla">
          ★ Indica el mejor resultado entre las cuatro arquitecturas 2D bajo prueba ciega (N=213).
          En cribado oncológico, la Sensibilidad (minimización de falsos negativos) constituye el parámetro de mayor relevancia clínica.
        </p>

        {/* REFERENCIA EXTERNA BIBLIOGRÁFICA 3D SEGREGADA */}
        {referencia3D && (
          <div className="bloque-referencia-externa-3d" data-testid="referencia-externa-3d-e2">
            <div className="referencia-externa-header">
              <div className="referencia-externa-titulo-fila">
                <span className="indicador-modelo-dot dot-ref-3d" />
                <h5>Referencia Externa Bibliográfica (Tesis 3D — Swin UNETR + KAN)</h5>
              </div>
              <BadgeProcedencia origen="referencia_3d" />
            </div>
            <div className="aviso-falta-comparabilidad">
              <p>
                <strong>Aviso de Falta de Comparabilidad Directa:</strong> Este modelo tridimensional proviene de
                literatura/tesis previa y opera sobre volúmenes tomográficos 3D completos. No es metodológicamente
                equivalente a las cuatro redes 2D entrenadas sobre parches axiales de 96×96. Se presenta de forma
                segregada como referencia bibliográfica externa 3D, no directamente comparable con el benchmark experimental 2D.
              </p>
            </div>
            <div className="referencia-externa-metricas-grid">
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">Sensibilidad:</span>
                <strong>{referencia3D.metricas.sensibilidad.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">Especificidad:</span>
                <strong>{referencia3D.metricas.especificidad.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">AUC-ROC:</span>
                <strong>{referencia3D.metricas.rocAuc.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">MCC:</span>
                <strong>{referencia3D.metricas.mcc.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">Exactitud:</span>
                <strong>{referencia3D.metricas.accuracy.toFixed(3)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MATRICES DE CONFUSIÓN COMPARATIVAS (N=213) */}
      <div className="bloque-matrices-confusion" data-testid="bloque-matrices-confusion">
        <div className="matrices-encabezado">
          <div>
            <h4 className="matrices-titulo">Desglose de Matrices de Confusión (N=213 Nódulos)</h4>
            <p className="matrices-subtitulo">
              Evaluación diagnóstica sobre 150 nódulos benignos y 63 malignos bajo umbral canónico 0.50.
            </p>
          </div>

          <div className="selector-modelo-matriz-tabs" role="tablist">
            {Object.entries(MATRICES_CONFUSION_AUDITADAS).map(([key, data]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={matrizSeleccionada === key}
                className={`btn-tab-matriz ${matrizSeleccionada === key ? 'activo' : ''}`}
                onClick={() => setMatrizSeleccionada(key)}
              >
                <span className={`indicador-modelo-dot dot-${obtenerColor(key)}`} />
                <span>{data.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="matriz-detalle-card">
          <div className="matriz-grid-layout">
            {/* Visualización 2x2 */}
            <div className="matriz-visual-2x2">
              <div className="matriz-header-top">
                <span>Predicción Benigno</span>
                <span>Predicción Maligno</span>
              </div>
              <div className="matriz-fila-datos">
                <div className="matriz-header-left">GT Benigno (150)</div>
                <div className="celda-cm celda-tn" title="Verdaderos Negativos: Benignos correctamente descartados">
                  <span className="cm-etiqueta">VN</span>
                  <strong className="cm-valor">{matrizActiva.tn}</strong>
                  <span className="cm-tasa">({((matrizActiva.tn / 150) * 100).toFixed(1)}%)</span>
                </div>
                <div className="celda-cm celda-fp" title="Falsos Positivos: Benignos clasificados como malignos">
                  <span className="cm-etiqueta">FP</span>
                  <strong className="cm-valor">{matrizActiva.fp}</strong>
                  <span className="cm-tasa">({((matrizActiva.fp / 150) * 100).toFixed(1)}%)</span>
                </div>
              </div>
              <div className="matriz-fila-datos">
                <div className="matriz-header-left">GT Maligno (63)</div>
                <div className="celda-cm celda-fn" title="Falsos Negativos: Cánceres omitidos sin detectar">
                  <span className="cm-etiqueta">FN (Riesgo)</span>
                  <strong className="cm-valor">{matrizActiva.fn}</strong>
                  <span className="cm-tasa">({((matrizActiva.fn / 63) * 100).toFixed(1)}%)</span>
                </div>
                <div className="celda-cm celda-tp" title="Verdaderos Positivos: Cánceres detectados exitosamente">
                  <span className="cm-etiqueta">VP</span>
                  <strong className="cm-valor">{matrizActiva.tp}</strong>
                  <span className="cm-tasa">({((matrizActiva.tp / 63) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Ficha explicativa de la matriz */}
            <div className="matriz-explicacion-col">
              <h5>Resumen Clínico para {matrizActiva.nombre}</h5>
              <ul className="matriz-metricas-lista">
                <li>
                  <span>Verdaderos Positivos (Malignos detectados):</span>
                  <strong>{matrizActiva.tp} de 63</strong>
                </li>
                <li className="item-alerta-fn">
                  <span>Falsos Negativos (Malignos no detectados):</span>
                  <strong className="alerta-valor-fn">{matrizActiva.fn} de 63</strong>
                </li>
                <li>
                  <span>Verdaderos Negativos (Benignos descartados):</span>
                  <strong>{matrizActiva.tn} de 150</strong>
                </li>
                <li>
                  <span>Falsos Positivos (Biopsias innecesarias):</span>
                  <strong>{matrizActiva.fp} de 150</strong>
                </li>
              </ul>
              <div className="matriz-veredicto-caja">
                {matrizSeleccionada === 'modcbam' ? (
                  <p>
                    <strong>Líder Clínico en Detección:</strong> ModCBAM minimiza las neoplasias omitidas a solo 15 casos,
                    identificando correctamente 11 nódulos malignos adicionales frente a CBAM clásico (26 FN) y 2 frente a U-Net (17 FN).
                  </p>
                ) : matrizSeleccionada === 'unet' ? (
                  <p>
                    <strong>Líder en Especificidad:</strong> U-Net comete solo 8 falsos positivos, pero a costa de omitir
                    17 nódulos malignos (73.0% de sensibilidad).
                  </p>
                ) : (
                  <p>
                    <strong>Balance General:</strong> Desempeño condicionado por el compromiso entre sensibilidad y especificidad
                    bajo desbalance 70/30.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE DE INTERPRETACIÓN CIENTÍFICA SEPARADO */}
      <div className="bloque-interpretacion-cualitativa">
        <div className="interpretacion-encabezado">
          <Activity size={18} className="icono-interpretacion" />
          <h4>Síntesis e Interpretación Científica de la Etapa 2</h4>
        </div>

        <div className="interpretacion-cuerpo-grid">
          <div className="columna-interpretacion">
            <h5>1. Prioridad Clínica de la Sensibilidad en Cáncer Pulmonar</h5>
            <p>
              En el cribado de nódulos pulmonares, el costo clínico de un <strong>Falso Negativo (FN)</strong> —un tumor
              maligno clasificado como benigno que progresa sin tratamiento— es significativamente más grave que el de un
              Falso Positivo (que deriva en seguimiento o tomografía de control).
            </p>
            <p>
              Bajo este paradigma médico, <strong>ModCBAM emerge como la opción más adecuada</strong> entre los modelos 2D al
              alcanzar una <strong>Sensibilidad de 76.2%</strong> (48/63), reduciendo los falsos negativos a solo 15 frente
              a 17 en U-Net, 22 en TransUNet y 26 en CBAM estándar.
            </p>
          </div>

          <div className="columna-interpretacion">
            <h5>2. Análisis del AUC y Especificidad de U-Net</h5>
            <p>
              La <strong>U-Net convencional</strong> obtiene el mayor <strong>AUC (0.914)</strong> y el mayor{' '}
              <strong>MCC (0.710)</strong>, impulsada por una sobresaliente Especificidad de <strong>94.7%</strong> (142/150).
            </p>
            <p>
              Dado que el conjunto de prueba presenta un marcado desbalance poblacional (70.4% benignos), los modelos que
              maximizan el acierto en la clase mayoritaria obtienen un AUC y Exactitud (88.3%) elevados. Sin embargo, esto
              conlleva una menor sensibilidad (73.0%), dejando 17 casos malignos sin clasificar correctamente.
            </p>
          </div>
        </div>
      </div>

      {/* ADVERTENCIAS METODOLÓGICAS DE E2 */}
      <div className="bloque-advertencias-e2">
        {advE2.map((adv) => (
          <AvisoCientifico
            key={adv.id}
            idAdvertencia={adv.id}
            titulo={adv.titulo}
            descripcion={adv.descripcion}
            justificacion={adv.justificacionCientifica}
            severidad={adv.severidad}
          />
        ))}
      </div>
    </section>
  );
};

export default SeccionClasificacionE2;
