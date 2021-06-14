import { ref } from 'vue';
import { Vault } from '@ionic-enterprise/identity-vault';

const config = {
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

const session = ref<string | null | undefined>();

export default function useVault() {
  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
  };

  const restoreSession = async () => {
    const value = await vault.getValue(key);
    session.value = value;
  };

  return {
    session,

    setSession,
    restoreSession,
  };
}
