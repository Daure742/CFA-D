import { Link } from 'react-router-dom';

export default function RoleModulePage({
  eyebrow,
  title,
  description,
  backTo,
  backLabel,
  metrics = [],
  actions = [],
  items = [],
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p>
          </div>
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              {backLabel || 'Retour tableau de bord'}
            </Link>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-950">{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={
                action.primary
                  ? 'rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
                  : 'rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50'
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">Espace de travail</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <article key={item.title} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-950">{item.title}</h3>
                  {item.status && (
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
              </div>
              {item.action && item.to && (
                <Link
                  to={item.to}
                  className="inline-flex items-center justify-center rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  {item.action}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
