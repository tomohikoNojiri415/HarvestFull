import styled from 'styled-components';
import { Link as LinkR } from 'react-router-dom';
import { Link as LinkS } from 'react-scroll'


export const Nav = styled.nav`
  //background: #FF6124;
  background: #c8102e;
  height: 80px;
  // margin-top: -80px; /* This is to offset the height of the navbar */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; /* This is to make sure the navbar is on top of everything else */
  position: sticky; /* This is to make sure the navbar is always on top */
  top: 0; /* This is to make sure the navbar is always on top */
  @media screen and (max-width: 960px) {
    transition: 0,8s all ease;
  }
`
export const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 80px;
  z-index: 1; /* This is to make sure the navbar is on top of everything else */
  width: 100%;
  padding: 0 24px;
  max-width: 1100px;
`
export const NavLogo = styled.div`
  color: #fff;
  //color: #ed9d7e;
  justify-self: flex-start; /* This is to make sure the logo is on the left side */
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center; /* This is to make sure the logo is vertically centered */
  margin-left: 24px;
  font-weight: bold;
  text-decoration: none;
  font-family: 'Gothic821';
`

export const MobileIcon = styled.div`
  display: none; 
  @media screen and (max-width: 768px) {
    display: block; 
    position: absolute; 
    top: 0; 
    right: 0; 
    transform: translate(-100%, 60%);
    font-size: 1.8rem; 
    cursor: pointer;
    color: #fff;
  }
`

export const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  text-align: center;
  margin-right: -22px; /*change for styling*/

  @media screen and (max-width: 768px) {
    display: none; 
  }
`

export const NavItem = styled.li`
  height: 80px;
`

export const NavLinks = styled(LinkS)`
  color: #fff;
  display: flex;
  align-items: center; 
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;

  &.active { 
    //a line at the border bottom of the active link
    border-bottom: 4px solid #fff;
  }
`

export const NavBtn = styled.nav`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`
export const NavBtnLink = styled(LinkR)`
  border-radius: 50px;
  //background: #ed9d7e;
  background: #012169;
  white-space: nowrap;
  padding: 10px 22px;
  color: #fff;
  font-size: 16px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;

  &:hover {
    transition: all 0.2s ease-in-out;
    background: #fff;
    color: #010606;
  }
`;
