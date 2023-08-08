import React from 'react'
import Icon1 from '../../images/ST1.svg'
import Icon2 from '../../images/ST2.svg'
import Icon3 from '../../images/ST3.svg'
import {
  ServicesContainer,
  ServicesWrapper,
  ServicesCard,
  ServicesIcon,
  ServicesH2,  
  ServicesP
} from './ServicesElements';

const Services = () => {
  return (
    <ServicesContainer id="services">
      <ServicesWrapper>
        <ServicesCard 
        to='bookingcurve'
        smooth={true}
        duration={500}
        offset={-80}
        >
          <ServicesIcon src={Icon1} />
          <ServicesH2>Booking Curve</ServicesH2>
          <ServicesP>Track bookings to date for a given event and analyse their performance against forecasted sales.</ServicesP>
        </ServicesCard>
        <ServicesCard to='clientsegmentation'>
          <ServicesIcon src={Icon2} />
          <ServicesH2>Spirited Travellers</ServicesH2>
          <ServicesP>Examine the patterns between consumer characteristics and booking habits to build customer profiles.</ServicesP>
        </ServicesCard>
        <ServicesCard to='cmq'>
          <ServicesIcon src={Icon3} />
          <ServicesH2>Class Mix Quality (CMQ)</ServicesH2>
          <ServicesP>Determine whether the value from bookings is maximized or if there is potential revenue being overlooked.</ServicesP>
        </ServicesCard>
      </ServicesWrapper>
    </ServicesContainer>
  )
}

export default Services
