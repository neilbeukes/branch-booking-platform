export type StepId = 'branch' | 'datetime' | 'details' | 'confirm';

export const STEPS: { id: StepId; label: string; heading: string }[] = [
    { id: 'branch', label: 'Branch', heading: 'Choose a branch' },
    { id: 'datetime', label: 'Date & time', heading: 'Select date and time' },
    { id: 'details', label: 'Your details', heading: 'Enter your details' },
    { id: 'confirm', label: 'Confirm', heading: 'Booking confirmed' },
  ];