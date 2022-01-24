import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref, watch } from 'vue';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivvue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};

const vault = Capacitor.getPlatform() === 'web' ? new BrowserVault(config) : new Vault(config);

const key = 'sessionData';
const lockType = ref<'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined>();
const session = ref<string | null | undefined>();
const vaultExists = ref(false);
const vaultIsLocked = ref(false);
const vaultType = ref();
const vaultDeviceSecurityType = ref();

vault.onLock(() => {
  vaultIsLocked.value = true;
  session.value = undefined;
});

vault.onUnlock(() => (vaultIsLocked.value = false));

vault.isLocked().then((x) => (vaultIsLocked.value = x));

const setLockType = async (lockType: 'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined) => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType | undefined;

  if (lockType) {
    switch (lockType) {
      case 'Biometrics':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Biometrics;
        break;

      case 'SystemPasscode':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      default:
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.None;
    }

    console.log('set config', type, deviceSecurityType);

    await vault.updateConfig({
      ...vault.config,
      type,
      deviceSecurityType,
    });

    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  }
};
watch(lockType, (lock) => setLockType(lock));

export default function useVault(): any {
  vault.isEmpty().then((x) => {
    vaultExists.value = !x;
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  });

  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
    vaultExists.value = !(await vault.isEmpty());
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  };

  const restoreSession = async () => {
    console.log('restore', vault.config.type, vault.config.deviceSecurityType);
    const value = await vault.getValue(key);
    session.value = value;
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  };

  const lockVault = () => {
    console.log('lock', vault.config.type, vault.config.deviceSecurityType);
    vault.lock();
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  };

  const unlockVault = () => {
    console.log('unlock', vault.config.type, vault.config.deviceSecurityType);
    vault.unlock();
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  };

  const clearVault = async () => {
    await vault.clear();
    session.value = undefined;
    vaultExists.value = !(await vault.isEmpty());
    vaultType.value = vault.config.type;
    vaultDeviceSecurityType.value = vault.config.deviceSecurityType;
  };

  return {
    lockType,
    session,
    vaultExists,
    vaultIsLocked,
    vaultType,
    vaultDeviceSecurityType,

    lockVault,
    unlockVault,

    setSession,
    restoreSession,
    clearVault,
  };
}
