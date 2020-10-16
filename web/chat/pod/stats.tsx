import React, { useRef, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import Close from '@material-ui/icons/Close'
import Chart from 'chart.js'
import moment from 'moment'

export default function Stats({ pod, onClose, incomingPayments, earned }) {
  const l = incomingPayments && incomingPayments.length
  const chartRef = useRef()
  const littleChartRef = useRef()
  const [selectedEpisodeID, setSelectedEpisodeID] = useState(null)

  useLayoutEffect(() => {
    if (!(chartRef && chartRef.current)) return
    makeChart(chartRef.current, incomingPayments)
  })
  const episodes = processEpisodeEarning(pod,incomingPayments)

  function selectEpisode(e){
    return
    setSelectedEpisodeID(e.id)
    setTimeout(()=>{
      if(littleChartRef.current) {
        makeChart(littleChartRef.current, incomingPayments)
      }
    },10)
  }

  return <Wrap>
    <Close onClick={onClose} style={{ color: 'white', position: 'absolute', right: 0, top: 0, cursor: 'pointer' }} />
    <PodTitle>
      {`${pod.title} statistics`}
    </PodTitle>
    <General>
      <Item>{`Total payments: ${l}`}</Item>
      <Item>{`Total earned: ${earned} sats`}</Item>
    </General>
    <ChartWrap>
      <canvas ref={chartRef} width="100%" height="100%"></canvas>
    </ChartWrap>
    {l && <>
      <ByEpisode>By Episode:</ByEpisode>
      {episodes.map((e,i)=>{
        const selected = selectedEpisodeID===e.id
        console.log("SELECTED",selected,e)
        return <EpisodeWrap key={i} onClick={()=>selectEpisode(e)}>
          <EpisodeEarning>
            <span>{e.title}</span>
            <span>{`${e.total} sats`}</span>
          </EpisodeEarning>
          {selected && <LittleChartWrap>
            <canvas ref={littleChartRef} width="100%" height="100%"></canvas>
          </LittleChartWrap>}
        </EpisodeWrap>
      })}
    </>}
  </Wrap>
}

interface Episode {
  id: number;
  title: string
  total: number
}
function processEpisodeEarning(pod, incomingPayments){
  if(!pod || !incomingPayments) return []
  const res:Episode[] = []
  incomingPayments.forEach(p=>{
    try {
      const c = JSON.parse(p.message_content)
      if(c.itemID){
        const ep = pod.episodes.find(e=>e.id===c.itemID)
        if(ep && ep.title) {
          const idx = res.findIndex(rep=>rep.title===ep.title)
          if(idx>-1) {
            res[idx].total = res[idx].total + p.amount
          } else {
            res.push({ title:ep.title, total:p.amount, id:ep.id })
          }
        }
      }
    } catch(e) {}
  })
  return res
}

function makeChart(ref, payments) {
  var ctx = ref.getContext('2d');
  const labels = []
  const data = []
  const days:{[k:string]:number} = {}
  payments && payments.forEach(p=>{
    const day = moment(p.date).format('MM/DD')
    if(days[day]) days[day] += p.amount
    else days[day] = p.amount
  })
  Object.entries(days).forEach(([day,amount])=>{
    labels.unshift(day)
    data.unshift(amount)
  })
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Sats earned',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio:false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

const Wrap = styled.div`
  display:flex;
  flex:1;
  flex-direction:column;
  position:relative;
`
const PodTitle = styled.div`
  display: flex;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`
const ByEpisode = styled.div`
  display: flex;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  margin-bottom:5px;
`
const General = styled.div`
  display: flex;
  margin-top:8px;
`
const Item = styled.div`
  display: flex;
  height:20px;
  margin-right:20px;
  align-items:center;
  display: flex;
  font-size: 13px;
  color: #809ab7;
  max-width: calc(100% - 26px);
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`
const ChartWrap = styled.div`
  width:100%;
  height:200px;
  max-height:200px;
  position:relative;
`
const EpisodeWrap = styled.div`
  display:flex;
  flex-direction:column;
  cursor:pointer;
`
const EpisodeEarning = styled.div`
  height:18px;
  display:flex;
  align-items:center;
  color:#809ab7;
  font-size:12px;
  justify-content:space-between;
`
const LittleChartWrap = styled.div`
  width:100%;
  height:100px;
  max-height:100px;
  position:relative;
`