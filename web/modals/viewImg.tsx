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

const Img = styled.img`
  height:640px;
`