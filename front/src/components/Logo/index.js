import React from 'react';
import LogoSVG from '../../images/logo.svg'; // Adjust the path if needed
import { LogoWrapper, LogoContainer, LogoImg, Logotxt, Logodiv} from './LogoElements';

const chepLink = 'https://chepnetwork.com/'; // Replace with the actual URL

const Logo = () => (
  <LogoContainer>
    <Logodiv>
      <Logotxt>Powered By</Logotxt>
      <LogoWrapper href={chepLink} target="_blank" rel="noopener noreferrer">
        <LogoImg src={LogoSVG} alt="Logo"/>
      </LogoWrapper>
    </Logodiv>
  </LogoContainer>
);

export default Logo;
