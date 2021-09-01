import React, { useState } from "react";
import styled from "styled-components";
import { constants, constantCodes } from "../../../src/constants";
import { useStores } from "../../../src/store";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function MemberRequest(props) {
  const { user, contacts } = useStores();

  const myid = user.myid;
  const chat = props.chat;
  const ownerPubkey = (chat && chat.owner_pubkey) || "";
  const owner = contacts.contacts.find((c) => c.id === myid);
  const isTribeOwner = owner && owner.public_key === ownerPubkey;

  const typ = constantCodes["message_types"][props.type];
  const [loading, setLoading] = useState("");

  let msg = "";
  if (typ === "member_approve") msg = "Welcome!";
  if (typ === "member_reject") msg = "The admin declined your request";
  if (isTribeOwner) {
    msg = `${props.senderAlias} wants to join the group`;
    if (typ === "member_approve") msg = "You have approved the request";
    if (typ === "member_reject") msg = "You have declined the request";
  }

  async function press(status: string) {
    console.log(typ);
    if (typ !== "member_request") return;
    setLoading(status);
    await props.onApproveOrDenyMember(props.sender, status, props.id);
    setLoading("");
  }

  return (
    <Wrap>
      <Text>{msg}</Text>
      {isTribeOwner && (
        <Buttons>
          {loading === "approved" ? (
            <CircularProgress
              style={{ height: 15, width: 15, marginRight: 10 }}
            />
          ) : (
            <ApproveButton
              onClick={() => press("approved")}
              disabled={typ === "member_reject"}
            >
              <CheckIcon style={{ color: "white", height: 15, width: 15 }} />
            </ApproveButton>
          )}
          {loading === "rejected" ? (
            <CircularProgress style={{ height: 15, width: 15 }} />
          ) : (
            <RejectButton
              onClick={() => press("rejected")}
              disabled={typ === "member_approve"}
            >
              <ClearIcon style={{ color: "white", height: 15, width: 15 }} />
            </RejectButton>
          )}
        </Buttons>
      )}
    </Wrap>
  );
}

const Text = styled.div`
  font-size: 12px;
`;

const Wrap = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
`;

const Buttons = styled.div`
  display: flex;
  padding: 10px 0px 10px 10px;
  justify-content: space-between;
`;

const ApproveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  margin-right: 10px;
  background-color: #3dba83;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  opacity: ${(p) => p.disabled && "50%"};
`;

const RejectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  background-color: #ff5e61;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  opacity: ${(p) => p.disabled && "50%"};
`;
