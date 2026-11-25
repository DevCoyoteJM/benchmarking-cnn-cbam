import React from 'react';
import type { OrigenMetrica } from '../../types/interpretacion';

interface BadgeProcedenciaProps {
  origen: OrigenMetrica | 'referencia_3d';
  tamanoMuestra?: number;
  className?: string;
}

export const BadgeProcedencia: React.FC<BadgeProcedenciaProps> = ({
  origen,
  tamanoMuestra,
  className = '',
}) => {
  if (origen === 'referencia_3d') {
    return (
      <span
        className={`badge-procedencia badge-ref-3d ${className}`}
        title="Modelo tridimensional externo con acceso a contexto volumétrico inter-corte"
      >
        <span className="badge-dot dot-ref-3d" aria-hidden="true" />
        Ref. 3D Externa
      </span>
    );
  }

  if (origen === 'prueba_independiente') {
    return (
      <span
        className={`badge-procedencia badge-test ${className}`}
        title="Evaluación ciega sobre datos independientes nunca vistos en optimización"
      >
        <span className="badge-dot dot-test" aria-hidden="true" />
        {tamanoMuestra ? `Test ciego (N=${tamanoMuestra})` : 'Test ciego'}
      </span>
    );
  }

  if (origen === 'validacion') {
    return (
      <span
        className={`badge-procedencia badge-val ${className}`}
        title="Métricas de subconjunto de validación empleadas en Early Stopping y checkpoints"
      >
        <span className="badge-dot dot-val" aria-hidden="true" />
        Validación
      </span>
    );
  }

  return (
    <span
      className={`badge-procedencia badge-train ${className}`}
      title="Métricas de optimización por descenso de gradiente"
    >
      <span className="badge-dot dot-train" aria-hidden="true" />
      Entrenamiento
    </span>
  );
};

export default BadgeProcedencia;
