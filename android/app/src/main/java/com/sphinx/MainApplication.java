package com.sphinx;

import android.app.Application;

import androidx.annotation.Nullable;
import com.facebook.react.ReactApplication;
import com.RNFetchBlob.RNFetchBlobPackage;
// import com.reactnativejitsimeet.RNJitsiMeetPackage;
import cl.json.RNSharePackage;
import com.horcrux.svg.SvgPackage;
import com.surajit.rnrg.RNRadialGradientPackage;
import com.reactlibrary.RNRncryptorPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.oblador.keychain.KeychainPackage;
import com.rnfingerprint.FingerprintAuthPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.RNRSA.RNRSAPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.sphinx.generated.BasePackageList;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;

import org.unimodules.adapters.react.ReactAdapterPackage;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.Package;
import org.unimodules.core.interfaces.SingletonModule;
import expo.modules.constants.ConstantsPackage;
import expo.modules.permissions.PermissionsPackage;
import expo.modules.filesystem.FileSystemPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
    new BasePackageList().getPackageList(),
    Arrays.<SingletonModule>asList()
  );

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNFetchBlobPackage(),
          // new RNJitsiMeetPackage(),
          new RNSharePackage(),
          new SvgPackage(),
          new RNRadialGradientPackage(),
          new RNRncryptorPackage(),
          new RandomBytesPackage(),
          new KeychainPackage(),
          new FingerprintAuthPackage(),
          new AsyncStoragePackage(),
          new RNRSAPackage(),
          new SafeAreaContextPackage(),
          new ReanimatedPackage(),
          new RNGestureHandlerPackage(),
          new RNScreensPackage(),
          new ModuleRegistryAdapter(mModuleRegistryProvider)
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }

    // @Override
    // protected @Nullable String getBundleAssetName() {
    //   return "app.bundle";
    // }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
