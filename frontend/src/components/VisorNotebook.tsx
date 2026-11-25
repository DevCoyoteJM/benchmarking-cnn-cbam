import { useEffect, useState } from "react";
import { BookOpen, Code2, FileText, X } from "lucide-react";

interface VisorNotebookProps {
  archivo: Blob;
  nombre: string;
  onCerrar: () => void;
}

interface CeldaNotebook {
  cell_type: string;
  source?: string | string[];
  execution_count?: number | null;
  outputs?: SalidaNotebook[];
}

interface SalidaNotebook {
  output_type?: string;
  text?: string | string[];
  data?: Record<string, unknown>;
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

interface Notebook {
  cells: CeldaNotebook[];
  nbformat: number;
}

interface ImagenNotebook {
  tipo: "image/png" | "image/jpeg";
  base64: string;
}

function convertirTexto(
  valor: string | string[] | undefined
): string {
  if (typeof valor === "string") {
    return valor;
  }

if (Array.isArray(valor)) {
    return valor.join("");
  }

return "";
}

function convertirValorATexto(valor: unknown): string {
  if (typeof valor === "string") {
    return valor;
  }

if (
    Array.isArray(valor) &&
    valor.every((elemento) => typeof elemento === "string")
  ) {
    return valor.join("");
  }

return "";
}

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function validarNotebook(valor: unknown): Notebook {
  if (
    !esObjeto(valor) ||
    typeof valor.nbformat !== "number" ||
    !Array.isArray(valor.cells)
  ) {
    throw new Error(
      "El archivo no tiene una estructura válida de Jupyter Notebook."
    );
  }

const celdasValidas = valor.cells.every((celda) => {
    if (!esObjeto(celda)) {
      return false;
    }

const sourceValido =
      celda.source === undefined ||
      typeof celda.source === "string" ||
      (Array.isArray(celda.source) &&
        celda.source.every(
          (linea) => typeof linea === "string"
        ));

const salidasValidas =
      celda.outputs === undefined ||
      (Array.isArray(celda.outputs) &&
        celda.outputs.every((salida) => {
          if (!esObjeto(salida)) {
            return false;
          }

const textoValido =
            salida.text === undefined ||
            typeof salida.text === "string" ||
            (Array.isArray(salida.text) &&
              salida.text.every(
                (linea) => typeof linea === "string"
              ));

const tracebackValido =
            salida.traceback === undefined ||
            (Array.isArray(salida.traceback) &&
              salida.traceback.every(
                (linea) => typeof linea === "string"
              ));

const datosValidos =
            salida.data === undefined ||
            (esObjeto(salida.data) &&
              Object.values(salida.data).every(
                (dato) =>
                  typeof dato === "string" ||
                  (Array.isArray(dato) &&
                    dato.every(
                      (elemento) =>
                        typeof elemento === "string"
                    ))
              ));

return (
            textoValido &&
            tracebackValido &&
            datosValidos
          );
        }));

return (
      typeof celda.cell_type === "string" &&
      sourceValido &&
      salidasValidas
    );
  });

if (!celdasValidas) {
    throw new Error(
      "El notebook contiene celdas con una estructura no válida."
    );
  }

return valor as unknown as Notebook;
}

function obtenerTextoSalida(
  salida: SalidaNotebook
): string {
  if (salida.output_type === "error") {
    return (
      convertirTexto(salida.traceback) ||
      `${salida.ename ?? "Error"}: ${salida.evalue ?? ""}`
    );
  }

if (salida.text !== undefined) {
    return convertirTexto(salida.text);
  }

const textoPlano = salida.data?.["text/plain"];

return convertirValorATexto(textoPlano);
}

function esBase64Valido(valor: string): boolean {
  const limpio = valor.replace(/\s/g, "");

  if (
    limpio.length === 0 ||
    limpio.length % 4 === 1
  ) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2,3})?$/.test(
    limpio
  );
}

function obtenerImagenSalida(
  salida: SalidaNotebook
): ImagenNotebook | null {
  if (!salida.data) {
    return null;
  }

const tiposImagen: Array<
    "image/png" | "image/jpeg"
  > = ["image/png", "image/jpeg"];

for (const tipo of tiposImagen) {
    const valor = salida.data[tipo];
    const base64 = convertirValorATexto(valor);

if (!base64) {
      continue;
    }

const base64Limpio = base64.replace(/\s/g, "");

if (!esBase64Valido(base64Limpio)) {
      continue;
    }

return {
      tipo,
      base64: base64Limpio,
    };
  }

return null;
}

function contieneDatosNoVisualizables(
  salida: SalidaNotebook
): boolean {
  if (!salida.data) {
    return false;
  }

return Object.keys(salida.data).some(
    (tipo) =>
      tipo !== "text/plain" &&
      tipo !== "image/png" &&
      tipo !== "image/jpeg"
  );
}

export default function VisorNotebook({
  archivo,
  nombre,
  onCerrar,
}: VisorNotebookProps) {
  const [notebook, setNotebook] = useState<Notebook | null>(
    null
  );
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

useEffect(() => {
    let activo = true;

const cargarNotebook = async () => {
      setCargando(true);
      setError("");
      setNotebook(null);

try {
        const contenido = await archivo.text();
        const datos: unknown = JSON.parse(contenido);
        const notebookValidado = validarNotebook(datos);

if (activo) {
          setNotebook(notebookValidado);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo leer el notebook."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

void cargarNotebook();

return () => {
      activo = false;
    };
  }, [archivo]);

return (
    <div
      className="visor-pdf-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizador de ${nombre}`}
    >
      <div className="visor-pdf-contenedor">
        <div className="visor-pdf-header">
          <div>
            <h3>
              <BookOpen
                size={18}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Visualizador de notebooks
            </h3>

<p>{nombre}</p>
          </div>

<button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar notebook"
          >
            <X size={22} />
          </button>
        </div>

<div className="visor-notebook-contenido">
          {cargando && (
            <p>Cargando notebook...</p>
          )}

{error && (
            <p
              role="alert"
              className="visor-notebook-error"
            >
              {error}
            </p>
          )}

{notebook && (
            <>
              <div className="visor-notebook-resumen">
                <strong>
                  {notebook.cells.length} celdas
                </strong>

<span>
                  Formato Jupyter {notebook.nbformat}
                </span>

<span>
                  Visualización de solo lectura
                </span>
              </div>

{notebook.cells.map((celda, indice) => {
                const esCodigo =
                  celda.cell_type === "code";

const esMarkdown =
                  celda.cell_type === "markdown";

const contenido = convertirTexto(
                  celda.source
                );

return (
                  <article
                    className="visor-notebook-celda"
                    key={indice}
                  >
                    <div className="visor-notebook-celda-header">
                      {esCodigo ? (
                        <Code2 size={17} />
                      ) : (
                        <FileText size={17} />
                      )}

<strong>
                        Celda {indice + 1} —{" "}
                        {esCodigo
                          ? "Código"
                          : esMarkdown
                            ? "Markdown"
                            : celda.cell_type}
                      </strong>

{esCodigo &&
                        celda.execution_count != null && (
                          <span>
                            Ejecución [
                            {celda.execution_count}]
                          </span>
                        )}
                    </div>

<pre className="visor-notebook-codigo">
                      <code>
                        {contenido || "Celda vacía"}
                      </code>
                    </pre>

{esCodigo &&
                      Array.isArray(celda.outputs) &&
                      celda.outputs.length > 0 && (
                        <div className="visor-notebook-salidas">
                          <strong>
                            Salidas guardadas
                          </strong>

{celda.outputs.map(
                            (salida, salidaIndice) => {
                              const texto =
                                obtenerTextoSalida(salida);

const imagen =
                                obtenerImagenSalida(salida);

const hayDatosNoVisualizables =
                                contieneDatosNoVisualizables(
                                  salida
                                );

return (
                                <div
                                  key={salidaIndice}
                                  className="visor-notebook-salida"
                                >
                                  {texto && (
                                    <pre>
                                      {texto}
                                    </pre>
                                  )}

{imagen && (
                                    <div className="visor-notebook-imagen-contenedor">
                                      <img
                                        className="visor-notebook-imagen"
                                        src={`data:${imagen.tipo};base64,${imagen.base64}`}
                                        alt={`Imagen generada en la salida ${
                                          salidaIndice + 1
                                        } de la celda ${
                                          indice + 1
                                        }`}
                                      />

<small>
                                        Imagen almacenada en el
                                        notebook:{" "}
                                        {imagen.tipo}
                                      </small>
                                    </div>
                                  )}

{!texto &&
                                    !imagen &&
                                    hayDatosNoVisualizables && (
                                      <p className="visor-notebook-salida-aviso">
                                        Esta salida contiene un
                                        formato no visualizado,
                                        como HTML, SVG u otro
                                        contenido embebido.
                                      </p>
                                    )}

{!texto &&
                                    !imagen &&
                                    !hayDatosNoVisualizables && (
                                      <p className="visor-notebook-salida-aviso">
                                        Salida sin contenido
                                        visualizable.
                                      </p>
                                    )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                  </article>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
