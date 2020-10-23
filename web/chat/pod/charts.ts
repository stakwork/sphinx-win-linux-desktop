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

interface StreamEarning {
  ts: number,
  amount: number
}
export function makeEpisodeChart(ref, payments) {
  var ctx = ref.getContext('2d');
  const labels = []
  const data = []
  const stream: StreamEarning[] = [];// { [k: number]: number } = {}
  const clip: { [k: string]: number } = {}
  const boost: { [k: string]: number } = {}
  payments && payments.forEach(p => {
    let j:StreamPayment
    try {
      j = JSON.parse(p.message_content)
    } catch(e){}
    if(!(j&&(j.ts||j.ts===0))) return
    const exists = stream.find(s=>s.ts===j.ts)
    if(exists) {
      exists.amount += p.amount
    } else {
      stream.push({ts:j.ts,amount:p.amount})
    }
  })
  stream.sort((a,b)=>b.ts-a.ts)
  stream.forEach(({ts,amount}) => {
    // @ts-ignore
    const dur = moment.duration(ts, 'seconds').format('hh:mm:ss')
    labels.unshift(dur)
    data.unshift(amount)
  })
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Streaming',
        data,
        backgroundColor: 'rgba(96, 137, 255, 0.2)',
        borderColor: 'rgba(96, 137, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
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