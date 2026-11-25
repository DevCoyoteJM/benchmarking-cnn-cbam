import { useState } from "react";
import { Upload, AlertTriangle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { modelos } from "../data/modelos";
import type {
  HistorialEntrenamiento,
  RegistroHistorialEntrenamiento,
  EtapaEntrenamiento,
} from "../data/historialEntrenamiento";

interface Props {
  historiales: RegistroHistorialEntrenamiento[];
  onImportar: (registro: RegistroHistorialEntrenamiento) => Promise<boolean | void> | void;
  onEliminar?: (id: string) => Promise<boolean | void> | void;
}

export const mapaNombresModelos: Record<string, string> = {
  unet: "unet",
  cbam: "unet-cbam",
  modcbam: "modcbam",
  transunet: "transunet",
};

export const metricasPermitidas = [
  "train_loss",
  "val_loss",
  "val_dice",
  "val_mcc",
  "val_f1",
];

/**
 * Valida minuciosamente que el JSON tenga la estructura esperada de un historial de entrenamiento.
 * Comprueba que existan etapas, que las métricas sean permitidas y que todos los valores sean
 * números finitos válidos (rechaza NaN e Infinity).
 */
export function validarHistorial(datos: unknown): datos is HistorialEntrenamiento {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return false;
  }

  const etapas = datos as Record<string, unknown>;
  const nombresEtapas = Object.keys(etapas);

  if (nombresEtapas.length === 0) {
    return false;
  }

  return nombresEtapas.every((nombreEtapa) => {
    const etapa = etapas[nombreEtapa];

    if (!etapa || typeof etapa !== "object" || Array.isArray(etapa)) {
      return false;
    }

    const metricas = etapa as Record<string, unknown>;
    const claves = Object.keys(metricas);

    if (claves.length === 0) {
      return false;
    }

    return Object.entries(metricas).every(([clave, valor]) => {
      return (
        metricasPermitidas.includes(clave) &&
        Array.isArray(valor) &&
        valor.length > 0 &&
        valor.every(
          (numero) =>
            typeof numero === "number" &&
            Number.isFinite(numero) &&
            !Number.isNaN(numero)
        )
      );
    });
  });
}

/**
 * Normaliza los nombres de las etapas a mayúsculas (ej. "e1" -> "E1")
 * conservando los datos exactos.
 */
function normalizarEtapas(etapas: HistorialEntrenamiento): HistorialEntrenamiento {
  const normalizadas: HistorialEntrenamiento = {};
  for (const [clave, valor] of Object.entries(etapas)) {
    const claveNormalizada = clave.toUpperCase();
    normalizadas[claveNormalizada] = valor as EtapaEntrenamiento;
  }
  return normalizadas;
}

export default function ImportarHistorialEntrenamiento({
  historiales,
  onImportar,
  onEliminar,
}: Props) {
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [reemplazoPendiente, setReemplazoPendiente] = useState<{
    registro: RegistroHistorialEntrenamiento;
    nombreModelo: string;
    archivoExistente: string;
  } | null>(null);

  async function procesarArchivo(archivo: File) {
    try {
      const texto = await archivo.text();
      const datos: unknown = JSON.parse(texto);

      if (!validarHistorial(datos)) {
        throw new Error(
          "El archivo no tiene el formato esperado. Debe contener etapas con arreglos numéricos válidos (sin NaN ni Infinity)."
        );
      }

      const nombreBase = archivo.name
        .replace(/_historial\.json$/i, "")
        .toLowerCase();

      const modeloId = mapaNombresModelos[nombreBase];

      if (!modeloId) {
        throw new Error(
          "Nombre de archivo no reconocido. Utiliza UNet_historial.json, CBAM_historial.json, ModCBAM_historial.json o TransUNet_historial.json."
        );
      }

      const etapasNormalizadas = normalizarEtapas(datos);

      const nuevoRegistro: RegistroHistorialEntrenamiento = {
        id: `${modeloId}-${Date.now()}`,
        modeloId,
        nombreArchivo: archivo.name,
        fechaImportacion: new Date().toISOString(),
        etapas: etapasNormalizadas,
      };

      const modeloInfo = modelos.find((m) => m.id === modeloId);
      const nombreModelo = modeloInfo?.nombre ?? modeloId;

      // Verificar si ya existe un historial para este modelo
      const existente = historiales.find((h) => h.modeloId === modeloId);

      if (existente) {
        // Solicitar confirmación antes de reemplazar
        setReemplazoPendiente({
          registro: {
            ...nuevoRegistro,
            id: existente.id, // Reutiliza el ID del registro anterior para garantizar reemplazo atómico
          },
          nombreModelo,
          archivoExistente: existente.nombreArchivo,
        });
        setMensaje(null);
        return;
      }

      // Si no existe, guardar directamente
      await onImportar(nuevoRegistro);
      setMensaje({
        texto: `Historial de ${nombreModelo} (${archivo.name}) importado correctamente.`,
        error: false,
      });
    } catch (error) {
      setMensaje({
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo leer el archivo de historial.",
        error: true,
      });
    }
  }

  function manejarSeleccionArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    void procesarArchivo(archivo);
    evento.target.value = "";
  }

  async function confirmarReemplazo() {
    if (!reemplazoPendiente) return;
    try {
      await onImportar(reemplazoPendiente.registro);
      setMensaje({
        texto: `Historial de ${reemplazoPendiente.nombreModelo} actualizado correctamente con ${reemplazoPendiente.registro.nombreArchivo}.`,
        error: false,
      });
    } catch (err) {
      console.error(err);
      setMensaje({
        texto: "No se pudo reemplazar el historial.",
        error: true,
      });
    } finally {
      setReemplazoPendiente(null);
    }
  }

  function cancelarReemplazo() {
    setReemplazoPendiente(null);
    setMensaje({
      texto: "Importación cancelada. Se conservó el historial existente.",
      error: false,
    });
  }

  return (
    <section className="selector-modelos">
      <div className="importar-resultados-header">
        <div>
          <h3>Importar historiales de entrenamiento por época</h3>
          <p>
            Carga los archivos JSON con las curvas de entrenamiento generadas en PyTorch
            (<code>UNet_historial.json</code>, <code>CBAM_historial.json</code>).
            Las etapas y métricas se conservarán con sus nombres originales.
          </p>
        </div>
        <Upload size={24} color="#7c3aed" />
      </div>

      <div className="importar-resultados-archivo">
        <label htmlFor="archivo-historial">
          Seleccionar archivo de historial (.json)
        </label>
        <input
          id="archivo-historial"
          type="file"
          accept=".json,application/json"
          onChange={manejarSeleccionArchivo}
        />
      </div>

      {/* AVISO DE REEMPLAZO */}
      {reemplazoPendiente && (
        <div
          style={{
            margin: "16px 0",
            padding: "16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            color: "#92400e",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={20} color="#d97706" />
            <strong>Historial ya existente</strong>
          </div>
          <p style={{ margin: "0 0 12px 0", fontSize: "13px", lineHeight: "1.5" }}>
            Ya existe un historial guardado para <strong>{reemplazoPendiente.nombreModelo}</strong>{" "}
            (archivo previo: <em>{reemplazoPendiente.archivoExistente}</em>).
            ¿Deseas reemplazarlo con el nuevo archivo <strong>{reemplazoPendiente.registro.nombreArchivo}</strong>?
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={confirmarReemplazo}
              style={{
                background: "#d97706",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Confirmar reemplazo
            </button>
            <button
              type="button"
              onClick={cancelarReemplazo}
              style={{
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 14px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MENSAJE DE ESTADO */}
      {mensaje && (
        <p
          role="status"
          style={{
            color: mensaje.error ? "#dc2626" : "#15803d",
            marginTop: 12,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {mensaje.texto}
        </p>
      )}

      {/* ESTADO DE HISTORIALES POR MODELO */}
      <div style={{ marginTop: "24px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 10px 0", color: "#334155" }}>
          Estado de historiales por arquitectura:
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {modelos.map((modelo) => {
            const historial = historiales.find((h) => h.modeloId === modelo.id);
            const tieneHistorial = Boolean(historial);

            return (
              <div
                key={modelo.id}
                style={{
                  background: tieneHistorial ? "#f8fafc" : "#fafafa",
                  border: `1px solid ${tieneHistorial ? "#cbd5e1" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {tieneHistorial ? (
                      <CheckCircle2 size={16} color="#16a34a" />
                    ) : (
                      <Clock size={16} color="#94a3b8" />
                    )}
                    <strong style={{ fontSize: "13px", color: "#1e293b" }}>
                      {modelo.nombre}
                    </strong>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "11px",
                      color: tieneHistorial ? "#475569" : "#94a3b8",
                    }}
                  >
                    {tieneHistorial
                      ? `${historial?.nombreArchivo} (${new Date(historial!.fechaImportacion).toLocaleDateString("es-CO")})`
                      : "Sin historial cargado"}
                  </p>
                </div>

                {tieneHistorial && onEliminar && historial && (
                  <button
                    type="button"
                    onClick={() => onEliminar(historial.id)}
                    title={`Eliminar historial de ${modelo.nombre}`}
                    aria-label={`Eliminar historial de ${modelo.nombre}`}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
