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
        text: 'Number of CMQs (Percent)',
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
      text: 'CMQ Curve',
    },
  },
};

const CMQSection = () => {
  const [CMQId, setCMQId] = useState('historical');
  const [CMQIdList, setCMQIdList] = useState(['historical']);
  const [CMQCabin, setCMQCabin] = useState('all');
  const [CMQCabinList, setCMQCabinList] = useState(['all']);
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

  const fetchCabins = (id) => {
    fetch(`http://127.0.0.1:5000/cabinlist/${id}`,{
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
      console.log('cabindata', res.data);
      setCMQCabinList(['all'].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  //fetching specific data for a ship id
  const fetchData = (id, cabin) => {
    if (cabin === 'all') {
      CMQOptions.plugins.title.text = 'CMQ Curve across all cabins';
    } else {
      CMQOptions.plugins.title.text = `CMQ Curve for ${cabin}`;
    }

    if (id === 'historical') {
      const url = `http://127.0.0.1:5000/cmq/${cabin}`;
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
      const url = `http://127.0.0.1:5000/cmq/${id}/${cabin}`;
      let dataset = [];
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
        dataset.push.apply(dataset,res.data);
        setCMQData((prevData) => {
          dataset = Array.from({ length: prevData.datasets[0].data.length - res.data.length }).fill(0);
          dataset.push.apply(dataset,res.data);
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
    fetchCabins(CMQId);
    fetchData(CMQId,CMQCabin);
  }, [CMQId,CMQCabin]);

  useEffect(() => {
    //fetchCabins(CMQId);
    fetchIds();
    //fetchData('historical');
  }, []);

  

  return (
    <>
      <CMQContainer id='cmq'>
        <CMQWrapper>
          <CMQColumn1>
          <CMQContentWrapper>
              <CMQHeading> Accumulative CMQ Curve</CMQHeading>
              <CMQPara1> Every event follows a similar pattern when it comes to CMQs. While nuances exi
                st among specific events there is a general pattern of behaviour that consumers follow.
                As a result, at any time prior to the event occurring there is an opportunity to recognise 
                whether or not ticket sales are ahead or behind forecast. This knowledge creates a starting 
                point for determining what actions needs to be taken.</CMQPara1>
              <select onChange={(event)=> {setCMQId(event.target.value)}}>
                {CMQIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <select onChange={(event)=> {setCMQCabin(event.target.value)}}>
                {CMQCabinList.map((cabin, index) => (
                  <option key={index} value={cabin}>
                    {cabin}
                  </option>
                ))}
              </select>
              <CMQPara2> Use the CMQ curve to the right to understand whether or not your current sales for 
                the event of your choice is within the range of expected sales to date. If the current sales
                 are tracking below expected, you can use the customer segmentation tab below to identify prof
                 iles of consumers likely to purchase at this time and aid in your marketing efforts. Similarly
                  if sales are ahead of expected, customer profiles can identify whether the characteristics of 
                  customers for this event in question differs from expected or if volume is simply higher.</CMQPara2>
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