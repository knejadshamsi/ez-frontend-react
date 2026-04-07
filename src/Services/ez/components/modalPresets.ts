import type { EZFeedbackModalAction } from './types';

type TFunction = (key: string, options?: Record<string, unknown>) => string;
type PresetBuilder = (onClick?: () => void | Promise<void>) => EZFeedbackModalAction;

export function createModalPresets(t: TFunction) {
  const p = (key: string, style: Partial<EZFeedbackModalAction> = {}): PresetBuilder =>
    (onClick) => ({ label: t(`ez-components:presets.${key}`), ...style, onClick });

  return {
    // Close-only (default style, autoDestroy: true)
    cancel:  p('cancel'),
    keep:    p('keep'),
    dismiss: p('dismiss'),
    ok:      p('ok'),

    // Destructive (danger, autoDestroy: true)
    exit:          p('exit',          { danger: true }),
    confirm:       p('confirm',       { danger: true }),
    discard:       p('discard',       { danger: true }),
    cancelAndExit: p('cancelAndExit', { danger: true }),

    // Positive (highlight, autoDestroy: true)
    saveDraftAndExit: p('saveDraftAndExit', { highlight: true }),
    switchToDemo:     p('switchToDemo',     { highlight: true }),
    editParameters:   p('editParameters',   { highlight: true }),
    startFresh:       p('startFresh',       { highlight: true }),
    keepInputs:       p('keepInputs',       { highlight: true }),

    // Neutral with action (default style)
    copyRequestId: p('copyId', { autoDestroy: false }),
    copyAndExit:   p('copyAndExit'),
  };
}
