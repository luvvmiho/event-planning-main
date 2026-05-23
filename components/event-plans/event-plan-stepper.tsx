'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type EventPlanStepId = 'budget' | 'venue' | 'services' | 'checkout';

export type EventPlanStep = {
	id: EventPlanStepId;
	label: string;
	complete?: boolean;
};

type EventPlanStepperProps = {
	steps: EventPlanStep[];
	currentStep: EventPlanStepId;
	onStepChange: (step: EventPlanStepId) => void;
};

export const EventPlanStepper = ({ steps, currentStep, onStepChange }: EventPlanStepperProps) => (
	<nav
		aria-label='Төлөвлөгөөний алхам'
		className='rounded-xl border border-border bg-card p-4 md:p-5'
	>
		<ol className='flex w-full flex-col justify-around gap-4 md:flex-row md:items-start'>
			{steps.map((step, index) => {
				const isActive = step.id === currentStep;
				const isComplete = step.complete && !isActive;
				const isLast = index === steps.length - 1;

				return (
					<li key={step.id} className='flex min-w-0 flex-1 items-center'>
						<button
							type='button'
							onClick={() => onStepChange(step.id)}
							className={cn(
								'relative z-10 flex shrink-0 items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors',
								'hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
								isActive && 'px-3 py-2',
							)}
							aria-current={isActive ? 'step' : undefined}
						>
							<span
								className={cn(
									'flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
									isActive && 'border-primary bg-primary text-primary-foreground',
									isComplete && 'border-accent bg-accent text-accent-foreground',
									!isActive &&
										!isComplete &&
										'border-border bg-card text-muted-foreground',
								)}
							>
								{isComplete ? <Check className='size-4' aria-hidden /> : index + 1}
							</span>
							<span className='min-w-0'>
								<span
									className={cn(
										'block text-sm font-semibold',
										isActive ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{step.label}
								</span>
							</span>
						</button>

						{!isLast ? (
							<div className={cn('hidden min-w-0 flex-1 px-2 md:block')} aria-hidden>
								<div
									className={cn('h-0.5 w-full', isComplete ? 'bg-accent' : 'bg-border')}
								/>
							</div>
						) : null}
					</li>
				);
			})}
		</ol>
	</nav>
);
