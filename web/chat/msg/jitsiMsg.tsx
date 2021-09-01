import React from "react";
import styled from "styled-components";
import PhoneIcon from "@material-ui/icons/Phone";
import MicIcon from "@material-ui/icons/Mic";
import CopyIcon from "@material-ui/icons/FileCopyOutlined";
import Button from "@material-ui/core/Button";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import theme from "../../theme";
import * as ipc from "../../crypto/ipc";

export default function JitsiMessage({ link, onCopy }) {
  const audioOnly = link && link.includes("#config.startAudioOnly=true");
  function copyLink() {
    navigator.clipboard.writeText(link);
    if (onCopy) onCopy("Call Link");
  }
  function openCall() {
    ipc.send(`link`, { link });
  }
  function openCallAudioOnly() {
    if (!audioOnly) {
      const l = link + "#config.startAudioOnly=true";
      ipc.send(`link`, { link: l });
    } else {
      ipc.send(`link`, { link });
    }
  }
  return (
    <Wrap>
      <Top>
        <PhoneIcon style={{ fontSize: 15, color: "white", marginRight: 8 }} />
        <span>Join call by...</span>
      </Top>
      <Mid>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          style={{ width: "100%", position: "relative" }}
          onClick={openCallAudioOnly}
        >
          AUDIO
          <MicIcon
            style={{
              fontSize: 18,
              color: "white",
              position: "absolute",
              right: 10,
              top: 10,
            }}
          />
        </Button>
        {!audioOnly && (
          <Button
            variant="contained"
            size="medium"
            color="secondary"
            style={{
              width: "100%",
              position: "relative",
              color: "white",
              marginTop: 8,
            }}
            onClick={openCall}
          >
            VIDEO
            <VideoCallIcon
              style={{
                fontSize: 18,
                color: "white",
                position: "absolute",
                right: 10,
                top: 10,
              }}
            />
          </Button>
        )}
      </Mid>
      <Bottom>
        <span style={{ marginRight: 10 }}>COPY LINK</span>
        <CopyIcon
          style={{ fontSize: 15, color: "white", cursor: "pointer" }}
          onClick={copyLink}
        />
      </Bottom>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  min-width: 220px;
  max-width: 220px;
`;
const Top = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
`;
const Mid = styled.div`
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 18px 0;
`;
const Bottom = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
