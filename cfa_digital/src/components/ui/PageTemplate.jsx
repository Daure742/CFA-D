import { Link } from 'react-router-dom';

export function PageTemplate({
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  sections = [],
}) {
  const StatWrapper = ({ stat, children }) => {
    if (!stat.to) return children;

    return (
      <Link
        to={stat.to}
        className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {children}
      </Link>
    );
  };

  const SectionWrapper = ({ section, children }) => {
    if (!section.to) return children;

    return (
      <Link
        to={section.to}
        className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {children}
      </Link>
    );
  };

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-700">
            {eyebrow}
          </p>
        )}
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-950 md:text-4xl">{title}</h1>
          {description && <p className="mt-3 text-base leading-7 text-gray-600">{description}</p>}
        </div>
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.to}
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
      </div>

      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatWrapper key={stat.label} stat={stat}>
              <div className="h-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{stat.value}</p>
                  </div>
                  {stat.to && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Ouvrir
                    </span>
                  )}
                </div>
                {stat.helper && <p className="mt-3 text-sm leading-6 text-gray-600">{stat.helper}</p>}
              </div>
            </StatWrapper>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <SectionWrapper key={section.title} section={section}>
              <article className="h-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-950">{section.title}</h2>
                  {section.to && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      Acceder
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{section.text}</p>
              </article>
            </SectionWrapper>
          ))}
        </div>
      )}
    </section>
  );
}

export function WorkspacePage({ title, description, actions = [], metrics = [], tasks = [] }) {
  return (
    <PageTemplate
      eyebrow="Espace securise"
      title={title}
      description={description}
      actions={actions}
      stats={metrics}
      sections={tasks.map((task) => ({
        title: typeof task === 'string' ? task : task.title,
        text:
          typeof task === 'string'
            ? 'Module pret pour connecter les donnees API, afficher les listes et suivre les actions importantes.'
            : task.text,
        to: typeof task === 'string' ? undefined : task.to,
      }))}
    />
  );
}
