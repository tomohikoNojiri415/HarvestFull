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
      setBookingIdList(['historical'].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  //fetching specific data for a ship id
  const fetchData = (id) => {
    if (id === 'historical') {
      const url = 'http://127.0.0.1:5000/booking/';
      // labels x-axis - array indicating weeks till end of booking
      let labels = [];
      //access api endpoint using get method
      fetch(url,{
        method: 'GET',
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
        },
      }).then(data => {
        console.log("history 2");
        //decode message
        const res=data.json();
        return res;
      }).then((res)=>{
        console.log("history 3");
        const mean = res.data.mean;
        const lower = res.data.lower;
        const upper = res.data.upper;
        //res.data contains the data from the backend
        //manipulate data
        labels = Array.from({ length: mean.length }, (_, index) => -mean.length + 1 + index);
        //update front end with data
        setBookingData({
          labels: labels,
          datasets: [
            // {
            //   label:'Historical Bookings',
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
      //console.log('fetching for',id);
      const url = `http://127.0.0.1:5000/booking/${id}`;
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
        setBookingData((prevData) => {
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
    fetchData(bookingId);
  }, [bookingId]);

  useEffect(() => {
    fetchIds();
    fetchData('historical');
  }, []);

  

  return (
    <>
      <BookingContainer id='bookingcurve'>
        <BookingWrapper>
          <BookingColumn1>
          <BookingContentWrapper>
              <BookingHeading> Accumulative Booking Curve</BookingHeading>
              <BookingPara1> Every event follows a similar pattern when it comes to bookings. While nuances exi
                st among specific events there is a general pattern of behaviour that consumers follow.
                As a result, at any time prior to the event occurring there is an opportunity to recognise 
                whether or not ticket sales are ahead or behind forecast. This knowledge creates a starting 
                point for determining what actions needs to be taken.</BookingPara1>
              <select onChange={(event)=> {setBookingId((prevData) =>{
                return event.target.value}
              )}}>
                {bookingIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <BookingPara2> Use the booking curve to the right to understand whether or not your current sales for 
                the event of your choice is within the range of expected sales to date. If the current sales
                 are tracking below expected, you can use the customer segmentation tab below to identify prof
                 iles of consumers likely to purchase at this time and aid in your marketing efforts. Similarly
                  if sales are ahead of expected, customer profiles can identify whether the characteristics of 
                  customers for this event in question differs from expected or if volume is simply higher.</BookingPara2>
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