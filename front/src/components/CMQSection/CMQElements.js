import styled from 'styled-components';

export const CMQContainer = styled.div`
  color: #fff;
  background: '#f9f9f9';
  display: flex;

  /* @media screen and (max-width: 768px){
    padding: 100px 0;
  }   */
`

export const CMQWrapper = styled.div`
  display:inline-flex;
  flex-wrap:wrap;
  min-height: 100vh - 80px;
  width: 100%;
  padding: 3%;
  //grid-template-areas: 'side main';
`;

export const CMQColumn1 = styled.div`
  float:left; 
  width:30%;

  @media screen and (max-width: 1000px){
    width: 100%;
  }
`;

export const CMQColumn2 = styled.div`
  width: 70%;
  overflow:hidden;
  min-height:170px;
  //grid-area: main;
  justify-content: center;
  align-items: center;

  @media screen and (max-width: 1000px){
    width: 100%;
  }
`;

export const CMQHeading = styled.h1`
  max-width: 24px;
  margin-bottom: 48px;
  line-height: 1.1;
  font-weight: 600;
  color:#202122;
`; 

export const CMQPara1 = styled.p`
  margin-bottom: 35px;
  font-size: 16px;
  line-height: 22px;
  color: #3F4041;
`;

export const CMQPara2 = styled.p`
  margin-top: 35px;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 22px;
  color: #848585;
`;

export const CMQChartWrapper = styled.div`
  position: relative;
  padding: 10% 5% 18% 5%;
  height: 100vh;

  @media screen and (max-width: 1000px){
    top: 0%;
  }
`;

export const CMQContentWrapper = styled.div`
  padding: 5% 5% 0 5%;
`;