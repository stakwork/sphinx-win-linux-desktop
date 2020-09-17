import React from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import { useStores } from '../../src/store'
import CloseButton from '@material-ui/icons/Close';



export default function ViewImg({ params }) {
  const { ui } = useStores()

  return <Modal
    open={true}
    onClose={() => ui.setImgViewerParams(null)}
    className="view-img-modal-wrap"
  >
    <Content>
      <CloseButton onClick={() => ui.setImgViewerParams(null)} style={{cursor: 'pointer', position: 'absolute'}}/>
      <ImgWrapper>
      <Img src={params.data} />
      </ImgWrapper>
    </Content>

  </Modal>
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

const ImgWrapper = styled.div`
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