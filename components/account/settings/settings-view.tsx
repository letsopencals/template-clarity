'use client';

import { useCallback } from 'react';
import { useProfile } from '@/components/account/use-profile';
import { FormSkeleton } from '@/components/account/skeletons';
import { LoadError } from '@/components/account/empty-state';
import { ProfileForm } from '@/components/account/settings/profile-form';
import { CommunicationPrefs } from '@/components/account/settings/communication-prefs';
import { PasswordForm } from '@/components/account/settings/password-form';

/** Profile, communication preferences and password. */
export function SettingsView() {
	const { profile, error, isLoading, mutate } = useProfile();
	const saved = useCallback(() => mutate(), [mutate]);

	return (
		<div className="space-y-6">
			<header className="max-w-2xl">
				<h2 className="display-sm text-ink">Settings</h2>
				<p className="mt-2 text-[15px] text-ink-muted">Your details, what we may send you, and how you sign in.</p>
			</header>
			{error && !profile ? <LoadError what="your details" onRetry={() => void mutate()} /> : null}
			{isLoading && !profile ? <FormSkeleton /> : null}
			{profile ? (
				<>
					<ProfileForm profile={profile} onSaved={saved} />
					<CommunicationPrefs />
					<PasswordForm email={profile.email} hasPassword={profile.isPasswordSet !== false} />
				</>
			) : null}
		</div>
	);
}
