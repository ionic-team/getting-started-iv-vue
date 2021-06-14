import { ref, watch } from 'vue';
import { Vault } from '@ionic-enterprise/identity-vault';

let config = {
  key: 'io.ionic.getstartedivvue',
  type: 'SecureStorage' as any,
  deviceSecurityType: 'SystemPasscode' as any,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

const vault: Vault = new Vault(config);

const lockType = ref<
  'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined
>();
const session = ref<string | null | undefined>();
const vaultIsLocked = ref(false);

vault.onLock(() => {
  vaultIsLocked.value = true;
  session.value = undefined;
});
vault.onUnlock(() => (vaultIsLocked.value = false));

const setLockType = (
  lockType: 'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined,
) => {
  let type: 'SecureStorage' | 'DeviceSecurity';
  let deviceSecurityType: 'SystemPasscode' | 'Biometrics';

  console.log('setting the lock type', lockType);

  if (lockType) {
    switch (lockType) {
      case 'Biometrics':
        type = 'DeviceSecurity';
        deviceSecurityType = 'Biometrics';
        break;

      case 'SystemPasscode':
        type = 'DeviceSecurity';
        deviceSecurityType = 'SystemPasscode';
        break;

      default:
        type = 'SecureStorage';
        deviceSecurityType = 'SystemPasscode';
    }

    config = {
      ...config,
      type,
      deviceSecurityType,
    };
    vault.updateConfig(config);
  }
};
watch(lockType, lock => setLockType(lock));

export default function useVault() {
  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
  };

  const restoreSession = async () => {
    const value = await vault.getValue(key);
    session.value = value;
  };

  const lockVault = () => {
    vault.lock();
  };
  const unlockVault = () => {
    vault.unlock();
  };

  return {
    lockType,
    session,
    vaultIsLocked,

    lockVault,
    unlockVault,

    setSession,
    restoreSession,
  };
}
