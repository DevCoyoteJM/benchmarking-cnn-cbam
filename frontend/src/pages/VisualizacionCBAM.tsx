import { useState } from 'react';
import { Microscope, Info, Layers } from 'lucide-react';
import { modelos } from '../data/modelos';
import GaleriaEvidencias from '../components/GaleriaEvidencias';

export default function VisualizacionCBAM() {
  // Selector de modelo para enfoque de correspondencia visual activa
  const [modeloEnfoqueId, setModeloEnfoqueId] = useState<string>('unet-cbam');

  const modeloEnfoque = modelos.find((m) => m.id === modeloEnfoqueId) || modelos[1];

  return (
    <div className="visualizacion-cbam-page" data-testid="pagina-visualizacion-cbam">
      {/* CABECERA PRINCIPAL DEL MÓDULO */}
      <header className="cbam-page-header">
        <div className="eyebrow">
          <Microscope size={16} />
          EVALUACIÓN VISUAL & ATENCIÓN · BENCHMARKING MULTIARQUITECTURA
        </div>
        <h2>Visualización CBAM</h2>
        <p className="cbam-header-descripcion">
          Exploración interactiva de evidencias visuales, mapas de interpretabilidad, evolución
          del entrenamiento y concordancia geométrica de área para las cuatro arquitecturas de
          aprendizaje profundo evaluadas en el trabajo de grado (U-Net, U-Net + CBAM, ModCBAM y TransUNet).
        </p>

        {/* NOTA METODOLÓGICA DE ALCANCE CIENTÍFICO */}
        <div className="cbam-aviso-metodologico" role="note">
          <Info size={18} className="icono-aviso-cbam" />
          <div className="aviso-cbam-texto">
            <strong>Alcance Científico y No Exclusividad CBAM:</strong>
            <p>
              Aunque este módulo lleva por título <em>Visualización CBAM</em> en concordancia con el
              objetivo central de la investigación, las ocho evidencias gráficas corresponden a
              evaluaciones comparativas simultáneas entre los cuatro modelos bajo condiciones de
              prueba homogéneas. Los mapas de saliencia (EV-06) y Grad-CAM (EV-07) son métodos
              post-hoc de interpretabilidad analizados sobre todas las redes, no mecanismos de
              atención nativos exclusivos de CBAM.
            </p>
          </div>
        </div>
      </header>

      {/* BARRA DE SELECCIÓN DE ENFOQUE DE MODELO ACTIVO */}
      <section className="cbam-selector-enfoque" aria-label="Selección de modelo para correspondencia visual">
        <div className="enfoque-barra-label">
          <Layers size={15} />
          <span>Resaltar correspondencia para:</span>
        </div>
        <div className="enfoque-botones-grupo" role="group" aria-label="Modelos para correspondencia visual">
          {modelos.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`btn-enfoque-modelo ${modeloEnfoqueId === m.id ? 'activo' : ''}`}
              onClick={() => setModeloEnfoqueId(m.id)}
            >
              <span className={`indicador-modelo-dot dot-${m.color}`} />
              <span>{m.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {/* GALERÍA DE EVIDENCIAS REORGANIZADA EN LAS 4 SUBSECCIONES */}
      <GaleriaEvidencias
        modeloActivoId={modeloEnfoque?.id}
        nombreModeloActivo={modeloEnfoque?.nombre}
        organizarPorSubsecciones={true}
      />
    </div>
  );
}
