import {Line} from 'react-chartjs-2';
import React, {useEffect, useState} from 'react';
import{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement)

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
const options = {
  indexAxis: 'x',
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Booking Curve',
    },
  },
};

const BookingCurveSection = () => {
  const [id, setId] = useState(0);
  const [idList, setIdList] = useState([0]);
  const [data, setData] = useState({
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
    fetch('http://127.0.0.1:5000/booking/idlist',{
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
      setIdList([0].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  //fetching historical data
  const fetchHistoricalData = () => {
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
      //decode message
      const res=data.json();
      return res;
    }).then((res)=>{
      //res.data contains the data from the backend
      //manipulate data
      labels = Array.from({ length: res.data.length }, (_, index) => -res.data.length + 1 + index);
      //update front end with data
      setData({
        labels: labels,
        datasets: [
          {
            label:'Historical Bookings',
            data: res.data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      });
    }).catch(err => {
      console.log(err);
    })
  }
  //fetching specific data for a ship id
  const fetchData = (id) => {
    if (id === 0) {
      setData((prevData) => {
        return {
          labels: prevData.labels,
          datasets: [prevData.datasets[0]],
        }
      });
      return;
    }
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
      setData((prevData) => {
        dataset = Array.from({ length: prevData.datasets[0].data.length - res.data.length }).fill(0);
        dataset.push.apply(dataset,res.data);
        return {
          labels: prevData.labels,
          datasets: [prevData.datasets[0],
            {
              label:`Ship ${id}`,
              data: dataset,
              borderColor: 'rgba(192, 75, 192, 1)',
              backgroundColor: 'rgba(192, 75, 192, 0.2)',
            },
          ],
        }
      });
    }).catch(err => {
      console.log(err);
    })
  }

  useEffect(() => {
    console.log(id);
    fetchData(id);
  }, [id]);

  useEffect(() => {
    fetchIds();
    fetchHistoricalData();
  }, []);

  

  return (
    <>
    <Line data={data} options={options} />
      <select onChange={(event)=> {setId(parseInt(event.target.value))}}>
      {idList.map((id, index) => (
        <option key={index} value={id}>
          {id}
        </option>
      ))}
    </select>
    </>
  );
}
export default BookingCurveSection;