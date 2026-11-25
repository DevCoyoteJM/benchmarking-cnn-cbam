import { useState, useMemo } from "react";
import {
  AlertCircle,
  Copy,
  CopyCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import { modelos } from "../data/modelos";
import {
  CAMPOS_REPLICABLES_PERMITIDOS,
  replicarConfiguracionExperimentos,
  type CampoReplicable,
  type ResultadoModelo,
} from "../data/resultados";

export interface ModalReplicarConfiguracionProps {
  experimentos: ResultadoModelo[];
  experimentoOrigenDefecto?: ResultadoModelo;
  isOpen: boolean;
  onCerrar: () => void;
  onReplicar: (experimentosActualizados: ResultadoModelo[]) => void;
}

const NOMBRES_CAMPOS_REPLICABLES: Record<CampoReplicable, string> = {
  dataset: "Nombre del Dataset",
  versionDataset: "Versión / Procedencia Dataset",
  numeroMuestras: "Número de muestras (casos)",
  divisionDatos: "División de datos (Train/Val/Test)",
  preprocesamiento: "Técnicas de preprocesamiento",
  framework: "Framework de Deep Learning",
  versionFramework: "Versión del Framework",
  hardware: "Hardware de cómputo",
  semillaAleatoria: "Semilla aleatoria",
  aumentoDatos: "Aumento de datos (Augmentation)",
  regularizacion: "Regularización",
  observaciones: "Observaciones metodológicas",
};

export default function ModalReplicarConfiguracion({
  experimentos,
  experimentoOrigenDefecto,
  isOpen,
  onCerrar,
  onReplicar,
}: ModalReplicarConfiguracionProps) {
  // 1. Experimento origen seleccionado (por defecto el sugerido o el primero que tenga configuración)
  const [origenId, setOrigenId] = useState<string>(() => {
    if (experimentoOrigenDefecto) return experimentoOrigenDefecto.id;
    const conConfig = experimentos.find(
      (e) =>
        e.configuracion &&
        Object.keys(e.configuracion).some((k) =>
          CAMPOS_REPLICABLES_PERMITIDOS.includes(k as CampoReplicable)
        )
    );
    return conConfig?.id ?? experimentos[0]?.id ?? "";
  });

  const origen =
    experimentos.find((e) => e.id === origenId) ?? experimentos[0];

  const modeloOrigen = modelos.find((m) => m.id === origen?.modeloId);

  // 2. Extraer del origen solo los campos que tengan un valor definido y no vacío
  const camposDisponiblesEnOrigen = useMemo(() => {
    if (!origen?.configuracion) return [];
    return CAMPOS_REPLICABLES_PERMITIDOS.filter((campo) => {
      const val = (origen.configuracion as Record<string, unknown>)[campo];
      return val !== undefined && val !== null && val !== "";
    });
  }, [origen]);

  // 3. Campos seleccionados para copiar (por defecto todos los disponibles en el origen)
  const [camposSeleccionados, setCamposSeleccionados] = useState<
    CampoReplicable[]
  >(() => camposDisponiblesEnOrigen);

  // Sincronizar campos seleccionados al cambiar de origen
  const handleCambiarOrigen = (nuevoOrigenId: string) => {
    setOrigenId(nuevoOrigenId);
    const nuevoOrigen = experimentos.find((e) => e.id === nuevoOrigenId);
    if (!nuevoOrigen?.configuracion) {
      setCamposSeleccionados([]);
      return;
    }
    const disponibles = CAMPOS_REPLICABLES_PERMITIDOS.filter((campo) => {
      const val = (nuevoOrigen.configuracion as Record<string, unknown>)[campo];
      return val !== undefined && val !== null && val !== "";
    });
    setCamposSeleccionados(disponibles);
  };

  // 4. Experimentos destino seleccionados (por defecto todos los demás modelos)
  const [destinosIds, setDestinosIds] = useState<string[]>(() =>
    experimentos
      .filter((e) => e.id !== (origen?.id ?? ""))
      .map((e) => e.id)
  );

  // 5. Autorización explícita de sobrescritura (desactivada por defecto)
  const [permitirSobrescritura, setPermitirSobrescritura] = useState(false);

  // 6. Mensaje de error o advertencia en el modal
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Helper para alternar selección de un campo
  const alternarCampo = (campo: CampoReplicable) => {
    setCamposSeleccionados((actuales) =>
      actuales.includes(campo)
        ? actuales.filter((c) => c !== campo)
        : [...actuales, campo]
    );
  };

  // Helper para alternar destino
  const alternarDestino = (id: string) => {
    setDestinosIds((actuales) =>
      actuales.includes(id)
        ? actuales.filter((d) => d !== id)
        : [...actuales, id]
    );
  };

  // Destinos seleccionados como objetos completos
  const destinosSeleccionados = useMemo(
    () => experimentos.filter((e) => destinosIds.includes(e.id)),
    [experimentos, destinosIds]
  );

  // Cálculo de la vista previa usando la función pura
  const vistaPrevia = useMemo(() => {
    if (!origen || destinosSeleccionados.length === 0 || camposSeleccionados.length === 0) {
      return null;
    }

    return replicarConfiguracionExperimentos({
      origen,
      destinos: destinosSeleccionados,
      todosLosExperimentos: experimentos,
      opciones: {
        camposSeleccionados,
        permitirSobrescritura,
      },
    });
  }, [
    origen,
    destinosSeleccionados,
    experimentos,
    camposSeleccionados,
    permitirSobrescritura,
  ]);

  // Manejar la acción de aplicar la replicación
  const manejarAplicar = () => {
    setErrorValidacion(null);

    if (!origen?.configuracion) {
      setErrorValidacion(
        "El experimento de origen no contiene ninguna configuración registrada."
      );
      return;
    }

    if (destinosSeleccionados.length === 0) {
      setErrorValidacion(
        "Debe seleccionar al menos un experimento de destino para replicar."
      );
      return;
    }

    if (camposSeleccionados.length === 0) {
      setErrorValidacion(
        "Debe seleccionar al menos un campo común para replicar."
      );
      return;
    }

    const resultado = replicarConfiguracionExperimentos({
      origen,
      destinos: destinosSeleccionados,
      todosLosExperimentos: experimentos,
      opciones: {
        camposSeleccionados,
        permitirSobrescritura,
      },
    });

    if (!resultado.exito || !resultado.experimentosCompletos) {
      setErrorValidacion(
        resultado.error ?? "No se pudo completar la replicación de configuración."
      );
      return;
    }

    // Persistir todos los experimentos actualizados de forma unificada
    onReplicar(resultado.experimentosCompletos);
    onCerrar();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-replicar-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-replicar-titulo"
    >
      <div className="modal-replicar-container">
        {/* Cabecera */}
        <div className="modal-replicar-header">
          <div className="modal-replicar-titulo-area">
            <Copy size={20} color="#4f46e5" />
            <h3 id="modal-replicar-titulo">
              Copiar configuración entre experimentos
            </h3>
          </div>

          <button
            type="button"
            className="btn-cerrar-modal"
            onClick={onCerrar}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Advertencia metodológica */}
        <div className="nota-metodologica-replicar">
          <ShieldAlert size={18} color="#4f46e5" style={{ flexShrink: 0 }} />
          <p>
            <strong>Asistencia documental metodológica:</strong> Esta herramienta
            facilita transferir metadatos comunes predefinidos en el estudio (ej.
            dataset LIDC-IDRI, particiones, framework y hardware) para evitar
            reescritura manual. <em>No afirma ni asume</em> que las distintas
            arquitecturas hayan utilizado configuraciones idénticas. Los
            hiperparámetros específicos (learning rate, batch size, épocas,
            optimizador) y el estado de verificación deben validarse y
            registrarse individualmente.
          </p>
        </div>

        {errorValidacion && (
          <div className="alerta-error-replicar" role="alert">
            <AlertCircle size={16} />
            <span>{errorValidacion}</span>
          </div>
        )}

        <div className="modal-replicar-body">
          {/* 1. SELECCIÓN DE ORIGEN */}
          <div className="replicar-bloque">
            <label
              htmlFor="select-origen-replicacion"
              className="replicar-bloque-label"
            >
              1. Experimento de origen (fuente de datos)
            </label>
            <select
              id="select-origen-replicacion"
              className="campo-select"
              value={origenId}
              onChange={(e) => handleCambiarOrigen(e.target.value)}
            >
              {experimentos.map((exp) => {
                const nombre = modelos.find((m) => m.id === exp.modeloId)?.nombre;
                const tieneConfig =
                  exp.configuracion &&
                  Object.keys(exp.configuracion).some((k) =>
                    CAMPOS_REPLICABLES_PERMITIDOS.includes(k as CampoReplicable)
                  );
                return (
                  <option key={exp.id} value={exp.id}>
                    {nombre ?? exp.modeloId} — Versión {exp.version}{" "}
                    {tieneConfig ? "(Con configuración)" : "(Sin registrar)"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. SELECCIÓN DE DESTINOS */}
          <div className="replicar-bloque">
            <div className="replicar-bloque-header-line">
              <span className="replicar-bloque-label">
                2. Experimentos de destino ({destinosSeleccionados.length} seleccionados)
              </span>
              <div className="replicar-botones-auxiliares">
                <button
                  type="button"
                  className="btn-texto-auxiliar"
                  onClick={() =>
                    setDestinosIds(
                      experimentos
                        .filter((e) => e.id !== origenId)
                        .map((e) => e.id)
                    )
                  }
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  className="btn-texto-auxiliar"
                  onClick={() => setDestinosIds([])}
                >
                  Deseleccionar todos
                </button>
              </div>
            </div>

            <div className="destinos-checkboxes-grid">
              {experimentos
                .filter((exp) => exp.id !== origenId)
                .map((exp) => {
                  const nombre = modelos.find(
                    (m) => m.id === exp.modeloId
                  )?.nombre;
                  const seleccionado = destinosIds.includes(exp.id);
                  return (
                    <label
                      key={exp.id}
                      className={`checkbox-destino-item ${
                        seleccionado ? "seleccionado" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => alternarDestino(exp.id)}
                      />
                      <span>
                        <strong>{nombre ?? exp.modeloId}</strong> (v{exp.version})
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* 3. SELECCIÓN INDIVIDUAL DE CAMPOS */}
          <div className="replicar-bloque">
            <div className="replicar-bloque-header-line">
              <span className="replicar-bloque-label">
                3. Campos comunes a replicar ({camposSeleccionados.length} de{" "}
                {camposDisponiblesEnOrigen.length} disponibles en origen)
              </span>
              <div className="replicar-botones-auxiliares">
                <button
                  type="button"
                  className="btn-texto-auxiliar"
                  onClick={() =>
                    setCamposSeleccionados([...camposDisponiblesEnOrigen])
                  }
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  className="btn-texto-auxiliar"
                  onClick={() => setCamposSeleccionados([])}
                >
                  Deseleccionar todos
                </button>
              </div>
            </div>

            {camposDisponiblesEnOrigen.length === 0 ? (
              <p className="texto-aviso-vacio">
                El experimento de origen «{modeloOrigen?.nombre}» no tiene
                valores registrados en ninguno de los campos comunes permitidos.
              </p>
            ) : (
              <div className="campos-replicables-grid">
                {camposDisponiblesEnOrigen.map((campo) => {
                  const valor = (
                    origen?.configuracion as Record<string, unknown>
                  )[campo];
                  const marcado = camposSeleccionados.includes(campo);
                  return (
                    <label
                      key={campo}
                      className={`checkbox-campo-item ${
                        marcado ? "marcado" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternarCampo(campo)}
                      />
                      <div className="campo-item-info">
                        <strong>{NOMBRES_CAMPOS_REPLICABLES[campo]}</strong>
                        <span className="campo-item-valor">
                          {String(valor)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. AUTORIZACIÓN DE SOBRESCRITURA */}
          <div className="replicar-autorizacion-card">
            <label className="checkbox-autorizacion-label">
              <input
                type="checkbox"
                checked={permitirSobrescritura}
                onChange={(e) => setPermitirSobrescritura(e.target.checked)}
              />
              <div>
                <strong>
                  Autorizar explícitamente la sobrescritura de campos con información existente
                </strong>
                <p>
                  Si está desactivada, los campos que ya tengan un valor en el
                  destino serán preservados sin modificación.
                </p>
              </div>
            </label>
          </div>

          {/* 5. VISTA PREVIA DETALLADA */}
          {vistaPrevia && vistaPrevia.destinosActualizados.length > 0 && (
            <div className="replicar-bloque">
              <span className="replicar-bloque-label">
                5. Vista previa del impacto en los destinos
              </span>

              <div className="vista-previa-destinos-contenedor">
                {vistaPrevia.destinosActualizados.map((item) => {
                  const nombre = modelos.find(
                    (m) => m.id === item.experimentoActualizado.modeloId
                  )?.nombre;
                  const totalAcciones =
                    item.camposAgregados.length +
                    item.camposSobrescritos.length +
                    item.camposOmitidosPorExistir.length;

                  return (
                    <div key={item.experimentoActualizado.id} className="destino-preview-card">
                      <div className="destino-preview-card-header">
                        <strong>{nombre ?? item.experimentoActualizado.modeloId}</strong>
                        <span className="badge-preview-recuento">
                          {item.camposAgregados.length} nuevos /{" "}
                          {item.camposSobrescritos.length} sobrescritos /{" "}
                          {item.camposOmitidosPorExistir.length} preservados
                        </span>
                      </div>

                      {totalAcciones === 0 ? (
                        <p className="texto-aviso-vacio">
                          Sin cambios aplicables para este modelo.
                        </p>
                      ) : (
                        <table className="tabla-preview-cambios">
                          <thead>
                            <tr>
                              <th>Campo</th>
                              <th>Valor de origen</th>
                              <th>Acción en destino</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Campos agregados */}
                            {item.camposAgregados.map((c) => (
                              <tr key={c}>
                                <td>{NOMBRES_CAMPOS_REPLICABLES[c]}</td>
                                <td>
                                  {String(
                                    (origen?.configuracion as Record<string, unknown>)[c]
                                  )}
                                </td>
                                <td>
                                  <span className="badge-cambio badge-cambio-agregar">
                                    + Se agregará (estaba vacío)
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {/* Campos sobrescritos */}
                            {item.camposSobrescritos.map((c) => (
                              <tr key={c}>
                                <td>{NOMBRES_CAMPOS_REPLICABLES[c]}</td>
                                <td>
                                  {String(
                                    (origen?.configuracion as Record<string, unknown>)[c]
                                  )}
                                </td>
                                <td>
                                  <span className="badge-cambio badge-cambio-sobrescribir">
                                    ⚠ Sobrescribirá valor previo
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {/* Campos omitidos por existir */}
                            {item.camposOmitidosPorExistir.map((c) => (
                              <tr key={c}>
                                <td>{NOMBRES_CAMPOS_REPLICABLES[c]}</td>
                                <td>
                                  {String(
                                    (origen?.configuracion as Record<string, unknown>)[c]
                                  )}
                                </td>
                                <td>
                                  <span className="badge-cambio badge-cambio-omitido">
                                    ↷ Conservará valor previo
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pie de acciones */}
        <div className="modal-replicar-footer">
          <button
            type="button"
            className="btn-cancelar-formulario"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn-guardar-formulario"
            onClick={manejarAplicar}
            disabled={
              destinosSeleccionados.length === 0 ||
              camposSeleccionados.length === 0 ||
              camposDisponiblesEnOrigen.length === 0
            }
          >
            <CopyCheck size={16} />
            Aplicar replicación guiada
          </button>
        </div>
      </div>
    </div>
  );
}
