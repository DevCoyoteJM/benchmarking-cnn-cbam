import { Download } from "lucide-react";
import type { ResultadoModelo } from "../data/resultados";

interface ExportarResultadosProps {
  experimentos: ResultadoModelo[];
}

export default function ExportarResultados({
  experimentos,
}: ExportarResultadosProps) {
  const exportarJSON = () => {
    if (experimentos.length === 0) {
      alert("No hay experimentos para exportar.");
      return;
    }

    const contenido = JSON.stringify(experimentos, null, 2);

    const archivo = new Blob([contenido], {
      type: "application/json",
    });

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `pulmovision_experimentos_${
      new Date().toISOString().split("T")[0]
    }.json`;

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);
  };

  return (
    <section className="selector-modelos">
      <div className="exportar-resultados-header">
        <div>
          <h3>Exportar experimentos</h3>

          <p>
            Descarga una copia de seguridad de los
            experimentos registrados en PulmoVision AI.
          </p>
        </div>

        <button
          type="button"
          className="btn-exportar-json"
          onClick={exportarJSON}
          disabled={experimentos.length === 0}
        >
          <Download size={18} />
          Exportar JSON
        </button>
      </div>

      <p className="exportar-resultados-info">
        Experimentos disponibles: {experimentos.length}
      </p>
    </section>
  );
}