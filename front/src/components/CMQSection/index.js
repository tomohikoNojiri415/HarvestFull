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
    if (start < -n + 1) {dataset = dataset.slice(-start - n + 1);}
    const extendedDataset = [...dataset];
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
        return res;
      }).then((res)=>{
        //res.data contains the data from the backend
        //manipulate data
        const mean = res.data.his.mean;
        const lower = res.data.his.lower;
        const upper = res.data.his.upper;
        var dataset = formatDataset(res.data.cur.data, res.data.cur.lower, res.data.cur.upper, CMQData.labels.length);
        setCMQData((prevData) => {
          //make the dataset as long as the historical data fill with nulls
          return {
            labels: prevData.labels,
            //keep the order so the id curve is always on top
            datasets: [
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
            {
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
            },
            ],
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
              <CMQPara1> Maximising the yield</CMQPara1>
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
              <CMQPara2>  Class Mix Quality (CMQ) is a CHEP metric created to represent 
                sales as a function of potential. With this metric we can optimise each 
                event. It is not an ability to discount, it is the capability to sell to
                 a customer based on what they are willing to pay.<br /><br />
 
                The calculation is built from a combination of the number of tickets available 
                and the price of those tickets. If every ticket is sold for the most expensive 
                ticket price, then our CMQ would equal 1. Conversely, if a ship sails without 
                a ticket being sold, the CMQ would be 0.<br /><br />

                By tracking the cumulative CMQ we can improve overall yield by recognising that we can sell:
                <CMQList>
                  <li>More tickets,</li>
                  <li>Higher priced tickets or,</li>
                  <li>More tickets at the higher price points.</li>
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