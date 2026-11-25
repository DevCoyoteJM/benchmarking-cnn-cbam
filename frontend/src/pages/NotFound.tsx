import { Link } from "react-router-dom";
import { AlertCircle, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="placeholder-page not-found-page">
      <div className="placeholder-icon not-found-icon">
        <AlertCircle size={32} />
      </div>
      <span className="eyebrow">ERROR 404 · RECURSO NO ENCONTRADO</span>
      <h2>Página no encontrada</h2>
      <p>
        La ruta solicitada no existe o fue trasladada dentro de la plataforma
        PulmoVision AI. Verifica el enlace o regresa al panel principal para
        continuar explorando la investigación.
      </p>
      <Link to="/" className="primary-button">
        <LayoutDashboard size={17} /> Volver al panel principal
      </Link>
    </div>
  );
}
