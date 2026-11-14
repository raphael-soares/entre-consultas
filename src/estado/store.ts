import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  ACOMPANHAMENTOS,
  CADASTROS,
  ENCAMINHAMENTOS,
  RESPOSTAS,
  TRANSFERENCIAS,
  USUARIOS,
} from '@/dados/fixtures'
import { respostasDoAcompanhamento } from '@/dominio/evolucao'
import { HOJE } from '@/dominio/hoje'
import { resumoEncaminhamento } from '@/dominio/resumo'
import type {
  Acompanhamento,
  Canal,
  Contrarreferencia,
  Encaminhamento,
  Estressor,
  MotivoEncerramento,
  MotivoTransferencia,
  Periodicidade,
  Resposta,
  Transferencia,
  Usuario,
} from '@/dominio/tipos'

export const CHAVE_ARMAZENAMENTO = 'entre-consultas-demo-v1'

export type CanalPaciente = 'site' | 'whatsapp'

export interface Rascunho {
  itens: (number | null)[]
  estressores: Estressor[]
  outroEstressor?: string
}

export interface RespostaNova {
  itens: number[]
  estressores: Estressor[]
  outroEstressor?: string
}

interface Dados {
  respostas: Resposta[]
  acompanhamentos: Acompanhamento[]
  encaminhamentos: Encaminhamento[]
  transferencias: Transferencia[]
}

interface Estado extends Dados {
  sessao: { usuarioId: string } | null
  rascunhos: Partial<Record<CanalPaciente, Rascunho>>
  entrar: (cpf: string, senha: string) => Usuario | null
  sair: () => void
  entrarComo: (usuarioId: string) => void
  responder: (pacienteId: string, canal: Canal, resposta: RespostaNova) => void
  registrarPeloProfissional: (pacienteId: string, local: 'unidade' | 'visita', resposta: RespostaNova) => void
  abrirAcompanhamento: (dados: { pacienteId: string; periodicidade: Periodicidade; responsavelId: string }) => void
  encerrarAcompanhamento: (pacienteId: string, motivo: MotivoEncerramento, detalhe?: string) => void
  encaminhar: (dados: {
    pacienteId: string
    psiquiatraId: string
    motivo: string
    prejuizoFuncional: string
    tratamentos: string
  }) => void
  transferir: (dados: {
    tipo: Transferencia['tipo']
    pacienteId: string
    paraId: string
    motivo: MotivoTransferencia
    detalhe?: string
  }) => void
  marcarVisto: (encaminhamentoId: string) => void
  marcarConsulta: (encaminhamentoId: string, data: string) => void
  responderEncaminhamento: (encaminhamentoId: string, resposta: Omit<Contrarreferencia, 'data'>) => void
  definirRascunho: (canal: CanalPaciente, rascunho: Rascunho | undefined) => void
  reiniciar: () => void
}

function dadosIniciais(): Dados {
  return {
    respostas: structuredClone(RESPOSTAS),
    acompanhamentos: structuredClone(ACOMPANHAMENTOS),
    encaminhamentos: structuredClone(ENCAMINHAMENTOS),
    transferencias: structuredClone(TRANSFERENCIAS),
  }
}

const somenteDigitos = (texto: string) => texto.replace(/\D/g, '')

export function acompanhamentoAtivo(acompanhamentos: Acompanhamento[], pacienteId: string) {
  return acompanhamentos.find((a) => a.pacienteId === pacienteId && !a.encerramento)
}

export const useStore = create<Estado>()(
  persist(
    (set, get) => ({
      ...dadosIniciais(),
      sessao: null,
      rascunhos: {},

      entrar: (cpf, senha) => {
        const usuario = USUARIOS.find(
          (u) => u.cpf && somenteDigitos(u.cpf) === somenteDigitos(cpf) && u.senha === senha,
        )
        if (usuario) set({ sessao: { usuarioId: usuario.id } })
        return usuario ?? null
      },
      sair: () => set({ sessao: null }),
      entrarComo: (usuarioId) => set({ sessao: { usuarioId } }),

      responder: (pacienteId, canal, resposta) =>
        set((s) => ({
          respostas: [
            ...s.respostas,
            { id: crypto.randomUUID(), pacienteId, data: HOJE, canal, ...resposta },
          ],
        })),

      registrarPeloProfissional: (pacienteId, local, resposta) =>
        set((s) => ({
          respostas: [
            ...s.respostas,
            {
              id: crypto.randomUUID(),
              pacienteId,
              data: HOJE,
              canal: local,
              registradoPor: s.sessao?.usuarioId,
              ...resposta,
            },
          ],
        })),

      abrirAcompanhamento: ({ pacienteId, periodicidade, responsavelId }) =>
        set((s) => ({
          acompanhamentos: [
            ...s.acompanhamentos,
            { id: crypto.randomUUID(), pacienteId, inicio: HOJE, periodicidade, responsavelId },
          ],
        })),

      encerrarAcompanhamento: (pacienteId, motivo, detalhe) =>
        set((s) => ({
          acompanhamentos: s.acompanhamentos.map((a) =>
            a.pacienteId === pacienteId && !a.encerramento
              ? { ...a, encerramento: { data: HOJE, motivo, detalhe, porId: s.sessao!.usuarioId } }
              : a,
          ),
        })),

      encaminhar: (dados) => {
        const s = get()
        const acompanhamento = acompanhamentoAtivo(s.acompanhamentos, dados.pacienteId)!
        const cadastro = CADASTROS.find((c) => c.id === dados.pacienteId)!
        const respostas = respostasDoAcompanhamento(acompanhamento, s.respostas)
        set({
          encaminhamentos: [
            ...s.encaminhamentos.filter((e) => e.pacienteId !== dados.pacienteId),
            {
              id: dados.pacienteId,
              profissionalId: s.sessao!.usuarioId,
              data: HOJE,
              resumo: resumoEncaminhamento(cadastro, acompanhamento, respostas, HOJE),
              ...dados,
            },
          ],
        })
      },

      transferir: ({ tipo, pacienteId, paraId, motivo, detalhe }) => {
        const s = get()
        let deId: string
        let mudanca: Partial<Dados>
        if (tipo === 'acompanhamento') {
          const atual = acompanhamentoAtivo(s.acompanhamentos, pacienteId)!
          deId = atual.responsavelId
          mudanca = {
            acompanhamentos: s.acompanhamentos.map((a) => (a === atual ? { ...a, responsavelId: paraId } : a)),
          }
        } else {
          const atual = s.encaminhamentos.find((e) => e.pacienteId === pacienteId)!
          deId = atual.psiquiatraId
          mudanca = {
            encaminhamentos: s.encaminhamentos.map((e) => (e === atual ? { ...e, psiquiatraId: paraId } : e)),
          }
        }
        set({
          ...mudanca,
          transferencias: [
            ...s.transferencias,
            {
              id: crypto.randomUUID(),
              tipo,
              pacienteId,
              deId,
              paraId,
              motivo,
              detalhe,
              data: HOJE,
              porId: s.sessao!.usuarioId,
            },
          ],
        })
      },

      marcarVisto: (id) =>
        set((s) => ({
          encaminhamentos: s.encaminhamentos.map((e) => (e.id === id && !e.vistoEm ? { ...e, vistoEm: HOJE } : e)),
        })),

      marcarConsulta: (id, data) =>
        set((s) => ({
          encaminhamentos: s.encaminhamentos.map((e) => (e.id === id ? { ...e, consulta: { data, marcadaEm: HOJE } } : e)),
        })),

      responderEncaminhamento: (id, resposta) =>
        set((s) => ({
          encaminhamentos: s.encaminhamentos.map((e) =>
            e.id === id ? { ...e, contrarreferencia: { data: HOJE, ...resposta } } : e,
          ),
        })),

      definirRascunho: (canal, rascunho) => set((s) => ({ rascunhos: { ...s.rascunhos, [canal]: rascunho } })),

      reiniciar: () => set({ ...dadosIniciais(), rascunhos: {} }),
    }),
    {
      name: CHAVE_ARMAZENAMENTO,
      storage: createJSONStorage(() => localStorage),
      // Suba a versão quando os dados da demonstração mudarem: quem já abriu recebe os novos e continua logado.
      version: 2,
      migrate: (salvo) => ({ ...dadosIniciais(), sessao: (salvo as Partial<Estado>).sessao }),
      partialize: ({ respostas, acompanhamentos, encaminhamentos, transferencias, sessao }) => ({
        respostas,
        acompanhamentos,
        encaminhamentos,
        transferencias,
        sessao,
      }),
    },
  ),
)

export function useUsuarioLogado(): Usuario | null {
  const id = useStore((s) => s.sessao?.usuarioId)
  return USUARIOS.find((u) => u.id === id) ?? null
}
