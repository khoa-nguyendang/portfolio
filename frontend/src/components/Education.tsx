import { GraduationCap, Calendar } from 'lucide-react';
import { useTranslation } from '@/i18n';

const educationItems = [
  {
    degree: 'Master of Science in Artificial Intelligence',
    institution: 'The Ho Chi Minh City University of Science',
    period: '2022 - 2024',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    degree: 'Bachelor of Science in Computer Science',
    institution: 'The Ho Chi Minh City University of Science',
    period: '2011 - 2015',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    degree: 'Bachelor of Business Administration',
    institution: 'Van Hien University',
    period: '2009 - 2011',
    color: 'from-emerald-500 to-teal-500',
  },
];

export function Education() {
  const { t } = useTranslation();

  return (
    <section id="education" className="py-20 bg-bg" aria-labelledby="education-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="education-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">{t('education.title')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {educationItems.map((item) => (
            <div
              key={item.degree}
              className="bg-surface rounded-2xl p-6 card-hover border border-border/30"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text text-base mb-2">{item.degree}</h3>
              <p className="text-text-muted text-sm mb-3">{item.institution}</p>
              <div className="flex items-center gap-1.5 text-text-dim text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
