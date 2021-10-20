import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import styled from "styled-components";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import theme from "../theme";
import { useStores } from "../../src/store";
import Button from "../utils/button";

export default function TribesSaveModal({ params }) {
  const { ui, contacts } = useStores();
  const [loading, setLoading] = useState(false);
  function onClose() {
    ui.setTribesSaveParams(null);
  }
  async function save(j) {
    setLoading(true);
    try {
      const protocol = j.host.includes("localhost") ? "http" : "https";
      const r = await fetch(`${protocol}://${j.host}/save/${j.key}`);
      const data = await r.json();
      console.log("DATA", data);
      const body = JSON.parse(data.body);
      if (data.path === "profile" && data.method === "POST") {
        const r2 = await contacts.updatePeopleProfile(body);
        console.log(r2);
      } else if (data.path === "profile" && data.method === "DELETE") {
        const r3 = await contacts.deletePeopleProfile();
        console.log(r3);
      }
    } catch (e) {}
    setLoading(false);
    onClose();
  }
  return (
    <Modal
      disableAutoFocus={true}
      open={true}
      onClose={onClose}
      className="view-img-modal-wrap"
    >
      <Content style={{ background: theme.bg }}>
        <VerifiedUserIcon
          style={{ fontSize: 46, color: "#6681fe", marginBottom: 20 }}
        />
        <H3>Do you want to save your profile from</H3>
        {params.host && <H2>{params.host}?</H2>}
        <ButtonsWrap>
          <Button onClick={onClose}>No</Button>
          <Button
            color="primary"
            loading={loading}
            onClick={() => save(params)}
          >
            Yes
          </Button>
        </ButtonsWrap>
      </Content>
    </Modal>
  );
}

const Content = styled.div`
  height: 400px;
  width: 330px;
  box-shadow: 0px 0px 17px 0px rgba(0, 0, 0, 0.75);
  border: 1px solid #444;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const H2 = styled.h2`
  color: white;
  font-size: 17px;
  margin: 20px 0;
`;
const H3 = styled.div`
  color: #ababab;
  font-weight: normal;
  margin: 20px 0;
`;
const Input = styled.input`
  max-width: 100%;
  width: 100%;
  height: 42px;
  border: none;
  outline: none;
  border-radius: 32px;
  font-size: 14px;
  padding-left: 24px;
  padding-right: 24px;
  color: grey;
  position: relative;
  z-index: 100;
`;
const ButtonsWrap = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 220px;
  margin-top: 35px;
`;
