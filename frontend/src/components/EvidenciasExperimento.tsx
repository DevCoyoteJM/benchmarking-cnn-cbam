
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
import VisorNotebook from "./VisorNotebook";

interface EvidenciasExperimentoProps {
  experimentos: ResultadoModelo[];
}

interface Evidencia {
  id: string;
  experimentoId: string;
  nombre: string;
  tipo: string;
  fecha: string;
  archivo: Blob;
}

const DB_NAME = "pulmovision_evidencias";
const STORE_NAME = "archivos";

function abrirBaseDatos(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open(DB_NAME, 1);

    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    solicitud.onsuccess = () =>
      resolve(solicitud.result);

    solicitud.onerror = () =>
      reject(
        solicitud.error ??
          new Error("Error al abrir IndexedDB")
      );
  });
}

async function consultarEvidencias(): Promise<Evidencia[]> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const solicitud = transaccion
      .objectStore(STORE_NAME)
      .getAll();

    solicitud.onsuccess = () =>
      resolve(solicitud.result as Evidencia[]);

    solicitud.onerror = () =>
      reject(
        solicitud.error ??
          new Error("Error al consultar archivos")
      );

    transaccion.oncomplete = () => db.close();
    transaccion.onabort = () => db.close();
  });
}

async function guardarEvidencia(
  evidencia: Evidencia
): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaccion
      .objectStore(STORE_NAME)
      .put(evidencia);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al guardar archivo")
      );
    };

    transaccion.onabort = () => db.close();
    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

async function borrarEvidencia(
  id: string
): Promise<void> {
  const db = await abrirBaseDatos();

  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaccion
      .objectStore(STORE_NAME)
      .delete(id);

    transaccion.oncomplete = () => {
      db.close();
      resolve();
    };

    transaccion.onerror = () => {
      reject(
        transaccion.error ??
          new Error("Error al eliminar archivo")
      );
    };

    transaccion.onabort = () => db.close();
  });
}

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

  // Recuperar archivos guardados
  useEffect(() => {
    let activo = true;

    consultarEvidencias()
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
      const evidencia: Evidencia = {
        id: crypto.randomUUID(),
        experimentoId: experimentoActual.id,
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

  // Archivos del experimento seleccionado
  const evidenciasActuales = evidencias.filter(
    (item) =>
      item.experimentoId ===
      experimentoActual?.id
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
                      <strong>
                        {evidencia.nombre}
                      </strong>

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
