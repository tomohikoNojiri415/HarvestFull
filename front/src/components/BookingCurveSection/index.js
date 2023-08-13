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
  BookingContainer,
  BookingWrapper,
  BookingHeading,
  BookingColumn1,
  BookingColumn2,
  BookingChartWrapper,
  BookingContentWrapper,
  BookingPara1,
  BookingPara2,
} from './BookingCurveElements'

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

const bookingOptions = {
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
        text: 'Number of Bookings (Percent)',
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
      text: 'Booking Curve',
    },
  },
};

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

const fetchData = async (url) => {
  // fetch(url,{ method: 'GET',
  // mode: 'cors',
  // headers: {
  //   "Content-Type": "application/json",
  // },
  // }).then(data => {
  //   const res=data.json();
  //   return res;
  // })
  const response = await fetch(url,{ method: 'GET', mode: 'cors', headers: { "Content-Type": "application/json",},});
  const data = await response.json();
  return data;
};

const BookingCurveSection = () => {
  const [bookingId, setBookingId] = useState('historical');
  const [bookingIdList, setBookingIdList] = useState(['historical']);
  const [bookingData, setBookingData] = useState({
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
  //the resulting list has a 0 at the start when page load
  const fetchIds = () => {
    fetchData('http://127.0.0.1:5000/idlist').then((res) => {
      setBookingIdList(['historical'].concat(res.data));
    })
  }
  const fetchHistoricalData = () => {
    const url = 'http://127.0.0.1:5000/booking/';
      //access api endpoint using get method
      fetchData(url).then((res)=>{
        const mean = res.data.mean;
        const lower = res.data.lower;
        const upper = res.data.upper;
        //res.data contains the data from the backend
        //manipulate data
        let labels = Array.from({ length: mean.length }, (_, index) => -mean.length + 1 + index);
        //update front end with data
        setBookingData({
          labels: labels,
          datasets: [
            {
              label: "Historical Mean",
              type: "line",
              backgroundColor: "rgb(1,3,105, 0.5)",
              borderColor: "rgb(1,3,105)",
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
      })
    };

  useEffect(() => {
      //fetching specific data for a ship id
    const fetchIdData = (id) => {
      const url = `http://127.0.0.1:5000/booking/${id}`;
      fetchData(url).then((res)=>{
        //res.data contains the data from the backend
        //manipulate data
        var dataset = formatDataset(res.data.data, res.data.lower, res.data.upper, bookingData.labels.length);
        setBookingData((prevData) => {
          return {
            labels: prevData.labels,
            //keep the order so the id curve is always on top
            datasets: [prevData.datasets[0],prevData.datasets[1], prevData.datasets[2],{
              label: `${id}`,
              type: "line",
              backgroundColor: "rgb(200, 16, 46, 0.5)",
              borderColor: "rgba(200, 16, 46, 1)",
              hoverBorderColor: "rgb(200, 16, 46)",
              fill: false,
              tension: 0,
              data: dataset,
              yAxisID: 'y',
              xAxisID: 'x'
            }],
          }
        });
      })
    }
    if (bookingId === 'historical') {
      fetchHistoricalData();
    }else{
      fetchIdData(bookingId);
    }
  }, [bookingId,bookingData.labels.length]);

  useEffect(() => {
    fetchIds();
    fetchHistoricalData();
  }, []);

  

  return (
    <>
      <BookingContainer id='bookingcurve'>
        <BookingWrapper>
          <BookingColumn1>
          <BookingContentWrapper>
              <BookingHeading> Accumulative Booking Curve</BookingHeading>
              <BookingPara1>Every booking follows a similar pattern.</BookingPara1>
              <select onChange={(event)=> {setBookingId((prevData) =>{
                return event.target.value}
              )}}>
                {bookingIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <BookingPara2>While nuances exist among specific events there is a general 
                pattern of behaviour that consumers follow.<br /><br /> 
                As a result, at any time prior to the event occurring there is an opportunity
                 to recognise whether or not ticket sales are ahead or behind forecast. This 
                 knowledge creates a starting point for determining what actions needs to be taken.
                <br /><br />
                Use the booking curve to the right to understand whether or not your current sales 
                for the event of your choice is within the range of expected sales to date.
                </BookingPara2>
            </BookingContentWrapper>
          </BookingColumn1>
          <BookingColumn2>
          <BookingChartWrapper>
            <Line data={bookingData} options={bookingOptions} />
            </BookingChartWrapper>
          </BookingColumn2>
        </BookingWrapper>
      </BookingContainer>      
    </>
  );
}
export default BookingCurveSection;