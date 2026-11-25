import { type ComponentType } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Microscope } from "lucide-react";

interface PlaceholderModuloProps {
  titulo: string;
  descripcion?: string;
  icono?: ComponentType<{ size?: number; className?: string }>;
}

export default function PlaceholderModulo({
  titulo,
  descripcion = "Esta sección está preparada para su siguiente fase de desarrollo. Aquí integraremos las imágenes, métricas o visualizaciones generadas por los modelos.",
  icono: Icono = Microscope,
}: PlaceholderModuloProps) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Icono size={30} />
      </div>
      <span className="eyebrow">MÓDULO DE INVESTIGACIÓN</span>
      <h2>{titulo}</h2>
      <p>{descripcion}</p>
      <Link to="/" className="primary-button">
        <LayoutDashboard size={17} /> Volver al panel principal
      </Link>
    </div>
  );
}
