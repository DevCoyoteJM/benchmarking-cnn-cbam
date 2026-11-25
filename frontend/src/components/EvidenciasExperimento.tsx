
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  X,
} from "lucide-react";

import { modelos } from "../data/modelos";
import type { ResultadoModelo } from "../data/resultados";
import { generarUUID } from "../utils/uuid";
import type { Evidencia } from "../services/storage/storageTypes";
import {
  consultarEvidencias,
  guardarEvidencia,
  borrarEvidencia,
  esEvidenciaAsociada,
  esNombreNotebookCompartido,
  EXPERIMENTOS_CANONICOS,
  asegurarEvidenciasCompartidas,
} from "../services/storage/indexedDBService";
import VisorNotebook from "./VisorNotebook";

interface EvidenciasExperimentoProps {
  experimentos: ResultadoModelo[];
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function EvidenciasExperimento({
  experimentos,
}: EvidenciasExperimentoProps) {
  const [experimentoId, setExperimentoId] =
    useState("");

  const [evidencias, setEvidencias] =
    useState<Evidencia[]>([]);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [pdfUrl, setPdfUrl] =
    useState<string | null>(null);

  const [nombrePdf, setNombrePdf] = useState("");

  const [notebookActual, setNotebookActual] =
    useState<Evidencia | null>(null);

  const experimentoActual =
    experimentos.find(
      (item) => item.id === experimentoId
    ) ?? experimentos[0];

  // Recuperar archivos guardados y asegurar asociaciones de evidencias compartidas
  useEffect(() => {
    let activo = true;

    asegurarEvidenciasCompartidas()
      .catch(() => {})
      .then(() => consultarEvidencias())
      .then((datos) => {
        if (activo) {
          setEvidencias(datos);
        }
      })
      .catch(() => {
        if (activo) {
          setMensaje(
            "No se pudieron recuperar las evidencias."
          );
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Liberar direcciones temporales del PDF
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Adjuntar archivo
  const subirArchivo = async (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = evento.target.files?.[0];

    if (!archivo || !experimentoActual) return;

    if (archivo.size > MAX_FILE_SIZE) {
      setMensaje(
        "El archivo supera el límite de 50 MB permitido."
      );
      evento.target.value = "";
      return;
    }

    const extension = archivo.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (
      extension !== "pdf" &&
      extension !== "ipynb"
    ) {
      setMensaje(
        "Solo se permiten archivos PDF o .ipynb."
      );
      evento.target.value = "";
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const esCompartido =
        extension === "ipynb" && esNombreNotebookCompartido(archivo.name);

      const evidencia: Evidencia = {
        id: generarUUID(),
        experimentoId: experimentoActual.id,
        experimentoIds: esCompartido
          ? [...EXPERIMENTOS_CANONICOS]
          : [experimentoActual.id],
        esCompartida: esCompartido,
        nombre: archivo.name,
        tipo: extension,
        fecha: new Date().toISOString(),
        archivo,
      };

      await guardarEvidencia(evidencia);

      const actualizadas =
        await consultarEvidencias();

      setEvidencias(actualizadas);
      setMensaje(
        "Evidencia guardada correctamente."
      );
    } catch {
      setMensaje(
        "No se pudo guardar la evidencia."
      );
    } finally {
      setCargando(false);
      evento.target.value = "";
    }
  };

  // Descargar archivo
  const descargarArchivo = (
    evidencia: Evidencia
  ) => {
    const url = URL.createObjectURL(
      evidencia.archivo
    );

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = evidencia.nombre;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Abrir PDF
  const abrirPDF = (evidencia: Evidencia) => {
    if (evidencia.tipo !== "pdf") return;

    const url = URL.createObjectURL(
      evidencia.archivo
    );

    setNombrePdf(evidencia.nombre);
    setPdfUrl(url);
  };

  // Cerrar PDF
  const cerrarPDF = () => {
    setPdfUrl(null);
    setNombrePdf("");
  };

  // Abrir notebook
  const abrirNotebook = (
    evidencia: Evidencia
  ) => {
    if (evidencia.tipo !== "ipynb") return;

    setNotebookActual(evidencia);
  };

  // Cerrar notebook
  const cerrarNotebook = () => {
    setNotebookActual(null);
  };

  // Eliminar archivo
  const eliminarArchivo = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "¿Eliminar esta evidencia?"
      )
    ) {
      return;
    }

    try {
      await borrarEvidencia(id);

      setEvidencias((actuales) =>
        actuales.filter(
          (item) => item.id !== id
        )
      );

      setMensaje("Evidencia eliminada.");
    } catch {
      setMensaje(
        "No se pudo eliminar la evidencia."
      );
    }
  };

  // Archivos del experimento seleccionado (incluye individuales y compartidos)
  const evidenciasActuales = evidencias.filter(
    (item) =>
      esEvidenciaAsociada(item, experimentoActual?.id ?? "")
  );

  return (
    <section className="selector-modelos">
      <h3>Evidencias del entrenamiento</h3>

      <p>
        Asocia notebooks de Jupyter y documentos PDF
        con las versiones registradas de los modelos.
      </p>

      {experimentos.length === 0 ? (
        <p>
          No hay experimentos disponibles.
        </p>
      ) : (
        <>
          {/* SELECCIONAR EXPERIMENTO */}
          <div className="historial-filtros">
            <label htmlFor="evidencia-experimento">
              Seleccionar experimento
            </label>

            <select
              id="evidencia-experimento"
              value={
                experimentoActual?.id ?? ""
              }
              onChange={(e) =>
                setExperimentoId(
                  e.target.value
                )
              }
            >
              {experimentos.map((item) => {
                const nombre = modelos.find(
                  (modelo) =>
                    modelo.id ===
                    item.modeloId
                )?.nombre;

                return (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {nombre ??
                      item.modeloId}{" "}
                    — Versión{" "}
                    {item.version}
                  </option>
                );
              })}
            </select>
          </div>

          {/* SUBIR EVIDENCIA */}
          <div className="evidencias-subida">
            <label htmlFor="archivo-evidencia">
              Adjuntar evidencia (.ipynb o PDF)
            </label>

            <input
              id="archivo-evidencia"
              type="file"
              accept=".pdf,.ipynb"
              disabled={cargando}
              onChange={subirArchivo}
            />
          </div>

          {/* LISTADO DE EVIDENCIAS */}
          <div className="evidencias-listado">
            {evidenciasActuales.length === 0 ? (
              <p>
                No hay evidencias asociadas
                a esta versión.
              </p>
            ) : (
              evidenciasActuales.map(
                (evidencia) => (
                  <div
                    className="evidencia-item"
                    key={evidencia.id}
                  >
                    <FileText size={22} />

                    <div className="evidencia-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong>
                          {evidencia.nombre}
                        </strong>
                        {evidencia.esCompartida && (
                          <span className="badge-estado badge-compartida">
                            Compartida (4 arquitecturas)
                          </span>
                        )}
                      </div>

                      <span>
                        {evidencia.tipo.toUpperCase()}
                        {" — "}
                        {new Date(
                          evidencia.fecha
                        ).toLocaleDateString(
                          "es-CO"
                        )}
                      </span>
                    </div>

                    {/* VISUALIZAR PDF O NOTEBOOK */}
                    {(evidencia.tipo === "pdf" ||
                      evidencia.tipo === "ipynb") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            evidencia.tipo ===
                            "pdf"
                          ) {
                            abrirPDF(evidencia);
                          } else {
                            abrirNotebook(
                              evidencia
                            );
                          }
                        }}
                        title={
                          evidencia.tipo ===
                          "pdf"
                            ? "Visualizar PDF"
                            : "Visualizar notebook"
                        }
                        aria-label={`Visualizar ${evidencia.nombre}`}
                      >
                        <Eye size={18} />
                      </button>
                    )}

                    {/* DESCARGAR */}
                    <button
                      type="button"
                      onClick={() =>
                        descargarArchivo(
                          evidencia
                        )
                      }
                      title="Descargar evidencia"
                      aria-label={`Descargar ${evidencia.nombre}`}
                    >
                      <Download size={18} />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      type="button"
                      onClick={() =>
                        eliminarArchivo(
                          evidencia.id
                        )
                      }
                      title="Eliminar evidencia"
                      aria-label={`Eliminar ${evidencia.nombre}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              )
            )}
          </div>

          {mensaje && (
            <p role="status">
              {mensaje}
            </p>
          )}
        </>
      )}

      {/* VISUALIZADOR PDF */}
      {pdfUrl && (
        <div
          className="visor-pdf-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualizador de ${nombrePdf}`}
        >
          <div className="visor-pdf-contenedor">
            <div className="visor-pdf-header">
              <div>
                <h3>
                  Visualizador de documentos
                </h3>

                <p>{nombrePdf}</p>
              </div>

              <button
                type="button"
                onClick={cerrarPDF}
                aria-label="Cerrar visualizador"
              >
                <X size={22} />
              </button>
            </div>

            <div className="visor-pdf-contenido">
              <iframe
                src={pdfUrl}
                title={nombrePdf}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* VISUALIZADOR NOTEBOOK */}
      {notebookActual && (
        <VisorNotebook
          archivo={notebookActual.archivo}
          nombre={notebookActual.nombre}
          onCerrar={cerrarNotebook}
        />
      )}
    </section>
  );
}
