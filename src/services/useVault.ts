import { ref, watch } from 'vue';
import {
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';

let config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivvue',
  type: 'SecureStorage',
  deviceSecurityType: 'SystemPasscode',
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
const vaultExists = ref(false);
const vaultIsLocked = ref(false);

vault.onLock(() => {
  vaultIsLocked.value = true;
  session.value = undefined;
});

vault.onUnlock(() => (vaultIsLocked.value = false));

vault.isLocked().then(x => (vaultIsLocked.value = x));

const setLockType = (
  lockType: 'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined,
) => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

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
  vault.doesVaultExist().then(x => (vaultExists.value = x));

  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
    vaultExists.value = await vault.doesVaultExist();
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

  const clearVault = async () => {
    await vault.clear();
    lockType.value = 'NoLocking';
    session.value = undefined;
    vaultExists.value = await vault.doesVaultExist();
  };

  return {
    lockType,
    session,
    vaultExists,
    vaultIsLocked,

    lockVault,
    unlockVault,

    setSession,
    restoreSession,
    clearVault,
  };
}
