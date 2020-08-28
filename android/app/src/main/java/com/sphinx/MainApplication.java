package com.sphinx;

import android.app.Application;
import android.webkit.WebView;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.clipboard.ClipboardPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.reactnativecommunity.rctaudiotoolkit.AudioPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.brentvatne.react.ReactVideoPackage;
import io.sua.RNDeviceTimeFormatPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import org.linusu.RNGetRandomValuesPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.mkuczera.RNReactNativeHapticFeedbackPackage;
import com.imagepicker.ImagePickerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.dooboolab.RNAudioRecorderPlayerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
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
import li.yunqi.rnsecurestorage.RNSecureStoragePackage;

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
          new WebRTCModulePackage(),
          new MainReactPackage(),
            new ClipboardPackage(),
          new RNDateTimePickerPackage(),
          new AudioPackage(),
          new FastImageViewPackage(),
          new ReactVideoPackage(),
          new RNDeviceTimeFormatPackage(),
          new ReactNativePushNotificationPackage(),
          new RNGetRandomValuesPackage(),
          new RNGestureHandlerPackage(),
          new VectorIconsPackage(),
          new RNReactNativeHapticFeedbackPackage(),
          new ImagePickerPackage(),
          new RNCameraPackage(),
          new RNAudioRecorderPlayerPackage(),
          new RNCWebViewPackage(),
          new RNFetchBlobPackage(),
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
          new RNScreensPackage(),
          new RNSecureStoragePackage()
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
    WebView.setWebContentsDebuggingEnabled(true);
    long size = 50L * 1024L * 1024L; // 50 MB
    com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
  }
}
