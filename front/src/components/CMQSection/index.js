import {Line} from 'react-chartjs-2';
import React, {useEffect, useState} from 'react';
import{
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import {
  CMQContainer,
  CMQWrapper,
  CMQHeading,
  CMQColumn1,
  CMQColumn2,
  CMQChartWrapper,
  CMQContentWrapper,
  CMQPara1,
  CMQPara2,
  CMQList,
} from './CMQElements'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  PointElement)

var CMQOptions = {
  indexAxis: 'x',
  maintainAspectRatio: false,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'CMQ (Percent)',
      }
    },
    x: {
      title: {
        display: true,
        text: 'Weeks before Departure',
      }
    }
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'CMQ Curve for all Ticket Types',
    },
  },
};

const CMQSection = () => {
  const [CMQId, setCMQId] = useState('historical');
  const [CMQIdList, setCMQIdList] = useState(['historical']);
  const [CMQTicketType, setCMQTicketType] = useState('All');
  const [CMQTicketTypeList, setCMQTicketTypeList] = useState(['All']);
  const [CMQData, setCMQData] = useState({
    labels: [0],
    datasets: [
      {
        label:'Historical',
        data: [0],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });

  // trim of dataset 
  const formatDataset = (dataset, start, end, n) => {
    //trim dataset which has a longer date range than the (longest) historical data
    if (start < -n + 1) {
      dataset = dataset.slice(-start - n + 1);
    }

    const extendedDataset = [...dataset]; // Create a shallow copy of the original dataset
  
    while (extendedDataset.length < n) {
      extendedDataset.push(null); // Add null values to the end of the dataset until it reaches the desired length
    }
  
    return extendedDataset;
  }

  //fetching a list of ids
  //the resulting list has a 0 at the start when page load !!reserve 0 for no ship selected
  const fetchIds = () => {
    fetch('http://127.0.0.1:5000/idlist',{
      method: 'GET',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
    }).then(data => {
      //decode message
      const res=data.json();
      return res;
    }).then((res)=>{
      setCMQIdList(['historical'].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  const fetchTicketTypes = (id) => {
    fetch(`http://127.0.0.1:5000/tickettypelist/${id}`,{
      method: 'GET',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
    }).then(data => {
      //decode message
      const res=data.json();
      return res;
    }).then((res)=>{
      //console.log('TicketTypedata', res.data);
      setCMQTicketTypeList(['All'].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  //fetching specific data for a ship id
  const fetchData = (id, TicketType) => {
    if (TicketType === 'All') {
      CMQOptions.plugins.title.text = 'CMQ Curve across all Ticket Types';
    } else {
      CMQOptions.plugins.title.text = `CMQ Curve for ${TicketType}`;
    }

    if (id === 'historical') {
      const url = `http://127.0.0.1:5000/cmq/${TicketType}`;
      // labels x-axis - array indicating weeks till end of CMQ
      let labels = [];
      //access api endpoint using get method
      fetch(url,{
        method: 'GET',
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
        },
      }).then(data => {
        //decode message
        const res=data.json();
        return res;
      }).then((res)=>{
        const mean = res.data.mean;
        const lower = res.data.lower;
        const upper = res.data.upper;
        //res.data contains the data from the backend
        //manipulate data
        labels = Array.from({ length: mean.length }, (_, index) => -mean.length + 1 + index);
        //update front end with data
        setCMQData({
          labels: labels,
          datasets: [
            // {
            //   label:'Historical CMQs',
            //   data: mean,
            //   borderColor: 'rgba(75, 192, 192, 1)',
            //   backgroundColor: 'rgba(75, 192, 192, 0.2)',
            // },
            {
              label: "Historical Mean",
              type: "line",
              backgroundColor: "rgb(75, 192, 255, 0.5)",
              borderColor: "rgb(75, 192, 255)",
              hoverBorderColor: "rgb(175, 192, 255)",
              fill: false,
              tension: 0,
              data: mean,
              yAxisID: 'y',
              xAxisID: 'x'
            },
            {
              label: "BandTop",
              type: "line",
              backgroundColor: "rgb(75, 192, 255, 0.5)",
              borderColor: "transparent",
              pointRadius: 0,
              fill: 0,
              tension: 0,
              data: upper,
              yAxisID: 'y',
              xAxisID: 'x'
            },
            {
              label: "BandBottom",
              type: "line",
              backgroundColor: "rgb(75, 192, 255, 0.5)",
              borderColor: "transparent",
              pointRadius: 0,
              fill: 0,
              tension: 0,
              data: lower,
              yAxisID: 'y',
              xAxisID: 'x'
            },
          ],
        });
      }).catch(err => {
        console.log(err);
      })
    } else {
      //id = parseInt(id);
      const url = `http://127.0.0.1:5000/cmq/${id}/${TicketType}`;
      fetch(url,{
        method: 'GET',
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
        },
      }).then(data => {
        //decode message
        const res=data.json();
        console.log('non-historical', res);
        return res;
      }).then((res)=>{
        //res.data contains the data from the backend
        //manipulate data
        var dataset = formatDataset(res.data.data, res.data.lower, res.data.upper, CMQData.labels.length);
        console.log('dataset', dataset);
        //dataset.push.apply(dataset,res.data.data);
        // setCMQData((prevData) => {
        //   dataset = Array.from({ length: prevData.datasets[0].data.length - res.data.length }).fill(0);
        //   dataset.push.apply(dataset,res.data);
        //   return {
        //     labels: prevData.labels,
        //     //keep the order so the id curve is always on top
        //     datasets: [prevData.datasets[0],prevData.datasets[1], prevData.datasets[2],{
        //       label: `${id}`,
        //       type: "line",
        //       backgroundColor: "rgb(255,97,36, 0.5)",
        //       borderColor: "rgba(255,97,36, 1)",
        //       hoverBorderColor: "rgb(255,97,36)",
        //       fill: false,
        //       tension: 0,
        //       data: dataset,
        //       yAxisID: 'y',
        //       xAxisID: 'x'
        //     }],
        //   }
        // });
        setCMQData((prevData) => {
          //make the dataset as long as the historical data fill with nulls
          //dataset = Array.from({ length: prevData.datasets[0].data.length - res.data.length }).fill(0);
          //console.log('dataset', dataset)
          //console.log(dataset)
          return {
            labels: prevData.labels,
            //keep the order so the id curve is always on top
            datasets: [prevData.datasets[0],prevData.datasets[1], prevData.datasets[2],{
              label: `${id}`,
              type: "line",
              backgroundColor: "rgb(255,97,36, 0.5)",
              borderColor: "rgba(255,97,36, 1)",
              hoverBorderColor: "rgb(255,97,36)",
              fill: false,
              tension: 0,
              data: dataset,
              yAxisID: 'y',
              xAxisID: 'x'
            }],
          }
        });
      }).catch(err => {
        console.log(err);
      })
    }
  }

  useEffect(() => {
    fetchTicketTypes(CMQId);
    fetchData(CMQId,CMQTicketType);
  }, [CMQId,CMQTicketType]);

  useEffect(() => {
    fetchIds();
  }, []);

  

  return (
    <>
      <CMQContainer id='cmq'>
        <CMQWrapper>
          <CMQColumn1>
          <CMQContentWrapper>
              <CMQHeading> Class Mix Quality</CMQHeading>
              <CMQPara1> Class Mix Quality (CMQ) is a CHEP specific 
                metric created to determine the standardised ROI for an 
                event.If all tickets, across all ticket levels were sold 
                at full price then the CMQ = 1. If discounted tickets were
                 sold or the event was not fully booked then the CMQ will 
                 fall between 0 and 1. CMQ gives us an understanding of how 
                 profitable an event will be and indicates any profitability
                   concerns far enough in advance to mitigate them.
                </CMQPara1>
              <select onChange={(event)=> {setCMQId(event.target.value)}}>
                {CMQIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <select onChange={(event)=> {setCMQTicketType(event.target.value)}}>
                {CMQTicketTypeList.map((TicketType, index) => (
                  <option key={index} value={TicketType}>
                    {TicketType}
                  </option>
                ))}
              </select>
              <CMQPara2>  CMQ is can be improved by either:
                <CMQList>
                  <li>Selling more tickets</li>
                  <li>Selling tickets at higher prices</li>
                  <li>Selling more tickets at higher prices</li>
                </CMQList>
              </CMQPara2>
            </CMQContentWrapper>
          </CMQColumn1>
          <CMQColumn2>
          <CMQChartWrapper>
            <Line data={CMQData} options={CMQOptions} />
            </CMQChartWrapper>
          </CMQColumn2>
        </CMQWrapper>
      </CMQContainer>      
    </>
  );
}
export default CMQSection;