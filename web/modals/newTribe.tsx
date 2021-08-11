import React, { useState, useEffect } from "react";
import { useStores } from "../../src/store";
import styled, { css } from "styled-components";
import Modal from "@material-ui/core/Modal";
import theme from "../theme";
import Form from "../form";
import * as Yup from "yup";
import Button from "../utils/button";

const rq = "Required";
const newTribeSchema = [
  {
    name: "name",
    type: "text",
    label: "Name",
    required: true,
    validator: Yup.string().required(rq),
  },
  {
    name: "img",
    type: "photoURI",
    label: "Group Image",
  },
  {
    name: "description",
    type: "text",
    label: "Description",
    required: true,
    validator: Yup.string().required(rq),
  },
  // {
  //   name: "tags",
  //   type: "tags",
  //   label: "Tags",
  //   validator: Yup.array(),
  // },
  // {
  //   name: "price_to_join",
  //   type: "number",
  //   label: "Price to Join",
  //   validator: Yup.number(),
  // },
  // {
  //   name: "price_per_message",
  //   type: "number",
  //   label: "Price per Message",
  //   validator: Yup.number(),
  // },
  // {
  //   name: "escrow_amount",
  //   type: "number",
  //   label: "Amount to Stake",
  //   validator: Yup.number(),
  //   description:
  //     "A spam protection mechanism: every subscriber pays this fee for each message, which is returned to them after after the amount of hours specific in Escrow Time",
  // },
  // {
  //   name: "escrow_time",
  //   type: "number",
  //   label: "Time to Stake (Hours)",
  //   validator: Yup.number(),
  //   description:
  //     "The number of hours before the Escrow Amount is returned to the subscriber",
  // },
  // {
  //   name: "feed_url",
  //   type: "text",
  //   label: "RSS Feed URL",
  //   validator: Yup.string(),
  // },
  // {
  //   name: "unlisted",
  //   type: "radio",
  //   // inverted:true,
  //   label: "Unlisted (do not show on tribes registry)",
  //   required: false,
  // },
  // {
  //   name: "is_private",
  //   type: "radio",
  //   label: "Private (requires permission to join)",
  //   required: false,
  // },
];

export default function NewTribe() {
  const { ui, chats, details, user } = useStores();

  const [loading, setLoading] = useState(false);

  function handleCloseModal() {
    ui.setNewGroupModal(false);
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
        <Title>NEW TRIBE</Title>
        <FormWrap>
          <Form
            onSubmit={async (values) => {
              setLoading(true);
              values.unlisted = false;
              values.is_private = false;
              values.tags = ["Sphinx"];
              (values.price_to_join = parseInt(values.price_to_join) || 0),
                (values.price_per_message =
                  parseInt(values.price_per_message) || 0),
                (values.escrow_amount = parseInt(values.escrow_amount) || 0),
                (values.escrow_time = parseInt(values.escrow_time) || 0),
                await await chats.createTribe(values);
              setLoading(false);
              handleCloseModal();
            }}
            loading={loading}
            schema={newTribeSchema}
            buttonColor={"secondary"}
            buttonText={"Create Tribe"}
            buttonStyle={{
              marginTop: 10,
            }}
          />
        </FormWrap>
      </Content>
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
  max-height: 90vh;
  width: 400px;
`;

const Title = styled.div`
  font-size: 25px;
`;

const FormWrap = styled.div`
  max-height: 70vh;
  overflow: auto;
  max-width: 90vw;
  width: 350px;
  margin: 0 50px;
  padding-right: 5px;
`;
