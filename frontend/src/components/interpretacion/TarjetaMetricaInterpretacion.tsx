import React from 'react';
import BadgeProcedencia from './BadgeProcedencia';
import type { OrigenMetrica } from '../../types/interpretacion';

interface TarjetaMetricaInterpretacionProps {
  titulo: string;
  valor: number | string | null | undefined;
  formatoValor?: string;
  arquitectura: string;
  colorArquitectura?: string;
  etapa: 'E1' | 'E2';
  origen: OrigenMetrica | 'referencia_3d';
  tamanoMuestra?: number;
  esOptimo?: boolean;
  etiquetaOptimo?: string;
  descripcionCientifica?: string;
  className?: string;
}

export const TarjetaMetricaInterpretacion: React.FC<TarjetaMetricaInterpretacionProps> = ({
  titulo,
  valor,
  formatoValor,
  arquitectura,
  colorArquitectura = 'unet',
  etapa,
  origen,
  tamanoMuestra,
  esOptimo = false,
  etiquetaOptimo,
  descripcionCientifica,
  className = '',
}) => {
  const tieneValor = valor !== null && valor !== undefined;
  const textoValor = tieneValor
    ? formatoValor ?? (typeof valor === 'number' ? valor.toFixed(3) : String(valor))
    : 'No disponible';

  return (
    <article
      className={`tarjeta-metrica-interp ${esOptimo ? 'tarjeta-optimo' : ''} ${className}`}
      data-testid={`tarjeta-metrica-${titulo.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="tarjeta-top">
        <div className="tarjeta-arq-pill">
          <span className={`indicador-modelo-dot dot-${colorArquitectura}`} aria-hidden="true" />
          <span className="nombre-arq">{arquitectura}</span>
        </div>
        <BadgeProcedencia origen={origen} tamanoMuestra={tamanoMuestra} />
      </div>

      <div className="tarjeta-cuerpo">
        <span className="tarjeta-titulo-metrica">{titulo}</span>
        <div className="tarjeta-valor-fila">
          <strong className={`tarjeta-valor-num ${!tieneValor ? 'valor-ausente' : ''}`}>
            {textoValor}
          </strong>
          {esOptimo && etiquetaOptimo && (
            <span className="badge-lider-2d" title="Mejor resultado entre arquitecturas 2D">
              ★ {etiquetaOptimo}
            </span>
          )}
        </div>
        <span className="tarjeta-etapa-etiqueta">
          Etapa {etapa} · {etapa === 'E1' ? 'Segmentación' : 'Clasificación'}
        </span>
      </div>

      {descripcionCientifica && (
        <div className="tarjeta-pie">
          <p className="tarjeta-descripcion-texto">{descripcionCientifica}</p>
        </div>
      )}
    </article>
  );
};

export default TarjetaMetricaInterpretacion;
