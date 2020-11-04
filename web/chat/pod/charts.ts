import Chart from 'chart.js'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);
import { StreamPayment } from '../../../src/store/feed'

export function makeChart(ref, payments) {
  var ctx = ref.getContext('2d');
  const labels = []
  const data = []
  const days: { [k: string]: number } = {} // day:amount
  payments && payments.forEach(p => {
    const day = moment(p.date).format('MM/DD')
    if (days[day]) days[day] += p.amount
    else days[day] = p.amount
  })
  Object.entries(days).forEach(([day, amount]) => {
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
      maintainAspectRatio: false,
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

interface Earning {
  ts: number,
  streaming: number,
  boosts: number,
  clips: number,
}
export function makeEpisodeChart(ref, payments) {
  var ctx = ref.getContext('2d');
  const payz: Earning[] = [];// { [k: number]: number } = {}
  payments && payments.forEach(p => {
    let j:StreamPayment
    try {
      j = JSON.parse(p.message_content)
    } catch(e){}
    if(!(j&&(j.ts||j.ts===0))) return
    const isBoost = j.amount?true:false
    const isClip = j.uuid?true:false
    const isStream = !isBoost && !isClip
    const exists = payz.find(s=>s.ts===j.ts)
    if(exists) {
      if(isBoost) exists.boosts += p.amount
      if(isClip) exists.clips += p.amount
      if(isStream) exists.streaming += p.amount
    } else {
      payz.push({
        ts:j.ts,
        streaming:isStream?p.amount:0,
        boosts:isBoost?p.amount:0,
        clips:isClip?p.amount:0,
      })
    }
  })
  payz.sort((a,b)=>b.ts-a.ts)
  const labels = []
  const streamData = []
  const boostData = []
  const clipData = []
  payz.forEach(({ts,streaming,boosts,clips}) => {
    // @ts-ignore
    const dur = moment.duration(ts, 'seconds').format('hh:mm:ss')
    labels.unshift(dur)
    streamData.unshift(streaming)
    boostData.unshift(boosts)
    clipData.unshift(clips)
  })
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Streaming',
        data: streamData,
        backgroundColor: 'rgba(96, 137, 255, 0.2)',
        borderColor: 'rgba(96, 137, 255, 1)',
        borderWidth: 1
      },{
        label: 'Boosts',
        data: boostData,
        backgroundColor: 'rgba(96, 237, 255, 0.2)',
        borderColor: 'rgba(96, 237, 255, 1)',
        borderWidth: 1
      },{
        label: 'Clips',
        data: clipData,
        backgroundColor: 'rgba(176, 137, 255, 0.2)',
        borderColor: 'rgba(176, 137, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        xAxes: [{stacked: true}],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          stacked: true
        }],
      }
    }
  });
}