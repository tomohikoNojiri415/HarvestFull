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

  return (
    <>
      <ProfileContainer id='clientsegmentation'>
        <ProfileWrapper>
          <ProfileColumn2>
            <ProfileChartWrapper>
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