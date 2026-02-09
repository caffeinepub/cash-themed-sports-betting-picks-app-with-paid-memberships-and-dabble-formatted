const TERMS_ACCEPTANCE_KEY = 'cashpicks_terms_accepted';

export interface TermsAcceptance {
  accepted: boolean;
  acceptedAt?: number;
}

export function getTermsAcceptance(): TermsAcceptance {
  try {
    const stored = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    if (!stored) {
      return { accepted: false };
    }
    return JSON.parse(stored) as TermsAcceptance;
  } catch (error) {
    console.error('Error reading terms acceptance:', error);
    return { accepted: false };
  }
}

export function setTermsAcceptance(): void {
  try {
    const acceptance: TermsAcceptance = {
      accepted: true,
      acceptedAt: Date.now(),
    };
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, JSON.stringify(acceptance));
  } catch (error) {
    console.error('Error saving terms acceptance:', error);
  }
}

export function clearTermsAcceptance(): void {
  try {
    localStorage.removeItem(TERMS_ACCEPTANCE_KEY);
  } catch (error) {
    console.error('Error clearing terms acceptance:', error);
  }
}
