import { useState } from "react";
import { BookOpen, CheckCircle2, Copy, Pencil, X } from "lucide-react";
import { modelos } from "../data/modelos";
import type {
  ResultadoModelo,
  ConfiguracionEntrenamiento,
  EstadoVerificacionConfiguracion,
} from "../data/resultados";
import type { RegistroHistorialEntrenamiento } from "../data/historialEntrenamiento";
import type { Evidencia } from "../services/storage/storageTypes";
import { esEvidenciaAsociada } from "../services/storage/indexedDBService";
import VisorNotebook from "./VisorNotebook";
import FormularioConfiguracion from "./FormularioConfiguracion";
import ModalReplicarConfiguracion from "./ModalReplicarConfiguracion";
import {
  obtenerInfoHistorialExperimento,
  formatearFecha,
} from "../utils/graficaUtils";

export interface DetalleExperimentoProps {
  experimentos: ResultadoModelo[];
  historiales?: RegistroHistorialEntrenamiento[];
  evidencias?: Evidencia[];
  onActualizarExperimento?: (experimentoActualizado: ResultadoModelo) => void;
  onActualizarMultiplesExperimentos?: (experimentosActualizados: ResultadoModelo[]) => void;
}

/**
 * Combina la configuración editada en el formulario con el experimento seleccionado,
 * preservando intactas todas las propiedades no configuracionales del modelo
 * (id, modeloId, version, fecha, estado, tarea, descripcion, metricas)
 * y garantizando la retención de referencias documentales preexistentes (notebook, PDF).
 */
export function actualizarConfiguracionExperimento(
  experimento: ResultadoModelo,
  nuevaConfig: ConfiguracionEntrenamiento
): ResultadoModelo {
  return {
    ...experimento,
    configuracion: {
      ...experimento.configuracion,
      ...nuevaConfig,
      archivoNotebook:
        nuevaConfig.archivoNotebook ?? experimento.configuracion?.archivoNotebook,
      archivoPDF:
        nuevaConfig.archivoPDF ?? experimento.configuracion?.archivoPDF,
      epocas:
        nuevaConfig.epocasPlanificadas ??
        nuevaConfig.epocas ??
        experimento.configuracion?.epocas,
    },
  };
}

export default function DetalleExperimento({
  experimentos,
  historiales = [],
  evidencias = [],
  onActualizarExperimento,
  onActualizarMultiplesExperimentos,
}: DetalleExperimentoProps) {
  const [experimentoId, setExperimentoId] = useState("");
  const [notebookActivo, setNotebookActivo] = useState<Evidencia | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalReplicarAbierto, setModalReplicarAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const experimento =
    experimentos.find((item) => item.id === experimentoId) ??
    experimentos[0];

  const modelo = modelos.find(
    (item) => item.id === experimento?.modeloId
  );

  const historial = historiales.find(
    (h) => h.modeloId === experimento?.modeloId
  );

  const info = obtenerInfoHistorialExperimento(historial);

  const notebookAsociado = evidencias.find(
    (e) =>
      e.tipo === "ipynb" &&
      esEvidenciaAsociada(e, experimento?.id ?? "")
  );

  const configuracion = experimento?.configuracion;

  const mostrarValor = (
    valor: string | number | undefined
  ) => {
    return valor === undefined || valor === ""
      ? "No registrado"
      : String(valor);
  };

  const renderBadgeVerificacion = (
    estado?: EstadoVerificacionConfiguracion
  ) => {
    if (!estado) {
      return <span className="texto-no-registrado">No registrado</span>;
    }
    switch (estado) {
      case "verificado_notebook":
        return (
          <span className="badge-verificacion badge-verif-notebook">
            Verificado con Notebook
          </span>
        );
      case "verificado_otra_evidencia":
        return (
          <span className="badge-verificacion badge-verif-otra">
            Verificado con otra evidencia
          </span>
        );
      case "pendiente":
        return (
          <span className="badge-verificacion badge-verif-pendiente">
            Pendiente de verificación
          </span>
        );
      default:
        return <span className="texto-no-registrado">No registrado</span>;
    }
  };

  const manejarGuardarConfiguracion = (
    nuevaConfig: ConfiguracionEntrenamiento
  ) => {
    if (!experimento) return;

    const experimentoActualizado = actualizarConfiguracionExperimento(
      experimento,
      nuevaConfig
    );

    onActualizarExperimento?.(experimentoActualizado);
    setModoEdicion(false);
    setMensajeExito(
      `Configuración experimental de «${modelo?.nombre ?? experimento.modeloId}» guardada correctamente.`
    );
  };

  const manejarCancelarEdicion = () => {
    setModoEdicion(false);
  };

  const manejarReplicarLote = (
    experimentosActualizados: ResultadoModelo[]
  ) => {
    onActualizarMultiplesExperimentos?.(experimentosActualizados);
    setMensajeExito(
      "Configuración común replicada exitosamente hacia los modelos seleccionados."
    );
  };

  return (
    <section className="selector-modelos">
      <h3>Ficha técnica del experimento</h3>

      <p>
        Consulta la configuración experimental, los historiales reales de
        entrenamiento (E1 y E2) recuperados desde IndexedDB y las referencias documentales.
      </p>

      {experimentos.length === 0 ? (
        <p>No hay experimentos registrados.</p>
      ) : (
        <>
          <div className="historial-filtros">
            <label htmlFor="detalle-experimento">
              Seleccionar experimento
            </label>

            <select
              id="detalle-experimento"
              value={experimento?.id ?? ""}
              onChange={(e) => {
                setExperimentoId(e.target.value);
                setModoEdicion(false);
                setMensajeExito(null);
              }}
            >
              {experimentos.map((item) => {
                const nombreModelo = modelos.find(
                  (m) => m.id === item.modeloId
                )?.nombre;
                const h = historiales.find(
                  (hist) => hist.modeloId === item.modeloId
                );
                const estadoTexto = h ? "Con historial" : "Pendiente";

                return (
                  <option key={item.id} value={item.id}>
                    {nombreModelo ?? item.modeloId} — Versión {item.version} ({estadoTexto})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 1. IDENTIFICACIÓN Y ESTADO */}
          <h4 className="detalle-subtitulo">Identificación y Registro</h4>
          <div className="detalle-experimento-grid">
            <div>
              <span>Modelo</span>
              <strong>
                {modelo?.nombre ?? "No registrado"}
              </strong>
            </div>

            <div>
              <span>Versión</span>
              <strong>{experimento?.version}</strong>
            </div>

            <div>
              <span>Estado experimental</span>
              <div>
                <span
                  className={`badge-estado ${
                    info.tieneHistorial
                      ? "badge-con-historial"
                      : "badge-pendiente"
                  }`}
                >
                  {info.estadoCalculado}
                </span>
              </div>
            </div>

            <div>
              <span>Fecha de entrenamiento</span>
              <strong>
                {experimento?.fecha
                  ? formatearFecha(experimento.fecha)
                  : "Sin registrar"}
              </strong>
            </div>

            <div>
              <span>Fecha de importación</span>
              <strong>
                {info.fechaImportacion
                  ? formatearFecha(info.fechaImportacion)
                  : "No disponible"}
              </strong>
            </div>
          </div>

          {/* 2. HISTORIAL DE ENTRENAMIENTO DINÁMICO (INDEXEDDB) */}
          <h4 className="detalle-subtitulo">
            Historial de Entrenamiento (IndexedDB)
          </h4>
          <div className="detalle-experimento-grid">
            <div>
              <span>Archivo JSON de origen</span>
              <strong>
                {info.archivoOrigen ?? "No disponible"}
              </strong>
            </div>

            <div>
              <span>Historial Etapa E1 (Segmentación)</span>
              <strong>
                {info.e1Disponible ? "Disponible" : "No disponible"}
              </strong>
            </div>

            <div>
              <span>Épocas registradas en E1</span>
              <strong>
                {info.epocasE1 !== null
                  ? `${info.epocasE1} épocas`
                  : "No disponible"}
              </strong>
            </div>

            <div>
              <span>Historial Etapa E2 (Clasificación)</span>
              <strong>
                {info.e2Disponible ? "Disponible" : "No disponible"}
              </strong>
            </div>

            <div>
              <span>Épocas registradas en E2</span>
              <strong>
                {info.epocasE2 !== null
                  ? `${info.epocasE2} épocas`
                  : "No disponible"}
              </strong>
            </div>
          </div>

          {/* 3. CONFIGURACIÓN EXPERIMENTAL DOCUMENTAL Y METODOLOGÍA */}
          <div className="detalle-seccion-header">
            <h4 className="detalle-subtitulo">
              Configuración Experimental (Documental / Metodología)
            </h4>

            {!modoEdicion && (
              <div className="detalle-cabecera-acciones">
                <button
                  type="button"
                  className="btn-copiar-configuracion"
                  onClick={() => {
                    setMensajeExito(null);
                    setModalReplicarAbierto(true);
                  }}
                  title="Copiar parámetros comunes hacia otras arquitecturas"
                >
                  <Copy size={15} />
                  Copiar a otros modelos
                </button>

                <button
                  type="button"
                  className="btn-editar-configuracion"
                  onClick={() => {
                    setMensajeExito(null);
                    setModoEdicion(true);
                  }}
                >
                  <Pencil size={15} />
                  Editar configuración
                </button>
              </div>
            )}
          </div>

          {mensajeExito && (
            <div className="alerta-exito-configuracion" role="status">
              <CheckCircle2 size={16} />
              <span>{mensajeExito}</span>
              <button
                type="button"
                className="btn-cerrar-alerta"
                onClick={() => setMensajeExito(null)}
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {modoEdicion ? (
            <FormularioConfiguracion
              configuracion={experimento?.configuracion}
              nombreModelo={modelo?.nombre ?? experimento?.modeloId}
              onGuardar={manejarGuardarConfiguracion}
              onCancelar={manejarCancelarEdicion}
            />
          ) : (
            <>
              {/* Sección A: Dataset y preprocesamiento */}
              <h5 className="detalle-grupo-titulo">A. Dataset y Preprocesamiento</h5>
              <div className="detalle-experimento-grid">
                <div>
                  <span>Dataset</span>
                  <strong>{mostrarValor(configuracion?.dataset)}</strong>
                </div>

                <div>
                  <span>Versión / Procedencia Dataset</span>
                  <strong>{mostrarValor(configuracion?.versionDataset)}</strong>
                </div>

                <div>
                  <span>Número de muestras</span>
                  <strong>
                    {configuracion?.numeroMuestras !== undefined
                      ? `${configuracion.numeroMuestras.toLocaleString()} casos`
                      : "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>División de datos (Train / Val / Test)</span>
                  <strong>{mostrarValor(configuracion?.divisionDatos)}</strong>
                </div>

                <div className="grid-col-span-2">
                  <span>Preprocesamiento</span>
                  <strong>{mostrarValor(configuracion?.preprocesamiento)}</strong>
                </div>
              </div>

              {/* Sección B: Configuración de entrenamiento */}
              <h5 className="detalle-grupo-titulo">B. Configuración de Entrenamiento</h5>
              <div className="detalle-experimento-grid">
                <div>
                  <span>Framework</span>
                  <strong>{mostrarValor(configuracion?.framework)}</strong>
                </div>

                <div>
                  <span>Versión Framework</span>
                  <strong>{mostrarValor(configuracion?.versionFramework)}</strong>
                </div>

                <div>
                  <span>Batch size</span>
                  <strong>{mostrarValor(configuracion?.batchSize)}</strong>
                </div>

                <div>
                  <span>Learning rate</span>
                  <strong>{mostrarValor(configuracion?.learningRate)}</strong>
                </div>

                <div>
                  <span>Optimizador</span>
                  <strong>{mostrarValor(configuracion?.optimizador)}</strong>
                </div>

                <div>
                  <span>Función de pérdida</span>
                  <strong>{mostrarValor(configuracion?.funcionPerdida)}</strong>
                </div>

                <div>
                  <span>Épocas planificadas</span>
                  <strong>
                    {configuracion?.epocasPlanificadas !== undefined
                      ? `${configuracion.epocasPlanificadas} épocas (planificadas)`
                      : configuracion?.epocas !== undefined
                        ? `${configuracion.epocas} épocas (planificadas)`
                        : "No registrado"}
                  </strong>
                </div>

                <div>
                  <span>Hardware de cómputo</span>
                  <strong>{mostrarValor(configuracion?.hardware)}</strong>
                </div>
              </div>

              {/* Sección C: Metodología y reproducibilidad */}
              <h5 className="detalle-grupo-titulo">C. Metodología y Reproducibilidad</h5>
              <div className="detalle-experimento-grid">
                <div>
                  <span>Semilla aleatoria</span>
                  <strong>{mostrarValor(configuracion?.semillaAleatoria)}</strong>
                </div>

                <div>
                  <span>Aumento de datos (Augmentation)</span>
                  <strong>{mostrarValor(configuracion?.aumentoDatos)}</strong>
                </div>

                <div>
                  <span>Regularización</span>
                  <strong>{mostrarValor(configuracion?.regularizacion)}</strong>
                </div>

                <div>
                  <span>Estado de verificación documental</span>
                  <div>
                    {renderBadgeVerificacion(configuracion?.estadoVerificacion)}
                  </div>
                </div>

                <div>
                  <span>Notebook (.ipynb)</span>
                  {notebookAsociado ? (
                    <div className="detalle-evidencia-item">
                      <strong title={notebookAsociado.nombre}>
                        {notebookAsociado.nombre}
                      </strong>
                      {notebookAsociado.esCompartida && (
                        <span className="badge-estado badge-compartida">
                          Evidencia compartida (4 arquitecturas)
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn-abrir-notebook"
                        onClick={() => setNotebookActivo(notebookAsociado)}
                      >
                        <BookOpen size={14} />
                        Abrir en visor
                      </button>
                    </div>
                  ) : (
                    <strong>
                      {mostrarValor(configuracion?.archivoNotebook)}
                    </strong>
                  )}
                </div>

                <div>
                  <span>Documento PDF</span>
                  <strong>
                    {mostrarValor(configuracion?.archivoPDF)}
                  </strong>
                </div>
              </div>

              <div className="detalle-observaciones">
                <h4>Observaciones y Notas Metodológicas</h4>
                <p>
                  {mostrarValor(configuracion?.observaciones)}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* VISOR INTEGRADO DE NOTEBOOK IPYNB */}
      {notebookActivo && (
        <VisorNotebook
          archivo={notebookActivo.archivo}
          nombre={notebookActivo.nombre}
          onCerrar={() => setNotebookActivo(null)}
        />
      )}

      {/* MODAL DE REPLICACIÓN GUIADA DE CONFIGURACIÓN */}
      <ModalReplicarConfiguracion
        experimentos={experimentos}
        experimentoOrigenDefecto={experimento}
        isOpen={modalReplicarAbierto}
        onCerrar={() => setModalReplicarAbierto(false)}
        onReplicar={manejarReplicarLote}
      />
    </section>
  );
}