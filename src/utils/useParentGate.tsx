import React, { useCallback, useRef, useState } from 'react';
import ParentPinModal from '../components/ParentPinModal';
import { useAuth } from '../context/AuthContext';
import { isKidsAge } from './kidsMode';

/**
 * Wrap a sensitive action so a Kids-mode account (age 6–10 with a parent PIN
 * set) must enter the PIN first. Everyone else runs the action straight away.
 *
 *   const { gate, gateModal } = useParentGate();
 *   <Button onPress={() => gate(doSensitiveThing, 'Enter parent PIN to sign out')} />
 *   {gateModal}
 */
export function useParentGate() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState<string | undefined>();
  const pending = useRef<null | (() => void)>(null);

  const gate = useCallback((action: () => void, why?: string) => {
    if (isKidsAge(user?.age) && user?.parentPin) {
      pending.current = action;
      setDescription(why);
      setOpen(true);
    } else {
      action();
    }
  }, [user?.age, user?.parentPin]);

  const gateModal = (
    <ParentPinModal
      visible={open}
      mode="verify"
      title="Parent PIN"
      description={description}
      pin={user?.parentPin}
      onCancel={() => { pending.current = null; setOpen(false); }}
      onSuccess={() => { const run = pending.current; pending.current = null; setOpen(false); run?.(); }}
    />
  );

  return { gate, gateModal };
}
