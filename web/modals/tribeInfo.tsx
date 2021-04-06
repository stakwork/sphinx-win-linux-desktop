import React, { useState, useEffect } from "react";
import Modal from "@material-ui/core/Modal";
import { useStores } from "../../src/store";
import theme from "../theme";
import styled from "styled-components";
import Button from "../utils/button";
import { CircularProgress } from "@material-ui/core";
import { tentIcon, avatarIcon } from "../images";
import ClearIcon from '@material-ui/icons/Clear';
import Dialog from '@material-ui/core/Dialog';
import Dropzone from "react-dropzone";
import { uploadFile } from "../utils/meme";
import TextField from "@material-ui/core/TextField";

export default function TribeInfo() {
  const { ui, chats, meme, user, contacts } = useStores();
  const tribe = ui.tribeInfo;
  const tribeId = ui.tribeInfo.id
  const tribeParams = ui.tribeInfoParams
  const [loading, setLoading] = useState(false);
  const [exit, setExit] = useState(false)
  const [uploading, setUploading] = useState(false);
  const [updateDisable, setUpdateDisable] = useState(true)

  const me = contacts.contacts.find((c) => c.id === user.myid);
  const [picsrc, setPicsrc] = useState(tribe.my_photo_url || me.photo_url || "");
  const [alias, setAlias] = useState(tribe.my_alias || me.alias || "");

  function handleClose() {
    ui.setTribeInfo(null, null);
  }

  function millisToHours(millis) {
    return Math.floor((millis / (1000 * 60 * 60)) % 24);
  }

  // async function dropzoneUpload(files) {
  //   const file = files[0];
  //   const server = meme.getDefaultServer();
  //   setUploading(true);
  //   const r = await uploadFile(
  //     file,
  //     file.type,
  //     server.host,
  //     server.token,
  //     "Image.jpg",
  //     true
  //   );
  //   if (r && r.muid) {
  //     // console.log(`https://${server.host}/public/${r.muid}`)
  //     setPicsrc(`https://${server.host}/public/${r.muid}`);
  //     setUploading(false)
  //   }
  // }

      async function exitGroup(){
      setExit(true)
    }
    async function actuallyExitGroup(){
      if(!tribeId) return
      await chats.exitGroup(tribeId)
      setExit(false)
      ui.setTribeInfo(null, null)
      ui.setSelectedChat(null)
    }


  async function updateTribeProf(){
    if(!alias && !picsrc) return
    console.log("alias == ", alias)
    console.log("picsrc == ", picsrc)
    chats.updateMyInfoInChat(tribeId, alias, picsrc);
    ui.setTribeInfo(null, null)
  }

  if (!tribe) {
    return <div></div>;
  }
  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Content bg={theme.bg}>
        <ClearIcon onClick={handleClose} style={{cursor: "pointer", position: "absolute", top: 4, right: 4 }}/>
        <Header>Tribe Info</Header>
        <Image
          style={{ backgroundImage: `url(${tribeParams.img || tentIcon})` }}
        ></Image>
        <Title>{tribeParams.name}</Title>
        <Description grey={theme.greyText}>{tribeParams.description}</Description>
        <Details grey={theme.greyText}>
          <Row name={"Price per Message:"} value={tribeParams.price_per_message} />
          <Row name={"Amount to Stake:"} value={tribeParams.escrow_amount} />
          <DetailRow style={{ border: "none" }}>
            <RowTitle>Time to Stake (hours):</RowTitle>
            <RowContent>{millisToHours(tribeParams.escrow_millis)}</RowContent>
          </DetailRow>
        </Details>

        <AliasWrap>
            <TextField
              variant="outlined"
              style={{ marginBottom: 5, width: "100%" }}
              label="My Name in this Tribe"
              type="text"
              value={alias}
              inputProps={{ style: { textAlign: "center" } }}
              onChange={(e) => {setAlias(e.target.value); setUpdateDisable(false)}}
            />
          </AliasWrap>

        {/* <PicWrap>
            <Dropzone multiple={false} onDrop={dropzoneUpload}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <PicDropWrap {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Pic
                    style={{
                      backgroundImage: `url(${
                        picsrc ? picsrc + "?thumb=true" : avatarIcon
                      })`,
                    }}
                  />
                </PicDropWrap>
              )}
            </Dropzone>
            <Text style={{ color: theme.greyText }}>
              My Picture in this Tribe
            </Text>
          </PicWrap> */}

          <ButtonWrap>
            <Button
              disabled={uploading || loading || updateDisable}
              onClick={updateTribeProf}
              color={"secondary"}
              style={{ marginTop: 20 }}
            >
              {loading && <CircularProgress size={14} />} Update Name
            </Button>
            <Button
              disabled={loading}
              onClick={exitGroup}
              color={"primary"}
              style={{ marginTop: 20 }}
            >
              {loading && <CircularProgress size={14} />} Leave Tribe
            </Button>
          </ButtonWrap>

      <Dialog onClose={()=>setExit(false)} open={exit}>
        <DialogContent>
          <div style={{marginBottom:10}}>Leave this Tribe?</div>
          <Button color={"primary"} onClick={()=>setExit(false)}>Cancel</Button>
          <Button color={"secondary"} onClick={()=>actuallyExitGroup()}>Yes</Button>
        </DialogContent>
      </Dialog>

      </Content>
    </Modal>
  );
}

function Row({ name, value }) {
  return (
    <DetailRow>
      <RowTitle>{name}</RowTitle>
      <RowContent>{value}</RowContent>
    </DetailRow>
  );
}

const Content = styled.div`
  position: relative;
  padding: 40px 20px;
  border-radius: 8px;
  width: 400px;
  min-height: 500px;
  background: ${(p) => p.bg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  max-height: 80vh;
  overflow: auto;
`;
const Header = styled.div`
  margin-bottom: 15px;
`;

const Image = styled.div`
  height: 100px;
  width: 100px;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const Title = styled.div`
  font-size: 35px;
  margin: 15px 0px;
  text-align: center;
`;

const Description = styled.div`
  display: flex;
  color: ${(p) => p.grey};
  margin: 15px 0px;
  text-align: center;
`;

const Details = styled.div`
  border-width: 1px;
  border-radius: 6px;
  border-style: solid;
  border-color: ${(p) => p.grey};
  color: ${(p) => p.grey};
  padding: 10px 20px;
  width: 80%;
  margin: 15px 0px;
`;

const DetailRow = styled.div`
  color: ${(p) => p.grey};
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid;
  padding: 10px 0px;
`;

const RowTitle = styled.div`
  color: ${(p) => p.grey};
`;

const RowContent = styled.div`
  color: ${(p) => p.grey};
`;

const ButtonWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`

const DialogContent = styled.div`
  display:flex;
  flex-direction:column;
  justify-content: space-between;
  padding:30px;
  height: 200px;
`

const Pic = styled.div`
  height: 50px;
  width: 50px;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const AliasWrap = styled.div`
  width: 80%;
`;
const PicWrap = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
`;
const PicDropWrap = styled.div`
  cursor: pointer;
`;
const Text = styled.div`
  margin-left: 15px;
`;