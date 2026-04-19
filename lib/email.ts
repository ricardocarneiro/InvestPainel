import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  try {
    await transporter.sendMail({
      from: `InvestPainel <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
    return { sucesso: true }
  } catch (err) {
    console.error('Email error:', err)
    return { sucesso: false, erro: String(err) }
  }
}

export function emailConfirmacaoAgendamento(params: {
  clienteNome: string
  consultorNome: string
  dataHora: string
  local: string
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#191C1D">
      <div style="background:#002444;padding:32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.5rem">InvestPainel</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.06em">WEALTH MANAGEMENT</p>
      </div>
      <div style="background:#F8F9FA;padding:40px;border-radius:0 0 8px 8px">
        <h2 style="color:#002444;margin:0 0 8px">Agendamento Confirmado</h2>
        <p style="color:#43474E;margin:0 0 32px">Seu agendamento foi registrado com sucesso.</p>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:24px">
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CLIENTE</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.clienteNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CONSULTOR</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.consultorNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">DATA E HORA</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.dataHora}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">LOCAL</p>
          <p style="margin:0;font-size:1.125rem;font-weight:600;color:#191C1D">${params.local}</p>
        </div>
        <p style="color:#73777F;font-size:0.75rem;text-align:center;margin:0">InvestPainel © 2024 Wealth Management Solution</p>
      </div>
    </div>
  `
}

export function emailLembreteAgendamento(params: {
  clienteNome: string
  consultorNome: string
  dataHora: string
  local: string
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#191C1D">
      <div style="background:#002444;padding:32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.5rem">InvestPainel</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.06em">WEALTH MANAGEMENT</p>
      </div>
      <div style="background:#F8F9FA;padding:40px;border-radius:0 0 8px 8px">
        <h2 style="color:#002444;margin:0 0 8px">Lembrete: Reunião Amanhã</h2>
        <p style="color:#43474E;margin:0 0 32px">Você tem uma reunião agendada para amanhã.</p>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:24px">
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CLIENTE</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.clienteNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">DATA E HORA</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.dataHora}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">LOCAL</p>
          <p style="margin:0;font-size:1.125rem;font-weight:600;color:#191C1D">${params.local}</p>
        </div>
        <p style="color:#73777F;font-size:0.75rem;text-align:center;margin:0">InvestPainel © 2024 Wealth Management Solution</p>
      </div>
    </div>
  `
}

export function emailVencimentoContrato(params: {
  clienteNome: string
  produtoNome: string
  valorInvestido: string
  dataVencimento: string
  consultorEmail: string
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#191C1D">
      <div style="background:#002444;padding:32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.5rem">InvestPainel</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.06em">WEALTH MANAGEMENT</p>
      </div>
      <div style="background:#F8F9FA;padding:40px;border-radius:0 0 8px 8px">
        <h2 style="color:#755B00;margin:0 0 8px">⚠ Contrato Próximo do Vencimento</h2>
        <p style="color:#43474E;margin:0 0 32px">Um contrato vence em 30 dias. Considere entrar em contato com o cliente.</p>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:24px">
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CLIENTE</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.clienteNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">PRODUTO</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.produtoNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">VALOR INVESTIDO</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.valorInvestido}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">DATA DE VENCIMENTO</p>
          <p style="margin:0;font-size:1.125rem;font-weight:600;color:#755B00">${params.dataVencimento}</p>
        </div>
        <p style="color:#73777F;font-size:0.75rem;text-align:center;margin:0">InvestPainel © 2024 Wealth Management Solution</p>
      </div>
    </div>
  `
}

export function emailNovoCliente(params: { clienteNome: string; cpf: string; consultorNome: string }) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#191C1D">
      <div style="background:#002444;padding:32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.5rem">InvestPainel</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.06em">WEALTH MANAGEMENT</p>
      </div>
      <div style="background:#F8F9FA;padding:40px;border-radius:0 0 8px 8px">
        <h2 style="color:#002444;margin:0 0 8px">Novo Cliente Cadastrado</h2>
        <p style="color:#43474E;margin:0 0 32px">Um novo cliente foi adicionado à plataforma.</p>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:24px">
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">NOME</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.clienteNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CPF</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.cpf}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CONSULTOR RESPONSÁVEL</p>
          <p style="margin:0;font-size:1.125rem;font-weight:600;color:#191C1D">${params.consultorNome}</p>
        </div>
        <p style="color:#73777F;font-size:0.75rem;text-align:center;margin:0">InvestPainel © 2024 Wealth Management Solution</p>
      </div>
    </div>
  `
}

export function emailNovoContrato(params: {
  clienteNome: string
  produtoNome: string
  valorInvestido: string
  consultorNome: string
}) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#191C1D">
      <div style="background:#002444;padding:32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.5rem">InvestPainel</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.06em">WEALTH MANAGEMENT</p>
      </div>
      <div style="background:#F8F9FA;padding:40px;border-radius:0 0 8px 8px">
        <h2 style="color:#002444;margin:0 0 8px">Novo Contrato Criado</h2>
        <p style="color:#43474E;margin:0 0 32px">Um novo contrato de investimento foi registrado.</p>
        <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:24px">
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CLIENTE</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.clienteNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">PRODUTO</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#191C1D">${params.produtoNome}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">VALOR INVESTIDO</p>
          <p style="margin:0 0 24px;font-size:1.125rem;font-weight:600;color:#C9A84C">${params.valorInvestido}</p>
          <p style="margin:0 0 12px;color:#43474E;font-size:0.75rem;letter-spacing:0.06em">CONSULTOR</p>
          <p style="margin:0;font-size:1.125rem;font-weight:600;color:#191C1D">${params.consultorNome}</p>
        </div>
        <p style="color:#73777F;font-size:0.75rem;text-align:center;margin:0">InvestPainel © 2024 Wealth Management Solution</p>
      </div>
    </div>
  `
}
