import styled from 'styled-components'

export const LogoContainer = styled.div`
  position: absolute;
  display: flex;
  top: 0px;
  left: 50px; 
  width: 100px;
  height: 200px;
  z-index: 10; 

  @media screen and (max-width: 480px) {
    top: 0px;
    left: 10px; 
    width: 50px;
    height: 100px;
  }
`;

export const Logodiv = styled.div`
  margin-top: 15px;
  //background: green;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 480px){
    width: 100px;
  height: 200px;;
  }

`;

// Styled component for the logo
export const LogoWrapper = styled.a`
  transition: transform 0.1s ease-in-out;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  background-size:contain;

  &:hover {
    transform: scale(1.1);
  }
`;

export const Logotxt = styled.h1`
  color: #FF6124;
  font-size: 18px;
  text-align: center;
  font-family: 'Gothic821';
  font-weight: 900;
  margin-bottom: 10px;

  @media screen and (max-width: 480px){
    font-size: 32px;
  }

`;

export const LogoImg = styled.img`
  width: 100%;
  height: 100%;

  @media screen and (max-width: 480px) {
  width: 30%;
  height: auto;
  }
`;

