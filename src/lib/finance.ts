/**
 * Simulação de financiamento — ilustrativa.
 *
 * Usa a Tabela Price (parcelas fixas). A taxa padrão é um valor de exemplo
 * para o protótipo, NÃO uma oferta: a taxa real depende do banco, do perfil
 * do comprador, do prazo e da entrada.
 */
export const EXAMPLE_MONTHLY_RATE = 0.0199;

export const DEFAULT_TERM = 48;
export const TERM_OPTIONS = [12, 24, 36, 48, 60];
export const DEFAULT_DOWN_RATE = 0.3;

export interface Financing {
  financed: number;
  installment: number;
  total: number;
  interest: number;
}

/** Parcela fixa da Tabela Price: PMT = PV · i / (1 − (1+i)^−n). */
export const simulate = (
  price: number,
  downPayment: number,
  months: number,
  monthlyRate: number = EXAMPLE_MONTHLY_RATE,
): Financing => {
  const financed = Math.max(0, price - downPayment);
  if (financed === 0 || months <= 0) {
    return { financed: 0, installment: 0, total: downPayment, interest: 0 };
  }

  const installment =
    monthlyRate === 0
      ? financed / months
      : (financed * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  const total = installment * months + downPayment;
  return { financed, installment, total, interest: installment * months - financed };
};

/** Parcela de vitrine: entrada de 30% em 48 vezes. */
export const showcaseInstallment = (price: number) =>
  simulate(price, price * DEFAULT_DOWN_RATE, DEFAULT_TERM).installment;
