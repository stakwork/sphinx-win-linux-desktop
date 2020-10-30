import React from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import { useStores } from '../../src/store'
import CloseButton from '@material-ui/icons/Close';
import { Player } from 'video-react';

export default function ViewImg({ params }) {
  console.log(params)
  const { ui } = useStores()
  const setImgViewerParamsHandler = () => ui.setImgViewerParams(null)
  const chatContent = document.getElementById('chat-content')
  return <Modal
    style={{position: 'absolute'}}
    open={true}
    onClose={setImgViewerParamsHandler}
    className="view-img-modal-wrap"
    disableEnforceFocus
    container={chatContent}
  >
    <Content>
      <CloseButton onClick={setImgViewerParamsHandler} style={{cursor: 'pointer', position: 'absolute', top:20, left:20, fontSize:48}}/>
      <MediaWrapper>
        <Media type={params.type||''} data={params.data} />
      </MediaWrapper>
    </Content>
  </Modal>
}

function Media({data,type}){
  if(type.startsWith('video')) {
    return <Player autoPlay fluid={false} height="100%" width="100%">
      <source 
        src={data}
        type={type==='video/mov'?'video/mp4':type}
      />
    </Player>
  }
  return <Img src={data} />
}

const Img = styled.div`
  background: url(${p => p.src});
  background-attachment: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 100%;
  width: 100%;
  background-color: black;
`

const MediaWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Content = styled.div`
  width: 80%;
  height: 80%;
`