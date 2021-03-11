import React, { useState, useEffect } from "react";
import { useStores } from "../../src/store";
import styled, { css } from "styled-components";
import Modal from "@material-ui/core/Modal";
import theme from "../theme";
import Form from "../form";
import * as Yup from "yup";
import Button from "../utils/button";

const newSchema = [
  {
    name: "alias",
    type: "textArea",
    label: "Nickname",
    validator: Yup.string().required("Required"),
    style: {
      marginTop: 10,
    },
  },
  {
    name: "message",
    type: "textArea",
    label: "Include A Message",
    rows: 4,
    style: {
      marginTop: 10,
    },
  },
];

const alreadySchema = [
  {
    name: "alias",
    type: "textArea",
    label: "Nickname",
    validator: Yup.string().required("Required"),
  },
  {
    name: "public_key",
    type: "textArea",
    label: "Address",
    validator: Yup.string().required("Required"),
  },
  {
    name: "route_hint",
    type: "textArea",
    label: "Route Hint (optional)",
    validator: Yup.string(),
  },
];

export default function NewContact() {
  const { ui, contacts, details, user } = useStores();
  const [contactState, setContactState] = useState(
    ui.newContact.pubKey ? "already" : ""
  );
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const price = await contacts.getLowestPriceForInvite();
      if (price || price === 0) setPrice(price);
    })();
  }, []);

  function handleCloseModal() {
    ui.setNewContact(null);
    setContactState("");
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
      {!contactState ? (
        <Content bg={theme.bg}>
          <Title>ADD CONTACT</Title>
          <Button
            style={{
              marginTop: 20,
              color: "white",
              height: "45px",
              width: "220px",
              backgroundColor: theme.secondary,
            }}
            onClick={() => setContactState("new")}
          >
            New to Sphinx
          </Button>
          <Button
            style={{
              marginTop: 20,
              color: "white",
              height: "45px",
              width: "220px",
              backgroundColor: theme.primary,
            }}
            onClick={() => setContactState("already")}
          >
            Already on Sphinx
          </Button>
        </Content>
      ) : (
        <Content contactState={contactState} bg={theme.bg}>
          <Title>{contactState === "new" ? "NEW CONTACT" : "ADD USER"}</Title>
          {contactState === "new" ? (
            <div>
              <Form
                onSubmit={async (values) => {
                  setLoading(true);
                  await contacts.createInvite(values.alias, values.message);
                  setLoading(false);
                  handleCloseModal();
                }}
                loading={loading}
                schema={newSchema}
                buttonColor={"secondary"}
                buttonText={"Create Invitation"}
                buttonStyle={{
                  marginTop: 10,
                }}
              />
              {price && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    color: "#6a7a8c",
                    marginTop: 5,
                  }}
                >
                  Estimated Cost:&nbsp;{" "}
                  <span style={{ color: "white" }}>{price}</span> &nbsp;SAT
                </div>
              )}
            </div>
          ) : (
            <div>
              <Form
                onSubmit={async (values) => {
                  setLoading(true);
                  await contacts.addContact(values);
                  setLoading(false);
                  handleCloseModal();
                }}
                loading={loading}
                schema={alreadySchema}
                buttonText={"Save To Contacts"}
                initialValues={{ public_key: ui.newContact.pubKey || "" }}
              />
            </div>
          )}
        </Content>
      )}
    </Modal>
  );
}

const Content = styled.div`
  color: white;
  padding: 30px 0;
  border-radius: 8px;
  background: ${(p) => p.bg};
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Title = styled.div`
  font-size: 25px;
`;
