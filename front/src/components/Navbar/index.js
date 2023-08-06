import React from 'react'
import { FaBars } from 'react-icons/fa'
import {animateScroll as scroll} from 'react-scroll'
import { 
  Nav, 
  NavbarContainer, 
  NavLogo, 
  MobileIcon, 
  NavMenu, 
  NavItem, 
  NavLinks,
  NavBtn,
  NavBtnLink
} from './NavbarElements'

const Navbar = ({ toggle }) => {
 
  const toggleHome = () => {
    scroll.scrollToTop();
  }

  return (
    <>
      <Nav>
        <NavbarContainer> 
          <NavLogo onClick={toggleHome}> Harvest </NavLogo>
          <MobileIcon onClick = {toggle}>
            <FaBars />
          </MobileIcon>
          <NavMenu>
            <NavItem>
              <NavLinks 
              to="bookingcurve"
              smooth={true}
              duration={250}
              spy={true}
              exact='true'
              offset={-80}
              >Booking Curve</NavLinks>
            </NavItem>
            <NavItem>
              <NavLinks 
              to="clientsegmentation"
              smooth={true}
              duration={250}
              spy={true}
              exact='true'
              offset={-80}
              >Client Segmentation</NavLinks>
            </NavItem>
            <NavItem>
              <NavLinks 
              to="cmq"
              smooth={true}
              duration={250}
              spy={true}
              exact='true'
              offset={-80}
              >Class Mix Quality</NavLinks>
            </NavItem>
            <NavItem>
              <NavLinks 
              to="recommendation"
              smooth={true}
              duration={250}
              spy={true}
              exact='true'
              offset={-80}
              >Recommendation</NavLinks>
            </NavItem>
          </NavMenu>
          <NavBtn>
            <NavBtnLink to="/">Menu</NavBtnLink>
          </NavBtn>
        
        </NavbarContainer>
      </Nav>
    </>
  )
}

export default Navbar
