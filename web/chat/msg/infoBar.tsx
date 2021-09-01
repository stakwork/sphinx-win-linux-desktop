import React from "react";
import styled from "styled-components";
import moment from "moment";
import LockIcon from "@material-ui/icons/Lock";
import FlashIcon from "@material-ui/icons/FlashOn";
import { constants } from "../../../src/constants";
import { getColor } from "../../utils/avatar";

const timeFormat = "hh:mm A"; //ui.is24HourFormat?'HH:mm A':'hh:mm A'

const received = constants.statuses.received;

const encryptedTypes = [
  constants.message_types.message,
  constants.message_types.invoice,
];

export default function InfoBar(props) {
  const isMe = props.sender === props.myid;
  const isReceived = props.status === received;
  const showLock = encryptedTypes.includes(props.type);
  let senderAlias = props.senderAlias;
  return (
    <Wrap style={{ flexDirection: isMe ? "row-reverse" : "row" }}>
      {senderAlias && !isMe && (
        <Alias style={{ color: getColor(senderAlias) }}>{senderAlias}</Alias>
      )}
      <Time>{moment(props.date).format(timeFormat)}</Time>
      {showLock && (
        <LockIcon
          style={{ color: "grey", fontSize: 11, marginLeft: 5, marginRight: 5 }}
        />
      )}
      {isMe && isReceived && (
        <FlashIcon style={{ color: "#48c998", fontSize: 12 }} />
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
`;
const Time = styled.div`
  font-size: 10px;
  color: grey;
`;
const Alias = styled.div`
  font-size: 10px;
  color: grey;
  margin-right: 8px;
  font-weight: bold;
`;
