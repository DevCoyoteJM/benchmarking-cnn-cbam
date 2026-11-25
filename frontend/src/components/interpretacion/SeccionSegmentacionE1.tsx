import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import {
  obtenerResultadosE1,
  obtenerMetadatosMuestra,
  obtenerAdvertenciasMetodologicas,
} from '../../services/interpretacionService';
import TarjetaMetricaInterpretacion from './TarjetaMetricaInterpretacion';
import BadgeProcedencia from './BadgeProcedencia';
import AvisoCientifico from './AvisoCientifico';

export const SeccionSegmentacionE1: React.FC = () => {
  // Datos auditados del servicio de interpretación
  const resultadosE1 = useMemo(() => obtenerResultadosE1(true), []); // Incluye referencia 3D
  const muestraE1 = useMemo(() => obtenerMetadatosMuestra('E1'), []);
  const advertencias = useMemo(() => obtenerAdvertenciasMetodologicas(), []);

  // Filtrar modelos 2D vs referencia 3D
  const modelos2D = useMemo(
    () => resultadosE1.filter((r) => r.arquitecturaId !== 'swin-unetr-kan-3d'),
    [resultadosE1]
  );
  const referencia3D = useMemo(
    () => resultadosE1.find((r) => r.arquitecturaId === 'swin-unetr-kan-3d'),
    [resultadosE1]
  );

  // Advertencias específicas de E1
  const advE1 = useMemo(
    () => advertencias.filter((a) => a.afectaEtapa === 'E1' || a.id === 'ADV-04'),
    [advertencias]
  );

  // Mapeo cromático
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

  return (
    <section
      className="seccion-interpretacion seccion-e1"
      aria-label="Resultados de Segmentación y Detección (Etapa E1)"
      data-testid="seccion-segmentacion-e1"
    >
      {/* BANNER DE CONTEXTO MUESTRAL */}
      <div className="banner-contexto-muestral">
        <div className="banner-contexto-top">
          <div className="banner-titulo-grupo">
            <span className="badge-etapa-etiqueta">Etapa E1</span>
            <h3>Segmentación y Detección Nodular Pulmonar</h3>
          </div>
          <BadgeProcedencia origen="prueba_independiente" tamanoMuestra={muestraE1.tamanoMuestra} />
        </div>
        <p className="banner-contexto-descripcion">
          Evaluación ciega sobre <strong>{`${muestraE1.tamanoMuestra} parches axiales 2D`}</strong> (corte
          axial central z de 96×96 píxeles), con partición disjunta a nivel de paciente
          (Semilla 42). Incluye parches con nódulo (consenso ≥ 50%) y parches negativos de parénquima sano.
        </p>
      </div>

      {/* TARJETAS DE LÍDERES MULTI-CRITERIO 2D (SIN GANADOR GLOBAL) */}
      <div className="metricas-resumen-grid" aria-label="Líderes por métrica específica en 2D">
        <TarjetaMetricaInterpretacion
          titulo="Mejor Coeficiente Dice"
          valor={0.893}
          arquitectura="ModCBAM"
          colorArquitectura="modcbam"
          etapa="E1"
          origen="prueba_independiente"
          tamanoMuestra={762}
          esOptimo={true}
          etiquetaOptimo="Máximo Solapamiento 2D"
          descripcionCientifica="Mayor índice de solapamiento volumétrico entre máscara ground truth y predicción (+2.0% sobre U-Net base)."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mejor Índice IoU (Jaccard)"
          valor={0.846}
          arquitectura="ModCBAM"
          colorArquitectura="modcbam"
          etapa="E1"
          origen="prueba_independiente"
          tamanoMuestra={762}
          esOptimo={true}
          etiquetaOptimo="Mayor Área de Solapamiento"
          descripcionCientifica="Intersección sobre unión superior en delimitación de área nodular frente al parénquima circundante."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mejor Precisión de Contorno (HD95)"
          valor={1.57}
          formatoValor="1.57 mm"
          arquitectura="U-Net"
          colorArquitectura="unet"
          etapa="E1"
          origen="prueba_independiente"
          tamanoMuestra={762}
          esOptimo={true}
          etiquetaOptimo="Menor Distancia de Frontera (Más Favorable)"
          descripcionCientifica="Distancia de Hausdorff al percentil 95 más baja (1.57 mm). Menor distancia representa contornos más precisos; U-Net genera límites geométricamente más regulares."
        />

        <TarjetaMetricaInterpretacion
          titulo="Mayor Detección de Nódulos (F1-det)"
          valor={0.973}
          arquitectura="ModCBAM & CBAM"
          colorArquitectura="modcbam"
          etapa="E1"
          origen="prueba_independiente"
          tamanoMuestra={762}
          esOptimo={true}
          etiquetaOptimo="Alta Sensibilidad Periférica"
          descripcionCientifica="Tasa de detección a IoU > 0.5. La atención espacial y de canal previene la omisión de lesiones pequeñas (+3.8% sobre U-Net)."
        />
      </div>

      {/* TABLA COMPARATIVA CANÓNICA HOMOLOGADA EN CONJUNTO DE PRUEBA */}
      <div className="bloque-tabla-comparativa">
        <div className="tabla-encabezado-fila">
          <div>
            <h4 className="tabla-titulo">Tabla Comparativa Homologada en Conjunto de Prueba (Test Ciego)</h4>
            <p className="tabla-subtitulo">
              Evaluación pareada de las 4 arquitecturas sobre las mismas 762 muestras axiales independientes.
            </p>
          </div>
          <span className="etiqueta-origen-test">Datos Canónicos · Celda 34 del Notebook</span>
        </div>

        <div className="contenedor-tabla-responsive">
          <table className="tabla-cientifica-comparativa" aria-label="Tabla de métricas E1">
            <thead>
              <tr>
                <th scope="col">Arquitectura</th>
                <th scope="col" title="Coeficiente de similitud Dice (mayor es mejor)">Dice</th>
                <th scope="col" title="Intersección sobre Unión (mayor es mejor)">IoU</th>
                <th scope="col" title="Distancia de Hausdorff 95% en milímetros (menor es mejor)">HD95 (mm)</th>
                <th scope="col" title="F1-score de detección de presencia de nódulo">F1-det</th>
                <th scope="col" title="Épocas efectivas de entrenamiento en E1">Épocas E1</th>
                <th scope="col" title="Pérdida mínima alcanzada en validación">Val Loss (Mín)</th>
                <th scope="col">Procedencia</th>
              </tr>
            </thead>
            <tbody>
              {modelos2D.map((item) => {
                const esMejorDice = item.metricas.dice === 0.893;
                const esMejorIoU = item.metricas.iou === 0.846;
                const esMejorHD95 = item.metricas.hd95Mm === 1.57;
                const esMejorF1Det = item.metricas.f1Det === 0.973;

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
                    <td className={`col-metrica ${esMejorDice ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.dice.toFixed(3)}</strong>
                      {esMejorDice && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorIoU ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.iou.toFixed(3)}</strong>
                      {esMejorIoU && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorHD95 ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.hd95Mm ? `${item.metricas.hd95Mm.toFixed(2)} mm` : 'No disponible'}</strong>
                      {esMejorHD95 && <span className="marca-lider">★</span>}
                    </td>
                    <td className={`col-metrica ${esMejorF1Det ? 'celda-lider' : ''}`}>
                      <strong>{item.metricas.f1Det ? item.metricas.f1Det.toFixed(3) : 'No disponible'}</strong>
                      {esMejorF1Det && <span className="marca-lider">★</span>}
                    </td>
                    <td className="col-epocas">
                      <span className="tag-epocas">
                        {item.dinamicaEntrenamiento?.epocasEfectivas} / {item.dinamicaEntrenamiento?.epocasConfiguradas}
                      </span>
                    </td>
                    <td className="col-val-loss">
                      {item.dinamicaEntrenamiento?.valLossMinimo?.toFixed(4) ?? 'No disponible'}
                    </td>
                    <td className="col-procedencia">
                      <BadgeProcedencia origen={item.origen} tamanoMuestra={762} />
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
        <p className="nota-pie-tabla">
          ★ Indica el mejor valor obtenido entre las cuatro arquitecturas bidimensionales bajo prueba ciega (N=762).
          La referencia tridimensional se segrega de la tabla para salvaguardar la comparabilidad metodológica.
        </p>

        {/* REFERENCIA EXTERNA BIBLIOGRÁFICA 3D SEGREGADA */}
        {referencia3D && (
          <div className="bloque-referencia-externa-3d" data-testid="referencia-externa-3d-e1">
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
                literatura/tesis previa y opera sobre volúmenes tomográficos 3D completos (con acceso a cortes axiales contiguos).
                No es metodológicamente equivalente a las cuatro redes 2D entrenadas sobre parches axiales aislados de 96×96.
                Se presenta de forma segregada como referencia bibliográfica externa 3D, no directamente comparable con el benchmark experimental 2D.
              </p>
            </div>
            <div className="referencia-externa-metricas-grid">
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">Dice 3D:</span>
                <strong>{referencia3D.metricas.dice.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">IoU 3D:</span>
                <strong>{referencia3D.metricas.iou.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">HD95 3D:</span>
                <strong>{referencia3D.metricas.hd95Mm?.toFixed(2)} mm</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">F1-det 3D:</span>
                <strong>{referencia3D.metricas.f1Det?.toFixed(3)}</strong>
              </div>
              <div className="ref-metrica-item">
                <span className="ref-metrica-label">Épocas / Val Loss:</span>
                <strong>150 / 0.1490</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMPARATIVA GRÁFICA DE BARRAS DE RENDIMIENTO */}
      <div className="bloque-grafica-comparativa">
        <h4 className="grafica-titulo">Comparación de Solapamiento Volumétrico y Detección (2D)</h4>
        <div className="grafica-barras-contenedor">
          {modelos2D.map((m) => {
            const dicePct = m.metricas.dice * 100;
            const iouPct = m.metricas.iou * 100;
            const f1Pct = (m.metricas.f1Det ?? 0) * 100;

            return (
              <div key={m.arquitecturaId} className="grafica-fila-modelo">
                <div className="grafica-modelo-nombre">
                  <span className={`indicador-modelo-dot dot-${obtenerColor(m.arquitecturaId)}`} />
                  <span>{m.nombre}</span>
                </div>
                <div className="grafica-barras-grupo">
                  <div className="barra-item">
                    <div className="barra-label-fila">
                      <span className="barra-etiqueta">Dice</span>
                      <span className="barra-valor">{m.metricas.dice.toFixed(3)}</span>
                    </div>
                    <div className="barra-pista">
                      <div
                        className={`barra-progreso color-${obtenerColor(m.arquitecturaId)}`}
                        style={{ width: `${dicePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="barra-item">
                    <div className="barra-label-fila">
                      <span className="barra-etiqueta">IoU</span>
                      <span className="barra-valor">{m.metricas.iou.toFixed(3)}</span>
                    </div>
                    <div className="barra-pista">
                      <div
                        className={`barra-progreso color-${obtenerColor(m.arquitecturaId)} opacidad-media`}
                        style={{ width: `${iouPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="barra-item">
                    <div className="barra-label-fila">
                      <span className="barra-etiqueta">F1-det</span>
                      <span className="barra-valor">{m.metricas.f1Det?.toFixed(3)}</span>
                    </div>
                    <div className="barra-pista">
                      <div
                        className={`barra-progreso color-${obtenerColor(m.arquitecturaId)} opacidad-suave`}
                        style={{ width: `${f1Pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE DE INTERPRETACIÓN CIENTÍFICA SEPARADO DE LOS NÚMEROS */}
      <div className="bloque-interpretacion-cualitativa">
        <div className="interpretacion-encabezado">
          <Layers size={18} className="icono-interpretacion" />
          <h4>Síntesis e Interpretación Científica de la Etapa 1</h4>
        </div>

        <div className="interpretacion-cuerpo-grid">
          <div className="columna-interpretacion">
            <h5>1. Solapamiento Volumétrico y Detección Fina</h5>
            <p>
              <strong>ModCBAM</strong> demuestra la mayor efectividad en la segmentación del área nodular,
              alcanzando el coeficiente <strong>Dice más alto (0.893)</strong> y el mayor <strong>IoU (0.846)</strong>.
              Supera a la U-Net convencional por +0.020 en Dice y a TransUNet por +0.011, probando que la
              modificación en la integración de mapas de atención espacial y de canal optimiza la captación
              de contrastes en la interfaz entre el tejido nodular y el parénquima pulmonar.
            </p>
            <p>
              Asimismo, las redes con atención (tanto CBAM como ModCBAM) elevan la detección a <strong>F1-det = 0.973</strong> frente
              a 0.937 de U-Net, lo que refleja una notable reducción en la omisión de lesiones de pequeño tamaño.
            </p>
          </div>

          <div className="columna-interpretacion">
            <h5>2. Precisión Periférica y Regularidad de Contorno (HD95)</h5>
            <p>
              A pesar de la superioridad de ModCBAM en solapamiento de área, la <strong>U-Net clásica</strong> obtiene
              la distancia de Hausdorff al 95% más reducida (<strong>1.57 mm</strong> frente a 1.72 mm en ModCBAM
              y 1.83 mm en TransUNet).
            </p>
            <p>
              Este trade-off demuestra que la arquitectura convolucional estándar genera bordes geométricos ligeramente
              más regulares y nítidos en lesiones grandes y bien definidas, mientras que las arquitecturas con
              atención tienden a expandir suavemente el contorno para asegurar la captura de tejido periférico tenue.
            </p>
          </div>
        </div>
      </div>

      {/* ADVERTENCIAS METODOLÓGICAS DE E1 */}
      <div className="bloque-advertencias-e1">
        {advE1.map((adv) => (
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

export default SeccionSegmentacionE1;
