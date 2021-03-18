import React, { useState } from "react";
import { useStores } from "../../src/store";
import styled from "styled-components";
import Modal from "@material-ui/core/Modal";
import theme from "../theme";
import Avatar from "../utils/avatar";
import Toggle from "../utils/toggle";
import Form from "../form";
import * as Yup from "yup";
import * as rsa from "../crypto/rsa";
import * as aes from "../crypto/aes";
import { userPinCode } from "./pin";

const schema = [
  {
    name: "alias",
    type: "text",
    label: "User Name",
    validator: Yup.string().required("Required"),
  },
  {
    name: "public_key",
    type: "text",
    label: "Address",
    readOnly: true,
  },
  {
    name: "route_hint",
    type: "text",
    label: "Route Hint",
    readOnly: true,
  },
];

const advSchema = [
  {
    name: "currentIP",
    type: "text",
    label: "Server URL",
    validator: Yup.string().required("Required"),
  },
];

export default function Profile() {
  const { ui, contacts, details, user } = useStores();
  const me = contacts.contacts.find((c) => c.id === user.myid);
  if(!me.route_hint) me.route_hint=''
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function updateMe(v) {
    setLoading(true);
    await contacts.updateContact(user.myid, { alias: v.alias });
    setLoading(false);
  }

  function handleCloseModal() {
    ui.setShowProfile(false);
  }

  async function exportKeys() {
    if (copied) return;
    const priv = await rsa.getPrivateKey();
    const me = contacts.contacts.find((c) => c.id === user.myid);
    const pub = me && me.contact_key;
    const ip = user.currentIP;
    const token = user.authToken;
    // console.log("ME === ", me);
    // console.log("PRIV === ", priv);
    // console.log("PUB === ", pub);
    // console.log("IP === ", ip);
    // console.log("TOKEN === ", token);
    if (!priv || !pub || !ip || !token) return;
    const str = `${priv}::${pub}::${ip}::${token}`;
    const pin = await userPinCode();
    const enc = await aes.encryptSymmetric(str, pin);
    const final = btoa(`keys::${enc}`);
    navigator.clipboard.writeText(final);
    setCopied(true);
    await sleep(4000);
    setCopied(false);
  }

  return (
    <Modal
      open={true}
      onClose={handleCloseModal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Content bg={theme.bg}>
        <TopWrapper>
          <Avatar
            xx-large
            photo={me.photo_url}
            alias={me.alias}
            style={{ size: "50px" }}
          />
          <InnerTopWrapper>
            <Name>{me.alias.toUpperCase()}</Name>
            <Sat>
              {details.balance} <span style={{ color: "#6b7b8d" }}>sat</span>
            </Sat>
          </InnerTopWrapper>
        </TopWrapper>
        <Toggle
          onChange={(e) => setAdvanced(e === "Advanced")}
          items={["Basic", "Advanced"]}
          value={advanced ? "Advanced" : "Basic"}
        />
        {advanced ? (
          <Form
            key={"adv"}
            onSubmit={(v) => user.setCurrentIP(v.currentIP)}
            schema={advSchema}
            initialValues={{ currentIP: user.currentIP }}
          />
        ) : (
          <Form
            key={"basic"}
            onSubmit={updateMe}
            schema={schema}
            initialValues={me}
            loading={loading}
          />
        )}

        <ExportKeysWrap style={{ color: theme.primary }} onClick={exportKeys}>
          {copied ? "Keys Copied!" : "Export Keys"}
        </ExportKeysWrap>
      </Content>
    </Modal>
  );
}

const Content = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
  width: 300px;
  background: ${(p) => p.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;
const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: row;
  width: 100%;
  height: 150px;
`;

const InnerTopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 150px;
`;

const Name = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Sat = styled.div``;
const ExportKeysWrap = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  width: 100%;
  cursor: pointer;
  display: flex;
  border-top: 1px solid grey;
  border-bottom: 1px solid grey;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: #252429;
`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
