import { useState } from 'react';
import { Send, Mail, User, MessageSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { submitContact } from '@/services/api';

export function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('form.error.name');
    if (!formData.email.trim()) {
      newErrors.email = t('form.error.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.error.email.invalid');
    }
    if (!formData.subject.trim()) newErrors.subject = t('form.error.subject');
    if (!formData.message.trim()) newErrors.message = t('form.error.message');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    try {
      await submitContact(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (status === 'success' || status === 'error') {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.name')}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            id="contact-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-text text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors ${
              errors.name ? 'border-error' : 'border-border/30'
            }`}
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </div>
        {errors.name && (
          <p id="name-error" className="text-error text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-text text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors ${
              errors.email ? 'border-error' : 'border-border/30'
            }`}
            placeholder="john@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-error text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.subject')}
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            id="contact-subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-text text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors ${
              errors.subject ? 'border-error' : 'border-border/30'
            }`}
            placeholder="Project consultation"
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
          />
        </div>
        {errors.subject && (
          <p id="subject-error" className="text-error text-xs mt-1">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-text mb-1.5">
          {t('contact.message')}
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-dim" />
          <textarea
            id="contact-message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={5}
            className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-xl text-text text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors resize-none ${
              errors.message ? 'border-error' : 'border-border/30'
            }`}
            placeholder="Tell me about your project..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
        </div>
        {errors.message && (
          <p id="message-error" className="text-error text-xs mt-1">{errors.message}</p>
        )}
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 text-success text-sm" role="alert">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {t('contact.success')}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t('contact.error')}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('contact.sending')}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('contact.send')}
          </>
        )}
      </button>
    </form>
  );
}
