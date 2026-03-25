import { useEffect, useState } from 'react';
import { Save, Loader2, RefreshCw, Lock } from 'lucide-react';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getSiteConfig, updateSiteConfig, changePassword, type SiteConfig } from '@/services/api';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email';
  placeholder: string;
  group: string;
}

const CONFIG_FIELDS: ConfigField[] = [
  {
    key: 'hero_title',
    label: 'Hero Title',
    type: 'text',
    placeholder: 'Your Name',
    group: 'Hero Section',
  },
  {
    key: 'hero_subtitle',
    label: 'Hero Subtitle',
    type: 'text',
    placeholder: 'Full Stack Developer',
    group: 'Hero Section',
  },
  {
    key: 'about_text',
    label: 'About Text',
    type: 'textarea',
    placeholder: 'Tell visitors about yourself...',
    group: 'About',
  },
  {
    key: 'contact_email',
    label: 'Contact Email',
    type: 'email',
    placeholder: 'you@example.com',
    group: 'Contact',
  },
  {
    key: 'github_url',
    label: 'GitHub URL',
    type: 'url',
    placeholder: 'https://github.com/username',
    group: 'Social Links',
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    group: 'Social Links',
  },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toasts, showToast, dismiss } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getSiteConfig();
      const configMap: Record<string, string> = {};
      data.forEach((c) => {
        configMap[c.key] = c.value;
      });
      setConfigs(configMap);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to load settings',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configArray: SiteConfig[] = Object.entries(configs).map(
        ([key, value]) => ({ key, value }),
      );
      await updateSiteConfig(configArray);
      showToast('success', 'Settings saved successfully');
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to save settings',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  };

  // Group fields by their group
  const groups = CONFIG_FIELDS.reduce<Record<string, ConfigField[]>>(
    (acc, field) => {
      if (!acc[field.group]) acc[field.group] = [];
      acc[field.group].push(field);
      return acc;
    },
    {},
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your site configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadConfigs}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            title="Reload"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Config groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div
            key={groupName}
            className="rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <div className="border-b border-gray-800 px-6 py-4">
              <h2 className="font-semibold text-white">{groupName}</h2>
            </div>
            <div className="space-y-5 p-6">
              {fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={field.key}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      value={configs[field.key] || ''}
                      onChange={(e) => updateConfig(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={5}
                    />
                  ) : (
                    <input
                      id={field.key}
                      type={field.type}
                      value={configs[field.key] || ''}
                      onChange={(e) => updateConfig(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <ChangePasswordSection showToast={showToast} />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function ChangePasswordSection({
  showToast,
}: {
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to update password',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 px-6 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <Lock className="h-4 w-4" />
          Change Password
        </h2>
      </div>
      <div className="space-y-5 p-6">
        <div>
          <label htmlFor="current_password">Current Password</label>
          <input
            id="current_password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label htmlFor="new_password">New Password</label>
          <input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <div>
          <label htmlFor="confirm_password">Confirm New Password</label>
          <input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </div>
        <button
          onClick={handleChangePassword}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
