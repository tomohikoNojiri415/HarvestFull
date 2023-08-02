import styled from 'styled-components';

export const BookingContainer = styled.div`
  color: #fff;
  background: '#f9f9f9';
  display: flex;

  /* @media screen and (max-width: 768px){
    padding: 100px 0;
  }   */
`

export const BookingWrapper = styled.div`
  display: grid;
  z-index: 1;
  height: 100vh;
  width: 100vw;
  padding: 0 5% 0 5%;
  justify-content: center;
  grid-template-columns: 30% 70%;
  grid-auto-rows: minmax(100px, auto);
  grid-gap: 20px;
  //grid-template-areas: 'side main';
`;

export const BookingColumn1 = styled.div`
  padding-top: 10%; 
  //grid-area: side;
  height: 100vh;
`;

export const BookingColumn2 = styled.div`
  //grid-area: main;
  justify-content: center;
  align-items: center;
`;

export const BookingHeading = styled.h1`
  max-width: 24px;
  margin-bottom: 48px;
  line-height: 1.1;
  font-weight: 600;
  color:#202122;
`; 

export const BookingPara1 = styled.p`
  margin-bottom: 35px;
  font-size: 16px;
  line-height: 22px;
  color: #3F4041;
`;

export const BookingPara2 = styled.p`
  padding-top: 10%;
  max-width: 440px;
  margin-bottom: 35px;
  font-size: 16px;
  line-height: 22px;
  color: #848585;
`;

export const BookingChartWrapper = styled.div`
  padding: 18% 5% 18% 5%;
  height: 100vh;
`;

export const BookingContentWrapper = styled.div`
  padding: 10% 5% 0 5%;
`;