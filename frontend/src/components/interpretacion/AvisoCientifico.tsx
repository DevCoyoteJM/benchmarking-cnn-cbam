import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { SeveridadAdvertencia } from '../../types/interpretacion';

interface AvisoCientificoProps {
  titulo: string;
  descripcion: string;
  justificacion?: string;
  severidad?: SeveridadAdvertencia;
  idAdvertencia?: string;
  className?: string;
}

export const AvisoCientifico: React.FC<AvisoCientificoProps> = ({
  titulo,
  descripcion,
  justificacion,
  severidad = 'informativa',
  idAdvertencia,
  className = '',
}) => {
  const renderIcono = () => {
    switch (severidad) {
      case 'critica':
        return <ShieldAlert size={19} className="icono-aviso icono-critico" aria-hidden="true" />;
      case 'moderada':
        return <AlertTriangle size={19} className="icono-aviso icono-moderado" aria-hidden="true" />;
      default:
        return <Info size={19} className="icono-aviso icono-informativo" aria-hidden="true" />;
    }
  };

  return (
    <aside
      className={`aviso-cientifico-box aviso-${severidad} ${className}`}
      role="note"
      aria-label={titulo}
      data-testid={idAdvertencia ? `aviso-${idAdvertencia}` : 'aviso-cientifico'}
    >
      <div className="aviso-icono-col">{renderIcono()}</div>
      <div className="aviso-contenido">
        <div className="aviso-encabezado">
          {idAdvertencia && <span className="aviso-tag-id">{idAdvertencia}</span>}
          <strong className="aviso-titulo">{titulo}</strong>
        </div>
        <p className="aviso-descripcion">{descripcion}</p>
        {justificacion && (
          <div className="aviso-justificacion">
            <span className="justificacion-etiqueta">Rigor metodológico:</span> {justificacion}
          </div>
        )}
      </div>
    </aside>
  );
};

export default AvisoCientifico;
