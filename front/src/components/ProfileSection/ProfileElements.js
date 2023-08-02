import styled from 'styled-components';

export const ProfileContainer = styled.div`
  color: #fff;
  background: #ed9d7e;

  @media screen and (max-width: 768px){
    padding: 100px 0;
  }  
`

export const ProfileWrapper = styled.div`
  display: grid;
  z-index: 1;
  height: 100vh;
  width: 100%;
  max-width: 1100px;
  margin-right: auto;
  margin-left: auto;
  justify-content: center;
  grid-template-columns: 30% 70%;
  grid-auto-rows: minmax(100px, auto);
  grid-gap: 20px;
  grid-template-areas: 'side main';
`;