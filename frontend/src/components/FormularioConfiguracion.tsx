import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {
  AlertCircle,
  Cpu,
  Database,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  ConfiguracionEntrenamiento,
  EstadoVerificacionConfiguracion,
} from "../data/resultados";

export interface FormularioConfiguracionProps {
  configuracion?: ConfiguracionEntrenamiento;
  onGuardar: (configuracionActualizada: ConfiguracionEntrenamiento) => void;
  onCancelar: () => void;
  nombreModelo?: string;
}

export interface FormularioConfiguracionState {
  dataset: string;
  versionDataset: string;
  numeroMuestras: string;
  divisionDatos: string;
  preprocesamiento: string;

  framework: string;
  versionFramework: string;
  batchSize: string;
  learningRate: string;
  optimizador: string;
  funcionPerdida: string;
  epocasPlanificadas: string;
  hardware: string;

  semillaAleatoria: string;
  aumentoDatos: string;
  regularizacion: string;
  observaciones: string;
  estadoVerificacion: string;
}

/**
 * Inicializa el estado del formulario con los valores existentes
 * o cadenas vacías si no hay valores previos.
 */
export function inicializarFormulario(
  config?: ConfiguracionEntrenamiento
): FormularioConfiguracionState {
  return {
    dataset: config?.dataset ?? "",
    versionDataset: config?.versionDataset ?? "",
    numeroMuestras:
      config?.numeroMuestras !== undefined ? String(config.numeroMuestras) : "",
    divisionDatos: config?.divisionDatos ?? "",
    preprocesamiento: config?.preprocesamiento ?? "",

    framework: config?.framework ?? "",
    versionFramework: config?.versionFramework ?? "",
    batchSize: config?.batchSize !== undefined ? String(config.batchSize) : "",
    learningRate:
      config?.learningRate !== undefined ? String(config.learningRate) : "",
    optimizador: config?.optimizador ?? "",
    funcionPerdida: config?.funcionPerdida ?? "",
    epocasPlanificadas:
      config?.epocasPlanificadas !== undefined
        ? String(config.epocasPlanificadas)
        : config?.epocas !== undefined
          ? String(config.epocas)
          : "",
    hardware: config?.hardware ?? "",

    semillaAleatoria:
      config?.semillaAleatoria !== undefined
        ? String(config.semillaAleatoria)
        : "",
    aumentoDatos: config?.aumentoDatos ?? "",
    regularizacion: config?.regularizacion ?? "",
    observaciones: config?.observaciones ?? "",
    estadoVerificacion: config?.estadoVerificacion ?? "",
  };
}

/**
 * Valida los datos del formulario y genera el objeto ConfiguracionEntrenamiento normalizado.
 * Los campos vacíos se transforman en undefined (nunca en ceros).
 */
export function validarYNormalizarConfiguracion(
  state: FormularioConfiguracionState,
  configuracionOriginal?: ConfiguracionEntrenamiento
): {
  esValido: boolean;
  errores: Record<string, string>;
  configuracion?: ConfiguracionEntrenamiento;
} {
  const errores: Record<string, string> = {};

  // 1. Validaciones numéricas opcionales
  let numeroMuestrasNum: number | undefined = undefined;
  if (state.numeroMuestras.trim() !== "") {
    const val = Number(state.numeroMuestras.trim());
    if (!Number.isFinite(val) || !Number.isInteger(val) || val <= 0) {
      errores.numeroMuestras =
        "El número de muestras debe ser un número entero positivo mayor a 0.";
    } else {
      numeroMuestrasNum = val;
    }
  }

  let batchSizeNum: number | undefined = undefined;
  if (state.batchSize.trim() !== "") {
    const val = Number(state.batchSize.trim());
    if (!Number.isFinite(val) || !Number.isInteger(val) || val <= 0) {
      errores.batchSize =
        "El batch size debe ser un número entero positivo mayor a 0.";
    } else {
      batchSizeNum = val;
    }
  }

  let learningRateNum: number | undefined = undefined;
  if (state.learningRate.trim() !== "") {
    const val = Number(state.learningRate.trim());
    if (!Number.isFinite(val) || val <= 0) {
      errores.learningRate =
        "El learning rate debe ser un número positivo mayor a 0 (ej. 0.0001).";
    } else {
      learningRateNum = val;
    }
  }

  let epocasPlanificadasNum: number | undefined = undefined;
  if (state.epocasPlanificadas.trim() !== "") {
    const val = Number(state.epocasPlanificadas.trim());
    if (!Number.isFinite(val) || !Number.isInteger(val) || val <= 0) {
      errores.epocasPlanificadas =
        "Las épocas planificadas deben ser un número entero positivo mayor a 0.";
    } else {
      epocasPlanificadasNum = val;
    }
  }

  let semillaAleatoriaNum: number | undefined = undefined;
  if (state.semillaAleatoria.trim() !== "") {
    const val = Number(state.semillaAleatoria.trim());
    if (!Number.isFinite(val) || !Number.isInteger(val) || val < 0) {
      errores.semillaAleatoria =
        "La semilla aleatoria debe ser un número entero mayor o igual a 0.";
    } else {
      semillaAleatoriaNum = val;
    }
  }

  // 2. Validación de estado de verificación
  let estadoVerificacionVal: EstadoVerificacionConfiguracion | undefined =
    undefined;
  if (state.estadoVerificacion.trim() !== "") {
    const permitido = [
      "pendiente",
      "verificado_notebook",
      "verificado_otra_evidencia",
    ];
    if (permitido.includes(state.estadoVerificacion.trim())) {
      estadoVerificacionVal =
        state.estadoVerificacion.trim() as EstadoVerificacionConfiguracion;
    } else {
      errores.estadoVerificacion =
        "El estado de verificación seleccionado no es válido.";
    }
  }

  if (Object.keys(errores).length > 0) {
    return { esValido: false, errores };
  }

  // 3. Normalización con trim() de campos de texto (cadena vacía -> undefined)
  const normalizarTexto = (valor: string): string | undefined => {
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : undefined;
  };

  const nuevaConfig: ConfiguracionEntrenamiento = {
    // Conservar metadatos preexistentes
    archivoNotebook: configuracionOriginal?.archivoNotebook,
    archivoPDF: configuracionOriginal?.archivoPDF,
    epocas: epocasPlanificadasNum ?? configuracionOriginal?.epocas,

    // Sección A: Dataset
    dataset: normalizarTexto(state.dataset),
    versionDataset: normalizarTexto(state.versionDataset),
    numeroMuestras: numeroMuestrasNum,
    divisionDatos: normalizarTexto(state.divisionDatos),
    preprocesamiento: normalizarTexto(state.preprocesamiento),

    // Sección B: Entrenamiento
    framework: normalizarTexto(state.framework),
    versionFramework: normalizarTexto(state.versionFramework),
    batchSize: batchSizeNum,
    learningRate: learningRateNum,
    optimizador: normalizarTexto(state.optimizador),
    funcionPerdida: normalizarTexto(state.funcionPerdida),
    epocasPlanificadas: epocasPlanificadasNum,
    hardware: normalizarTexto(state.hardware),

    // Sección C: Metodología
    semillaAleatoria: semillaAleatoriaNum,
    aumentoDatos: normalizarTexto(state.aumentoDatos),
    regularizacion: normalizarTexto(state.regularizacion),
    observaciones: normalizarTexto(state.observaciones),
    estadoVerificacion: estadoVerificacionVal,
  };

  return {
    esValido: true,
    errores: {},
    configuracion: nuevaConfig,
  };
}

export default function FormularioConfiguracion({
  configuracion,
  onGuardar,
  onCancelar,
  nombreModelo,
}: FormularioConfiguracionProps) {
  const [formulario, setFormulario] = useState<FormularioConfiguracionState>(
    () => inicializarFormulario(configuracion)
  );
  const [errores, setErrores] = useState<Record<string, string>>({});

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const manejarEnvio = (e: FormEvent) => {
    e.preventDefault();
    const resultado = validarYNormalizarConfiguracion(formulario, configuracion);

    if (!resultado.esValido || !resultado.configuracion) {
      setErrores(resultado.errores);
      return;
    }

    onGuardar(resultado.configuracion);
  };

  return (
    <div className="formulario-configuracion-contenedor">
      <div className="formulario-header">
        <div>
          <h3>
            Configuración Experimental{" "}
            {nombreModelo ? `— ${nombreModelo}` : ""}
          </h3>
          <p>
            Registra los parámetros metodológicos y de reproducibilidad. Los
            campos que no cuenten con documentación comprobable pueden dejarse
            vacíos (se mostrarán como «No registrado»).
          </p>
        </div>
        <button
          type="button"
          className="btn-icono-cerrar"
          onClick={onCancelar}
          title="Cancelar edición"
          aria-label="Cerrar formulario"
        >
          <X size={20} />
        </button>
      </div>

      {Object.keys(errores).length > 0 && (
        <div className="formulario-alerta-errores" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Existen inconsistencias en los campos:</strong>
            <ul>
              {Object.entries(errores).map(([campo, msg]) => (
                <li key={campo}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={manejarEnvio} noValidate>
        {/* SECCIÓN A: DATASET Y PREPROCESAMIENTO */}
        <section className="formulario-seccion">
          <div className="formulario-seccion-titulo">
            <Database size={17} color="#4f46e5" />
            <h4>A. Dataset y Preprocesamiento</h4>
          </div>

          <div className="formulario-grid">
            <div className="campo-grupo">
              <label htmlFor="campo-dataset" className="campo-label">
                Nombre del dataset
              </label>
              <input
                id="campo-dataset"
                name="dataset"
                type="text"
                className="campo-input"
                placeholder="Ej. LIDC-IDRI"
                value={formulario.dataset}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-versionDataset" className="campo-label">
                Versión o procedencia
              </label>
              <input
                id="campo-versionDataset"
                name="versionDataset"
                type="text"
                className="campo-input"
                placeholder="Ej. TCIA XML Consensus (4 radiólogos)"
                value={formulario.versionDataset}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-numeroMuestras" className="campo-label">
                Número de muestras / nódulos
              </label>
              <input
                id="campo-numeroMuestras"
                name="numeroMuestras"
                type="number"
                min="1"
                step="1"
                className={`campo-input ${errores.numeroMuestras ? "campo-invalido" : ""}`}
                placeholder="Ej. 1018"
                value={formulario.numeroMuestras}
                onChange={manejarCambio}
              />
              {errores.numeroMuestras ? (
                <span className="campo-error">{errores.numeroMuestras}</span>
              ) : (
                <span className="campo-ayuda">Entero positivo (opcional)</span>
              )}
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-divisionDatos" className="campo-label">
                División de datos (Train / Val / Test)
              </label>
              <input
                id="campo-divisionDatos"
                name="divisionDatos"
                type="text"
                className="campo-input"
                placeholder="Ej. 70% / 15% / 15%"
                value={formulario.divisionDatos}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo campo-ancho-completo">
              <label htmlFor="campo-preprocesamiento" className="campo-label">
                Técnicas de preprocesamiento
              </label>
              <textarea
                id="campo-preprocesamiento"
                name="preprocesamiento"
                className="campo-textarea"
                rows={2}
                placeholder="Ej. Ventana pulmonar [-1000, 400 HU], normalización [0, 1], remuestreo isotrópico a 1 mm."
                value={formulario.preprocesamiento}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>
          </div>
        </section>

        {/* SECCIÓN B: CONFIGURACIÓN DE ENTRENAMIENTO */}
        <section className="formulario-seccion">
          <div className="formulario-seccion-titulo">
            <Cpu size={17} color="#4f46e5" />
            <h4>B. Configuración de Entrenamiento</h4>
          </div>

          <div className="formulario-grid">
            <div className="campo-grupo">
              <label htmlFor="campo-framework" className="campo-label">
                Framework
              </label>
              <input
                id="campo-framework"
                name="framework"
                type="text"
                className="campo-input"
                placeholder="Ej. PyTorch"
                value={formulario.framework}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-versionFramework" className="campo-label">
                Versión del framework
              </label>
              <input
                id="campo-versionFramework"
                name="versionFramework"
                type="text"
                className="campo-input"
                placeholder="Ej. 2.1.2+cu121"
                value={formulario.versionFramework}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-batchSize" className="campo-label">
                Batch size
              </label>
              <input
                id="campo-batchSize"
                name="batchSize"
                type="number"
                min="1"
                step="1"
                className={`campo-input ${errores.batchSize ? "campo-invalido" : ""}`}
                placeholder="Ej. 16"
                value={formulario.batchSize}
                onChange={manejarCambio}
              />
              {errores.batchSize ? (
                <span className="campo-error">{errores.batchSize}</span>
              ) : (
                <span className="campo-ayuda">Entero positivo (opcional)</span>
              )}
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-learningRate" className="campo-label">
                Learning rate
              </label>
              <input
                id="campo-learningRate"
                name="learningRate"
                type="number"
                min="0.0000001"
                step="any"
                className={`campo-input ${errores.learningRate ? "campo-invalido" : ""}`}
                placeholder="Ej. 0.0001"
                value={formulario.learningRate}
                onChange={manejarCambio}
              />
              {errores.learningRate ? (
                <span className="campo-error">{errores.learningRate}</span>
              ) : (
                <span className="campo-ayuda">Flotante positivo (opcional)</span>
              )}
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-optimizador" className="campo-label">
                Optimizador
              </label>
              <input
                id="campo-optimizador"
                name="optimizador"
                type="text"
                className="campo-input"
                placeholder="Ej. AdamW con CosineAnnealingLR"
                value={formulario.optimizador}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-funcionPerdida" className="campo-label">
                Función de pérdida
              </label>
              <input
                id="campo-funcionPerdida"
                name="funcionPerdida"
                type="text"
                className="campo-input"
                placeholder="Ej. E1: BCE + Dice Loss / E2: Focal Loss"
                value={formulario.funcionPerdida}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-epocasPlanificadas" className="campo-label">
                Épocas planificadas
              </label>
              <input
                id="campo-epocasPlanificadas"
                name="epocasPlanificadas"
                type="number"
                min="1"
                step="1"
                className={`campo-input ${errores.epocasPlanificadas ? "campo-invalido" : ""}`}
                placeholder="Ej. 100"
                value={formulario.epocasPlanificadas}
                onChange={manejarCambio}
              />
              {errores.epocasPlanificadas ? (
                <span className="campo-error">{errores.epocasPlanificadas}</span>
              ) : (
                <span className="campo-ayuda">
                  Meta configurada (no sustituye las reales)
                </span>
              )}
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-hardware" className="campo-label">
                Hardware / GPU
              </label>
              <input
                id="campo-hardware"
                name="hardware"
                type="text"
                className="campo-input"
                placeholder="Ej. NVIDIA A100-SXM4-40GB"
                value={formulario.hardware}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>
          </div>
        </section>

        {/* SECCIÓN C: METODOLOGÍA Y REPRODUCIBILIDAD */}
        <section className="formulario-seccion">
          <div className="formulario-seccion-titulo">
            <ShieldCheck size={17} color="#4f46e5" />
            <h4>C. Metodología y Reproducibilidad</h4>
          </div>

          <div className="formulario-grid">
            <div className="campo-grupo">
              <label htmlFor="campo-semillaAleatoria" className="campo-label">
                Semilla aleatoria (Seed)
              </label>
              <input
                id="campo-semillaAleatoria"
                name="semillaAleatoria"
                type="number"
                min="0"
                step="1"
                className={`campo-input ${errores.semillaAleatoria ? "campo-invalido" : ""}`}
                placeholder="Ej. 42"
                value={formulario.semillaAleatoria}
                onChange={manejarCambio}
              />
              {errores.semillaAleatoria ? (
                <span className="campo-error">{errores.semillaAleatoria}</span>
              ) : (
                <span className="campo-ayuda">Entero mayor o igual a 0</span>
              )}
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-estadoVerificacion" className="campo-label">
                Estado de verificación documental
              </label>
              <select
                id="campo-estadoVerificacion"
                name="estadoVerificacion"
                className="campo-select"
                value={formulario.estadoVerificacion}
                onChange={manejarCambio}
              >
                <option value="">Sin especificar</option>
                <option value="pendiente">Pendiente de verificar</option>
                <option value="verificado_notebook">
                  Verificado con notebook (.ipynb)
                </option>
                <option value="verificado_otra_evidencia">
                  Verificado con otra evidencia (PDF / reporte)
                </option>
              </select>
              <span className="campo-ayuda">Control de trazabilidad</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-regularizacion" className="campo-label">
                Regularización
              </label>
              <input
                id="campo-regularizacion"
                name="regularizacion"
                type="text"
                className="campo-input"
                placeholder="Ej. Dropout 0.2, Weight Decay 1e-4, Early Stopping"
                value={formulario.regularizacion}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo">
              <label htmlFor="campo-aumentoDatos" className="campo-label">
                Técnicas de aumento de datos
              </label>
              <input
                id="campo-aumentoDatos"
                name="aumentoDatos"
                type="text"
                className="campo-input"
                placeholder="Ej. Rotaciones +/- 15 grados, Flip horizontal/vertical"
                value={formulario.aumentoDatos}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>

            <div className="campo-grupo campo-ancho-completo">
              <label htmlFor="campo-observaciones" className="campo-label">
                Observaciones adicionales
              </label>
              <textarea
                id="campo-observaciones"
                name="observaciones"
                className="campo-textarea"
                rows={3}
                placeholder="Notas de convergencia, consideraciones metodológicas o hiperparámetros adicionales..."
                value={formulario.observaciones}
                onChange={manejarCambio}
              />
              <span className="campo-ayuda">Opcional</span>
            </div>
          </div>
        </section>

        {/* ACCIONES DEL FORMULARIO */}
        <div className="formulario-acciones">
          <button
            type="button"
            className="btn-cancelar-formulario"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-guardar-formulario">
            <Save size={16} />
            Guardar configuración
          </button>
        </div>
      </form>
    </div>
  );
}
