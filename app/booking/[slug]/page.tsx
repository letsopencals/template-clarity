'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { BOOKING_STEPS, STEP_LABELS, type BookingStep } from '@/lib/booking-constants';
import { HorizontalDayStrip } from '@/components/booking/horizontal-day-strip';
import { TimeSlots } from '@/components/booking/time-slots';
import { StaffSelector } from '@/components/booking/staff-selector';
import { LocationSelector } from '@/components/booking/location-selector';
import { AddOnsSelector } from '@/components/booking/addons-selector';
import { BookingSummary } from '@/components/booking/booking-summary';
import { DetailsStep } from '@/components/booking/details-step';
import { PaymentStep } from '@/components/booking/payment-step';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { useSettings } from '@/contexts/settings-context';

export default function BookingPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { currency } = useSettings();
	const flow = useBookingFlow(slug);

	if (flow.loading) {
		return (
			<div className="min-h-screen bg-[var(--color-bg)] pt-32 pb-20">
				<div className="mx-auto max-w-[1100px] px-6 lg:px-10">
					<div className="animate-pulse space-y-6">
						<div className="h-12 rounded-2xl bg-[var(--color-surface)]" />
						<div className="h-32 rounded-3xl bg-[var(--color-surface)]" />
						<div className="h-64 rounded-3xl bg-[var(--color-surface)]" />
					</div>
				</div>
			</div>
		);
	}

	if (flow.error && !flow.product) {
		return (
			<div className="min-h-screen bg-[var(--color-bg)] pt-32 pb-20">
				<div className="mx-auto max-w-[1100px] px-6 text-center lg:px-10">
					<p className="text-[var(--color-ink-muted)]">{flow.error}</p>
					<Link
						href="/services"
						className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
					>
						&larr; Back to Services
					</Link>
				</div>
			</div>
		);
	}

	if (!flow.product) return null;

	const variantLocations = flow.activeVariant?.locations ?? [];
	const variantLabel = flow.hasVariants ? (flow.activeVariant?.variantTitle ?? null) : null;
	const totalPrice =
		(flow.activeVariant?.price ?? flow.product.price) * flow.attendees + flow.addOnsTotal;
	const displayPrice = formatPrice(totalPrice, currency);

	const visibleSteps: BookingStep[] = BOOKING_STEPS.filter((s) => {
		if (s === 'who' && flow.whoSkipped) return false;
		if (s === 'extras' && flow.extrasSkipped) return false;
		if (s === 'questions' && flow.questionsSkipped) return false;
		return true;
	});

	const showSummary = flow.step === 'extras' || flow.step === 'questions' || flow.step === 'details' || flow.step === 'payment';

	const finalStaff = flow.staffForLocation.find((s) => s.id === flow.finalStaffId) ?? null;
	const selectedLocation = variantLocations.find((l) => l.id === flow.selectedLocationId) ?? null;

	return (
		<div className="min-h-screen bg-[var(--color-bg)] pt-24">
			{/* Sticky glass bar (offset below the fixed site header) */}
			<div className="sticky top-[72px] z-20 px-3 lg:px-6">
				<div className="glass-nav mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-full px-5 py-3 shadow-[0_8px_32px_-12px_rgba(18,48,63,0.2)]">
					<Link
						href="/services"
						className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-primary)]"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						<span className="hidden sm:inline">All services</span>
					</Link>
					<p className="truncate text-center text-sm font-semibold text-[var(--color-ink)]">{flow.product.title}</p>
					<span className="text-sm font-semibold text-[var(--color-primary)]">{displayPrice}</span>
				</div>
			</div>

			<div className="mx-auto max-w-[1200px] px-6 pt-10 pb-24 lg:px-10">
				{/* Progress header */}
				<StepProgress
					steps={visibleSteps}
					current={flow.step}
					completed={flow.stepCompleted}
					canEnter={flow.canEnter}
					onSelect={flow.goToStep}
				/>

				<div className={`mt-10 grid gap-10 ${showSummary ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
					<div className={`min-w-0 ${showSummary ? 'order-2 lg:order-1' : ''}`}>
						{/* Visit / location selector */}
						{variantLocations.length > 1 && (
							<div className="mb-6">
								<p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Choose a location</p>
								<LocationSelector
									locations={variantLocations}
									selected={flow.selectedLocationId}
									onSelect={flow.setSelectedLocationId}
								/>
							</div>
						)}

						{/* Variant pills */}
						{flow.hasVariants && flow.variants.length > 1 && (
							<div className="mb-6">
								<p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Choose an option</p>
								<div className="no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2">
									{flow.variants.map((v) => {
										const isActive = (flow.activeVariant?.id ?? flow.variants[0]?.id) === v.id;
										return (
											<button
												key={v.id}
												onClick={() => flow.setSelectedVariantId(v.id)}
												className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
													isActive
														? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
														: 'border-[var(--color-line-strong)] text-[var(--color-ink)] hover:border-[var(--color-primary)]/40'
												}`}
											>
												{v.variantTitle} · {formatPrice(v.price, currency)}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Error banner */}
						{flow.error && (
							<div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								<span>{flow.error}</span>
								<button onClick={() => flow.setError(null)} className="shrink-0 font-semibold underline">
									Dismiss
								</button>
							</div>
						)}

						<AnimatePresence mode="wait">
							{flow.step === 'when' && (
								<motion.div
									key="when"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
								>
									{flow.staffForLocation.length > 1 && (
										<div className="mb-6">
											<StaffSelector
												staffMembers={flow.staffForLocation}
												selected={flow.selectedStaffId}
												onSelect={flow.setSelectedStaffId}
											/>
										</div>
									)}

									<HorizontalDayStrip
										selectedDate={flow.selectedDate}
										onDateSelect={flow.setSelectedDate}
									/>

									<div className="mt-6">
										{flow.selectedDate ? (
											<TimeSlots
												slots={flow.slots}
												selectedSlot={flow.selectedSlot}
												onSlotSelect={flow.handleSlotSelect}
												loading={flow.slotsLoading}
												timezone={flow.timezone}
												staffMembers={flow.staffForLocation}
											/>
										) : (
											<p className="rounded-3xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface)] py-10 text-center text-sm text-[var(--color-ink-muted)]">
												Pick a day above to see open times.
											</p>
										)}
									</div>
								</motion.div>
							)}

							{flow.step === 'who' && flow.selectedSlot && (
								<motion.div
									key="who"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
								>
									<p className="mb-5 text-base text-[var(--color-ink-muted)]">
										Choose a clinician for your appointment.
									</p>
									<StaffSelector
										staffMembers={flow.slotStaff}
										selected={flow.confirmedStaffId}
										onSelect={flow.setConfirmedStaffId}
										hideLabel
									/>
								</motion.div>
							)}

							{flow.step === 'extras' && flow.selectedSlot && (
								<motion.div
									key="extras"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
									className="space-y-6"
								>
									<AddOnsSelector
										addOns={flow.availableAddOns}
										loading={flow.addOnsLoading}
										selected={flow.selectedAddOns}
										bookedDurationUnits={flow.bookedDurationUnits}
										currency={currency}
										onChange={flow.updateAddOnQuantity}
									/>

									<button
										onClick={flow.handleContinueFromExtras}
										className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-primary)] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)]"
									>
										{flow.selectedAddOns.size > 0 ? 'Continue' : 'Skip & continue'}
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</button>
								</motion.div>
							)}

							{flow.step === 'questions' && (
								<motion.div
									key="questions"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
								>
									<QuestionsForm
										questions={flow.questions}
										answers={flow.answers}
										setAnswers={flow.setAnswers}
										valid={flow.questionsValid}
										onContinue={flow.handleContinueFromQuestions}
									/>
								</motion.div>
							)}

							{flow.step === 'details' && (
								<motion.div
									key="details"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
								>
									<DetailsStep
										email={flow.email}
										firstName={flow.firstName}
										lastName={flow.lastName}
										customerId={flow.customerId}
										onChangeEmail={flow.setEmail}
										onChangeFirstName={flow.setFirstName}
										onChangeLastName={flow.setLastName}
										fieldErrors={flow.fieldErrors}
										submitting={flow.submitting}
										canSubmit={flow.detailsValid}
										onSubmit={flow.handleSubmitDetails}
									/>
								</motion.div>
							)}

							{flow.step === 'payment' && (
								<motion.div
									key="payment"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.25 }}
								>
									<PaymentStep
										providers={flow.providers}
										provider={flow.provider}
										paymentData={flow.paymentData}
										submitting={flow.submitting}
										isExpired={flow.isExpired}
										onSelectProvider={flow.handleSelectProvider}
										onStripeSuccess={(piId) => flow.handleSubmitCheckout(piId)}
										onStripeError={(msg) => flow.setError(msg)}
										onSubmitCash={() => flow.handleSubmitCheckout()}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Sticky glass summary panel */}
					{showSummary && (
						<aside className="order-1 lg:order-2">
							<div className="lg:sticky lg:top-28">
								{flow.selectedSlot ? (
									<BookingSummary
										product={flow.product}
										activeVariant={flow.activeVariant}
										variantLabel={variantLabel}
										staff={finalStaff}
										location={selectedLocation}
										selectedSlot={flow.selectedSlot}
										selectedDate={flow.selectedDate}
										availableAddOns={flow.availableAddOns}
										selectedAddOns={flow.selectedAddOns}
										bookedDurationUnits={flow.bookedDurationUnits}
										currency={currency}
										attendees={flow.attendees}
										formatCustom={flow.formatCustom}
										formatTimeRange={flow.formatTimeRange}
									/>
								) : (
									<div className="glass rounded-3xl px-5 py-8 text-center">
										<p className="text-sm font-semibold text-[var(--color-primary)]">Your appointment</p>
										<p className="mt-3 text-sm text-[var(--color-ink-dim)]">
											Your selections will appear here as you go.
										</p>
									</div>
								)}

								<div className="mt-4 flex items-baseline justify-between rounded-3xl border border-[var(--color-primary)]/20 bg-[var(--color-brass-soft)] px-5 py-4">
									<span className="text-sm font-semibold text-[var(--color-ink-muted)]">Total</span>
									<span className="heading-display text-2xl text-[var(--color-primary)]">{displayPrice}</span>
								</div>
							</div>
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}

function StepProgress({
	steps,
	current,
	completed,
	canEnter,
	onSelect,
}: {
	steps: BookingStep[];
	current: BookingStep;
	completed: Record<BookingStep, boolean>;
	canEnter: (s: BookingStep) => boolean;
	onSelect: (s: BookingStep) => void;
}) {
	const currentIndex = steps.indexOf(current);

	return (
		<ol className="no-scrollbar -mx-2 flex items-center gap-1 overflow-x-auto px-2">
			{steps.map((s, i) => {
				const isActive = s === current;
				const isDone = completed[s] && !isActive;
				const enabled = canEnter(s);
				const isPast = i < currentIndex;

				return (
					<li key={s} className="flex shrink-0 items-center">
						<button
							type="button"
							disabled={!enabled}
							onClick={() => onSelect(s)}
							className="group flex items-center gap-2.5 rounded-full py-1.5 pr-3 transition-opacity disabled:opacity-50"
						>
							<span
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
									isActive
										? 'bg-[var(--color-primary)] text-white'
										: isDone
											? 'bg-[var(--color-brass-soft)] text-[var(--color-primary)]'
											: 'bg-[var(--color-surface-2)] text-[var(--color-ink-dim)]'
								}`}
							>
								{isDone ? (
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								) : (
									i + 1
								)}
							</span>
							<span
								className={`whitespace-nowrap text-sm font-medium ${
									isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-dim)]'
								}`}
							>
								{STEP_LABELS[s]}
							</span>
						</button>
						{i < steps.length - 1 && (
							<span
								className={`mx-1 h-px w-6 shrink-0 ${
									isPast ? 'bg-[var(--color-primary)]/40' : 'bg-[var(--color-line-strong)]'
								}`}
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}

function QuestionsForm({
	questions,
	answers,
	setAnswers,
	valid,
	onContinue,
}: {
	questions: import('@opencals/storefront-sdk').CheckoutQuestionResponse[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	valid: boolean;
	onContinue: () => void;
}) {
	const ordered = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	return (
		<div className="space-y-6">
			<div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] card-shadow">
				<div className="border-b border-[var(--color-line)] px-6 py-5">
					<p className="text-base font-semibold text-[var(--color-ink)]">Before your visit</p>
					<p className="mt-1 text-sm text-[var(--color-ink-dim)]">A few details to help us prepare.</p>
				</div>
				<div className="space-y-5 px-6 py-6">
					{ordered.map((q) => {
						const translation = q.translations?.[0];
						const title = translation?.title ?? q.internalName;
						const description = translation?.description;
						const options = translation?.options;
						const value = answers[q.id] ?? '';
						return (
							<div key={q.id}>
								<label className="mb-1 block text-sm font-semibold text-[var(--color-ink)]">
									{title}
									{q.required && <span className="ml-1 text-[var(--color-primary)]">*</span>}
								</label>
								{description && <p className="mb-2 text-sm text-[var(--color-ink-dim)]">{description}</p>}
								{q.type === 'dropdown' && options ? (
									<select
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										className="w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-primary)]"
									>
										<option value="">Select…</option>
										{options.map((o) => (
											<option key={o} value={o}>{o}</option>
										))}
									</select>
								) : q.type === 'multi-line-text-field' ? (
									<textarea
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										rows={3}
										className="w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-primary)]"
									/>
								) : q.type === 'checkbox' ? (
									<label className="flex items-center gap-2.5">
										<input
											type="checkbox"
											checked={value === 'true'}
											onChange={(e) =>
												setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? 'true' : 'false' }))
											}
											className="h-4 w-4 accent-[var(--color-primary)]"
										/>
										<span className="text-sm text-[var(--color-ink)]">Yes</span>
									</label>
								) : (
									<input
										type="text"
										required={q.required}
										value={value}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										className="w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-primary)]"
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<button
				onClick={onContinue}
				disabled={!valid}
				className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-primary)] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-bright)] disabled:cursor-not-allowed disabled:opacity-40"
			>
				Continue
				<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>
			</button>
		</div>
	);
}
