import React, { useState, useEffect } from "react";
import { useObserver } from "mobx-react-lite";
import { useStores, useTheme } from "../../store";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import {
  Appbar,
  Portal,
  ActivityIndicator,
  TextInput,
} from "react-native-paper";
import { Title } from "react-native-paper";
import Icon from "react-native-vector-icons/AntDesign";
import { me } from "../form/schemas";
import Form from "../form";
import Cam from "../utils/cam";
import ImgSrcDialog from "../utils/imgSrcDialog";
import { usePicSrc } from "../utils/picSrc";
import RNFetchBlob from "rn-fetch-blob";
import * as rsa from "../../crypto/rsa";
import * as e2e from "../../crypto/e2e";
import { encode as btoa } from "base-64";
import PIN, { userPinCode } from "../utils/pin";
import Clipboard from "@react-native-community/clipboard";
import Toggler from "./toggler";
import { useDarkMode } from "react-native-dynamic";
import { getPinTimeout, updatePinTimeout } from "../utils/pin";
import Slider from "@react-native-community/slider";

export default function Profile() {
  const { details, user, contacts, meme, ui } = useStores();
  const myid = user.myid;
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photo_url, setPhotoUrl] = useState("");
  const [_, setTapCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [pinTimeout, setPinTimeout] = useState(12);
  const [initialPinTimeout, setInitialPinTimeout] = useState(12);
  const [serverURL, setServerURL] = useState("");
  const [tipAmount, setTipAmount] = useState(user.tipAmount + "");

  async function loadPinTimeout() {
    const pt = await getPinTimeout();
    setInitialPinTimeout(pt);
    setPinTimeout(pt);
  }
  useEffect(() => {
    loadPinTimeout();
    setServerURL(user.currentIP);
  }, []);
  function pinTimeoutValueUpdated(v) {
    console.log("UPDATE NOW");
    updatePinTimeout(String(v));
  }
  function pinTimeoutValueChange(v) {
    setPinTimeout(v);
  }
  function serverURLchange(URL) {
    setServerURL(URL);
  }
  function serverURLDoneChanging() {
    user.setCurrentIP(serverURL);
  }
  function tipAmountChange(ta) {
    const int = parseInt(ta);
    setTipAmount(int ? int + "" : "");
  }
  function tipAmountDoneChanging() {
    user.setTipAmount(parseInt(tipAmount));
  }

  const isDark = useDarkMode();
  function selectAppearance(a) {
    if (a === "System") theme.setDark(isDark);
    if (a === "Dark") theme.setDark(true);
    if (a === "Light") theme.setDark(false);
    theme.setMode(a);
  }

  async function shareContactKey() {
    const me = contacts.contacts.find((c) => c.id === myid);
    const contact_key = me.contact_key;
    if (!contact_key) return;
    setSharing(true);
    await contacts.updateContact(user.myid, { contact_key });
    setSharing(false);
  }

  async function tookPic(img) {
    setDialogOpen(false);
    setTakingPhoto(false);
    setUploading(true);
    try {
      await upload(img.uri);
    } catch (e) {
      console.log(e);
      setUploading(false);
    }
  }

  async function upload(uri) {
    const type = "image/jpg";
    const name = "Image.jpg";
    const server = meme.getDefaultServer();
    if (!server) return;

    RNFetchBlob.fetch(
      "POST",
      `https://${server.host}/public`,
      {
        Authorization: `Bearer ${server.token}`,
        "Content-Type": "multipart/form-data",
      },
      [
        {
          name: "file",
          filename: name,
          type: type,
          data: RNFetchBlob.wrap(uri),
        },
        { name: "name", data: name },
      ]
    )
      .uploadProgress({ interval: 250 }, (written, total) => {
        // console.log('uploaded', written / total)
      })
      .then(async (resp) => {
        let json = resp.json();
        if (json.muid) {
          console.log("UPLOADED!!", json.muid);
          setPhotoUrl(`https://${server.host}/public/${json.muid}`);
        }
        setUploading(false);
      })
      .catch((err) => {
        console.log(err);
        setUploading(false);
      });
  }

  return useObserver(() => {
    const meContact = contacts.contacts.find((c) => c.id === myid);

    function showError(err) {
      ToastAndroid.showWithGravityAndOffset(
        err,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
        0,
        125
      );
    }

    async function exportKeys(pin) {
      try {
        setShowPIN(false);
        if (!pin) return showError('NO PIN');
        const thePIN = await userPinCode();
        if (pin !== thePIN) return showError('NO USER PIN');
        setExporting(true);
        const priv = await rsa.getPrivateKey();
        const pub = meContact && meContact.contact_key;
        const ip = user.currentIP;
        const token = user.authToken;
        if (!priv || !pub || !ip || !token) return showError('MISSING A VAR');;
        const str = `${priv}::${pub}::${ip}::${token}`;
        const enc = await e2e.encrypt(str, pin);
        const final = btoa(`keys::${enc}`);
        Clipboard.setString(final);
        ToastAndroid.showWithGravityAndOffset(
          "Export Keys Copied",
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
          0,
          125
        );
        setExporting(false);
      } catch(e) {
        showError(e.message || e)
      }
    }

    let imgURI = usePicSrc(meContact);
    if (photo_url) imgURI = photo_url;

    if (showPIN) {
      return <PIN forceEnterMode={true} onFinish={(pin) => exportKeys(pin)} />;
    }

    const cardStyles = {
      backgroundColor: theme.main,
      borderBottomColor: theme.dark ? "#181818" : "#ddd",
      borderTopColor: theme.dark ? "#181818" : "#ddd",
    };
    const width = Math.round(Dimensions.get("window").width);
    return (
      <View style={{ ...styles.wrap, backgroundColor: theme.bg }}>
        <Header />

        <View style={styles.userInfoSection}>
          <View>
            <TouchableOpacity
              onPress={() => setDialogOpen(true)}
              style={styles.userPic}
            >
              <Image
                resizeMode="cover"
                source={
                  imgURI
                    ? { uri: imgURI }
                    : require("../../../android_assets/avatar.png")
                }
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
              {uploading && (
                <ActivityIndicator
                  animating={true}
                  color="#55D1A9"
                  style={styles.spinner}
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Title style={styles.title}>{user.alias}</Title>
            <View style={styles.userBalance}>
              <Text style={{ color: theme.title }}>{details.balance}</Text>
              <Text
                style={{ marginLeft: 10, marginRight: 10, color: "#c0c0c0" }}
              >
                sat
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTapCount((cu) => {
                    if (cu >= 6) {
                      // seventh tap
                      shareContactKey();
                      return 0;
                    }
                    return cu + 1;
                  });
                }}
              >
                {sharing ? (
                  <View style={{ height: 20, paddingTop: 4 }}>
                    <ActivityIndicator
                      animating={true}
                      color="#d0d0d0"
                      size={12}
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                ) : (
                    <Icon name="wallet" color="#d0d0d0" size={20} />
                  )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Toggler
          width={width}
          extraStyles={{
            borderRadius: 0,
            borderRightWidth: 0,
            borderLeftWidth: 0,
          }}
          onSelect={(e) => setAdvanced(e === "Advanced")}
          selectedItem={advanced ? "Advanced" : "Basic"}
          items={["Basic", "Advanced"]}
        />

        {!advanced && (
          <ScrollView style={styles.scroller}>
            <View style={{ ...styles.formWrap, ...cardStyles }}>
              <Form
                schema={me}
                loading={saving}
                buttonText="Save"
                readOnlyFields={["public_key", "route_hint"]}
                forceEnable={photo_url}
                initialValues={{
                  alias: user.alias,
                  public_key: user.publicKey,
                  private_photo: meContact.private_photo || false,
                  route_hint: meContact.route_hint || "",
                }}
                extraCopySuffixes={{
                  // so that route hint is appended when copy
                  public_key: meContact.route_hint ? ':' + meContact.route_hint : ""
                }}
                onSubmit={async (values) => {
                  setSaving(true);
                  await contacts.updateContact(user.myid, {
                    alias: values.alias,
                    private_photo: values.private_photo,
                    ...(photo_url && { photo_url }),
                  });
                  setSaving(false);
                }}
              />
            </View>

            <View style={{ ...styles.options, ...cardStyles }}>
              <Text style={{ ...styles.label, color: theme.subtitle }}>
                Appearance
              </Text>
              <Toggler
                width={300}
                extraStyles={{}}
                onSelect={selectAppearance}
                selectedItem={theme.mode}
                items={["System", "Dark", "Light"]}
              />
            </View>

            <View style={{ ...styles.inputs, ...cardStyles }}>
              <Text style={{ ...styles.label, color: theme.subtitle }}>
                Default tip amount
              </Text>
              <Text style={{ paddingLeft: 12, paddingRight: 12 }}>
                <TextInput
                  placeholder="Default Tip Amount"
                  value={tipAmount + ""}
                  onChangeText={tipAmountChange}
                  onBlur={tipAmountDoneChanging}
                />
              </Text>
            </View>

            <TouchableOpacity
              style={{ ...styles.export, ...cardStyles }}
              onPress={() => setShowPIN(true)}
            >
              <Text style={styles.exportText}>
                {!exporting
                  ? "Want to switch devices? Export keys"
                  : "Encrypting keys with your PIN........"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {advanced && (
          <ScrollView style={styles.scroller}>
            <View style={{ ...cardStyles, padding: 20, marginBottom: 12 }}>
              <View style={styles.pinTimeoutTextWrap}>
                <Text style={{ color: theme.subtitle }}>Server URL</Text>
              </View>
              <TextInput
                placeholder="Server URL"
                value={serverURL}
                onChangeText={serverURLchange}
                onBlur={serverURLDoneChanging}
              />
            </View>

            <View style={{ ...cardStyles, padding: 20 }}>
              <View style={styles.pinTimeoutTextWrap}>
                <Text style={{ color: theme.subtitle }}>PIN Timeout</Text>
                <Text style={{ color: theme.title }}>
                  {pinTimeout ? pinTimeout : "Always Require PIN"}
                </Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={24}
                value={initialPinTimeout}
                step={1}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.primary}
                thumbTintColor={theme.primary}
                onSlidingComplete={pinTimeoutValueUpdated}
                onValueChange={pinTimeoutValueChange}
              />
            </View>
          </ScrollView>
        )}

        <ImgSrcDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onPick={(res) => tookPic(res)}
          onChooseCam={() => setTakingPhoto(true)}
        />

        {takingPhoto && (
          <Portal>
            <Cam
              onCancel={() => setTakingPhoto(false)}
              onSnap={(pic) => tookPic(pic)}
            />
          </Portal>
        )}
      </View>
    );
  });
}

function Header() {
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <Appbar.Header style={{ width: "100%", backgroundColor: theme.main }}>
      <Appbar.Action
        icon="menu"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        accessibilityLabel="menu-close-profile"
      />
      <Appbar.Content title="Profile" />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  userInfoSection: {
    paddingLeft: 20,
    marginBottom: 25,
    marginTop: 25,
    display: "flex",
    flexDirection: "row",
  },
  scroller: {
    display: "flex",
  },
  drawerSection: {
    marginTop: 25,
  },
  userPic: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    minWidth: 62,
    height: 62,
    width: 62,
    flexShrink: 0,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 31,
    position: "relative",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginLeft: 15,
  },
  title: {
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  userBalance: {
    flexDirection: "row",
    alignItems: "center",
  },
  img: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  spinner: {
    position: "absolute",
    left: 19,
    top: 19,
  },
  formWrap: {
    flex: 1,
    paddingBottom: 30,
    maxHeight: 445,
    minHeight: 445,
    position: "relative",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 10,
  },
  options: {
    maxHeight: 100,
    minHeight: 100,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  inputs: {
    maxHeight: 100,
    minHeight: 124,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  export: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginTop: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 45,
  },
  exportText: {
    color: "#6289FD",
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    marginTop: 15,
    marginLeft: 20,
    marginBottom: 10,
  },
  pinTimeoutTextWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 15,
  },
});
