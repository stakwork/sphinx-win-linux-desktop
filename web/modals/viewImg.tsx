import React from 'react'
import Modal from '@material-ui/core/Modal';
import styled from 'styled-components'
import {useStores} from '../../src/store'

export default function ViewImg({params}){
  const {ui} = useStores()
  return <Modal
    open={true}
    onClose={()=>ui.setImgViewerParams(null)}
    className="view-img-modal-wrap"
  >
    <Img src={params.data} />
  </Modal>
}

const Img = styled.div`
  background: url(${p=>p.src});
  background-attachment: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 80%;
  width: 80%;
  background-color: black;
`