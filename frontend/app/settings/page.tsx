'use client';

import { useSettings } from '@/lib/SettingsContext';
import { Switch } from '@headlessui/react';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  const handleToggle = (value: boolean) => {
    setSettings({ showProfanity: value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize your experience on the platform.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Content Filtering</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose whether to display or mask potentially profane language.
                </p>
              </div>
              <Switch
                checked={settings.showProfanity}
                onChange={handleToggle}
                className={`${
                  settings.showProfanity ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.showProfanity ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}