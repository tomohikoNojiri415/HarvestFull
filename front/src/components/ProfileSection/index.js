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
  ProfileContainer,
  ProfileWrapper,
  ProfileHeading,
  ProfileColumn1,
  ProfileColumn2,
  ProfileChartWrapper,
  ProfileContentWrapper,
  ProfilePara1,
  ProfilePara2,
} from './ProfileElements'

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

var ProfileOptions = {
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
        text: 'Number of Profiles (Percent)',
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
      text: 'Profile Curve',
    },
  },
};

const ProfileSection = () => {
  const [ProfileId, setProfileId] = useState('historical');
  const [ProfileIdList, setProfileIdList] = useState(['historical']);
  const [ProfileCabin, setProfileCabin] = useState('all');
  const [ProfileCabinList, setProfileCabinList] = useState(['all']);
  const [ProfileData, setProfileData] = useState({
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
      setProfileIdList(['historical'].concat(res.data));
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
      setProfileCabinList(['all'].concat(res.data));
    }).catch(err => {
      console.log(err);
    })
  }

  //fetching specific data for a ship id
  const fetchData = (id, cabin) => {
    if (cabin === 'all') {
      ProfileOptions.plugins.title.text = 'Profile Curve across all cabins';
    } else {
      ProfileOptions.plugins.title.text = `Profile Curve for ${cabin}`;
    }

    if (id === 'historical') {
      const url = `http://127.0.0.1:5000/Profile/${cabin}`;
      // labels x-axis - array indicating weeks till end of Profile
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
        setProfileData({
          labels: labels,
          datasets: [
            // {
            //   label:'Historical Profiles',
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
      const url = `http://127.0.0.1:5000/Profile/${id}/${cabin}`;
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
        setProfileData((prevData) => {
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
    fetchCabins(ProfileId);
    fetchData(ProfileId,ProfileCabin);
  }, [ProfileId,ProfileCabin]);

  useEffect(() => {
    //fetchCabins(ProfileId);
    fetchIds();
    //fetchData('historical');
  }, []);

  

  return (
    <>
      <ProfileContainer id='Profile'>
        <ProfileWrapper>
          <ProfileColumn2>
            <ProfileChartWrapper>
              <Line data={ProfileData} options={ProfileOptions} />
            </ProfileChartWrapper>
          </ProfileColumn2>
          <ProfileColumn1>
          <ProfileContentWrapper>
              <ProfileHeading> Client Segmentation</ProfileHeading>
              <ProfilePara1> Class Mix Quality (Profile) is a CHEP specific 
                metric created to determine the standardised ROI for an 
                event.If all tickets, across all ticket levels were sold 
                at full price then the Profile = 1. If discounted tickets were
                 sold or the event was not fully booked then the Profile will 
                 fall between 0 and 1. Profile gives us an understanding of how 
                 profitable an event will be and indicates any profitability
                   concerns far enough in advance to mitigate them.
                </ProfilePara1>
              <select onChange={(event)=> {setProfileId(event.target.value)}}>
                {ProfileIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <select onChange={(event)=> {setProfileCabin(event.target.value)}}>
                {ProfileCabinList.map((cabin, index) => (
                  <option key={index} value={cabin}>
                    {cabin}
                  </option>
                ))}
              </select>
              <ProfilePara2>  Profile is can be improved by either:
              </ProfilePara2>
            </ProfileContentWrapper>
          </ProfileColumn1>
        </ProfileWrapper>
      </ProfileContainer>      
    </>
  );
}
export default ProfileSection;