import {Bar} from 'react-chartjs-2';
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
  Title,
  Tooltip,
  Legend,
  PointElement)


  var profileOptions = {
    indexAxis: 'x',
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
        }
      },
      x: {
        title: {
          display: false,
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
        text: 'Customer Profile',
      },
    },
  };

const fetchData = async (url) => {
  const response = await fetch(url,{ method: 'GET', mode: 'cors', headers: { "Content-Type": "application/json",},});
  const data = await response.json();
  return data;
}

const setTitle = (variable) => {
  if (variable === '(variable)') {
    profileOptions.plugins.title.text = `Customer Profile`;
  } else {
    profileOptions.plugins.title.text = `Customer ${variable}`;
  }
}

const ProfileSection = () => {
  //https://blog.bitsrc.io/customizing-chart-js-in-react-2199fa81530a
  const [profileId, setProfileId] = useState('historical');
  const [profileIdList, setProfileIdList] = useState(['historical']);
  const [profileWeek, setProfileWeek] = useState('All');
  const [profileWeeksList, setProfileWeeksList] = useState(['All']);
  const [profileVariable, setProfileVariable] = useState('(variable)');
  const [profileVariablesList, setProfileVariablesList] = useState(['(varible)']);
  const [profileData, setProfileData] = useState({
    labels: [0],
    datasets: [
      {
        label:'(variable)',
        data: [0],
        backgroundColor: "rgb(1,33,105, 0.5)",
        borderColor: "rgb(1,33,105)",
        hoverBorderColor: "rgb(175, 192, 255)",
      },
    ],
  });

    //the resulting list has a 0 at the start when page load
  const fetchIds = () => {
    console.log('fetchIds');
    fetchData('http://127.0.0.1:5000/idlist').then((res)=>{
      setProfileIdList(['historical'].concat(res.data));
     })
  }

  const fetchWeeks = (id) => {
    console.log('fetchWeeks',id);
    fetchData(`http://127.0.0.1:5000/profileweeks/${id}`).then((res)=>{
      setProfileWeeksList(['All'].concat(res.data));
    })
  }

  const fetchVariables = (id) => {
    fetchData(`http://127.0.0.1:5000/profilevariables/${id}`).then((res)=>{
      setProfileVariablesList(['(variable)'].concat(res.data));
    })
  }

  const fetchIdData = (id,week,variable) => {
    setTitle(variable);
    fetchData(`http://127.0.0.1:5000/profile/${id}/${week}/${variable}`).then((res)=>{
      const lbl = res.data.data.map(dataPoint => dataPoint.x);
      setProfileData({
        labels: lbl,
        datasets: [
          {
            label: `${variable}`,
            type: res.data.ctype,
            backgroundColor: "rgb(1,33,105, 0.5)",
            borderColor: "rgb(1,33,105)",
            hoverBorderColor: "rgb(175, 192, 255)",
            fill: false,
            tension: 0,
            data: res.data.data,
            yAxisID: 'y',
            xAxisID: 'x'
          },
        ],
      });
    }).catch(err => {
      console.log(err);
    });
  };
  useEffect(()=>{
    fetchIds();
  },[])  

  useEffect(() => {
    fetchWeeks(profileId);
    fetchVariables(profileId);
    fetchIdData(profileId, profileWeek,profileVariable);
  }, [profileId,profileWeek,profileVariable]);
  
  return (
    <>
      <ProfileContainer id='clientsegmentation'>
        <ProfileWrapper>
          <ProfileColumn2>
            <ProfileChartWrapper>
              <Bar data={profileData} options={profileOptions} />
            </ProfileChartWrapper>
          </ProfileColumn2>
          <ProfileColumn1>
          <ProfileContentWrapper>
              <ProfileHeading> Spirited Travellers</ProfileHeading>
              <ProfilePara1> The customer segmentation identifies the profiles of 
                consumers most likely to purchase at the specific times.
                </ProfilePara1>
                <select onChange={(event)=> {setProfileId(event.target.value)}}>
                {profileIdList && profileIdList.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
                </select>
                <select onChange={(event)=> {setProfileWeek(event.target.value)}}>
                {profileWeeksList.map((profileWeek, index) => (
                  <option key={index} value={profileWeek}>
                    {profileWeek}
                  </option>
                ))}
              </select>
              <select onChange={(event)=> {setProfileVariable(event.target.value)}}>
                {profileVariablesList.map((varp, index) => (
                  <option key={index} value={varp}>
                    {varp}
                  </option>
                ))}
              </select>
              <ProfilePara2>  
                If you are
                pacing behind forecast, these profiles will assist you in identifying 
                the characteristics of customers most relevant to talk to at this moment 
                in time. <br /> <br />If you are ahead of forecast, then it might be worth 
                considering repurposing the media for audiences you would be 
                buying against.
              </ProfilePara2>
            </ProfileContentWrapper>
          </ProfileColumn1>
        </ProfileWrapper>
      </ProfileContainer>      
    </>
  );
}
export default ProfileSection;