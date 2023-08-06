import React from 'react'
import {
  SidebarContainer,
  Icon,
  CloseIcon,
  SidebarWrapper,
  SidebarMenu,
  SidebarLink,
  SideBtnWrap,
  SidebarRoute
} from './SidebarElements'
const Sidebar = ({isOpen, toggle}) => {
  console.log(isOpen);
  return (
    <SidebarContainer isOpen={isOpen} onClick={toggle}>
      <Icon onClick ={toggle}>
        <CloseIcon />
      </Icon>
      <SidebarWrapper>
        <SidebarMenu>
          <SidebarLink to='bookingcurve' onClick={toggle}>Booking Curve</SidebarLink>
          <SidebarLink to='clientsegmentation' onClick={toggle}>Client Segmentation</SidebarLink>
          <SidebarLink to='cmq' onClick={toggle}>Class Mix Quality</SidebarLink>
          <SidebarLink to='recommendation' onClick={toggle}>Recommendation</SidebarLink>
        </SidebarMenu>
        <SideBtnWrap>
          <SidebarRoute to='/'>Menu</SidebarRoute>
        </SideBtnWrap>
      </SidebarWrapper>
    </SidebarContainer>
  );
};

export default Sidebar
