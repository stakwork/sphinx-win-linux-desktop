package com.sphinx;

import android.app.Application;

import androidx.annotation.Nullable;
import com.facebook.react.ReactApplication;
import org.linusu.RNGetRandomValuesPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactlibrary.securekeystore.RNSecureKeyStorePackage;
import com.mkuczera.RNReactNativeHapticFeedbackPackage;
import com.imagepicker.ImagePickerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.dooboolab.RNAudioRecorderPlayerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnativejitsimeet.RNJitsiMeetPackage;
import cl.json.RNSharePackage;
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
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;


import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNGetRandomValuesPackage(),
            new RNGestureHandlerPackage(),
          new VectorIconsPackage(),
          new RNSecureKeyStorePackage(),
          new RNReactNativeHapticFeedbackPackage(),
          new ImagePickerPackage(),
          new RNCameraPackage(),
          new RNAudioRecorderPlayerPackage(),
          new RNCWebViewPackage(),
          new RNFetchBlobPackage(),
          new RNJitsiMeetPackage(),
          new RNSharePackage(),
          new RNRadialGradientPackage(),
          new RNRncryptorPackage(),
          new RandomBytesPackage(),
          new KeychainPackage(),
          new FingerprintAuthPackage(),
          new AsyncStoragePackage(),
          new RNRSAPackage(),
          new SafeAreaContextPackage(),
          new ReanimatedPackage(),
          new RNScreensPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }

    @Override
    protected @Nullable String getBundleAssetName() {
      return "app.bundle";
    }
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
