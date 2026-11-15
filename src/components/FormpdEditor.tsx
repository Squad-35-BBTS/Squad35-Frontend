import {
  useEffect,
  useId,
  useState,
} from 'react'

import type { FormEvent } from 'react'

import { api } from '../lib/api'
import { DEMO_MODE } from '../lib/demo'

import {
  annualFields,
  technicalFields,
} from '../lib/formpdFields'

import type {
  Field,
  Preparation,
  Primitive,
  Values,
} from '../lib/formpdFields'

type ExpenseRef = {
  id_dispendio: number
  descricao: string
}

type PersonRef = {
  colaborador_id: string
  colaborador_nome?: string
}

type Row = Record<string, Primitive>

type Props = {
  year?: string
  projectId?: number
  manager?: boolean
  technicalOnly?: boolean
  expenses?: ExpenseRef[]
  people?: PersonRef[]
  onSaved?: () => void
}

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível salvar a preparação.'

function Fields({
  fields,
  values,
  change,
  prefix,
}: {
  fields: Field[]
  values: Values
  change: (
    name: string,
    value: Primitive,
  ) => void
  prefix: string
}) {
  return (
    <div className="form-grid">
      {fields.map(field => {
        const id =
          `${prefix}-${field.name}`

        const value =
          values[field.name]

        const description =
          field.maxLength
            ? `${id}-count`
            : undefined

        return (
          <label
            className={
              field.type === 'textarea'
                ? 'full'
                : ''
            }
            key={field.name}
            htmlFor={id}
          >
            {field.label}

            {field.type === 'textarea' ? (
              <textarea
                id={id}
                name={field.name}
                aria-describedby={description}
                value={String(value ?? '')}
                maxLength={field.maxLength}
                onChange={event =>
                  change(
                    field.name,
                    event.target.value || null,
                  )
                }
              />
            ) : field.type === 'boolean' ||
              field.type === 'option' ? (
              <select
                id={id}
                name={field.name}
                value={
                  value === true
                    ? 'true'
                    : value === false
                      ? 'false'
                      : String(value ?? '')
                }
                onChange={event =>
                  change(
                    field.name,
                    event.target.value === ''
                      ? null
                      : field.type === 'boolean'
                        ? event.target.value === 'true'
                        : event.target.value,
                  )
                }
              >
                <option value="">
                  Não informado
                </option>

                {field.type === 'boolean' ? (
                  <>
                    <option value="true">
                      Sim
                    </option>

                    <option value="false">
                      Não
                    </option>
                  </>
                ) : (
                  <>
                    <option>
                      Aplicável
                    </option>

                    <option>
                      Não aplicável
                    </option>
                  </>
                )}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                aria-describedby={description}
                type={field.type || 'text'}
                value={String(value ?? '')}
                min={
                  field.name ===
                  'trl_final_ano_base_confirmado'
                    ? 1
                    : 0
                }
                max={
                  field.max ??
                  (
                    field.type === 'number'
                      ? 999999999999.99
                      : undefined
                  )
                }
                step={field.step}
                maxLength={field.maxLength}
                onChange={event =>
                  change(
                    field.name,
                    event.target.value || null,
                  )
                }
              />
            )}

            {field.maxLength && (
              <small
                id={`${id}-count`}
                aria-hidden="true"
                className="muted"
              >
                {String(value ?? '').length}
                {' / '}
                {field.maxLength}
                {' caracteres'}
              </small>
            )}
          </label>
        )
      })}
    </div>
  )
}

export default function FormpdEditor({
  year,
  projectId,
  manager = false,
  technicalOnly = false,
  expenses = [],
  people = [],
  onSaved,
}: Props) {
  const prefix = useId()

  const [retry, setRetry] =
    useState(0)

  const path = projectId
    ? `/iniciativas/${projectId}/formpd`
    : `/relatorios/formpd/${year}/preparacao`

  const key = `${path}:${retry}`

  const [result, setResult] = useState<{
    key: string
    item: Preparation | null
    error: string
  }>({
    key: '',
    item: null,
    error: '',
  })

  const [draft, setDraft] = useState<
    Record<string, unknown>
  >({})

  const [dirty, setDirty] =
    useState(false)

  const [busy, setBusy] =
    useState(false)

  const [feedback, setFeedback] =
    useState({
      error: '',
      success: '',
    })

  useEffect(() => {
    let active = true

    if (DEMO_MODE) return

    api<Preparation>(path)
      .then(item => {
        if (active) {
          setResult({
            key,
            item,
            error: '',
          })

          setDraft(item.dados)
          setDirty(false)

          setFeedback({
            error: '',
            success: '',
          })
        }
      })
      .catch(error => {
        if (active) {
          setResult({
            key,
            item: null,
            error: message(error),
          })
        }
      })

    return () => {
      active = false
    }
  }, [path, key])

  useEffect(() => {
    if (!dirty && !busy) return

    function unload(
      event: BeforeUnloadEvent,
    ) {
      event.preventDefault()
      event.returnValue = ''
    }

    function navigate(event: Event) {
      if (
        busy ||
        !window.confirm(
          'Existem alterações não salvas. Deseja sair e descartá-las?',
        )
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener(
      'beforeunload',
      unload,
    )

    window.addEventListener(
      'sgalb:before-navigate',
      navigate,
    )

    return () => {
      window.removeEventListener(
        'beforeunload',
        unload,
      )

      window.removeEventListener(
        'sgalb:before-navigate',
        navigate,
      )
    }
  }, [dirty, busy])

  const fields = projectId
    ? technicalFields
    : annualFields.filter(
        field =>
          manager ||
          field.name !==
            'modelo_referencia_conferido',
      )

  function change(
    name: string,
    value: unknown,
  ) {
    setDraft(current => ({
      ...current,
      [name]: value,
    }))

    setDirty(true)

    setFeedback({
      error: '',
      success: '',
    })
  }

  function changeRow(
    collection: string,
    idName: string,
    id: Primitive,
    name: string,
    value: Primitive,
  ) {
    const rows =
      (
        draft[collection] as
          | Row[]
          | undefined
      ) || []

    const row =
      rows.find(
        item => item[idName] === id,
      ) || {
        [idName]: id,
      }

    change(
      collection,
      [
        ...rows.filter(
          item => item[idName] !== id,
        ),
        {
          ...row,
          [name]: value,
        },
      ],
    )
  }

  async function save(
    event: FormEvent,
  ) {
    event.preventDefault()

    if (!result.item) return

    setBusy(true)

    setFeedback({
      error: '',
      success: '',
    })

    try {
      const keys = fields.map(
        field => field.name,
      )

      if (
        projectId &&
        !technicalOnly
      ) {
        keys.push(
          'rubricas',
          'profissionais',
        )
      }

      const dados =
        Object.fromEntries(
          Object.entries(draft).filter(
            ([campo]) =>
              keys.includes(campo),
          ),
        )

      const item =
        await api<Preparation>(
          path,
          'PUT',
          {
            revisao:
              result.item.revisao,
            dados,
          },
        )

      setResult({
        key,
        item,
        error: '',
      })

      setDraft(item.dados)
      setDirty(false)

      setFeedback({
        error: '',
        success:
          'Preparação salva. O histórico e o dossiê foram atualizados.',
      })

      onSaved?.()
    } catch (error) {
      setFeedback({
        error: message(error),
        success: '',
      })
    } finally {
      setBusy(false)
    }
  }

  if (DEMO_MODE) {
    return (
      <p className="notice">
        O preenchimento exige uma sessão real.
        A demonstração permanece somente
        para visualização.
      </p>
    )
  }

  if (result.key !== key) {
    return (
      <p role="status">
        Carregando formulário de preparação…
      </p>
    )
  }

  if (!result.item) {
    return (
      <div>
        <p
          className="notice error"
          role="alert"
        >
          {result.error}
        </p>

        <button
          onClick={() =>
            setRetry(value => value + 1)
          }
        >
          Recarregar formulário
        </button>
      </div>
    )
  }

  const item = result.item

  const uniquePeople = [
    ...new Map(
      people.map(person => [
        person.colaborador_id,
        person,
      ]),
    ).values(),
  ]

  return (
    <form
      onSubmit={event => void save(event)}
      className="formpd-editor"
      aria-label={
        projectId
          ? 'Complementação do projeto'
          : 'Dados anuais da empresa'
      }
    >
      <p className="muted">
        Ano-base {year || item.ano_base}
        {' · '}
        Revisão {item.revisao}.
        {' '}
        Você pode salvar o rascunho com
        campos pendentes. Valores monetários
        usam ponto decimal.
      </p>

      {item.fechado && (
        <p className="notice">
          Dossiê fechado. Solicite a reabertura
          ao gestor para alterar a preparação.
        </p>
      )}

      <fieldset
        disabled={busy || item.fechado}
      >
        <legend>
          {projectId
            ? 'Dados técnicos para o FORMP&D'
            : 'Empresa e informações do exercício'}
        </legend>

        <Fields
          fields={fields}
          values={draft as Values}
          change={change}
          prefix={prefix}
        />

        {projectId && !technicalOnly && (
          <>
            <h3>
              Rubricas e financiamento dos dispêndios
            </h3>

            <p className="muted">
              Use a rubrica conferida com o responsável.
              O preenchimento não declara automaticamente
              a elegibilidade do gasto.
            </p>

            {!expenses.length && (
              <p>
                Nenhum dispêndio cadastrado
                neste exercício.
              </p>
            )}

            {expenses.map(expense => (
              <fieldset
                key={expense.id_dispendio}
              >
                <legend>
                  #{expense.id_dispendio}
                  {' — '}
                  {expense.descricao}
                </legend>

                <Fields
                  prefix={
                    `${prefix}-d${expense.id_dispendio}`
                  }
                  fields={[
                    {
                      name: 'rubrica',
                      label: 'Rubrica conferida',
                      maxLength: 191,
                    },
                    {
                      name: 'fonte_financiamento',
                      label: 'Fonte de financiamento',
                      maxLength: 191,
                    },
                  ]}
                  values={
                    (
                      (
                        draft.rubricas as
                          | Row[]
                          | undefined
                      ) || []
                    ).find(
                      row =>
                        row.id_dispendio ===
                        expense.id_dispendio,
                    ) || {}
                  }
                  change={(name, value) =>
                    changeRow(
                      'rubricas',
                      'id_dispendio',
                      expense.id_dispendio,
                      name,
                      value,
                    )
                  }
                />
              </fieldset>
            ))}

            <h3>
              Complementação dos profissionais
            </h3>

            <p className="muted">
              As horas e os custos dos lançamentos
              continuam no financeiro. Jornada e
              remuneração anuais abaixo são informações
              declaradas por profissional e não são
              somadas entre projetos.
            </p>

            {!uniquePeople.length && (
              <p>
                Nenhum profissional nos timesheets
                deste exercício.
              </p>
            )}

            {uniquePeople.map(person => (
              <fieldset
                key={person.colaborador_id}
              >
                <legend>
                  {person.colaborador_nome ||
                    person.colaborador_id}
                  {' · '}
                  {person.colaborador_id}
                </legend>

                <Fields
                  prefix={
                    `${prefix}-p${encodeURIComponent(
                      person.colaborador_id,
                    )}`
                  }
                  fields={[
                    {
                      name: 'cpf',
                      label: 'CPF do profissional',
                      maxLength: 14,
                    },
                    {
                      name: 'sexo',
                      label: 'Sexo (conforme cadastro)',
                      maxLength: 50,
                    },
                    {
                      name: 'titulacao',
                      label: 'Titulação',
                      maxLength: 191,
                    },
                    {
                      name: 'funcao_projeto_formpd',
                      label: 'Função no projeto',
                      maxLength: 191,
                    },
                    {
                      name: 'horas_trabalhadas_ano_profissional',
                      label: 'Jornada total anual (horas)',
                      type: 'number',
                      max: 8784,
                      step: '0.01',
                    },
                    {
                      name: 'valor_total_pago_profissional',
                      label: 'Remuneração total anual (R$)',
                      type: 'number',
                      step: '0.01',
                    },
                    {
                      name: 'dedicacao_formpd',
                      label: 'Dedicação no exercício',
                      maxLength: 191,
                    },
                  ]}
                  values={
                    (
                      (
                        draft.profissionais as
                          | Row[]
                          | undefined
                      ) || []
                    ).find(
                      row =>
                        row.colaborador_id ===
                        person.colaborador_id,
                    ) || {}
                  }
                  change={(name, value) =>
                    changeRow(
                      'profissionais',
                      'colaborador_id',
                      person.colaborador_id,
                      name,
                      value,
                    )
                  }
                />
              </fieldset>
            ))}
          </>
        )}
      </fieldset>

      {dirty && (
        <p
          className="notice"
          role="status"
        >
          Há alterações ainda não salvas.
        </p>
      )}

      {feedback.error && (
        <p
          className="notice error"
          role="alert"
        >
          {feedback.error}
        </p>
      )}

      {feedback.success && (
        <p
          className="notice success"
          role="status"
        >
          {feedback.success}
        </p>
      )}

      <div className="actions">
        <button
          type="submit"
          className="primary"
          disabled={
            busy ||
            item.fechado ||
            !dirty
          }
        >
          {busy
            ? 'Salvando…'
            : 'Salvar preparação'}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const podeRecarregar =
              !dirty ||
              window.confirm(
                'Descartar o rascunho e carregar os dados salvos?',
              )

            if (podeRecarregar) {
              setDirty(false)
              setRetry(value => value + 1)
            }
          }}
        >
          Recarregar formulário
        </button>
      </div>
    </form>
  )
}