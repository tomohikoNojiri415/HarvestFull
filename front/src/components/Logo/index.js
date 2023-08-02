import React from 'react';
import LogoSVG from '../../images/logo.svg'; // Adjust the path if needed
import { LogoWrapper, LogoContainer, LogoImg } from './LogoElements';

const chepLink = 'https://chepnetwork.com/'; // Replace with the actual URL

const Logo = () => (
  <LogoContainer>
    <LogoWrapper href={chepLink} target="_blank" rel="noopener noreferrer">
      <LogoImg src={LogoSVG} alt="Logo"/>
    </LogoWrapper>
  </LogoContainer>
);

export default Logo;
