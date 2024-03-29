# Getting Started with Identity Vault in @ionic/vue

In this tutorial we will walk through the basic setup and use of Ionic's Identity Vault in an `@ionic/vue` application.

:::note
The source code for the Ionic application created in this tutorial can be found [here](https://github.com/ionic-team/getting-started-iv-vue)
:::

The most common use case of Identity Vault is to connect to a back end service and store user session data. For the purpose of this tutorial, the application we build will not connect to an actual service. Instead, the application will store information that the user enters.

The work done in this tutorial will be concentrated on a couple of files:

- `src/composables/vault.ts`: A composition API function that abstracts the logic associated with using Identity Vault. The functions and reactive variable exported here model what might be done in a real application.

- `src/views/HomePage.vue`: The main view will have several form controls that allow the user to manipulate the vault. An application would not typically do this. Rather, it would call the methods from `useVault()` within various workflows. In this "getting started" demo application, however, this allows us to easily play around with the various Identity Vault APIs to see how they behave.

## Generate the Application

The first step to take is to generate our application:

```bash
ionic start getting-started-iv-vue blank --type=vue
```

Now that the application has been generated let's add the iOS and Android platforms.

Open the `capacitor.config.ts` file and change the `appId` to something unique like `io.ionic.gettingstartedivvue`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedivvue',
  appName: 'getting-started-iv-vue',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
```

Next, build the application and install and create the platforms:

```bash
npm run build
ionic cap add android
ionic cap add ios
```

Finally, in order to ensure that the web application bundle is copied over each build, add `cap copy` to the `build` script in the `package.json` file:

```json
  "scripts": {
    "build": "vue-cli-service build && cap copy",
    ...
  },
```

## Install Identity Vault

In order to install Identity Vault, you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Identity Vault:

```bash
npm install @ionic-enterprise/identity-vault
```

## Create the Vault

In this step, we will create the vault and test it by storing and retrieving a value from it. This value will be called `session`, since storing session data in a vault is the most common use case of Identity Vault. However, it is certainly not the _only_ use case.

First, create a file named `src/composables/vault.ts`. Within this file, we will define the vault as well as create a composition function that abstracts all of the logic we need in order to interact with the vault:

```typescript
import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

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
const session = ref<string | null | undefined>();

export const useVault = () => {
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
};
```

Let's look at this file section by section:

The first thing we do is define the configuration for our vault. The `key` gives the vault a name. The other properties provide a default behavior for our vault. As we shall see later, the configuration can be changed as we use the vault.

We then create the vault. Note that we are using the `BrowserVault` class the application is running on the web. The `BrowserVault` allows us to continue to use our normal web-based development workflow.

```typescript
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
```

:::note
The `BrowserVault` class allows developers to use their normal web-based development workflow. It does **not** provide locking or security functionality.
:::

Next, we define a key for storing data. All data within the vault is stored as a key-value pair. You can store multiple key-value pairs within a single vault.

We also create a reactive property that is used to reflect the current `session` data to the outside world.

```typescript
const key = 'sessionData';
const session = ref<string | null | undefined>();
```

Finally, we create a composition function that returns our `session` as well defining a couple of functions that are used to set and restore our session:

```typescript
export const useVault = () => {
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
};
```

:::note
It's recommended to abstract vault functionality into functions that define how the rest of the application should interact with the vault instead of directly returning the `vault` instance. This creates more maintainable and debuggable code, while preventing the rest of the code from being exposed to potential API changes and reduces the chance of duplicating code.
:::

Now that we have the vault in place, let's switch over to `src/views/HomePage.vue` and implement some simple interactions with the vault. Here is a snapshot of what we will change:

1. Replace the "container" `div` with a list of form controls
1. Remove the existing styling

Update the file to match the following code:

```html
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-input label="Enter the &ldquo;session&rdquo; data" label-placement="floating" v-model="data"></ion-input>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="setSession(data)">Set Session Data</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="restoreSession">Restore Session Data</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Session Data: {{ session }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
  import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
  } from '@ionic/vue';
  import { ref } from 'vue';
  import { useVault } from '@/composables/useVault';

  const data = ref('');
  const { ...useVault() };
</script>

<style scoped></style>
```

:::note
Throughout the rest of this tutorial only new markup or required code will be provided. It is up to you to make sure that the correct imports and component definitions are added.
:::

Build the application and run it on an iOS and/or Android device. You should be able to enter some data and store it in the vault by clicking "Set Session Data." If you shutdown the app and start it again, you should be able to restore it using "Restore Session Data."

## Locking and Unlocking the Vault

Now that we are storing data in the vault, it would be helpful to lock and unlock that data. The vault will automatically lock after `lockAfterBackgrounded` milliseconds of the application being in the background. We can also lock the vault manually if we so desire.

Add the following code to the `useVault()` composition function:

```typescript
const lockVault = () => {
  vault.lock();
};

const unlockVault = () => {
  vault.unlock();
};
```

Remember to return the references to the functions:

```typescript
return {
  session,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
};
```

We can then add a couple of buttons to our `HomePage.vue` component file:

```html
<ion-item>
  <div style="flex: auto">
    <ion-button expand="block" @click="lockVault">Lock Vault</ion-button>
  </div>
</ion-item>

<ion-item>
  <div style="flex: auto">
    <ion-button expand="block" @click="unlockVault">Unlock Vault</ion-button>
  </div>
</ion-item>
```

We can now lock and unlock the vault, though in our current state we cannot really tell. Our application should react in some way when the vault is locked. For example, we may want to clear specific data from memory. We may also wish to redirect to a page that will onl allow the user to proceed if they unlock the vault.

In our case, we will just clear the `session` and have a flag that we can use to visually indicate if the vault is locked or not. We can do that by using the vault's `onLock` event.

Add the following code to `src/composables/vault.ts` before the start of the `useVault()` function:

```typescript
const vaultIsLocked = ref(false);

vault.onLock(() => {
  vaultIsLocked.value = true;
  session.value = undefined;
});

vault.onUnlock(() => (vaultIsLocked.value = false));
```

Update the return value from `useVault()` to include the `vaultIsLocked` reactive value:

```typescript
return {
  session,
  vaultIsLocked,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
};
```

Finally, update `HomePage.vue` to display the `vaultIsLocked` value along with the session:

```html
<ion-item>
  <ion-label>
    <div>Session Data: {{ session }}</div>
    <div>Vault is Locked: {{ vaultIsLocked }}</div>
  </ion-label>
</ion-item>
```

Build and run the application. When the user presses the "Lock Vault" button, the "Session Data" will be cleared out. Pressing "Unlock Vault" will cause "Vault is Locked" to show as false again. Pressing "Restore Session Data" will both unlock a vault and get the session data back.

In its current state, the vault is set to the `SecureStorage` vault type. We will be unable to observe any changes to the "Vault is Locked" value until we update the vault's configuration to a different vault type.

:::note
Vaults set to the `SecureStorage` vault type _do not_ lock. Data stored within this type of vault are still encrypted at rest and can be restored between sessions.
:::

In a few sections we will explore different vault types further, allowing us to test the ability to lock and unlock a vault. First, we will begin exploring the `Device` API.

## Device Level Capabilities

Identity Vault allows you to have multiple vaults within your application. However, there are some capabilities that Identity Vault allows you to control that are applicable to the device that the application is running on rather than being applicable to any given vault. For these items, we will use Identity Vault's `Device` API.

One such item is the "privacy screen." When an application is put into the background, the default behavior is for the OS to take a screenshot of the current page and display that as the user scrolls through the open applications. However, if your application displays sensitive information, you may not want that information displayed at such a time, so another option is to display the splash screen (on iOS) or a plain rectangle (on Android) instead of the screenshot. This is often referred to as a "privacy screen."

We will use the `Device.isHideScreenOnBackgroundEnabled()` method to determine if our application will currently display the privacy screen or not. Then we will use the `Device.setHideScreenOnBackground()` method to control whether it is displayed or not. Finally, we will hook that all up to a checkbox in the UI to allow the user to manipulate the value at run time.

We only want to interact with the Device API if we are actually running on a device, so we will also use Ionic's platform detection features to avoid using the Device API when running on the web. Our app is not targeting the web; we just want to ensure we can still use a web based development flow.

All of the following code applies to the `src/views/HomePage.vue` file.

First, import the `Device` API and add `isPlatform` to the import from `@ionic/vue`:

```typescript
import {
  ...
  isPlatform
} from '@ionic/vue';
import { Device } from '@ionic-enterprise/identity-vault';
```

Next, add the following code to the `script setup` section:

```typescript
const isMobile = isPlatform('hybrid');
const privacyScreen = ref(false);

Device.isHideScreenOnBackgroundEnabled().then((x) => (privacyScreen.value = x));

const privacyScreenChanged = (evt: { detail: { checked: boolean } }) => {
  Device.setHideScreenOnBackground(evt.detail.checked);
};
```

Finally, we can add the checkbox to our template:

```html
<ion-item>
  <ion-checkbox :disabled="!isMobile" :checked="privacyScreen" @ionChange="privacyScreenChanged"
    >Use Privacy Screen</ion-checkbox
  >
</ion-item>
```

Build the app and play around with changing the check box and putting the app in the background. In most applications, you would leave this value set by default, but if you were going to change it, you would most likely just do so on startup and leave it that way.

## Using Different Vault Types

The mechanism used to unlock a vault is determined by a combination of the `type` and the `deviceSecurityType` configuration settings.

The `type` setting can be set to any value from the `VaultType` enumeration:

- `SecureStorage`: Securely store the data in the keychain, but do not lock it.
- `DeviceSecurity`: When the vault is locked, it needs to be unlocked by a mechanism provided by the device.
- `CustomPasscode`: When the vault is locked, it needs to be unlocked via a custom method provided by the application. This is typically done in the form of a custom PIN dialog.
- `InMemory`: The data is never persisted. As a result, if the application is locked or restarted the data is gone.

If `VaultType.DeviceSecurity` is used, the optional `deviceSecurityType` setting can further refine the vault by assigning a value from the `DeviceSecurity` enumeration:

- `Biometrics`: Use the biometric authentication type specified by the device.
- `SystemPasscode`: Use the system passcode entry screen.
- `Both`: Use `Biometrics` with the `SystemPasscode` as a backup when `Biometrics` fails.

We specified `SecureStorage` when we set up the vault:

```typescript
const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivvue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

However, we can use the vault's `updateConfig()` method to change this at run time.

In our application,we don't want to use every possible combination. Rather than exposing the raw `type` and `deviceSecurityType` values to the rest of the application, let's define the types of authentication we _do_ want to support:

- `NoLocking`: We want to store the session data securely, but never lock it.
- `Biometrics`: We want to use the device's biometric mechanism to unlock the vault when it is locked.
- `SystemPasscode`: We want to use the device's passcode screen (typically a PIN or pattern) to unlock the vault when it is locked.

Now we have the types defined within the domain of our application. The only code within our application that will have to worry about what this means within the context of the Identity Vault configuration is our `useVault()` composition function.

First, let's add a reactive property to `src/composables/vault.ts` just like the other ones that exist.

```typescript
const lockType = ref<'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined>();
```

Next, we will need to watch for changes and update the configuration when they occur. Since we only need a single watch to do this once, we should put that outside the `useVault()` function, just like our reactive properties and our `onLock` and `onUnlock` event handlers.

```typescript
const setLockType = (lockType: 'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined) => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

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

    vault.updateConfig({
      ...vault.config,
      type,
      deviceSecurityType,
    });
  }
};

watch(lockType, (lock) => setLockType(lock));
```

:::note
When this code is added, you will also need to add `watch` to the import from "vue."
:::

We can now add a group of radio buttons to our `Home` view that will control the vault type. Remember to import any new components we are using and specify them in the view's components object.

```html
<ion-item>
  <ion-radio-group v-model="lockType">
    <ion-list-header>
      <ion-label> Vault Locking Mechanism </ion-label>
    </ion-list-header>

    <ion-item>
      <ion-radio value="NoLocking">Do Not Lock</ion-radio>
    </ion-item>

    <ion-item>
      <ion-radio :disabled="!canUseBiometrics" value="Biometrics">Use Biometrics</ion-radio>
    </ion-item>

    <ion-item>
      <ion-radio :disabled="!canUseSystemPIN." value="SystemPasscode">Use System Passcode</ion-radio>
    </ion-item>
  </ion-radio-group>
</ion-item>
```

For the "Use Biometric" and "Use System Passcode "radio buttons, we are disabling it based on whether or not the feature has been enabled on the device. We will need to code for that in our `script setup`.

```typescript
const canUseSystemPIN = ref(false);
const canUseBiometrics = ref(false);

Device.isSystemPasscodeSet().then((x) => (canUseSystemPIN.value = x));
Device.isBiometricsEnabled().then((x) => (canUseBiometrics.value = x));
```

Notice that we are using the `Device` API again to determine if biometrics is both: (a) supported by the current device, and (b) enabled by the device user. Users should not be able to choose that option unless biometrics are properly set up on the device.

One final bit of housekeeping before building and running the application: if you are using an iOS device you need to open the `Info.plist` file and add the `NSFaceIDUsageDescription` key with a value like "Use Face ID to unlock the vault when it is locked."

Now when you run the app, you can choose a different locking mechanism and it should be used whenever you need to unlock the vault.

If you change the vault type to use either Biometrics or Session Passcode, you should see that the vault is still using that mode when you restart the application. If a vault already exists for a given key (such as `'io.ionic.getstartedivvue'`), the vault remembers which mode it is operating in and will ignore the mode passed into the constructor.

## Current Lock Status

Try the following:

1. Set some session data.
1. Press either the "Use Biometrics" or "Use System Passcode" radio buttons.
1. Close the application.
1. Restart the application.
1. Observe that "Vault is Locked" is shown as `false`.
1. Press the "Restore Session Data" button.
1. Observe the application request a security prompt.

Our flag is wrong because it's value is set to `false` on startup, and the `onLock` event does not trigger on startup. The `Vault` API provides a way to programmatically obtain the current lock status of the vault.

Add the following line of code immediately after the `onLock` and `onUnlock` event handlers in our `useVault.ts` file:

```typescript
vault.isLocked().then((x) => (vaultIsLocked.value = x));
```

Now when we restart the app, the vault should be shown as locked.

## Clearing the Vault

In this final step, we will remove all items from the vault and then remove the vault itself. This can be achieved through the `Vault` API by calling the `clear()` method.

To show this in action, let's add a `vaultExists` reactive property to our `src/services/useVault.ts` file. Remember to return it from the `useVault()` composable function so we bind to it in our view:

```typescript
const vaultExists = ref(false);
```

Next, add a `clearVault()` function within `useVault()`. This function will call `vault.clear()`, reset the lockType to the default of `NoLocking`, and clear our session data cache:

```typescript
const clearVault = async () => {
  await vault.clear();
  lockType.value = 'NoLocking';
  session.value = undefined;
};
```

Remember to add it to the return from `useVault()` as well.

In order to see when a vault does and does not exist, let's use `vaultExists.value = await vault.doesVaultExist();` in a couple of places. Add a call in `clearVault()` as well as in `setSession()`. Let's also add a call within `useVault()` itself, but since that function is not `async` we will need to use the "promise then" syntax there. Add those call now.

Once that is all in place, open the `HomePage.vue` file and do the following:

- Add a button to clear the vault by calling `clearVault()` on click.
- Display the current value of `vaultExists` in a `div` just like we are currently showing `session` and `vaultIsLocked`.

## Conclusion

This "getting started" tutorial has implemented using Identity Vault in a very manual manner, allowing for a lot of user interaction with the vault. In an actual application, a lot of this functionality would instead be a part of several programmatic workflows within the application.

At this point, you should have a good idea of how Identity Vault works. There is still more functionality that can be implemented. Be sure to check out our other documentation to determine how to facilitate specific areas of functionality within your application.
