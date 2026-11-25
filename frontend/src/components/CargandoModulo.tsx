import { Loader2 } from "lucide-react";

interface CargandoModuloProps {
  mensaje?: string;
}

export default function CargandoModulo({
  mensaje = "Cargando módulo de investigación...",
}: CargandoModuloProps) {
  return (
    <div className="cargando-modulo-container" role="status" aria-live="polite">
      <div className="cargando-modulo-spinner">
        <Loader2 size={36} className="animate-spin text-purple" />
      </div>
      <p className="cargando-modulo-texto">{mensaje}</p>
      <span className="cargando-modulo-subtexto">PulmoVision AI · Entorno experimental</span>
    </div>
  );
}
